"use server";

import { canAccessPlayer } from "@/lib/auth/own-or-coached";

/**
 * PlayerHQ · Live-økt V2 — server actions for TrainingSessionV2.
 *
 * Henter økt + drills, logger reps per drill (DrillLogV2), og fullfører økta.
 */

import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { PyramidArea, SessionStatusV2 } from "@/generated/prisma/client";
import type { LiveV2Drill, LiveV2DrillLog, LiveV2Session } from "@/components/portal/live";
import { triggerLiveSessionAgent } from "@/lib/agents/triggers";
import { GENERERT_FRA } from "@/lib/workbench/v2-sync";
import { applyPositionTaskReps } from "@/lib/teknisk-plan/apply-reps";
import { beregnSRpe } from "@/lib/training/srpe";
import { DrillResultSchema, FysResultSchema, readDrillResults, type DrillResult } from "@/lib/portal-live/training-result";
import { golfLoggTall, lesFysRegistrering } from "@/lib/portal-live/fys-registrering";
import { z } from "zod";
import { summaryFieldUpdate } from "@/lib/portal-live/summary-field";

export type StartSessionResult =
  | { state: "active" }
  | { state: "completed"; redirectTo: string }
  | { state: "unavailable"; redirectTo: string };

export type CompleteDrillInput = {
  sessionId: string;
  drillId: string;
  repsTotal: number;
  repsWithoutBall: number;
  repsLowSpeed: number;
  repsAutomatic: number;
  repsHit: number;
  successRate?: number;
  notes?: string;
  /** Medgått tid på drillen (sekunder), fra live-timeren. Mater
   * varighetsestimatet neste gang drillen planlegges. */
  actualDurationSec?: number;
};

type AccessResult =
  | { ok: true; data: LiveV2Session }
  | { ok: false; reason: "notfound" | "forbidden" };

const AXIS_FOR_SESSION: PyramidArea = "TEK";

const MILJO_LABEL: Record<string, string> = {
  M0: "Innendørs",
  M1: "Driving range",
  M2: "Korte banen",
  M3: "Banen",
  M4: "Turnering",
  M5: "Simulator",
};

const PRACTICE_LABEL: Record<string, string> = {
  BLOKK: "Blokkpraksis",
  RANDOM: "Tilfeldig praksis",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spilltest",
};

/** Les coach-kommentar fra completedSummary.coachBrief.melding, fallback til notes. */
function readCoachComment(session: {
  notes: string | null;
  completedSummary: Prisma.JsonValue;
}): string | null {
  const raw = session.completedSummary;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const coachBrief = (raw as Record<string, unknown>).coachBrief;
    if (coachBrief && typeof coachBrief === "object" && !Array.isArray(coachBrief)) {
      const melding = (coachBrief as Record<string, unknown>).melding;
      if (typeof melding === "string" && melding.trim()) return melding;
    }
  }
  if (session.notes) return session.notes;
  return null;
}

/** Sjekk at brukeren har tilgang til økta (spiller, coach, admin, eller deltaker). */
async function verifyAccess(sessionId: string) {
  const user = await requireConsentingUser();

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    include: {
      drills: { orderBy: { sortOrder: "asc" } },
      participants: { where: { userId: user.id } },
    },
  });
  if (!session) throw new Error("not-found");

  const isOwner =
    session.studentId === user.id ||
    session.hostId === user.id ||
    session.coachId === user.id;
  const isParticipant = session.participants.some(
    (p) => p.userId === user.id && ["ACCEPTED", "ATTENDED"].includes(p.status),
  );

  if (!isOwner && !isParticipant && !(session.studentId && await canAccessPlayer(user, session.studentId))) {
    throw new Error("forbidden");
  }

  return { user, session };
}

/** Mapper en TrainingDrillV2 til live-view. */
function mapDrill(drill: {
  id: string;
  sortOrder: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  actualDurationSec: number | null;
  repetitions: number | null;
  pyramide: PyramidArea;
  lFase: string | null;
  notes: string | null;
  repType: string | null;
  repAntall: number | null;
  repMinutter: number | null;
  repSett: number | null;
  repReps: number | null;
  fysTreningstype: string | null;
  fysMuskelgruppe: string | null;
  fysSett: number | null;
  fysReps: number | null;
  fysVektKg: number | null;
  fysTempo: string | null;
  fysPauseSek: number | null;
  fysVarighetMin: number | null;
  fysIntensitetsSone: number | null;
  fysDistanseM: number | null;
  fysAktivitet: string | null;
  fysBevegelighetType: string | null;
  fysHoldSek: number | null;
}): LiveV2Drill {
  return {
    id: drill.id,
    index: drill.sortOrder + 1,
    name: drill.name,
    description: drill.description,
    durationMinutes: drill.durationMinutes,
    actualDurationSec: drill.actualDurationSec,
    plannedReps: drill.pyramide === "FYS" || drill.repType === "TID" || drill.repType === "SETT_REPS" ? 0 : drill.repetitions ?? drill.repAntall ?? 0,
    pyramide: drill.pyramide,
    lFase: drill.lFase,
    notes: drill.notes,
    repType: drill.repType,
    repAntall: drill.repAntall,
    repMinutter: drill.repMinutter,
    repSett: drill.repSett,
    repReps: drill.repReps,
    fysTreningstype: drill.fysTreningstype,
    fysMuskelgruppe: drill.fysMuskelgruppe,
    fysSett: drill.fysSett,
    fysReps: drill.fysReps,
    fysVektKg: drill.fysVektKg,
    fysTempo: drill.fysTempo,
    fysPauseSek: drill.fysPauseSek,
    fysVarighetMin: drill.fysVarighetMin,
    fysIntensitetsSone: drill.fysIntensitetsSone,
    fysDistanseM: drill.fysDistanseM,
    fysAktivitet: drill.fysAktivitet,
    fysBevegelighetType: drill.fysBevegelighetType,
    fysHoldSek: drill.fysHoldSek,
  };
}

/** Mapper DrillLogV2 til live-view. */
function mapLog(log: {
  drillId: string;
  repsTotal: number;
  repsWithoutBall: number;
  repsLowSpeed: number;
  repsAutomatic: number;
  repsHit: number;
  successRate: number;
  notes: string | null;
  loggedAt: Date;
}): LiveV2DrillLog {
  return {
    drillId: log.drillId,
    repsTotal: log.repsTotal,
    repsWithoutBall: log.repsWithoutBall,
    repsLowSpeed: log.repsLowSpeed,
    repsAutomatic: log.repsAutomatic,
    repsHit: log.repsHit,
    successRate: log.successRate,
    notes: log.notes,
    loggedAt: log.loggedAt.toISOString(),
  };
}

/** Henter sesjon + drills + eksisterende logger for live-økt.
 *  Feilfiks 5.1 (2026-07-13): bruker/rolle utledes INTERNT — som eksportert
 *  server action kunne funksjonen tidligere kalles fra klient med vilkårlig
 *  userId + isCoach=true og lese enhver økt. */
export async function loadLiveSession(sessionId: string): Promise<AccessResult> {
  const user = await requireConsentingUser();
  const userId = user.id;


  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    include: {
      drills: { orderBy: { sortOrder: "asc" } },
      participants: true,
    },
  });
  if (!session) return { ok: false, reason: "notfound" };

  const isOwner =
    session.studentId === userId ||
    session.hostId === userId ||
    session.coachId === userId;
  const isParticipant = session.participants.some((p) =>
    p.userId === userId && ["ACCEPTED", "ATTENDED"].includes(p.status),
  );

  if (!isOwner && !isParticipant && !(session.studentId && await canAccessPlayer(user, session.studentId))) {
    return { ok: false, reason: "forbidden" };
  }

  const [student, coach] = await Promise.all([
    session.studentId
      ? prisma.user.findUnique({
          where: { id: session.studentId },
          select: { name: true },
        })
      : Promise.resolve(null),
    session.coachId
      ? prisma.user.findUnique({
          where: { id: session.coachId },
          select: { name: true },
        })
      : Promise.resolve(null),
  ]);

  const existingLogs = await prisma.drillLogV2.findMany({
    where: { drill: { sessionId } },
    orderBy: { loggedAt: "asc" },
  });

  // Økt-pyramide utledes fra drills (majoritet), ellers TEK.
  const pyramideCounts = session.drills.reduce<Record<string, number>>((acc, d) => {
    acc[d.pyramide] = (acc[d.pyramide] ?? 0) + 1;
    return acc;
  }, {});
  const pyramide =
    (Object.entries(pyramideCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as PyramidArea) ??
    AXIS_FOR_SESSION;

  const data: LiveV2Session = {
    sessionId: session.id,
    title: session.title,
    coachComment: readCoachComment(session),
    focus: `${MILJO_LABEL[session.miljo] ?? session.miljo} · ${PRACTICE_LABEL[session.practiceType] ?? session.practiceType}`,
    status: session.status as SessionStatusV2,
    scheduledAtISO: session.startTime.toISOString(),
    endTimeISO: session.endTime.toISOString(),
    location: session.location,
    maalsetning: session.maalsetning,
    coachName: session.isCoachCreated ? coach?.name ?? null : null,
    publishedAtISO: session.createdAt.toISOString(),
    completed: session.status === "COMPLETED",
    studentName: student?.name ?? null,
    pyramide,
    drills: session.drills.map(drill => {
      const source = session.status === "COMPLETED" ? readDrillResults(session.completedSummary).find(r => r.drillId === drill.id)?.source : null;
      return mapDrill(source ? { ...drill, ...source.physicalDose, name: source.title, pyramide: source.pyramid,
        durationMinutes: source.durationMinutes, repType: source.repType, repAntall: source.repAntall,
        repMinutter: source.repMinutter, repSett: source.repSett, repReps: source.repReps,
        repetitions: source.repetitions !== undefined ? source.repetitions : drill.repetitions } : drill);
    }),
    existingLogs: existingLogs.map(mapLog),
    completedSummary: session.completedSummary,
  };

  return { ok: true, data };
}


/** Starter økta (PLANNED → IN_PROGRESS). */
export async function startSession(sessionId: string): Promise<StartSessionResult> {
  const { user, session } = await verifyAccess(sessionId);

  switch (session.status) {
    case "PLANNED":
      await prisma.trainingSessionV2.update({
        where: { id: sessionId },
        data: { status: "IN_PROGRESS" },
      });
      void triggerLiveSessionAgent({ userId: user.id, sessionId, kind: "session-v2" });
      revalidatePath(`/portal/live/${sessionId}`);
      return { state: "active" };
    case "IN_PROGRESS":
      return { state: "active" };
    case "COMPLETED":
      return { state: "completed", redirectTo: `/portal/live/${sessionId}/summary` };
    case "CANCELLED":
    case "SKIPPED":
    default:
      return { state: "unavailable", redirectTo: "/portal/planlegge" };
  }
}

/** Logger reps for en drill (upsert på drillId + loggedBy). */
export async function logDrillReps(input: CompleteDrillInput): Promise<{ ok: boolean }> {
  const { user, session } = await verifyAccess(input.sessionId);
  if (session.status !== "IN_PROGRESS") return { ok: false };
  if (!session.drills.some((drill) => drill.id === input.drillId)) throw new Error("Øvelsen tilhører ikke denne økta.");
  const counters = [input.repsTotal, input.repsWithoutBall, input.repsLowSpeed, input.repsAutomatic, input.repsHit];
  if (counters.some((value) => !Number.isSafeInteger(value) || value < 0 || value > 100000)) throw new Error("Kontroller antall registreringer.");

  const parsed = z.object({ successRate: z.number().int().min(0).max(100).optional(), notes: z.string().max(4000).optional(), actualDurationSec: z.number().int().min(0).max(43200).optional() }).safeParse(input);
  if (!parsed.success) throw new Error("Ugyldig treningsresultat.");
  const successRate = input.successRate ?? (input.repsTotal > 0 ? Math.round((input.repsHit / input.repsTotal) * 100) : 0);
  if (successRate > 100) throw new Error("Kontroller antall treff.");
  const saved = await prisma.$transaction(async tx => {
    // Samme radlås som fullføring: siste resultat kan ikke lande etter sluttstatus.
    const locked = await tx.$queryRaw<{ status: string; completedSummary: Prisma.JsonValue }[]>(Prisma.sql`SELECT status, "completedSummary" FROM training_sessions_v2 WHERE id = ${session.id} FOR UPDATE`);
    if (locked[0]?.status !== "IN_PROGRESS") return false;
    const drill = await tx.trainingDrillV2.findUniqueOrThrow({ where: { id: input.drillId }, select: { name: true, durationMinutes: true, exerciseId: true, repetitions: true, belastning: true,
      fysTreningstype: true, fysSett: true, fysReps: true, fysVektKg: true, fysPauseSek: true,
      fysVarighetMin: true, fysIntensitetsSone: true, fysDistanseM: true, fysBevegelighetType: true,
      fysHoldSek: true, fysTempo: true, fysAktivitet: true, repType: true, repAntall: true, repMinutter: true, repSett: true, repReps: true, pyramide: true, positionTaskId: true, actualDurationSec: true, positionTask: { select: { updatedAt: true, position: { select: { plan: { select: { userId: true } } } } } } } });
    if (drill.pyramide !== "FYS" && input.repsTotal !== input.repsWithoutBall + input.repsLowSpeed + input.repsAutomatic + input.repsHit) throw new Error("Antall må stemme med registreringene.");
    const existing = await tx.drillLogV2.findFirst({ where: { drillId: input.drillId, loggedBy: user.id }, orderBy: { loggedAt: "desc" } });
    const data = { repsTotal: input.repsTotal, repsWithoutBall: input.repsWithoutBall, repsLowSpeed: input.repsLowSpeed, repsAutomatic: input.repsAutomatic, repsHit: input.repsHit, successRate, notes: input.notes ?? null };
    if (existing) await tx.drillLogV2.update({ where: { id: existing.id }, data: { ...data, loggedAt: new Date() } });
    else await tx.drillLogV2.create({ data: { ...data, drillId: input.drillId, loggedBy: user.id } });
    if (input.actualDurationSec != null && input.actualDurationSec > (drill.actualDurationSec ?? 0)) await tx.trainingDrillV2.update({ where: { id: input.drillId }, data: { actualDurationSec: input.actualDurationSec } });
    if (drill.pyramide !== "FYS" && drill.positionTaskId && drill.positionTask?.position.plan.userId === user.id) {
      await applyPositionTaskReps(drill.positionTaskId, {
        dry: input.repsWithoutBall - (existing?.repsWithoutBall ?? 0),
        lav: input.repsLowSpeed - (existing?.repsLowSpeed ?? 0),
        full: input.repsAutomatic + input.repsHit - (existing?.repsAutomatic ?? 0) - (existing?.repsHit ?? 0),
      }, user.id, { sessionV2Id: input.sessionId, belastning: drill.belastning ?? null }, tx);
    }
    const priorResults = readDrillResults(locked[0].completedSummary);
    const oldResult = priorResults.find(r => r.drillId === input.drillId);
    const fys = FysResultSchema.safeParse(lesFysRegistrering(input.notes));
    const measured = drill.pyramide === "FYS" ? (fys.success ? fys.data : null) : {
      type: "golf" as const, repsWithoutBall: input.repsWithoutBall, repsLowSpeed: input.repsLowSpeed,
      repsAutomatic: input.repsAutomatic, repsHit: input.repsHit, notat: input.notes ?? "",
    };
    if (!measured && oldResult) throw new Error("Den fysiske registreringen kunne ikke leses. Ingen data er endret.");
    if (measured) {
      const result: DrillResult = {
        drillId: input.drillId, result: measured, actualDurationSec: input.actualDurationSec == null ? drill.actualDurationSec : Math.max(input.actualDurationSec, drill.actualDurationSec ?? 0),
        loggedAt: new Date().toISOString(), source: oldResult?.source ?? {
          repetitions: drill.repetitions ?? null, belastning: drill.belastning ?? null,
          ...(drill.pyramide === "FYS" ? { physicalDose: {
            fysTreningstype: drill.fysTreningstype ?? null, fysSett: drill.fysSett ?? null, fysReps: drill.fysReps ?? null,
            fysVektKg: drill.fysVektKg ?? null, fysPauseSek: drill.fysPauseSek ?? null, fysVarighetMin: drill.fysVarighetMin ?? null,
            fysIntensitetsSone: drill.fysIntensitetsSone ?? null, fysDistanseM: drill.fysDistanseM ?? null,
            fysBevegelighetType: drill.fysBevegelighetType ?? null, fysHoldSek: drill.fysHoldSek ?? null,
            fysTempo: drill.fysTempo ?? null, fysAktivitet: drill.fysAktivitet ?? null,
          } } : {}),
          pyramid: drill.pyramide, planRevision: session.updatedAt.toISOString(), sourceId: drill.positionTaskId ?? drill.exerciseId,
          sourceRevision: drill.positionTask?.updatedAt.toISOString() ?? null, positionTaskId: drill.positionTaskId, exerciseId: drill.exerciseId,
          title: drill.name, akFormel: null, repType: drill.repType, repAntall: drill.repAntall,
          repMinutter: drill.repMinutter, repSett: drill.repSett, repReps: drill.repReps, durationMinutes: drill.durationMinutes,
        },
      };
      if (!DrillResultSchema.safeParse(result).success) throw new Error("Treningsresultatets kilde eller enhet er ugyldig.");
      const root = locked[0].completedSummary && typeof locked[0].completedSummary === "object" && !Array.isArray(locked[0].completedSummary) ? locked[0].completedSummary : {};
      await tx.trainingSessionV2.update({ where: { id: session.id }, data: { completedSummary: { ...root, drillResults: [...priorResults.filter(r => r.drillId !== input.drillId), result] } } });
    }
    return true;
  });
  if (!saved) return { ok: false };

  revalidatePath(`/portal/live/${input.sessionId}`);
  revalidatePath(`/portal/live/${input.sessionId}/active`);
  revalidatePath(`/portal/live/${input.sessionId}/summary`);
  return { ok: true };
}

/** Markerer en drill som fullført ved å logge reps. Alias for logDrillReps. */
export async function completeDrill(input: CompleteDrillInput): Promise<{ ok: boolean }> {
  return logDrillReps(input);
}

/** Fullfører økt og planspeil samlet. Klienten åpner oppsummeringen etter bekreftet svar. */
export async function completeSession(sessionId: string, clientDurationSec?: number, completedDrillIds?: string[]): Promise<{ href: string }> {
  const { user, session } = await verifyAccess(sessionId);

  if (session.status === "COMPLETED") {
    return { href: `/portal/live/${sessionId}/summary` };
  }

  if (session.status !== "IN_PROGRESS") throw new Error("Økta er ikke pågående.");
  if (clientDurationSec != null && (!Number.isSafeInteger(clientDurationSec) || clientDurationSec < 0)) throw new Error("Ugyldig varighet.");
  if (completedDrillIds && (!Array.isArray(completedDrillIds) || completedDrillIds.some((id) => !session.drills.some((drill) => drill.id === id)))) throw new Error("Ugyldig øvelse i fullføringen.");

  await prisma.$transaction(async tx => {
    const locked = await tx.$queryRaw<{ status: string; completedSummary: Prisma.JsonValue }[]>(Prisma.sql`SELECT status, "completedSummary" FROM training_sessions_v2 WHERE id = ${sessionId} FOR UPDATE`);
    if (locked[0]?.status === "COMPLETED") return;
    if (locked[0]?.status !== "IN_PROGRESS") throw new Error("Økta er ikke pågående.");
  const logs = await tx.drillLogV2.findMany({
    where: { drill: { sessionId } },
    orderBy: { loggedAt: "asc" },
  });

  const totalReps = golfLoggTall(session.drills.map(d => ({ id: d.id, pyramide: d.pyramide, plannedReps: d.repetitions ?? 0 })), logs).totalReps;
  const drillsCompleted = completedDrillIds ? new Set(completedDrillIds).size : new Set(logs.map((log) => log.drillId)).size;
  const startedAt = logs.length > 0 ? logs[0].loggedAt : session.startTime;
  const lastLoggedAt = logs.length > 0 ? logs[logs.length - 1].loggedAt : new Date();
  const computedDurationSec = Math.max(
    0,
    Math.round((lastLoggedAt.getTime() - startedAt.getTime()) / 1000),
  );
  const durationSec = clientDurationSec ?? computedDurationSec;

  const existingSummary =
    locked[0].completedSummary &&
    typeof locked[0].completedSummary === "object" &&
    !Array.isArray(locked[0].completedSummary)
      ? locked[0].completedSummary
      : {};

  const summary = {
    ...existingSummary,
    liveSummary: {
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      durationSec,
      totalReps,
      drillsCompleted,
      ...(completedDrillIds ? { completedDrillIds: [...new Set(completedDrillIds)] } : {}),
      loggedBy: user.id,
    },
  };

  const writes: Prisma.PrismaPromise<unknown>[] = [tx.trainingSessionV2.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      completedSummary: summary,
    },
  })];

  // Speil tilbake til plan-økta — etterlevelsen (adherence/compliance) leser
  // plan-sida, ellers telles ikke live-fullførte økter. Skriv også
  // TrainingPlanSessionLog (totalReps + drillAggregates) for Bølge 5-lesere.
  if (session.generertFra === GENERERT_FRA && session.generertFraId) {
    const drillAggregates = logs.map((l) => ({
      drillId: l.drillId,
      repsTotal: l.repsTotal,
      repsWithoutBall: l.repsWithoutBall,
      repsLowSpeed: l.repsLowSpeed,
      repsAutomatic: l.repsAutomatic,
      repsHit: l.repsHit,
    }));
    writes.push(
      tx.trainingPlanSession.updateMany({
        where: { id: session.generertFraId },
        data: { status: "COMPLETED", liveSnapshot: Prisma.DbNull },
      }),
      tx.trainingPlanSessionLog.upsert({
        where: { sessionId: session.generertFraId },
        create: {
          sessionId: session.generertFraId,
          startedAt,
          completedAt: new Date(),
          totalReps,
          rating: null,
          drillAggregates: drillAggregates,
        },
        update: {
          completedAt: new Date(),
          totalReps,
          drillAggregates: drillAggregates,
        },
      }),
    );
  }

  await Promise.all(writes);

  });

  revalidatePath("/portal/planlegge");
  revalidatePath(`/portal/live/${sessionId}`);
  return { href: `/portal/live/${sessionId}/summary` };
}

/** «Dine ord» etter økt → completedSummary.dineOrd (Paper PP-3, ETTER-skjermen).
 *  Samme lagringsmønster som spillerVurdering — ingen ny persistens, kun et
 *  felt til i completedSummary-JSON-en. Speiles til plan-økt-loggen så coachen
 *  ser spillerens oppsummering i stallen. */
export async function lagreDineOrd(
  sessionId: string,
  tekst: string,
): Promise<{ ok: boolean; error?: string }> {
  const { user, session } = await verifyAccess(sessionId);
  if (session.status !== "COMPLETED") {
    return { ok: false, error: "Økta er ikke fullført ennå" };
  }
  const ord = tekst.trim();
  if (!ord || ord.length > 2000) {
    return { ok: false, error: !ord ? "Skriv noe først — ett ord er nok" : "Oppsummeringen kan ha inntil 2 000 tegn" };
  }
  const count = await prisma.$executeRaw(summaryFieldUpdate(sessionId, "dineOrd", {
    tekst: ord,
    loggedBy: user.id,
    loggedAt: new Date().toISOString(),
  }));
  if (count !== 1) return { ok: false, error: "Økta er ikke tilgjengelig for lagring. Prøv igjen." };

  // Bevisst INGEN speiling til TrainingPlanSessionLog.notes her —
  // lagreSpillerVurdering eier det feltet (spiller-fokus), og en upsert
  // herfra ville overskrevet det. Coachen leser dineOrd fra completedSummary.

  revalidatePath(`/portal/live/${sessionId}/summary`);
  revalidatePath("/portal/planlegge");
  return { ok: true };
}

/** Spiller-vurdering etter økt → completedSummary.spillerVurdering (write-back). */
export async function lagreSpillerVurdering(
  sessionId: string,
  input: { kvalitet: number; nesteFokus: string; folelse?: string; rpe?: number },
): Promise<{ ok: boolean; error?: string }> {
  const { user, session } = await verifyAccess(sessionId);
  if (session.status !== "COMPLETED") {
    return { ok: false, error: "Økta er ikke fullført ennå" };
  }
  if (!Number.isInteger(input.kvalitet) || input.kvalitet < 1 || input.kvalitet > 5) {
    return { ok: false, error: "Kvalitet må være 1–5" };
  }
  if (
    input.rpe !== undefined &&
    (!Number.isInteger(input.rpe) || input.rpe < 1 || input.rpe > 10)
  ) {
    return { ok: false, error: "RPE må være et helt tall 1–10" };
  }

  const existing =
    session.completedSummary &&
    typeof session.completedSummary === "object" &&
    !Array.isArray(session.completedSummary)
      ? session.completedSummary
      : {};

  // sRPE (Foster): økt-RPE × varighet i minutter = belastningspoeng.
  // Varighet hentes fra serverens egen liveSummary (skrevet av completeSession),
  // aldri fra klienten. Uten varighet lagres RPE alene (sRpe = null).
  const liveSummary =
    existing.liveSummary && typeof existing.liveSummary === "object"
      ? (existing.liveSummary as Record<string, unknown>)
      : null;
  const durationSec =
    typeof liveSummary?.durationSec === "number" ? liveSummary.durationSec : null;
  const { durationMin, sRpe } = beregnSRpe(input.rpe, durationSec);

  await prisma.$transaction(async (tx) => {
    const count = await tx.$executeRaw(summaryFieldUpdate(sessionId, "spillerVurdering", {
      kvalitet: input.kvalitet,
      nesteFokus: input.nesteFokus.trim().slice(0, 500),
      folelse: input.folelse?.trim().slice(0, 200) || null,
      rpe: input.rpe ?? null,
      durationMin,
      sRpe,
      loggedBy: user.id,
      loggedAt: new Date().toISOString(),
    }));
    if (count !== 1) throw new Error("Økta er ikke tilgjengelig for lagring");

    // Vurdering og eventuelt planspeil lagres samlet; feil beholder begge førverdiene.
    if (session.generertFra === GENERERT_FRA && session.generertFraId && input.nesteFokus.trim()) {
      const fokus = input.nesteFokus.trim().slice(0, 500);
      await tx.trainingPlanSessionLog.upsert({
        where: { sessionId: session.generertFraId },
        create: { sessionId: session.generertFraId, startedAt: new Date(), notes: `Spiller-fokus etter økt: ${fokus}`, rating: input.kvalitet },
        update: { notes: `Spiller-fokus etter økt: ${fokus}`, rating: input.kvalitet },
      });
    }
  });

  revalidatePath(`/portal/live/${sessionId}/summary`);
  revalidatePath("/portal/planlegge");
  return { ok: true };
}
