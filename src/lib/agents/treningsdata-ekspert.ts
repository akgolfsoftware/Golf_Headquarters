// treningsdata-ekspert — korrelasjon mellom treningsvolum og SG-utvikling.

import { prisma } from "@/lib/prisma";
import { beregnKorrelasjon } from "@/lib/training/korrelasjon";
import { aggregateSg } from "@/lib/sg";
import type { SgCategory } from "@/generated/prisma/client";
import { SG_TO_SKILL } from "@/lib/training/skills";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleVedPlanAction } from "./notify-plan-action";

export const AGENT_NAME = "treningsdata-ekspert";

const OMRAADER: SgCategory[] = ["OTT", "APP", "ARG", "PUTT"];

export async function runTreningsdataEkspert(
  userId: string,
): Promise<AgentResult> {
  return runAgent(AGENT_NAME, userId, async () => {
    const tretti = new Date();
    tretti.setDate(tretti.getDate() - 30);

    const runder = await prisma.round.findMany({
      where: { userId, playedAt: { gte: tretti } },
      orderBy: { playedAt: "desc" },
      take: 10,
    });
    if (runder.length < 3) {
      return { signalsWritten: 0, planActionsWritten: 0 };
    }

    const korrelasjon = await beregnKorrelasjon(userId, 12);

    const negativ = korrelasjon.find(
      (k) => k.tolkning === "negativ" && k.datapunkter >= 3,
    );
    if (!negativ) {
      return { signalsWritten: 0, planActionsWritten: 0 };
    }

    const sg = aggregateSg(runder);
    const sgSnitt = {
      OTT: sg.ott ?? 0,
      APP: sg.app ?? 0,
      ARG: sg.arg ?? 0,
      PUTT: sg.putt ?? 0,
    };
    const primary = OMRAADER.reduce(
      (best, cur) => (sgSnitt[cur] < sgSnitt[best] ? cur : best),
      negativ.sgArea,
    );

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

    const plan = await prisma.trainingPlan.findFirst({
      where: { userId, isActive: true },
      select: { id: true },
    });
    const coachId = await resolveCoachIdForPlayer(userId);
    const forklaring = `Trening på ${negativ.sgArea} korrelerer negativt (r=${negativ.r?.toFixed(2) ?? "?"}). Vurder omfang eller fokus før mer volum.`;

    const created = await prisma.planAction.create({
      data: {
        userId,
        coachId,
        planId: plan?.id ?? null,
        actionType: "FOCUS_CHANGE",
        agentName: AGENT_NAME,
        suggestion: {
          skillArea: SG_TO_SKILL[primary],
          forklaring,
          signalSnapshot: {
            kind: "KORRELASJON",
            sgArea: negativ.sgArea,
            r: negativ.r,
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
    });

    return { signalsWritten: 0, planActionsWritten: 1 };
  });
}