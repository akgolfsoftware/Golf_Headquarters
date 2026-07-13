import "server-only";

import type { PyramidArea, MMiljo } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const GENERERT_FRA = "WORKBENCH_PLAN";

const PYR_TO_PRACTICE: Record<PyramidArea, "BLOKK" | "RANDOM" | "KONKURRANSE" | "SPILL_TEST"> = {
  FYS: "BLOKK",
  TEK: "BLOKK",
  SLAG: "RANDOM",
  SPILL: "SPILL_TEST",
  TURN: "KONKURRANSE",
};

/** Finn coachId for V2-økt: gruppe.coachId → plan.createdById → første coach. */
export async function resolveCoachIdForPlayer(
  playerId: string,
  explicitCoachId?: string | null,
): Promise<string> {
  if (explicitCoachId) return explicitCoachId;

  const membership = await prisma.groupMember.findFirst({
    where: { userId: playerId },
    include: { group: { select: { coachId: true } } },
  });
  if (membership?.group.coachId) return membership.group.coachId;

  const plan = await prisma.trainingPlan.findFirst({
    where: { userId: playerId, createdById: { not: null } },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    select: { createdById: true },
  });
  if (plan?.createdById) return plan.createdById;

  const coach = await prisma.user.findFirst({
    where: { role: { in: ["COACH", "ADMIN"] }, deletedAt: null },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return coach?.id ?? playerId;
}

/** Opprett eller oppdater TrainingSessionV2 koblet til TrainingPlanSession. */
export async function upsertV2ForPlanSession(input: {
  planSessionId: string;
  playerId: string;
  title: string;
  scheduledAt: Date;
  durationMin: number;
  pyramidArea: PyramidArea;
  coachId?: string | null;
  // AK-formel (Fase 0) — kun miljo speiles (eneste session-nivå AK-felt på
  // TrainingSessionV2). Full formel bor på kanon TrainingPlanSession;
  // drill-nivå-formelen bor på TrainingDrillV2 (egen runde).
  miljo?: MMiljo | null;
}): Promise<void> {
  const coachId = await resolveCoachIdForPlayer(input.playerId, input.coachId);
  const endTime = new Date(input.scheduledAt.getTime() + input.durationMin * 60_000);

  const existing = await prisma.trainingSessionV2.findFirst({
    where: { generertFra: GENERERT_FRA, generertFraId: input.planSessionId },
    select: { id: true },
  });

  const data = {
    title: input.title,
    studentId: input.playerId,
    coachId,
    startTime: input.scheduledAt,
    endTime,
    miljo: input.miljo ?? "M2",
    practiceType: PYR_TO_PRACTICE[input.pyramidArea],
    status: "PLANNED" as const,
    isCoachCreated: coachId !== input.playerId,
    generertFra: GENERERT_FRA,
    generertFraId: input.planSessionId,
  };

  let v2Id: string;
  if (existing) {
    await prisma.trainingSessionV2.update({ where: { id: existing.id }, data });
    v2Id = existing.id;
  } else {
    const created = await prisma.trainingSessionV2.create({ data, select: { id: true } });
    v2Id = created.id;
  }

  await speilDrillerTilV2(input.planSessionId, v2Id);
}

/** Bølge 4 (2026-07-13): speil plan-øktas driller (SessionDrill ↔ øvelsesbanken)
 *  inn i V2-økta slik at live-flyten viser drillene med bank-kobling
 *  (TrainingDrillV2.exerciseId). Uten dette hadde plan-genererte V2-økter
 *  ingen driller i live-visningen. Kun for PLANNED-økter — en påbegynt/
 *  fullført økt har drill-logger (DrillLogV2, cascade) som aldri skal slettes
 *  av en plan-redigering. */
async function speilDrillerTilV2(planSessionId: string, v2Id: string): Promise<void> {
  const v2 = await prisma.trainingSessionV2.findUnique({
    where: { id: v2Id },
    select: { status: true },
  });
  if (!v2 || v2.status !== "PLANNED") return;

  const drills = await prisma.sessionDrill.findMany({
    where: { sessionId: planSessionId },
    orderBy: { orderIndex: "asc" },
    include: { exercise: { select: { name: true, description: true, pyramidArea: true } } },
  });

  await prisma.trainingDrillV2.deleteMany({ where: { sessionId: v2Id } });
  if (drills.length === 0) return;

  await prisma.trainingDrillV2.createMany({
    data: drills.map((d, i) => ({
      sessionId: v2Id,
      exerciseId: d.exerciseId,
      sortOrder: i,
      name: d.exercise.name,
      description: d.exercise.description,
      // durationMinutes er påkrevd på TrainingDrillV2 — bruk drillens minutter
      // når satt, ellers en nøktern standard (10 min).
      durationMinutes: d.repMinutter ?? 10,
      repetitions: d.reps,
      pyramide: d.pyramidArea ?? d.exercise.pyramidArea,
      lFase: d.lFase,
      csNivaa: d.csNivaa,
      miljo: d.miljo,
      prPress: d.prPress,
      repType: d.repType,
      repAntall: d.repAntall,
      repMinutter: d.repMinutter,
      repSett: d.repSett,
      repReps: d.repReps,
      notes: d.notes,
    })),
  });
}

/** Slett V2-økt koblet til plan-økt. */
export async function deleteV2ForPlanSession(planSessionId: string): Promise<void> {
  await prisma.trainingSessionV2.deleteMany({
    where: { generertFra: GENERERT_FRA, generertFraId: planSessionId },
  });
}