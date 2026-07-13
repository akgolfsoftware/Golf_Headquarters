import "server-only";

import type { PyramidArea, MMiljo } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { GENERERT_FRA, syncDrillsToV2 } from "./v2-drill-mirror";

// Re-eksport: reverse-synkene (okt-status-actions, live-actions) matcher
// samme streng via denne.
export { GENERERT_FRA };

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
    select: { id: true, status: true },
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
    // Ikke nullstill status på en økt spilleren alt har startet/fullført.
    const { status: _status, ...utenStatus } = data;
    await prisma.trainingSessionV2.update({
      where: { id: existing.id },
      data: existing.status === "PLANNED" ? data : utenStatus,
    });
    v2Id = existing.id;
  } else {
    const opprettet = await prisma.trainingSessionV2.create({ data, select: { id: true } });
    v2Id = opprettet.id;
  }

  // Drill-speiling: kun for PLANNED-økter — en påbegynt/logget økt røres aldri.
  if (!existing || existing.status === "PLANNED") {
    await syncDrillsToV2(v2Id, input.planSessionId, input.pyramidArea);
  }
}

/**
 * Synk V2-speilet fra plan-økt-id alene — for mutasjonsflater som ikke har
 * feltene for hånden (admin/plans, AI-executor, legacy planlegge).
 */
export async function syncV2FromPlanSessionId(planSessionId: string): Promise<void> {
  const s = await prisma.trainingPlanSession.findUnique({
    where: { id: planSessionId },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      durationMin: true,
      pyramidArea: true,
      miljo: true,
      plan: { select: { userId: true, createdById: true } },
    },
  });
  if (!s) return;
  await upsertV2ForPlanSession({
    planSessionId: s.id,
    playerId: s.plan.userId,
    title: s.title,
    scheduledAt: s.scheduledAt,
    durationMin: s.durationMin,
    pyramidArea: s.pyramidArea,
    coachId: s.plan.createdById,
    miljo: s.miljo,
  });
}

/** Slett V2-økt koblet til plan-økt. */
export async function deleteV2ForPlanSession(planSessionId: string): Promise<void> {
  await prisma.trainingSessionV2.deleteMany({
    where: { generertFra: GENERERT_FRA, generertFraId: planSessionId },
  });
}