/**
 * DB move for Workbench drag-drop persistering.
 * Date math lives in session-move-math.ts (testable without server-only).
 */

import type { PrismaClient } from "@/generated/prisma/client";
import {
  computeMoveTarget,
  dateForDayIndex,
  dayIndexFromScheduledAt,
  mondayOf,
} from "@/lib/workbench/session-move-math";
import { upsertV2ForPlanSession } from "@/lib/workbench/v2-sync";

export { computeMoveTarget, dateForDayIndex, dayIndexFromScheduledAt, mondayOf };

export async function executeSessionMove(
  prisma: PrismaClient,
  input: {
    sessionId: string;
    playerId: string;
    dayIndex: number;
    coachId?: string;
    refDate?: Date;
  },
): Promise<{ ok: boolean; error?: string; before?: Date; after?: Date }> {
  const { sessionId, playerId, dayIndex, coachId, refDate = new Date() } = input;
  if (dayIndex < 0 || dayIndex > 6) return { ok: false, error: "Ugyldig dag" };

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      scheduledAt: true,
      title: true,
      durationMin: true,
      pyramidArea: true,
      plan: { select: { userId: true } },
    },
  });
  if (!session || session.plan.userId !== playerId) {
    return { ok: false, error: "Økt ikke funnet" };
  }

  const before = session.scheduledAt;
  const target = computeMoveTarget(before, dayIndex, refDate);

  const updated = await prisma.trainingPlanSession.update({
    where: { id: sessionId },
    data: { scheduledAt: target },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      durationMin: true,
      pyramidArea: true,
    },
  });

  await upsertV2ForPlanSession({
    planSessionId: updated.id,
    playerId,
    title: updated.title,
    scheduledAt: updated.scheduledAt,
    durationMin: updated.durationMin,
    pyramidArea: updated.pyramidArea,
    coachId,
  });

  return { ok: true, before, after: updated.scheduledAt };
}