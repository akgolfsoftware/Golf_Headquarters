// turnering-agent: cron daglig 07:00. Spillere med turnering innen 7 dager
// får PERIOD_SWITCH / FOCUS_CHANGE PlanAction via periodization-skill.

import { prisma } from "@/lib/prisma";
import { runPeriodizationSkill } from "@/lib/training/skills";
import { runAgent, type AgentResult } from "./agent-runner";

export const AGENT_NAME = "turnering-agent";

const DAGER_TERSKEL = 7;

export async function runTurneringAgent(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const idag = new Date();
    const grense = new Date(idag);
    grense.setDate(grense.getDate() + DAGER_TERSKEL);

    const entries = await prisma.tournamentEntry.findMany({
      where: {
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
      },
      include: {
        tournament: { select: { id: true, name: true, startDate: true } },
        user: { select: { id: true } },
      },
    });

    let opprettet = 0;

    for (const entry of entries) {
      const start =
        entry.manualDate ?? entry.tournament?.startDate ?? null;
      if (!start || start < idag || start > grense) continue;

      const dagerTil = Math.ceil(
        (start.getTime() - idag.getTime()) / 86400000,
      );

      const eksisterende = await prisma.planAction.findFirst({
        where: {
          userId: entry.userId,
          actionType: "PERIOD_SWITCH",
          status: "PENDING",
        },
      });
      if (eksisterende) continue;

      const period = runPeriodizationSkill({
        ukeStart: idag,
        dagerTilTurnering: dagerTil,
        periodType: "TURN",
      });

      const plan = await prisma.trainingPlan.findFirst({
        where: { userId: entry.userId, isActive: true },
        select: { id: true },
      });

      await prisma.planAction.create({
        data: {
          userId: entry.userId,
          planId: plan?.id ?? null,
          actionType: "PERIOD_SWITCH",
          agentName: AGENT_NAME,
          suggestion: {
            periodType: "TURN",
            dagerTilTurnering: dagerTil,
            turneringNavn:
              entry.manualName ?? entry.tournament?.name ?? "Turnering",
            pyramidOverride: period.pyramidOverride,
            forklaring: `${entry.manualName ?? entry.tournament?.name} om ${dagerTil} dager — bytt til turneringsforberedelse.`,
            signalSnapshot: {
              kind: "TOURNAMENT_PROXIMITY",
              value: dagerTil,
            },
          },
        },
      });
      opprettet++;
    }

    return { planActionsWritten: opprettet };
  });
}