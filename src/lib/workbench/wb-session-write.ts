/**
 * OW-3 fase 3 — skrivesiden for spillerens planlegger, mot `WorkbenchSession`/
 * `WorkbenchDrill` i stedet for `TrainingPlanSession`/`SessionDrill`.
 *
 * Erstatter den gamle skrive-kjernen (session-update.ts sin
 * executeSessionUpdate/skrivSessionDrills mot TrainingPlanSession,
 * session-move.ts sin executeSessionMove, duplicate-week.ts/duplicate-
 * session.ts) med samme kontrakt, men mot ny tabell. `actions.ts` er eneste
 * kaller — auth (requirePortalUser) og revalidering eies der.
 *
 * Redigerbarhet (Anders 17.09.2026): en økt kan endres av spiller og coach
 * uansett status i prosessen — ingen av funksjonene her sjekker `status`
 * før skriving.
 *
 * L-fase/M-miljø/CS-nivå skrives ALDRI av nye handlinger (kun historisk
 * lesing av migrerte rader, beslutningen 16.09.2026 §6 pkt. 2).
 */

import type { Prisma, PrismaClient, PyramidArea } from "@/generated/prisma/client";
import { sanitizeAkFormel, type AkFormelInput } from "@/lib/workbench/ak-formel";
import { skrivWorkbenchDrills } from "@/lib/workbench/wb-drill-write";
import { SessionUpdateSchema, type OktDrillInput, type SessionUpdateInput } from "@/lib/workbench/session-update";
import { computeMoveTarget, dateForDayIndex, weekRefDate } from "@/lib/workbench/session-move-math";
import { lokalDatoTilKolonne } from "@/lib/workbench/wb-map";
import { deleteV2ForPlanSession, resolveCoachIdForPlayer, upsertV2ForPlanSession } from "@/lib/workbench/v2-sync";

type Db = PrismaClient | Prisma.TransactionClient;

const PYRAMID_AREAS: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

/** Speiler den ferske WorkbenchSession-raden til TrainingSessionV2 (live-flyten). */
async function speilTilV2(
  db: Db,
  row: { id: string; title: string; date: Date; startMinute: number; durationMinutes: number; pyramid: string; location: string | null; maalsetning: string | null; groupId: string | null },
  playerId: string,
): Promise<void> {
  const pyramidArea = (PYRAMID_AREAS as string[]).includes(row.pyramid) ? (row.pyramid as PyramidArea) : "TEK";
  const scheduledAt = new Date(row.date.getUTCFullYear(), row.date.getUTCMonth(), row.date.getUTCDate(), 0, row.startMinute);
  const coachId = await resolveCoachIdForPlayer(playerId);
  await upsertV2ForPlanSession({
    planSessionId: row.id,
    playerId,
    title: row.title,
    scheduledAt,
    durationMin: row.durationMinutes,
    pyramidArea,
    coachId,
    location: row.location,
    maalsetning: row.maalsetning,
    sourceGroupId: row.groupId,
    db: db as PrismaClient,
  });
}

async function finnEidOkt(db: Db, sessionId: string, playerId: string) {
  const rad = await db.workbenchSession.findUnique({
    where: { id: sessionId },
    select: { id: true, playerId: true, date: true, startMinute: true, durationMinutes: true, pyramid: true, title: true, location: true, maalsetning: true, groupId: true },
  });
  if (!rad || rad.playerId !== playerId) return null;
  return rad;
}

// ── Opprett ──────────────────────────────────────────────────────────────

export async function createWbSession(
  prisma: PrismaClient,
  input: {
    playerId: string;
    dayIndex: number;
    hour: number;
    minute: number;
    weekOffset?: number;
    durationMin: number;
    title: string;
    pyramidArea: PyramidArea;
    akFormel?: AkFormelInput;
    drills?: OktDrillInput[];
    location?: string | null;
    maalsetning?: string | null;
  },
): Promise<{ ok: boolean; sessionId?: string; error?: string }> {
  if (input.dayIndex < 0 || input.dayIndex > 6) return { ok: false, error: "Ugyldig dag" };

  const dato = dateForDayIndex(input.dayIndex, input.hour, input.minute, weekRefDate(input.weekOffset ?? 0));
  const ak = sanitizeAkFormel(input.akFormel);
  const now = new Date();

  const created = await prisma.$transaction(async (tx) => {
    const rad = await tx.workbenchSession.create({
      data: {
        playerId: input.playerId,
        coachId: await resolveCoachIdForPlayer(input.playerId),
        date: lokalDatoTilKolonne(dato),
        startMinute: input.hour * 60 + input.minute,
        durationMinutes: Math.max(5, Math.min(480, Math.round(input.durationMin))),
        title: input.title.trim().slice(0, 120) || "Ny økt",
        pyramid: input.pyramidArea,
        // Spilleren lager økta for seg selv — synlig med en gang, ingen
        // egen «publiser»-klikk for eget innhold (uendret fra dagens UX).
        status: "PUBLISHED",
        origin: "PLAYER",
        createdBy: input.playerId,
        publishedAt: now,
        publishedBy: input.playerId,
        pressureLevel: ak.pressureLevel,
        pPosisjoner: ak.pPosisjoner,
        location: input.location?.trim().slice(0, 160) || null,
        maalsetning: input.maalsetning?.trim().slice(0, 300) || null,
      },
      select: { id: true, playerId: true, date: true, startMinute: true, durationMinutes: true, pyramid: true, title: true, location: true, maalsetning: true, groupId: true },
    });

    if (input.drills && input.drills.length > 0) {
      await skrivWorkbenchDrills(tx, {
        sessionId: rad.id,
        drills: input.drills,
        fallbackPyramidArea: input.pyramidArea,
        playerId: input.playerId,
      });
    }
    return rad;
  });

  await speilTilV2(prisma, created, input.playerId);
  return { ok: true, sessionId: created.id };
}

// ── Flytt ────────────────────────────────────────────────────────────────

export async function moveWbSession(
  prisma: PrismaClient,
  input: { sessionId: string; playerId: string; dayIndex: number; refDate?: Date },
): Promise<{ ok: boolean; error?: string }> {
  if (input.dayIndex < 0 || input.dayIndex > 6) return { ok: false, error: "Ugyldig dag" };
  const eksisterende = await finnEidOkt(prisma, input.sessionId, input.playerId);
  if (!eksisterende) return { ok: false, error: "Økt ikke funnet" };

  // Nåværende klokkeslett (fra startMinute) bevares — kun dag endres.
  const naaKlokke = dateForDayIndex(0, Math.floor(eksisterende.startMinute / 60), eksisterende.startMinute % 60);
  const nyDato = computeMoveTarget(naaKlokke, input.dayIndex, input.refDate ?? new Date());

  const updated = await prisma.workbenchSession.update({
    where: { id: input.sessionId },
    data: { date: lokalDatoTilKolonne(nyDato) },
    select: { id: true, playerId: true, date: true, startMinute: true, durationMinutes: true, pyramid: true, title: true, location: true, maalsetning: true, groupId: true },
  });
  await speilTilV2(prisma, updated, input.playerId);
  return { ok: true };
}

// ── Rediger (felter + full drill-erstatning) ───────────────────────────────

export async function updateWbSession(
  prisma: PrismaClient,
  input: { sessionId: string; playerId: string; patch: SessionUpdateInput },
): Promise<{ ok: boolean; error?: string }> {
  const eksisterende = await finnEidOkt(prisma, input.sessionId, input.playerId);
  if (!eksisterende) return { ok: false, error: "Økt ikke funnet" };
  const parsed = SessionUpdateSchema.safeParse(input.patch);
  if (!parsed.success) return { ok: false, error: "Ugyldig endring." };
  const p = parsed.data;

  const data: Prisma.WorkbenchSessionUpdateInput = {};
  if (p.title !== undefined) data.title = p.title;
  if (p.pyramidArea !== undefined) data.pyramid = p.pyramidArea;
  if (p.durationMin !== undefined) data.durationMinutes = p.durationMin;
  if (p.hour !== undefined || p.minute !== undefined) {
    const hour = p.hour ?? Math.floor(eksisterende.startMinute / 60);
    const minute = p.minute ?? eksisterende.startMinute % 60;
    data.startMinute = hour * 60 + minute;
  }
  // Tom streng tømmer feltet — `?? undefined` kan aldri nullstille i Prisma
  // (gotcha). L-fase/miljo/csNivaa er UTELATT med vilje — kun historisk lesing.
  if (p.location !== undefined) data.location = p.location?.trim().slice(0, 160) || null;
  if (p.maalsetning !== undefined) data.maalsetning = p.maalsetning?.trim().slice(0, 300) || null;

  const updated = await prisma.$transaction(async (tx) => {
    const rad = await tx.workbenchSession.update({
      where: { id: input.sessionId },
      data,
      select: { id: true, playerId: true, date: true, startMinute: true, durationMinutes: true, pyramid: true, title: true, location: true, maalsetning: true, groupId: true },
    });
    if (p.drills !== undefined) {
      await skrivWorkbenchDrills(tx, {
        sessionId: input.sessionId,
        drills: p.drills,
        fallbackPyramidArea: (PYRAMID_AREAS as string[]).includes(rad.pyramid) ? (rad.pyramid as PyramidArea) : "TEK",
        playerId: input.playerId,
      });
    }
    return rad;
  });
  await speilTilV2(prisma, updated, input.playerId);
  return { ok: true };
}

// ── Slett ────────────────────────────────────────────────────────────────

export async function removeWbSession(
  prisma: PrismaClient,
  input: { sessionId: string; playerId: string },
): Promise<{ ok: boolean; error?: string }> {
  const eksisterende = await finnEidOkt(prisma, input.sessionId, input.playerId);
  if (!eksisterende) return { ok: false, error: "Økt ikke funnet" };
  await deleteV2ForPlanSession(input.sessionId);
  await prisma.workbenchSession.delete({ where: { id: input.sessionId } });
  return { ok: true };
}

// ── Dupliser uke / enkeltøkt ────────────────────────────────────────────

const KOPIER_SELECT = {
  date: true,
  startMinute: true,
  durationMinutes: true,
  title: true,
  pyramid: true,
  blockType: true,
  environment: true,
  location: true,
  maalsetning: true,
  pressureLevel: true,
  pPosisjoner: true,
  drills: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      title: true,
      description: true,
      durationMinutes: true,
      akFormel: true,
      techniqueFocus: true,
      sourceId: true,
      exerciseId: true,
      sortOrder: true,
      repType: true,
      repAntall: true,
      repMinutter: true,
      repSett: true,
      repReps: true,
      planRepsUtenBall: true,
      planRepsLavFart: true,
      planRepsAuto: true,
      positionTaskId: true,
    },
  },
} satisfies Prisma.WorkbenchSessionSelect;

async function kopierOkt(
  prisma: PrismaClient,
  kilde: Prisma.WorkbenchSessionGetPayload<{ select: typeof KOPIER_SELECT }>,
  playerId: string,
  nyDato: Date,
): Promise<{ id: string; date: Date; startMinute: number; durationMinutes: number; pyramid: string; title: string; location: string | null; maalsetning: string | null; groupId: string | null }> {
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const rad = await tx.workbenchSession.create({
      data: {
        playerId,
        coachId: await resolveCoachIdForPlayer(playerId),
        date: nyDato,
        startMinute: kilde.startMinute,
        durationMinutes: kilde.durationMinutes,
        title: kilde.title,
        pyramid: kilde.pyramid,
        blockType: kilde.blockType,
        environment: kilde.environment,
        location: kilde.location,
        maalsetning: kilde.maalsetning,
        pressureLevel: kilde.pressureLevel,
        pPosisjoner: kilde.pPosisjoner,
        status: "PUBLISHED",
        origin: "PLAYER",
        createdBy: playerId,
        publishedAt: now,
        publishedBy: playerId,
      },
      select: { id: true, playerId: true, date: true, startMinute: true, durationMinutes: true, pyramid: true, title: true, location: true, maalsetning: true, groupId: true },
    });
    if (kilde.drills.length > 0) {
      await tx.workbenchDrill.createMany({
        // akFormel er NOT NULL i skjemaet — Prisma sin leseType er defensivt
        // bredere (JsonValue inkl. null) enn skrivetypen (InputJsonValue).
        data: kilde.drills.map((d) => ({ ...d, sessionId: rad.id, akFormel: d.akFormel as Prisma.InputJsonValue })),
      });
    }
    return rad;
  });
}

/** «Gjenta forrige uke»: kopier alle økter fra uka før måluka, +7 dager. */
export async function duplicateWbWeek(
  prisma: PrismaClient,
  playerId: string,
  targetWeekOffset = 0,
): Promise<{ ok: boolean; count?: number; error?: string }> {
  const refMandag = weekRefDate(targetWeekOffset);
  const kildeMandag = new Date(refMandag);
  kildeMandag.setDate(kildeMandag.getDate() - 7);

  const kilder = await prisma.workbenchSession.findMany({
    where: {
      playerId,
      date: { gte: lokalDatoTilKolonne(kildeMandag), lt: lokalDatoTilKolonne(refMandag) },
    },
    select: KOPIER_SELECT,
  });
  if (kilder.length === 0) return { ok: false, error: "Forrige uke har ingen økter" };

  let count = 0;
  for (const kilde of kilder) {
    const nyDato = new Date(kilde.date);
    nyDato.setUTCDate(nyDato.getUTCDate() + 7);
    const rad = await kopierOkt(prisma, kilde, playerId, nyDato);
    await speilTilV2(prisma, rad, playerId);
    count++;
  }
  return { ok: true, count };
}

/** Dupliser én økt — kopien legges neste dag, samme klokkeslett. */
export async function duplicateWbSession(
  prisma: PrismaClient,
  playerId: string,
  sessionId: string,
): Promise<{ ok: boolean; sessionId?: string; error?: string }> {
  const kilde = await prisma.workbenchSession.findFirst({
    where: { id: sessionId, playerId },
    select: KOPIER_SELECT,
  });
  if (!kilde) return { ok: false, error: "Økten finnes ikke" };

  const nyDato = new Date(kilde.date);
  nyDato.setUTCDate(nyDato.getUTCDate() + 1);
  const rad = await kopierOkt(prisma, kilde, playerId, nyDato);
  await speilTilV2(prisma, rad, playerId);
  return { ok: true, sessionId: rad.id };
}
