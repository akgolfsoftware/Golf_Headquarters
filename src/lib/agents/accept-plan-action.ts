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
 * Godkjenner en PlanAction og kjører executor. Etter at utføringen har startet,
 * forblir handlingen PROCESSING ved feil fordi executor kan ha rukket å lagre
 * en delhandling. Blind retry ville da kunne gjenta sideeffekten.
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
  } catch (err) {
    // Utføreren omfatter flere varige trinn. Et kast kan bety både «ingenting
    // lagret» og «delvis lagret». Behold derfor PROCESSING til et menneske har
    // avstemt faktisk resultat; automatisk PENDING ville åpnet for duplikater.
    try {
      await prisma.agentRun.create({
        data: planActionFeilSpor({
          actionId,
          actionType: action.actionType,
          userId: action.userId,
          error: err,
        }),
      });
    } catch {
      // Sporfeil skal ikke erstatte den trygge feilen som returneres til klienten.
    }
    throw new Error("execution-failed");
  }

  try {
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
    // Executor har returnert og sideeffekten kan allerede være varig. Behold
    // PROCESSING ved statusfeil; PENDING ville åpnet for dobbel utføring.
    try {
      await prisma.agentRun.create({
        data: planActionFeilSpor({
          actionId,
          actionType: action.actionType,
          userId: action.userId,
          error: err,
        }),
      });
    } catch {
      // Statusen er fortsatt låst selv om også feilsporet skulle feile.
    }
    throw new Error("execution-failed");
  }

  // Sporfeil skal ikke gjøre en utført og godkjent handling til en klientfeil.
  try {
    await prisma.agentRun.create({
      data: planActionOkSpor({
        actionId,
        actionType: action.actionType,
        userId: action.userId,
        applied: exec.applied,
        summary: exec.summary,
      }),
    });
  } catch {
    // Statusen er ACCEPTED og sideeffekten skal aldri gjentas for å reparere spor.
  }
  return {
    status: "ACCEPTED",
    applied: exec.applied,
    summary: exec.summary,
  };
}
