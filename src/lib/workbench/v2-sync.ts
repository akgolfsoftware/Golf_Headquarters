import "server-only";

import type { PyramidArea, MMiljo } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { mapSessionDrillToV2Drill } from "@/lib/workbench/v2-drill-map";

const GENERERT_FRA = "WORKBENCH_PLAN";

const PYR_TO_PRACTICE: Record<PyramidArea, "BLOKK" | "RANDOM" | "KONKURRANSE" | "SPILL_TEST"> = {
  FYS: "BLOKK",
  TEK: "BLOKK",
  SLAG: "RANDOM",
  SPILL: "SPILL_TEST",
  TURN: "KONKURRANSE",
};

const SESSION_DRILL_SELECT = {
  orderIndex: true,
  reps: true,
  sets: true,
  repsSets: true,
  csTarget: true,
  notes: true,
  lFase: true,
  miljo: true,
  csNivaa: true,
  prPress: true,
  pPosisjoner: true,
  repType: true,
  repAntall: true,
  repMinutter: true,
  repSett: true,
  repReps: true,
  pyramidArea: true,
  skillArea: true,
  exercise: {
    select: {
      name: true,
      description: true,
      durationMin: true,
      pyramidArea: true,
      skillArea: true,
    },
  },
} as const;

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

/**
 * Speiler SessionDrill-rader til TrainingDrillV2 for en WORKBENCH_PLAN-koblet V2-økt.
 * Erstatter kun når V2-status er PLANNED (bevarer DrillLogV2 under live/gjennomført økt).
 */
export async function syncV2DrillsForPlanSession(planSessionId: string): Promise<void> {
  const v2 = await prisma.trainingSessionV2.findFirst({
    where: { generertFra: GENERERT_FRA, generertFraId: planSessionId },
    select: { id: true, status: true },
  });
  if (!v2 || v2.status !== "PLANNED") return;

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: planSessionId },
    select: {
      durationMin: true,
      pyramidArea: true,
      drills: { orderBy: { orderIndex: "asc" }, select: SESSION_DRILL_SELECT },
    },
  });
  if (!session) return;

  const drillCount = session.drills.length;
  const mapped = session.drills.map((d) =>
    mapSessionDrillToV2Drill(d, {
      sessionDurationMin: session.durationMin,
      drillCount,
      sessionPyramid: session.pyramidArea,
    }),
  );

  await prisma.$transaction([
    prisma.trainingDrillV2.deleteMany({ where: { sessionId: v2.id } }),
    ...(mapped.length > 0
      ? [
          prisma.trainingDrillV2.createMany({
            data: mapped.map((row) => ({ sessionId: v2.id, ...row })),
          }),
        ]
      : []),
  ]);
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

  if (existing) {
    await prisma.trainingSessionV2.update({ where: { id: existing.id }, data });
  } else {
    await prisma.trainingSessionV2.create({ data });
  }

  await syncV2DrillsForPlanSession(input.planSessionId);
}

/** Slett V2-økt koblet til plan-økt. */
export async function deleteV2ForPlanSession(planSessionId: string): Promise<void> {
  await prisma.trainingSessionV2.deleteMany({
    where: { generertFra: GENERERT_FRA, generertFraId: planSessionId },
  });
}