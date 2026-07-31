import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  fangstIdFraSuggestion,
  sjekkpunktFraSuggestion,
} from "@/lib/recording/fangst-suggestion";
import { executePlanAction } from "./plan-action-executor";

export type AcceptPlanActionResult = {
  status: "ACCEPTED" | "REJECTED" | "UNCHANGED";
  applied: boolean;
  summary?: string;
};

/**
 * Godkjenner en PlanAction og kjører executor. Ved feil forblir status PENDING.
 */
export async function acceptAndApplyPlanAction(
  actionId: string,
  coachNoteSuggestion?: Record<string, unknown>,
): Promise<AcceptPlanActionResult> {
  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
  });
  if (!action) throw new Error("not-found");
  if (action.status !== "PENDING") {
    return { status: action.status as "ACCEPTED" | "REJECTED", applied: false };
  }

  try {
    const exec = await executePlanAction(actionId);

    // FØR/UNDER/ETTER: sjekkpunkt + fangstId fra suggestion (zod, #9).
    const rawSug = coachNoteSuggestion ?? action.suggestion;
    const sjekkpunkt =
      sjekkpunktFraSuggestion(rawSug, exec.summary) ??
      (exec.summary?.trim() ? exec.summary.trim().slice(0, 2000) : null);
    const fangstId = fangstIdFraSuggestion(rawSug);

    await prisma.planAction.update({
      where: { id: actionId },
      data: {
        status: "ACCEPTED",
        ...(coachNoteSuggestion
          ? { suggestion: coachNoteSuggestion as Prisma.InputJsonValue }
          : {}),
        ...(sjekkpunkt ? { sjekkpunkt } : {}),
        ...(fangstId ? { fangstId } : {}),
        updatedAt: new Date(),
      },
    });
    await prisma.agentRun.create({
      data: {
        agentName: "plan-action-executor",
        userId: action.userId,
        status: "OK",
        duration: 0,
        output: {
          actionId,
          actionType: action.actionType,
          ...exec,
        },
      },
    });
    return {
      status: "ACCEPTED",
      applied: exec.applied,
      summary: exec.summary,
    };
  } catch (err) {
    await prisma.agentRun.create({
      data: {
        agentName: "plan-action-executor",
        userId: action.userId,
        status: "ERROR",
        duration: 0,
        error: err instanceof Error ? err.message.slice(0, 500) : String(err),
      },
    });
    throw err;
  }
}