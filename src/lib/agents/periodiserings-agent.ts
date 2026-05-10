// periodiseringsagent: kjøres når TrainingPlan opprettes/oppdateres.
// Foreslår initial uke-allokering hvis planen mangler sesjoner.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";

export const AGENT_NAME = "periodiseringsagent";

const MAL_PROSENT = {
  FYS: 15,
  TEK: 20,
  SLAG: 35,
  SPILL: 20,
  TURN: 10,
} as const;

export async function runPeriodiseringsAgent(
  planId: string
): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const plan = await prisma.trainingPlan.findUnique({
      where: { id: planId },
      include: { sessions: true },
    });
    if (!plan) return { planActionsWritten: 0 };

    if (plan.sessions.length > 0) {
      // Plan har allerede sesjoner — ingenting å foreslå nå
      return { planActionsWritten: 0 };
    }

    await prisma.planAction.create({
      data: {
        userId: plan.userId,
        planId: plan.id,
        actionType: "PYRAMID_ADJUST",
        agentName: AGENT_NAME,
        suggestion: {
          forklaring:
            "Ny plan opprettet. Foreslått uke-allokering: 35% SLAG, 20% TEK, 20% SPILL, 15% FYS, 10% TURN.",
          fordeling: MAL_PROSENT,
        },
      },
    });

    return { planActionsWritten: 1 };
  });
}
