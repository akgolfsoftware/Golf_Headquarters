// plan-effectiveness-agent — flagger planer med lav completion eller negativ SG-effekt.

import { prisma } from "@/lib/prisma";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleVedPlanAction } from "./notify-plan-action";
import { byggProvenance } from "./provenance";

export const AGENT_NAME = "plan-effectiveness-agent";

const COMPLETION_TERSKEL = 0.55;
const SG_DELTA_TERSKEL = -0.25;

export async function runPlanEffectivenessAgent(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const seksti = new Date();
    seksti.setDate(seksti.getDate() - 60);

    const rader = await prisma.planEffectiveness.findMany({
      where: { computedAt: { gte: seksti }, postSnapshot: { path: ["analyseVersjon"], equals: "2026-10-23.1" } },
      include: {
        plan: { select: { id: true, name: true, userId: true, isActive: true } },
      },
      orderBy: { computedAt: "desc" },
      take: 50,
    });

    let planActionsWritten = 0;
    let signalsWritten = 0;

    for (const row of rader) {
      if (!row.plan || !row.plan.isActive) continue;

      const rate = row.complianceRate ?? row.completionRate ?? null;
      const lavCompletion = rate !== null && Number.isFinite(rate) && rate >= 0 && rate < COMPLETION_TERSKEL;
      const negativSg =
        row.sgTotalDelta != null && row.sgTotalDelta < SG_DELTA_TERSKEL;
      if (!lavCompletion && !negativSg) continue;

      if (!row.planId) continue;
      const dup = await prisma.planAction.findFirst({
        where: {
          userId: row.userId,
          planId: row.planId,
          agentName: AGENT_NAME,
          status: "PENDING",
        },
      });
      if (dup) continue;

      const coachId = await resolveCoachIdForPlayer(row.userId);
      const forklaring = lavCompletion
        ? `Plan «${row.plan.name}»: bare ${Math.round((rate ?? 0) * 100)} % økter fullført — vurder revisjon.`
        : `Plan «${row.plan.name}»: SG-total ${row.sgTotalDelta?.toFixed(2)} etter plan — vurder justering.`;

      const dato = (row.computedAt ?? row.createdAt).toISOString();
      const created = await prisma.planAction.create({
        data: {
          userId: row.userId,
          coachId,
          planId: row.planId,
          actionType: "COACH_REVIEW",
          agentName: AGENT_NAME,
          suggestion: {
            forklaring,
            signalSnapshot: {
              completionRate: rate,
              sgTotalDelta: row.sgTotalDelta,
            },
          },
          provenance: byggProvenance({
            kilde: "PLAN",
            rader: [{ id: row.id, dato }],
            regel: lavCompletion
              ? `completionRate under terskel ${COMPLETION_TERSKEL}`
              : `sgTotalDelta under terskel ${SG_DELTA_TERSKEL}`,
            terskel: lavCompletion ? COMPLETION_TERSKEL : SG_DELTA_TERSKEL,
            maaltVerdi: lavCompletion
              ? (rate ?? undefined)
              : (row.sgTotalDelta ?? undefined),
          }),
        },
      });
      planActionsWritten++;

      await varsleVedPlanAction({
        userId: row.userId,
        agentName: AGENT_NAME,
        actionType: "COACH_REVIEW",
        forklaring,
        planActionId: created.id,
      });

      await prisma.signal.create({
        data: {
          userId: row.userId,
          kind: "PLAN_EFFECTIVENESS",
          value: row.sgTotalDelta,
          payload: {
            planId: row.planId,
            completionRate: row.completionRate,
          },
        },
      });
      signalsWritten++;
    }

    return { signalsWritten, planActionsWritten };
  });
}