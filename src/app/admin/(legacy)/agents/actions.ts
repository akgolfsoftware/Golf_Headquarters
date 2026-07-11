"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { runPlanWatcher } from "@/lib/agents/plan-watcher";
import { runTrainingGap } from "@/lib/agents/training-gap";
import { runDailyBrief } from "@/lib/agents/daily-brief-agent";
import { runDrillForslag } from "@/lib/agents/drill-forslag-agent";
import { runBookingOptimizer } from "@/lib/agents/booking-optimizer";
import { runAvailabilityMonitor } from "@/lib/agents/availability-24-7-monitor";
import { runAvailabilityGapFiller } from "@/lib/agents/availability-gap-filler";
import { runBookingConflictMonitor } from "@/lib/agents/booking-conflict-monitor";
import { runAiCodeReviewer } from "@/lib/agents/ai-code-reviewer";
import { runDemandPredictor } from "@/lib/agents/demand-predictor";
import { runProactiveBookingAlerts } from "@/lib/agents/booking-alerts-proactive";
import { runPlanEffectivenessAgent } from "@/lib/agents/plan-effectiveness-agent";


// Agenter som kan kjøres manuelt fra Mission Control (ADMIN-only).
const MANUELT: Record<string, () => Promise<unknown>> = {
  "plan-watcher": runPlanWatcher,
  "training-gap": runTrainingGap,
  "daily-brief": runDailyBrief,
  "drill-forslag": runDrillForslag,
  "booking-optimizer": runBookingOptimizer,
  "availability-24-7-monitor": runAvailabilityMonitor,
  "availability-gap-filler": runAvailabilityGapFiller,
  "booking-conflict-monitor": runBookingConflictMonitor,
  "ai-code-reviewer": runAiCodeReviewer,
  "demand-predictor": runDemandPredictor,
  "24-7-booking-alerts": runProactiveBookingAlerts,
  "plan-effectiveness-agent": runPlanEffectivenessAgent,
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
