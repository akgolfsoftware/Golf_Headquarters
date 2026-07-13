"use server";

// Manuell kjøring av de per-spiller-agentene fra agent-detaljsiden.
// ADMIN/COACH. Kjøringene logges til AgentRun (synlig i "Siste kjøringer"),
// og forslaget returneres for inline-visning i skjemaet.

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { runPlanRevisjon } from "@/lib/agents/plan-revisjon-agent";
import { runPeaking } from "@/lib/agents/peaking-agent";
import type { PlanRevisionForslag, PlanRevisionTrigger } from "@/lib/ai/agents/plan-revision";
import type { PeakingPlanResult } from "@/lib/ai/agents/performance-peaking";

const TRIGGERE: PlanRevisionTrigger[] = [
  "siste-runde",
  "skade-flagg",
  "turnering-prep",
];

export type PlanRevisjonResultat =
  | { ok: true; forslag: PlanRevisionForslag }
  | { ok: false; melding: string };

export type PeakingResultat =
  | { ok: true; plan: PeakingPlanResult }
  | { ok: false; melding: string };

export async function kjorPlanRevisjon(
  planId: string,
  trigger: string,
): Promise<PlanRevisjonResultat> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!planId) return { ok: false, melding: "Velg en treningsplan" };
  if (!TRIGGERE.includes(trigger as PlanRevisionTrigger)) {
    return { ok: false, melding: "Ugyldig trigger" };
  }
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: { userId: true },
  });
  if (!plan) return { ok: false, melding: "Fant ikke planen" };
  if (!(await harCoachTilgangTilSpiller(coach, plan.userId))) {
    return { ok: false, melding: "Du har ikke tilgang til denne spilleren." };
  }
  try {
    const forslag = await runPlanRevisjon({
      planId,
      trigger: trigger as PlanRevisionTrigger,
    });
    revalidatePath("/admin/agents/plan-revisjon");
    return { ok: true, forslag };
  } catch (err) {
    return {
      ok: false,
      melding: err instanceof Error ? err.message : "Kjøring feilet",
    };
  }
}

export async function kjorPeaking(
  spillerId: string,
  tournamentId: string,
): Promise<PeakingResultat> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!spillerId || !tournamentId) {
    return { ok: false, melding: "Velg både spiller og turnering" };
  }
  if (!(await harCoachTilgangTilSpiller(coach, spillerId))) {
    return { ok: false, melding: "Du har ikke tilgang til denne spilleren." };
  }
  try {
    const plan = await runPeaking({ spillerId, tournamentId });
    revalidatePath("/admin/agents/peaking");
    return { ok: true, plan };
  } catch (err) {
    return {
      ok: false,
      melding: err instanceof Error ? err.message : "Kjøring feilet",
    };
  }
}
