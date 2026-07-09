// SG-analyse-ekspert — dypere SG-tolkning etter round-agent.

import { prisma } from "@/lib/prisma";
import { aggregateSg } from "@/lib/sg";
import { SG_TO_PYRAMID, SG_TO_SKILL } from "@/lib/training/skills";
import { mapSgBandToFault } from "@/lib/training/skills/morad-fault";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleVedPlanAction } from "./notify-plan-action";

export const AGENT_NAME = "sg-analyse-ekspert";

const SG_TERSKEL = -0.35;

export async function runSgAnalyseEkspert(
  userId: string,
): Promise<AgentResult> {
  return runAgent(AGENT_NAME, userId, async () => {
    const tretti = new Date();
    tretti.setDate(tretti.getDate() - 30);

    const runder = await prisma.round.findMany({
      where: { userId, playedAt: { gte: tretti } },
      orderBy: { playedAt: "desc" },
      take: 5,
    });

    if (runder.length === 0) {
      return { signalsWritten: 0, planActionsWritten: 0 };
    }

    const sg = aggregateSg(runder);
    const sgSnitt = {
      OTT: sg.ott ?? 0,
      APP: sg.app ?? 0,
      ARG: sg.arg ?? 0,
      PUTT: sg.putt ?? 0,
    };

    const primary = (Object.keys(sgSnitt) as (keyof typeof sgSnitt)[]).reduce(
      (best, curr) => (sgSnitt[curr] < sgSnitt[best] ? curr : best),
      "OTT",
    );

    const sgValue = sgSnitt[primary];
    if (sgValue >= SG_TERSKEL) {
      return { signalsWritten: 0, planActionsWritten: 0 };
    }

    const moradFaultId = mapSgBandToFault(primary);
    const plan = await prisma.trainingPlan.findFirst({
      where: { userId, isActive: true },
      select: { id: true },
    });

    const eksisterende = await prisma.planAction.findFirst({
      where: {
        userId,
        agentName: AGENT_NAME,
        status: "PENDING",
      },
    });
    if (eksisterende) {
      return { signalsWritten: 0, planActionsWritten: 0 };
    }

    const coachId = await resolveCoachIdForPlayer(userId);
    const forklaring = moradFaultId
      ? `SG ${primary} ${sgValue.toFixed(2)} — MORAD-funn ${moradFaultId}. Prioriter ${SG_TO_SKILL[primary]}.`
      : `SG ${primary} ${sgValue.toFixed(2)} — prioriter ${SG_TO_SKILL[primary]} neste uke.`;

    const created = await prisma.planAction.create({
      data: {
        userId,
        coachId,
        planId: plan?.id ?? null,
        actionType: "FOCUS_CHANGE",
        agentName: AGENT_NAME,
        suggestion: {
          skillArea: SG_TO_SKILL[primary],
          pyramidArea: SG_TO_PYRAMID[primary],
          moradFaultId,
          forklaring,
          signalSnapshot: {
            kind: `SG_${primary}`,
            value: sgValue,
            runder: runder.length,
          },
        },
      },
    });

    await varsleVedPlanAction({
      userId,
      agentName: AGENT_NAME,
      actionType: "FOCUS_CHANGE",
      forklaring,
      planActionId: created.id,
      sgValue,
    });

    return { signalsWritten: 0, planActionsWritten: 1 };
  });
}