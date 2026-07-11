/**
 * Konverterer PlanRevisionForslag (LLM/demo) til PENDING PlanAction-rader.
 * Skills validerer konkrete endringer før persist via executor ved godkjenning.
 */
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  PlanRevisionEndring,
  PlanRevisionForslag,
  PlanRevisionTrigger,
} from "@/lib/ai/agents/plan-revision";
import { foreslaPlanRevisjon } from "@/lib/ai/agents/plan-revision";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";
import { varsleVedPlanAction } from "./notify-plan-action";

const PYRAMIDE_TIL_ACTION: Record<
  PlanRevisionEndring["pyramideAkser"][number],
  "PYRAMID_ADJUST" | "FOCUS_CHANGE" | "PERIOD_SWITCH"
> = {
  FYS: "PYRAMID_ADJUST",
  TEK: "PYRAMID_ADJUST",
  SLAG: "FOCUS_CHANGE",
  SPILL: "FOCUS_CHANGE",
  TURN: "PERIOD_SWITCH",
};

function endringTilSuggestion(
  endring: PlanRevisionEndring,
  trigger: PlanRevisionTrigger,
): { actionType: string; suggestion: Prisma.InputJsonValue } {
  const hovedAkse = endring.pyramideAkser[0] ?? "TEK";
  const actionType = PYRAMIDE_TIL_ACTION[hovedAkse];

  if (actionType === "PERIOD_SWITCH") {
    return {
      actionType: "PERIOD_SWITCH",
      suggestion: {
        periodType: trigger === "turnering-prep" ? "TURN" : "SPES",
        forklaring: endring.rasjonale,
        endring: endring.endring,
        varighet: endring.varighet,
        signalSnapshot: { trigger },
      },
    };
  }

  if (actionType === "FOCUS_CHANGE") {
    const skillMap: Record<string, string> = {
      SLAG: "TEE_TOTAL",
      SPILL: "AROUND_GREEN",
    };
    return {
      actionType: "FOCUS_CHANGE",
      suggestion: {
        skillArea: skillMap[hovedAkse] ?? "TILNAERMING",
        pyramidArea: hovedAkse,
        forklaring: endring.rasjonale,
        endring: endring.endring,
        varighet: endring.varighet,
        signalSnapshot: { trigger },
      },
    };
  }

  return {
    actionType: "PYRAMID_ADJUST",
    suggestion: {
      omrade: hovedAkse,
      omradeNavn: hovedAkse,
      forklaring: endring.rasjonale,
      endring: endring.endring,
      varighet: endring.varighet,
      signalSnapshot: { trigger },
    },
  };
}

export async function persistRevisionForslag(
  forslag: PlanRevisionForslag,
): Promise<number> {
  let written = 0;
  for (const endring of forslag.endringer) {
    const { actionType, suggestion } = endringTilSuggestion(
      endring,
      forslag.trigger,
    );
    const dup = await prisma.planAction.findFirst({
      where: {
        userId: forslag.spillerId,
        actionType,
        status: "PENDING",
        agentName: "plan-revision",
      },
    });
    if (dup) continue;

    const coachId = await resolveCoachIdForPlayer(forslag.spillerId);
    const created = await prisma.planAction.create({
      data: {
        userId: forslag.spillerId,
        coachId,
        planId: forslag.planId,
        actionType,
        agentName: "plan-revision",
        suggestion,
      },
    });
    const forklaring =
      typeof suggestion === "object" &&
      suggestion !== null &&
      "forklaring" in suggestion &&
      typeof (suggestion as { forklaring?: unknown }).forklaring === "string"
        ? (suggestion as { forklaring: string }).forklaring
        : actionType;
    await varsleVedPlanAction({
      userId: forslag.spillerId,
      agentName: "plan-revision",
      actionType,
      forklaring,
      planActionId: created.id,
    });
    written++;
  }
  return written;
}

export async function runPlanRevisionAgent(opts: {
  planId: string;
  trigger: PlanRevisionTrigger;
  context?: string;
}): Promise<{ planActionsWritten: number }> {
  const forslag = await foreslaPlanRevisjon(opts);
  const planActionsWritten = await persistRevisionForslag(forslag);
  return { planActionsWritten };
}