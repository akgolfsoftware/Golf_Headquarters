/**
 * Slår opp live-økt på tvers av V2, plan og WorkbenchSession.
 * Rekkefølge: TrainingSessionV2 → TrainingPlanSession → WorkbenchSession.
 */

import { prisma } from "@/lib/prisma";
import type { ResolvedLiveSession } from "./live-route";

export async function resolveLiveSession(
  sessionId: string,
  userId: string,
): Promise<ResolvedLiveSession | null> {
  const v2 = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    select: {
      status: true,
      studentId: true,
      coachId: true,
      hostId: true,
      participants: { where: { userId }, select: { status: true } },
    },
  });
  if (v2) {
    return {
      kind: "v2",
      id: sessionId,
      status: v2.status,
      playerId: v2.studentId ?? v2.hostId ?? v2.coachId ?? "",
      coachId: v2.coachId,
      hostId: v2.hostId,
      isParticipant: v2.participants.some((p) =>
        p.status === "ACCEPTED" || p.status === "ATTENDED",
      ),
    };
  }

  const plan = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { status: true, plan: { select: { userId: true } } },
  });
  if (plan) {
    return {
      kind: "plan",
      id: sessionId,
      status: plan.status,
      playerId: plan.plan.userId,
      coachId: null,
      hostId: null,
      isParticipant: false,
    };
  }

  const wb = await prisma.workbenchSession.findUnique({
    where: { id: sessionId },
    select: { status: true, playerId: true, coachId: true },
  });
  if (wb) {
    return {
      kind: "wb",
      id: sessionId,
      status: wb.status,
      playerId: wb.playerId,
      coachId: wb.coachId,
      hostId: null,
      isParticipant: false,
    };
  }

  return null;
}

export async function loadWorkbenchForLive(sessionId: string) {
  return prisma.workbenchSession.findUnique({
    where: { id: sessionId },
    include: { drills: { orderBy: { sortOrder: "asc" } } },
  });
}
