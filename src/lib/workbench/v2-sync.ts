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

  // Felles data for create + update. Status settes KUN ved create — en
  // update skal aldri nullstille COMPLETED/CANCELLED/SKIPPED til PLANNED.
  const data = {
    title: input.title,
    studentId: input.playerId,
    coachId,
    startTime: input.scheduledAt,
    endTime,
    miljo: input.miljo ?? "M2",
    practiceType: PYR_TO_PRACTICE[input.pyramidArea],
    isCoachCreated: coachId !== input.playerId,
    generertFra: GENERERT_FRA,
    generertFraId: input.planSessionId,
  };

  if (existing) {
    await prisma.trainingSessionV2.update({ where: { id: existing.id }, data });
  } else {
    await prisma.trainingSessionV2.create({ data: { ...data, status: "PLANNED" } });
  }
}

/** Slett V2-økt koblet til plan-økt. */
export async function deleteV2ForPlanSession(planSessionId: string): Promise<void> {
  await prisma.trainingSessionV2.deleteMany({
    where: { generertFra: GENERERT_FRA, generertFraId: planSessionId },
  });
}