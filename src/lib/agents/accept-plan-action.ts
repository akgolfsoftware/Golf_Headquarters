import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  fangstIdFraSuggestion,
  sjekkpunktFraSuggestion,
} from "@/lib/recording/fangst-suggestion";
import { isEditedSuggestion } from "./canonical-json";
import { executePlanAction } from "./plan-action-executor";

export type AcceptPlanActionResult = {
  status: "ACCEPTED" | "REJECTED" | "UNCHANGED";
  applied: boolean;
  summary?: string;
};

/**
 * Godkjenner en PlanAction og kjører executor. Ved feil forblir status PENDING.
 * Ved coach-redigering snapshotes originalforslaget til `originalSuggestion`
 * og `editedBeforeApproval` settes via kanonisk JSON-diff — grunnlaget for
 * «godkjent uendret»-metrikken i eval-suiten.
 */
export async function acceptAndApplyPlanAction(
  actionId: string,
  coachNoteSuggestion?: Record<string, unknown>,
  decidedById?: string,
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
        decidedAt: new Date(),
        ...(decidedById ? { decidedById } : {}),
        ...(coachNoteSuggestion
          ? {
              suggestion: coachNoteSuggestion as Prisma.InputJsonValue,
              originalSuggestion: action.suggestion as Prisma.InputJsonValue,
              editedBeforeApproval: isEditedSuggestion(
                action.suggestion,
                coachNoteSuggestion,
              ),
            }
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