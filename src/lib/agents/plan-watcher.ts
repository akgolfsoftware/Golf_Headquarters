// plan-watcher: cron mandag 06:00. Sjekker forrige uke for hver aktive plan
// og oppretter PlanAction-forslag basert på pyramide-adherence.

import { prisma } from "@/lib/prisma";
import { aggregateByArea, prosentPerArea, PYR_LABEL } from "@/lib/pyramide";
import { startOfWeek, endOfWeek } from "@/lib/uke-helpers";
import { runAgent, type AgentResult } from "./agent-runner";

export const AGENT_NAME = "plan-watcher";

// Mål-allokering — kan senere flyttes til egen tabell
const MAL_PROSENT = {
  FYS: 15,
  TEK: 20,
  SLAG: 35,
  SPILL: 20,
  TURN: 10,
} as const;

export async function runPlanWatcher(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const idag = new Date();
    const ukestart = startOfWeek(idag);
    const forrigeStart = new Date(ukestart);
    forrigeStart.setDate(forrigeStart.getDate() - 7);
    const forrigeSlutt = endOfWeek(forrigeStart);

    const planer = await prisma.trainingPlan.findMany({
      where: { isActive: true },
      include: {
        sessions: {
          where: {
            scheduledAt: { gte: forrigeStart, lt: forrigeSlutt },
            status: "COMPLETED",
          },
        },
      },
    });

    let opprettet = 0;
    for (const plan of planer) {
      if (plan.sessions.length === 0) continue;
      const fordeling = prosentPerArea(aggregateByArea(plan.sessions));

      for (const omr of Object.keys(MAL_PROSENT) as (keyof typeof MAL_PROSENT)[]) {
        const faktisk = fordeling[omr];
        const mal = MAL_PROSENT[omr];
        const avvik = mal - faktisk;
        if (avvik <= 8) continue;

        await prisma.planAction.create({
          data: {
            userId: plan.userId,
            planId: plan.id,
            actionType: "PYRAMID_ADJUST",
            agentName: AGENT_NAME,
            suggestion: {
              omrade: omr,
              omradeNavn: PYR_LABEL[omr],
              faktiskProsent: faktisk,
              malProsent: mal,
              forklaring: `${PYR_LABEL[omr]} er ${avvik}% under mål. Vurder å legge inn flere ${omr}-økter.`,
            },
          },
        });
        opprettet++;
      }
    }

    return { planActionsWritten: opprettet };
  });
}
