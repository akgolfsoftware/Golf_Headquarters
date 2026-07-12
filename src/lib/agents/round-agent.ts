// round-agent: kjøres etter Round.create. Beregner SG-snitt siste 30 dager,
// skriver Signal og evt. PlanAction ved tydelig svakhet.

import { prisma } from "@/lib/prisma";
import { resolveDrillPakke } from "./plan-action-executor";
import { aggregateSg } from "@/lib/sg";
import {
  runWeaknessSkill,
  SG_TO_PYRAMID,
  SG_TO_SKILL,
} from "@/lib/training/skills";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleVedPlanAction } from "./notify-plan-action";

export const AGENT_NAME = "round-agent";

const SG_TERSKEL = -0.5;

export async function runRoundAgent(userId: string): Promise<AgentResult> {
  return runAgent(AGENT_NAME, userId, async () => {
    const tretti = new Date();
    tretti.setDate(tretti.getDate() - 30);

    const runder = await prisma.round.findMany({
      where: { userId, playedAt: { gte: tretti } },
    });

    const sg = aggregateSg(runder);
    const computedAt = new Date();

    type Skrivbar = { kind: string; value: number };
    const signals: Skrivbar[] = [];
    if (sg.total != null) signals.push({ kind: "SG_TOTAL", value: sg.total });
    if (sg.ott != null) signals.push({ kind: "SG_OTT", value: sg.ott });
    if (sg.app != null) signals.push({ kind: "SG_APP", value: sg.app });
    if (sg.arg != null) signals.push({ kind: "SG_ARG", value: sg.arg });
    if (sg.putt != null) signals.push({ kind: "SG_PUTT", value: sg.putt });

    if (signals.length > 0) {
      await prisma.signal.createMany({
        data: signals.map((s) => ({
          userId,
          kind: s.kind,
          value: s.value,
          computedAt,
          payload: { rundeAntall: sg.rundeAntall },
        })),
      });
    }

    let planActionsWritten = 0;
    const sgSnitt = {
      OTT: sg.ott ?? 0,
      APP: sg.app ?? 0,
      ARG: sg.arg ?? 0,
      PUTT: sg.putt ?? 0,
    };
    const plan = await prisma.trainingPlan.findFirst({
      where: { userId, isActive: true },
      select: { id: true },
    });

    const ukeSiden = new Date();
    ukeSiden.setDate(ukeSiden.getDate() - 7);
    const pyramidSessions = plan
      ? (
          await prisma.trainingPlanSession.findMany({
            where: {
              planId: plan.id,
              status: "COMPLETED",
              scheduledAt: { gte: ukeSiden },
            },
            select: { pyramidArea: true, durationMin: true },
          })
        ).map((s) => ({
          pyramidArea: s.pyramidArea,
          durationMin: s.durationMin,
        }))
      : [];

    const weakness = runWeaknessSkill({ sgSnitt, pyramidSessions });

    if (weakness.sgValue < SG_TERSKEL) {
      const eksisterende = await prisma.planAction.findFirst({
        where: {
          userId,
          actionType: "FOCUS_CHANGE",
          status: "PENDING",
        },
      });
      if (!eksisterende) {
        const coachId = await resolveCoachIdForPlayer(userId);
        // C3: forhåndsberegn drill-pakken så coachen ser den i køen.
        const drillPakke = await resolveDrillPakke(
          SG_TO_SKILL[weakness.primarySgArea],
          SG_TO_PYRAMID[weakness.primarySgArea],
        );
        const forklaring =
          drillPakke.length > 0
            ? `${weakness.anbefaling} Foreslåtte driller: ${drillPakke.map((d) => d.navn).join(", ")}.`
            : weakness.anbefaling;
        const created = await prisma.planAction.create({
          data: {
            userId,
            coachId,
            planId: plan?.id ?? null,
            actionType: "FOCUS_CHANGE",
            agentName: AGENT_NAME,
            suggestion: {
              drillPakke,
              skillArea: SG_TO_SKILL[weakness.primarySgArea],
              pyramidArea: SG_TO_PYRAMID[weakness.primarySgArea],
              forklaring,
              signalSnapshot: {
                kind: `SG_${weakness.primarySgArea}`,
                value: weakness.sgValue,
              },
            },
          },
        });
        planActionsWritten++;
        await varsleVedPlanAction({
          userId,
          agentName: AGENT_NAME,
          actionType: "FOCUS_CHANGE",
          forklaring,
          planActionId: created.id,
          sgValue: weakness.sgValue,
        });
      }
    }

    return {
      signalsWritten: signals.length,
      planActionsWritten,
    };
  });
}