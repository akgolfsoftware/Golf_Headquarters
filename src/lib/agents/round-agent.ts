// round-agent: kjøres etter Round.create. Beregner SG-snitt siste 30 dager,
// skriver Signal og evt. PlanAction ved tydelig svakhet.

import { prisma } from "@/lib/prisma";
import { resolveDrillPakke } from "./plan-action-executor";
import { SG_ANALYSE_SELECT, sgSammenligningsnokkel, sgSnapshot, MIN_SG_RUNDER } from "@/lib/ai-plan/analyse-grunnlag";
import {
  runWeaknessSkill,
  SG_TO_PYRAMID,
  SG_TO_SKILL,
} from "@/lib/training/skills";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleVedPlanAction } from "./notify-plan-action";
import { byggProvenance } from "./provenance";

export const AGENT_NAME = "round-agent";

const SG_TERSKEL = -0.5;

export async function runRoundAgent(userId: string): Promise<AgentResult> {
  return runAgent(AGENT_NAME, userId, async () => {
    const tretti = new Date();
    tretti.setDate(tretti.getDate() - 30);

    const alleRunder = await prisma.round.findMany({
      where: { userId, playedAt: { gte: tretti, lte: new Date() }, playStatus: "COMPLETED", partialSave: false },
      select: SG_ANALYSE_SELECT,
      orderBy: [{ playedAt: "desc" }, { id: "desc" }],
    });

    const siste = alleRunder.find(r => sgSammenligningsnokkel(r) !== null);
    const key = siste ? sgSammenligningsnokkel(siste) : null;
    const runder = key ? alleRunder.filter(r => sgSammenligningsnokkel(r) === key) : [];
    if (runder.length < MIN_SG_RUNDER) return { signalsWritten: 0, planActionsWritten: 0 };
    const snapshot = sgSnapshot(runder);
    const sg = { total: snapshot.sgTotal, ott: snapshot.sgOtt, app: snapshot.sgApp,
      arg: snapshot.sgArg, putt: snapshot.sgPutt, rundeAntall: runder.length };
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
      OTT: sg.ott,
      APP: sg.app,
      ARG: sg.arg,
      PUTT: sg.putt,
    };
    const plan = await prisma.trainingPlan.findFirst({
      where: { userId, isActive: true },
      select: { id: true },
    });

    // En sammenligning av svakeste område krever dekning i alle fire.
    if (Object.values(sgSnitt).some(v => v === null || !Number.isFinite(v)) ||
      runder.some(r => [r.sgOtt, r.sgApp, r.sgArg, r.sgPutt].some(v => v === null || !Number.isFinite(v)))) {
      return { signalsWritten: signals.length, planActionsWritten: 0 };
    }
    const weakness = runWeaknessSkill({
      sgSnitt: { OTT: sg.ott!, APP: sg.app!, ARG: sg.arg!, PUTT: sg.putt! }, pyramidSessions: [],
    });

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
            provenance: byggProvenance({
              kilde: "RUNDER",
              rader: runder.map((r) => ({ id: r.id, dato: r.playedAt.toISOString() })),
              regel: `SG ${weakness.primarySgArea} under terskel ${SG_TERSKEL}`,
              terskel: SG_TERSKEL,
              maaltVerdi: weakness.sgValue,
            }),
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