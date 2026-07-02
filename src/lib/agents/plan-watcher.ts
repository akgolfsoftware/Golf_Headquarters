// plan-watcher: cron mandag 06:00. Sjekker forrige uke for hver aktive plan
// og oppretter PlanAction-forslag basert på pyramide-adherence.

import { prisma } from "@/lib/prisma";
import { aggregateByArea, prosentPerArea, PYR_LABEL, PYR_REKKEFOLGE } from "@/lib/pyramide";
import { parseTargetAllocation } from "@/lib/training/target-allocation";
import { startOfWeek, endOfWeek } from "@/lib/uke-helpers";
import { runAgent, type AgentResult } from "./agent-runner";

export const AGENT_NAME = "plan-watcher";

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
      // Mål planen faktisk er godkjent mot (eller standard hvis ikke satt).
      const malAllokering = parseTargetAllocation(plan.targetAllocation);

      for (const omr of PYR_REKKEFOLGE) {
        const faktisk = fordeling[omr];
        const mal = malAllokering[omr];
        const avvik = mal - faktisk;
        if (avvik <= 8) continue;

        const eksisterende = await prisma.planAction.findFirst({
          where: {
            userId: plan.userId,
            planId: plan.id,
            actionType: "PYRAMID_ADJUST",
            status: "PENDING",
          },
        });
        const eksSugg = eksisterende?.suggestion as { omrade?: string } | null;
        if (eksisterende && eksSugg?.omrade === omr) continue;

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
              signalSnapshot: {
                kind: "PYRAMIDE_ADHERENCE",
                omrade: omr,
                faktiskProsent: faktisk,
                malProsent: mal,
              },
            },
          },
        });
        opprettet++;
      }
    }

    return { planActionsWritten: opprettet };
  });
}
