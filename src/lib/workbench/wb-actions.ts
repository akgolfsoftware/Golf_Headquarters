"use server";

/**
 * Workbench-kjernen — server actions (natt-plan 25.08.2026, Loop 1).
 *
 * Persistens for den nye Workbench-modellen. Domenet i
 * `src/lib/domain/workbench/` er rent; alle sideeffekter bor her.
 *
 * Tilgang: spilleren selv, eller en coach/admin som faktisk har tilgang til
 * spilleren (`harCoachTilgangTilSpiller`) — rolle-sjekk alene er ikke nok.
 *
 * Personvern: logg IDer, aldri navn.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import {
  addDrill as addDrillPure,
  buildWeekViewModel,
  createSession as createSessionPure,
  moveSession as moveSessionPure,
  publishSession as publishSessionPure,
  reorderDrills as reorderDrillsPure,
  unpublishSession as unpublishSessionPure,
} from "@/lib/domain/workbench/operations";
import type {
  AKFormel,
  SourceItem,
  WeekViewModel,
  WorkbenchMode,
  WorkbenchSession,
} from "@/lib/domain/workbench/types";
import {
  AkFormelSchema,
  BlockTypeSchema,
  EnvironmentSchema,
  IsoDateSchema,
  MoveSessionInputSchema,
  PyramidAreaSchema,
  ReorderDrillsInputSchema,
} from "@/lib/domain/workbench/schemas";
import {
  SPILLER_SYNLIGE_STATUSER,
  mapSession,
  tilDatoKolonne,
  type WbRow,
} from "@/lib/workbench/wb-map";

// ─── Resultattype ───────────────────────────────────────────────────────────

export type WbResultat<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * AKFormel → Prisma JSON. Eksplisitt felt for felt: et cast ville sneket
 * ugyldige verdier forbi typesjekken (CLAUDE.md invariant 6).
 */
function akFormelTilJson(f: AKFormel): Prisma.InputJsonObject {
  return {
    pyramid: f.pyramid,
    area: f.area,
    label: f.label,
    ...(f.motorikk ? { motorikk: f.motorikk } : {}),
    ...(f.belastning ? { belastning: f.belastning } : {}),
    ...(f.press ? { press: f.press } : {}),
  };
}

const INGEN_TILGANG = "Du har ikke tilgang til denne spilleren.";
const FINNES_IKKE = "Fant ikke økten.";

/**
 * Ruter som leser Workbench-tabellene. Kalles etter hver skriving slik at
 * coach-uka og spillerens dag ikke serverer en foreldet cache.
 */
function revalider(playerId: string): void {
  revalidatePath(`/admin/workbench/${playerId}`);
  revalidatePath("/portal");
}

// ─── Tilgang ────────────────────────────────────────────────────────────────

type Viewer = { id: string; role: string };

async function kreverTilgangTilSpiller(playerId: string): Promise<Viewer | null> {
  const user = await requirePortalUser();
  if (user.id === playerId) return { id: user.id, role: user.role };
  if (user.role !== "COACH" && user.role !== "ADMIN") return null;
  const harTilgang = await harCoachTilgangTilSpiller(
    { id: user.id, role: user.role },
    playerId,
  );
  return harTilgang ? { id: user.id, role: user.role } : null;
}

/** Henter økten og verifiserer at innloggede har lov til å røre den. */
async function hentMedTilgang(
  sessionId: string,
): Promise<{ row: WbRow; viewer: Viewer } | { feil: string }> {
  const row = await prisma.workbenchSession.findUnique({
    where: { id: sessionId },
    include: { drills: true },
  });
  if (!row) return { feil: FINNES_IKKE };
  const viewer = await kreverTilgangTilSpiller(row.playerId);
  if (!viewer) return { feil: INGEN_TILGANG };
  return { row, viewer };
}

// ─── Skjemaer ───────────────────────────────────────────────────────────────

const DrillInputSchema = z.object({
  title: z.string().min(1, "Øvelsen må ha et navn"),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(1).max(600),
  akFormel: AkFormelSchema,
  techniqueFocus: z.string().optional(),
  sourceId: z.string().optional(),
});

const CreateSessionSchema = z.object({
  playerId: z.string().min(1),
  date: IsoDateSchema,
  startMinute: z.number().int().min(0).max(1439),
  durationMinutes: z.number().int().min(15).max(720),
  title: z.string().min(1, "Økten må ha en tittel"),
  pyramid: PyramidAreaSchema,
  blockType: BlockTypeSchema.optional(),
  environment: EnvironmentSchema.optional(),
  notes: z.string().optional(),
  groupId: z.string().optional(),
  drills: z.array(DrillInputSchema).optional(),
});

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;

// ─── Lesing ─────────────────────────────────────────────────────────────────

/**
 * Hele uka for én spiller — coach-siden. Inneholder DRAFT.
 * Låste blokker (skole, booking) er tomme i Loop 1; de kobles på i Loop 2.
 */
export async function loadWeek(params: {
  weekStart: string;
  mode: WorkbenchMode;
  playerId: string;
  targetMinutes?: number;
}): Promise<WbResultat<WeekViewModel>> {
  const weekStart = IsoDateSchema.safeParse(params.weekStart);
  if (!weekStart.success) return { ok: false, error: "Ugyldig ukestart." };

  const viewer = await kreverTilgangTilSpiller(params.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const fra = tilDatoKolonne(weekStart.data);
  const til = new Date(fra);
  til.setUTCDate(til.getUTCDate() + 6);

  const rows = await prisma.workbenchSession.findMany({
    where: { playerId: params.playerId, date: { gte: fra, lte: til } },
    include: { drills: true },
    orderBy: [{ date: "asc" }, { startMinute: "asc" }],
  });

  const vm = buildWeekViewModel(
    weekStart.data,
    rows.map(mapSession),
    [],
    params.mode,
    params.targetMinutes ?? 0,
  );
  return { ok: true, data: vm };
}

/** Én økt — inspektør / dyplenke. */
export async function loadSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession | null>> {
  const treff = await hentMedTilgang(sessionId);
  if ("feil" in treff) {
    return treff.feil === FINNES_IKKE
      ? { ok: true, data: null }
      : { ok: false, error: treff.feil };
  }
  return { ok: true, data: mapSession(treff.row) };
}

/**
 * Kildepanelet (øvelsesbank, maler, forrige uke).
 * Tom liste i Loop 1 — innholdet kommer i Loop 2T (skall) og Loop 3.
 */
export async function loadSources(params: {
  playerId: string;
}): Promise<WbResultat<SourceItem[]>> {
  const viewer = await kreverTilgangTilSpiller(params.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };
  return { ok: true, data: [] };
}

/** Én økt slik den vises spilleren i «I dag» — se `loadPlayerDay`. */
export type PlayerDaySession = {
  id: string;
  title: string;
  startMinute: number;
  durationMinutes: number;
  pyramid: string;
  status: string;
  drillsCount: number;
  location?: string;
};

/** Resultattype for `loadPlayerDay` — brukt av klientkomponenter (type-only import). */
export type PlayerDayResult = WbResultat<{
  date: string;
  sessions: PlayerDaySession[];
  nextSessionId: string | null;
}>;

/**
 * Player HQ «I dag». Returnerer ALDRI DRAFT — kun publiserte, pågående og
 * fullførte økter. Dette er den harde regelen i hele Loop 1.
 */
export async function loadPlayerDay(params: {
  playerId: string;
  date: string;
}): Promise<PlayerDayResult> {
  const dato = IsoDateSchema.safeParse(params.date);
  if (!dato.success) return { ok: false, error: "Ugyldig dato." };

  const viewer = await kreverTilgangTilSpiller(params.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const rows = await prisma.workbenchSession.findMany({
    where: {
      playerId: params.playerId,
      date: tilDatoKolonne(dato.data),
      status: { in: [...SPILLER_SYNLIGE_STATUSER] },
    },
    include: { drills: true },
    orderBy: { startMinute: "asc" },
  });

  const sessions = rows.map(mapSession).map((s) => ({
    id: s.id,
    title: s.title,
    startMinute: s.startMinute,
    durationMinutes: s.durationMinutes,
    pyramid: s.pyramid,
    status: s.status,
    drillsCount: s.drills.length,
    location: s.location,
  }));

  const neste =
    sessions.find((s) => s.status !== "COMPLETED")?.id ??
    sessions[0]?.id ??
    null;

  return { ok: true, data: { date: dato.data, sessions, nextSessionId: neste } };
}

/**
 * Spillerens eget økt-ark. I motsetning til `loadSession` (coach-siden)
 * filtrerer denne PÅ STATUS i tillegg til eierskap — DRAFT er aldri synlig
 * for spilleren, selv om spilleren selv eier raden (invariant 3, CLAUDE.md).
 * Kun spilleren selv (ikke coach) bruker denne — coach har inspektøren.
 */
export async function loadPlayerSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession | null>> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const row = await prisma.workbenchSession.findUnique({
    where: { id: sessionId },
    include: { drills: true },
  });
  if (!row || row.playerId !== user.id) return { ok: true, data: null };

  const session = mapSession(row);
  const synligStatuser: readonly string[] = SPILLER_SYNLIGE_STATUSER;
  if (!synligStatuser.includes(session.status)) return { ok: true, data: null };

  return { ok: true, data: session };
}

// ─── Skriving ───────────────────────────────────────────────────────────────

async function lagreOgHent(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession>> {
  const row = await prisma.workbenchSession.findUnique({
    where: { id: sessionId },
    include: { drills: true },
  });
  if (!row) return { ok: false, error: FINNES_IKKE };
  revalider(row.playerId);
  return { ok: true, data: mapSession(row) };
}

/** Ny økt. Alltid DRAFT — spilleren ser den først etter publisering. */
export async function createSession(
  input: CreateSessionInput,
): Promise<WbResultat<WorkbenchSession>> {
  const parsed = CreateSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldige felter." };
  }
  const cmd = parsed.data;

  const viewer = await kreverTilgangTilSpiller(cmd.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const erCoach = viewer.id !== cmd.playerId;
  const utkast = createSessionPure({
    playerId: cmd.playerId,
    coachId: viewer.id,
    date: cmd.date,
    startMinute: cmd.startMinute,
    durationMinutes: cmd.durationMinutes,
    title: cmd.title,
    pyramid: cmd.pyramid,
    blockType: cmd.blockType,
    environment: cmd.environment,
    notes: cmd.notes,
    groupId: cmd.groupId,
    drills: cmd.drills,
    createdBy: erCoach ? "COACH" : "PLAYER",
  });

  const rad = await prisma.workbenchSession.create({
    data: {
      playerId: utkast.playerId,
      coachId: utkast.coachId,
      groupId: utkast.groupId ?? null,
      date: tilDatoKolonne(utkast.date),
      startMinute: utkast.startMinute,
      durationMinutes: utkast.durationMinutes,
      title: utkast.title,
      pyramid: utkast.pyramid,
      status: utkast.status,
      blockType: utkast.blockType,
      environment: utkast.environment ?? null,
      notes: utkast.notes ?? null,
      origin: utkast.origin,
      createdBy: utkast.createdBy,
      drills: {
        create: utkast.drills.map((d) => ({
          title: d.title,
          description: d.description ?? null,
          durationMinutes: d.durationMinutes,
          akFormel: akFormelTilJson(d.akFormel),
          techniqueFocus: d.techniqueFocus ?? null,
          sourceId: d.sourceId ?? null,
          sortOrder: d.order,
        })),
      },
    },
    include: { drills: true },
  });

  revalider(rad.playerId);
  return { ok: true, data: mapSession(rad) };
}

/** Flytt / endre lengde. */
export async function moveSession(input: {
  sessionId: string;
  newDate: string;
  newStartMinute: number;
  newDurationMinutes?: number;
}): Promise<WbResultat<WorkbenchSession>> {
  const parsed = MoveSessionInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig flytting." };
  }

  const treff = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const flyttet = moveSessionPure(mapSession(treff.row), {
    sessionId: parsed.data.sessionId,
    newDate: parsed.data.newDate,
    newStartMinute: parsed.data.newStartMinute,
    newDurationMinutes: parsed.data.newDurationMinutes,
  });

  await prisma.workbenchSession.update({
    where: { id: parsed.data.sessionId },
    data: {
      date: tilDatoKolonne(flyttet.date),
      startMinute: flyttet.startMinute,
      durationMinutes: flyttet.durationMinutes,
    },
  });

  return lagreOgHent(parsed.data.sessionId);
}

/** Publiser et utvalg økter — dette er øyeblikket spilleren ser dem. */
export async function publishSessions(
  sessionIds: string[],
): Promise<WbResultat<WorkbenchSession[]>> {
  if (sessionIds.length === 0) return { ok: true, data: [] };

  const publiserte: WorkbenchSession[] = [];
  for (const id of sessionIds) {
    const treff = await hentMedTilgang(id);
    if ("feil" in treff) return { ok: false, error: treff.feil };

    let neste: WorkbenchSession;
    try {
      neste = publishSessionPure(mapSession(treff.row), {
        sessionId: id,
        publishedBy: treff.viewer.id,
      });
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Kunne ikke publisere økten.",
      };
    }

    const rad = await prisma.workbenchSession.update({
      where: { id },
      data: {
        status: neste.status,
        publishedAt: neste.publishedAt ? new Date(neste.publishedAt) : null,
        publishedBy: neste.publishedBy ?? null,
      },
      include: { drills: true },
    });
    publiserte.push(mapSession(rad));
    revalider(rad.playerId);
  }

  return { ok: true, data: publiserte };
}

/** Trekk tilbake — økten blir utkast igjen og forsvinner fra spillerens dag. */
export async function unpublishSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession>> {
  const treff = await hentMedTilgang(sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const neste = unpublishSessionPure(mapSession(treff.row));
  await prisma.workbenchSession.update({
    where: { id: sessionId },
    data: { status: neste.status, publishedAt: null, publishedBy: null },
  });

  return lagreOgHent(sessionId);
}

/** Legg til øvelse. Vokser øktlengden hvis øvelsene blir lengre enn økten. */
export async function addDrill(input: {
  sessionId: string;
  drill: z.infer<typeof DrillInputSchema>;
  atIndex?: number;
}): Promise<WbResultat<WorkbenchSession>> {
  const parsed = DrillInputSchema.safeParse(input.drill);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig øvelse." };
  }

  const treff = await hentMedTilgang(input.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const neste = addDrillPure(mapSession(treff.row), {
    sessionId: input.sessionId,
    drill: parsed.data,
    atIndex: input.atIndex,
  });

  await prisma.$transaction(async (tx) => {
    await tx.workbenchDrill.deleteMany({ where: { sessionId: input.sessionId } });
    await tx.workbenchSession.update({
      where: { id: input.sessionId },
      data: {
        durationMinutes: neste.durationMinutes,
        drills: {
          create: neste.drills.map((d) => ({
            title: d.title,
            description: d.description ?? null,
            durationMinutes: d.durationMinutes,
            akFormel: akFormelTilJson(d.akFormel),
            techniqueFocus: d.techniqueFocus ?? null,
            sourceId: d.sourceId ?? null,
            sortOrder: d.order,
          })),
        },
      },
    });
  });

  return lagreOgHent(input.sessionId);
}

/** Ny rekkefølge på øvelsene. */
export async function reorderDrills(input: {
  sessionId: string;
  orderedDrillIds: string[];
}): Promise<WbResultat<WorkbenchSession>> {
  const parsed = ReorderDrillsInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig rekkefølge." };
  }

  const treff = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const neste = reorderDrillsPure(mapSession(treff.row), {
    sessionId: parsed.data.sessionId,
    orderedDrillIds: parsed.data.orderedDrillIds,
  });

  await prisma.$transaction(
    neste.drills.map((d) =>
      prisma.workbenchDrill.update({
        where: { id: d.id },
        data: { sortOrder: d.order },
      }),
    ),
  );

  return lagreOgHent(parsed.data.sessionId);
}

/** Fjern én øvelse og reindekser resten. */
export async function removeDrill(input: {
  sessionId: string;
  drillId: string;
}): Promise<WbResultat<WorkbenchSession>> {
  const treff = await hentMedTilgang(input.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };
  if (!treff.row.drills.some((d) => d.id === input.drillId)) {
    return { ok: false, error: "Fant ikke øvelsen i denne økten." };
  }

  const beholdt = treff.row.drills
    .filter((d) => d.id !== input.drillId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  await prisma.$transaction([
    prisma.workbenchDrill.delete({ where: { id: input.drillId } }),
    ...beholdt.map((d, i) =>
      prisma.workbenchDrill.update({
        where: { id: d.id },
        data: { sortOrder: i },
      }),
    ),
  ]);

  return lagreOgHent(input.sessionId);
}

/** Slett økten. Øvelsene følger med (ON DELETE CASCADE). */
export async function deleteSession(
  sessionId: string,
): Promise<WbResultat<null>> {
  const treff = await hentMedTilgang(sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  await prisma.workbenchSession.delete({ where: { id: sessionId } });
  revalider(treff.row.playerId);
  return { ok: true, data: null };
}

// ─── Gjennomføring ──────────────────────────────────────────────────────────

async function settStatus(
  sessionId: string,
  status: "IN_PROGRESS" | "COMPLETED" | "SKIPPED",
  kreverPublisert: boolean,
): Promise<WbResultat<WorkbenchSession>> {
  const treff = await hentMedTilgang(sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  if (kreverPublisert && treff.row.status === "DRAFT") {
    return { ok: false, error: "Økten er ikke publisert ennå." };
  }

  await prisma.workbenchSession.update({
    where: { id: sessionId },
    data: { status },
  });
  return lagreOgHent(sessionId);
}

/** Start økten. Et utkast kan ikke startes — det finnes ikke for spilleren. */
export async function startSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession>> {
  return settStatus(sessionId, "IN_PROGRESS", true);
}

export async function completeSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession>> {
  return settStatus(sessionId, "COMPLETED", true);
}

export async function skipSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession>> {
  return settStatus(sessionId, "SKIPPED", false);
}

// ─── Godkjenning (Loop 3T) ──────────────────────────────────────────────────

/**
 * Spillerens ja/nei på en coach- eller gruppeøkt.
 * Ikke implementert i Loop 1 — hele godkjenningsflyten hører til Loop 3T
 * (se docs/natt/workbench/integration/player-hq.md).
 */
export async function resolvePlayerApproval(): Promise<WbResultat<never>> {
  return { ok: false, error: "Godkjenning er ikke koblet på ennå (Loop 3T)." };
}
