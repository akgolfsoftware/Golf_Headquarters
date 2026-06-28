"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { runPlanWatcher } from "@/lib/agents/plan-watcher";
import { runTrainingGap } from "@/lib/agents/training-gap";
import { runDailyBrief } from "@/lib/agents/daily-brief-agent";
import { runDrillForslag } from "@/lib/agents/drill-forslag-agent";

// Agenter som kan kjøres manuelt fra Mission Control (ADMIN-only).
const MANUELT: Record<string, () => Promise<unknown>> = {
  "plan-watcher": runPlanWatcher,
  "training-gap": runTrainingGap,
  "daily-brief": runDailyBrief,
  "drill-forslag": runDrillForslag,
};

export const MANUELLE_AGENTER = Object.keys(MANUELT);

export type ManuellResultat =
  | { ok: true; melding: string }
  | { ok: false; melding: string };

export async function triggerAgentManually(
  agentName: string,
): Promise<ManuellResultat> {
  await requirePortalUser({ allow: ["ADMIN"] });
  const fn = MANUELT[agentName];
  if (!fn) return { ok: false, melding: `Ukjent agent: ${agentName}` };
  try {
    await fn();
    revalidatePath("/admin/agents");
    return { ok: true, melding: "Kjørt — se siste kjøringer under." };
  } catch (err) {
    return {
      ok: false,
      melding: err instanceof Error ? err.message : "Ukjent feil",
    };
  }
}
