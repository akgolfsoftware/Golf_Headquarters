"use server";

/**
 * PlayerHQ · Live-økt V2 — server actions for TrainingSessionV2.
 *
 * Henter økt + drills, logger reps per drill (DrillLogV2), og fullfører økta.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { PyramidArea, SessionStatusV2 } from "@/generated/prisma/client";
import type { LiveV2Drill, LiveV2DrillLog, LiveV2Session } from "@/components/portal/live";

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

  const isAdmin = user.role === "ADMIN";
  const isCoach = user.role === "COACH";
  const isOwner =
    session.studentId === user.id ||
    session.hostId === user.id ||
    session.coachId === user.id;
  const isParticipant = session.participants.some(
    (p) => p.userId === user.id && ["ACCEPTED", "ATTENDED"].includes(p.status),
  );

  if (!isAdmin && !isCoach && !isOwner && !isParticipant) {
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
  repetitions: number | null;
  pyramide: PyramidArea;
  lFase: string | null;
  notes: string | null;
  repType: string | null;
  repAntall: number | null;
  repMinutter: number | null;
  repSett: number | null;
  repReps: number | null;
}): LiveV2Drill {
  return {
    id: drill.id,
    index: drill.sortOrder + 1,
    name: drill.name,
    description: drill.description,
    durationMinutes: drill.durationMinutes,
    plannedReps: drill.repetitions ?? 0,
    pyramide: drill.pyramide,
    lFase: drill.lFase,
    notes: drill.notes,
    repType: drill.repType,
    repAntall: drill.repAntall,
    repMinutter: drill.repMinutter,
    repSett: drill.repSett,
    repReps: drill.repReps,
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

/** Henter sesjon + drills + eksisterende logger for live-økt. */
export async function loadLiveSession(
  sessionId: string,
  userId: string,
  isCoach: boolean,
): Promise<AccessResult> {
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
    ["ACCEPTED", "ATTENDED"].includes(p.status),
  );

  if (!isOwner && !isParticipant && !isCoach) {
    return { ok: false, reason: "forbidden" };
  }

  const student = session.studentId
    ? await prisma.user.findUnique({
        where: { id: session.studentId },
        select: { name: true },
      })
    : null;

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
    completed: session.status === "COMPLETED",
    studentName: student?.name ?? null,
    pyramide,
    drills: session.drills.map(mapDrill),
    existingLogs: existingLogs.map(mapLog),
    completedSummary: session.completedSummary,
  };

  return { ok: true, data };
}

/** Finn pågående økt (IN_PROGRESS) for spilleren. */
export async function findOngoingSession(userId: string): Promise<{
  sessionId: string;
  title: string;
} | null> {
  const ongoing = await prisma.trainingSessionV2.findFirst({
    where: {
      OR: [
        { studentId: userId },
        { participants: { some: { userId, status: { in: ["ACCEPTED", "ATTENDED"] } } } },
      ],
      status: "IN_PROGRESS",
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true },
  });
  if (!ongoing) return null;
  return { sessionId: ongoing.id, title: ongoing.title };
}

/** Starter økta (PLANNED → IN_PROGRESS). */
export async function startSession(sessionId: string): Promise<StartSessionResult> {
  const { session } = await verifyAccess(sessionId);

  switch (session.status) {
    case "PLANNED":
      await prisma.trainingSessionV2.update({
        where: { id: sessionId },
        data: { status: "IN_PROGRESS" },
      });
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
  const { user } = await verifyAccess(input.sessionId);

  const successRate =
    input.successRate ??
    (input.repsTotal > 0 ? Math.round((input.repsHit / input.repsTotal) * 100) : 0);

  await prisma.drillLogV2.upsert({
    where: {
      // Prisma støtter ikke unik sammensatt nøkkel uten @unique; vi bruker id-en
      // via drillId + loggedBy lookup i stedet.
      id: await findExistingLogId(input.drillId, user.id),
    },
    create: {
      drillId: input.drillId,
      loggedBy: user.id,
      repsTotal: input.repsTotal,
      repsWithoutBall: input.repsWithoutBall,
      repsLowSpeed: input.repsLowSpeed,
      repsAutomatic: input.repsAutomatic,
      repsHit: input.repsHit,
      successRate,
      notes: input.notes ?? null,
    },
    update: {
      repsTotal: input.repsTotal,
      repsWithoutBall: input.repsWithoutBall,
      repsLowSpeed: input.repsLowSpeed,
      repsAutomatic: input.repsAutomatic,
      repsHit: input.repsHit,
      successRate,
      notes: input.notes ?? null,
      loggedAt: new Date(),
    },
  });

  revalidatePath(`/portal/live/${input.sessionId}`);
  revalidatePath(`/portal/live/${input.sessionId}/active`);
  revalidatePath(`/portal/live/${input.sessionId}/summary`);
  return { ok: true };
}

/** Hjelper for å finne eksisterende logg-id ved upsert. */
async function findExistingLogId(drillId: string, userId: string): Promise<string> {
  const existing = await prisma.drillLogV2.findFirst({
    where: { drillId, loggedBy: userId },
    select: { id: true },
    orderBy: { loggedAt: "desc" },
  });
  // Upsert krever en gyldig where. Hvis ingen logg finnes bruker vi en dummy-id
  // som garantert ikke finnes, slik at create kjøres.
  return existing?.id ?? "__new__";
}

/** Markerer en drill som fullført ved å logge reps. Alias for logDrillReps. */
export async function completeDrill(input: CompleteDrillInput): Promise<{ ok: boolean }> {
  return logDrillReps(input);
}

/** Fullfører økta: setter COMPLETED, lagrer sammendrag, redirect til summary. */
export async function completeSession(sessionId: string, clientDurationSec?: number): Promise<void> {
  const { user, session } = await verifyAccess(sessionId);

  if (session.status === "COMPLETED") {
    redirect(`/portal/live/${sessionId}/summary`);
  }

  const logs = await prisma.drillLogV2.findMany({
    where: { drill: { sessionId } },
    orderBy: { loggedAt: "asc" },
  });

  const totalReps = logs.reduce((sum, l) => sum + l.repsTotal, 0);
  const drillsCompleted = logs.length;
  const startedAt = logs.length > 0 ? logs[0].loggedAt : session.startTime;
  const lastLoggedAt = logs.length > 0 ? logs[logs.length - 1].loggedAt : new Date();
  const computedDurationSec = Math.max(
    0,
    Math.round((lastLoggedAt.getTime() - startedAt.getTime()) / 1000),
  );
  const durationSec = clientDurationSec ?? computedDurationSec;

  const summary = {
    liveSummary: {
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      durationSec,
      totalReps,
      drillsCompleted,
      loggedBy: user.id,
    },
  };

  await prisma.trainingSessionV2.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      completedSummary: summary as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/portal/planlegge");
  revalidatePath(`/portal/live/${sessionId}`);
  redirect(`/portal/live/${sessionId}/summary`);
}
