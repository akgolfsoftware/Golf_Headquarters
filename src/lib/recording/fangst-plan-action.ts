/**
 * Etter fangst-analyse: opprett PENDING PlanAction med sjekkpunkt + fangstId.
 * Coach godkjenner i køen → acceptAndApplyPlanAction lagrer sjekkpunkt permanent.
 */

import { prisma } from "@/lib/prisma";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";
import { varsleVedPlanAction } from "@/lib/agents/notify-plan-action";
import type { AnalyseResultat } from "@/lib/coaching-analysis";
import { byggSjekkpunktFraAnalyse } from "./fangst-sjekkpunkt-tekst";

export const FANGST_ACTION_TYPE = "FANGST_SJEKKPUNKT" as const;
export { byggSjekkpunktFraAnalyse } from "./fangst-sjekkpunkt-tekst";

/**
 * Idempotent: hopper over hvis det allerede finnes PENDING med samme fangstId.
 * Returnerer opprettet id eller null.
 */
export async function opprettFangstSjekkpunktPlanAction(opts: {
  playerId: string;
  recordingId: string;
  analyse: AnalyseResultat;
  coachUserId?: string | null;
}): Promise<string | null> {
  const existing = await prisma.planAction.findFirst({
    where: {
      userId: opts.playerId,
      status: "PENDING",
      fangstId: opts.recordingId,
      actionType: FANGST_ACTION_TYPE,
    },
    select: { id: true },
  });
  if (existing) return existing.id;

  const sjekkpunkt = byggSjekkpunktFraAnalyse(opts.analyse);
  const coachId =
    opts.coachUserId ?? (await resolveCoachIdForPlayer(opts.playerId));

  const created = await prisma.planAction.create({
    data: {
      userId: opts.playerId,
      coachId: coachId ?? undefined,
      actionType: FANGST_ACTION_TYPE,
      agentName: "fangst-analyse",
      status: "PENDING",
      fangstId: opts.recordingId,
      // Ligger også i suggestion til kø-UI / accept-fallback
      suggestion: {
        title: "Sjekkpunkt etter fangst",
        tittel: "Sjekkpunkt etter fangst",
        forklaring: sjekkpunkt,
        detail: opts.analyse.oppsummering?.slice(0, 400) ?? "",
        sjekkpunkt,
        fangstId: opts.recordingId,
        hjemmelekse: opts.analyse.hjemmelekse,
        nesteOktAnbefaling: opts.analyse.nesteOktAnbefaling,
      },
    },
    select: { id: true },
  });

  await varsleVedPlanAction({
    userId: opts.playerId,
    agentName: "fangst-analyse",
    actionType: FANGST_ACTION_TYPE,
    forklaring: sjekkpunkt.slice(0, 200),
    planActionId: created.id,
  });

  return created.id;
}
