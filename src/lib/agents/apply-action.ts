// Apply-lag for godkjente PlanActions.
//
// «Godkjenn» skal faktisk endre planen, ikke bare flippe en status. I dag har
// agentene én anvendbar forslagstype: PYRAMID_ADJUST → setter planens
// mål-allokering (`TrainingPlan.targetAllocation`), som plan-watcher deretter
// måler mot. Rent rådgivende typer (TRAINING_GAP m.fl.) flippes bare til
// ACCEPTED med revisjons-spor — apply er en trygg no-op for dem.

import { prisma } from "@/lib/prisma";
import { Prisma, type PlanAction } from "@/generated/prisma/client";
import {
  applyPyramidSuggestion,
  parseTargetAllocation,
} from "@/lib/training/target-allocation";

export type CoachNote = {
  kind: "approve" | "decline" | "info_request";
  text: string;
  authorId: string;
  at: string;
};

function somObjekt(json: unknown): Record<string, unknown> {
  return json && typeof json === "object" && !Array.isArray(json)
    ? (json as Record<string, unknown>)
    : {};
}

/**
 * Marker en PlanAction som ACCEPTED og anvend effekten på planen.
 * Idempotent på status (returnerer tidlig hvis ikke PENDING).
 */
export async function applyAcceptedPlanAction(
  action: PlanAction,
  opts?: { coachNote?: CoachNote },
): Promise<void> {
  if (action.status !== "PENDING") return;

  const suggestion = somObjekt(action.suggestion);

  // Revisjons-spor: legg ev. coach-kommentar i loggen.
  if (opts?.coachNote) {
    const log = Array.isArray(suggestion.coachLog) ? suggestion.coachLog : [];
    suggestion.coachLog = [...log, opts.coachNote];
  }

  // PYRAMID_ADJUST med plan → anvend ny mål-allokering på planen.
  if (action.actionType === "PYRAMID_ADJUST" && action.planId) {
    const plan = await prisma.trainingPlan.findUnique({
      where: { id: action.planId },
      select: { id: true, targetAllocation: true },
    });
    if (plan) {
      const naavaerende = parseTargetAllocation(plan.targetAllocation);
      const ny = applyPyramidSuggestion(naavaerende, action.suggestion);
      suggestion.appliedAllocation = ny;
      suggestion.appliedAt = new Date().toISOString();

      await prisma.$transaction([
        prisma.trainingPlan.update({
          where: { id: plan.id },
          data: { targetAllocation: ny },
        }),
        prisma.planAction.update({
          where: { id: action.id },
          data: { status: "ACCEPTED", suggestion: suggestion as Prisma.InputJsonValue },
        }),
      ]);
      return;
    }
  }

  // Rådgivende typer (eller PYRAMID_ADJUST uten plan): bare flipp + spor.
  await prisma.planAction.update({
    where: { id: action.id },
    data: { status: "ACCEPTED", suggestion: suggestion as Prisma.InputJsonValue },
  });
}
