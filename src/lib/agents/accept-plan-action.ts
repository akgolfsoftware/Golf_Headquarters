import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  fangstIdFraSuggestion,
  sjekkpunktFraSuggestion,
} from "@/lib/recording/fangst-suggestion";
import { isEditedSuggestion } from "./canonical-json";
import { executePlanAction } from "./plan-action-executor";
import { planActionFeilSpor, planActionOkSpor } from "./plan-action-spor";

export type AcceptPlanActionResult = {
  status: "ACCEPTED" | "REJECTED" | "UNCHANGED";
  applied: boolean;
  summary?: string;
};

async function claimPendingAction(actionId: string): Promise<boolean> {
  const claim = await prisma.planAction.updateMany({
    where: { id: actionId, status: "PENDING" },
    data: { status: "PROCESSING", updatedAt: new Date() },
  });
  return claim.count === 1;
}

/**
 * Godkjenner en PlanAction og kjører executor. Ved kjøringsfeil settes status
 * tilbake til PENDING, mens en ferdig sideeffekt aldri åpnes for ny kjøring ved
 * en etterfølgende sporfeil.
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
    return {
      status:
        action.status === "ACCEPTED" || action.status === "REJECTED"
          ? action.status
          : "UNCHANGED",
      applied: false,
    };
  }

  // Atomisk krav: bare én samtidig forespørsel får flytte PENDING til
  // PROCESSING. Alle andre returnerer uten å kjøre sideeffekten.
  if (!(await claimPendingAction(actionId))) {
    return { status: "UNCHANGED", applied: false };
  }

  let exec: Awaited<ReturnType<typeof executePlanAction>>;
  try {
    exec = await executePlanAction(actionId);

    // FØR/UNDER/ETTER: sjekkpunkt + fangstId fra suggestion (zod, #9).
    const rawSug = coachNoteSuggestion ?? action.suggestion;
    const sjekkpunkt =
      sjekkpunktFraSuggestion(rawSug, exec.summary) ??
      (exec.summary?.trim() ? exec.summary.trim().slice(0, 2000) : null);
    const fangstId = fangstIdFraSuggestion(rawSug);

    const accepted = await prisma.planAction.updateMany({
      where: { id: actionId, status: "PROCESSING" },
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
    if (accepted.count !== 1) throw new Error("claim-lost");
  } catch (err) {
    await prisma.planAction.updateMany({
      where: { id: actionId, status: "PROCESSING" },
      data: { status: "PENDING", updatedAt: new Date() },
    });
    await prisma.agentRun.create({
      data: planActionFeilSpor({
        actionId,
        actionType: action.actionType,
        userId: action.userId,
        error: err,
      }),
    });
    throw new Error("execution-failed");
  }

  // Sporfeil skal aldri sette handlingen tilbake til PENDING etter at
  // sideeffekten er utført. En ny godkjenning ville da kunne kjøre den igjen.
  await prisma.agentRun.create({
    data: planActionOkSpor({
      actionId,
      actionType: action.actionType,
      userId: action.userId,
      applied: exec.applied,
      summary: exec.summary,
    }),
  });
  return {
    status: "ACCEPTED",
    applied: exec.applied,
    summary: exec.summary,
  };
}
