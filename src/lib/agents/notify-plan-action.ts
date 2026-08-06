import "server-only";

import { prisma } from "@/lib/prisma";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";
import { varsleAgentFunn } from "./agent-notify";
import { logError } from "@/lib/error-tracking";

export type VarslePlanActionOpts = {
  userId: string;
  agentName: string;
  actionType: string;
  forklaring: string;
  planActionId?: string;
  /** SG-verdi for å eskalere varsel (f.eks. < -1.0). */
  sgValue?: number;
};

/** Varsler coach når en agent skriver PENDING PlanAction. Best-effort. */
export async function varsleVedPlanAction(
  opts: VarslePlanActionOpts,
): Promise<void> {
  try {
    const [spiller, coachId] = await Promise.all([
      prisma.user.findUnique({
        where: { id: opts.userId },
        select: { name: true },
      }),
      resolveCoachIdForPlayer(opts.userId),
    ]);

    const navn = spiller?.name?.split(/\s+/)[0] ?? "Spiller";
    const lenke = opts.planActionId
      ? `/admin/godkjenninger/${opts.planActionId}`
      : "/admin/godkjenninger";

    await varsleAgentFunn({
      coachId,
      tittel: `Agent: ${opts.actionType.replace(/_/g, " ")}`,
      tekst: `${navn} — ${opts.forklaring}`,
      lenke,
      telegram: opts.sgValue != null && opts.sgValue < -1.0,
    });
  } catch (error) {
    await logError({
      context: "agents.notifyPlanAction",
      error,
      meta: { userId: opts.userId, actionType: opts.actionType, planActionId: opts.planActionId },
      severity: "warn",
    });
  }
}