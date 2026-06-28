// peaking: manuelt kjørbar agent. Coach velger spiller + turnering i Mission
// Control; agenten foreslår en uke-for-uke periodiseringsplan (Bompa) frem mot
// turneringen via Claude. Per-spiller (ikke cron) — wrapper rundt
// foreslaPeakingPlan, logget til AgentRun.

import type { Prisma } from "@/generated/prisma/client";
import { runAgent } from "./agent-runner";
import {
  foreslaPeakingPlan,
  type PeakingPlanResult,
} from "@/lib/ai/agents/performance-peaking";

export const AGENT_NAME = "peaking";

export async function runPeaking(opts: {
  spillerId: string;
  tournamentId: string;
}): Promise<PeakingPlanResult> {
  let resultat: PeakingPlanResult | null = null;
  await runAgent(AGENT_NAME, opts.spillerId, async () => {
    resultat = await foreslaPeakingPlan(opts);
    return { output: { ...resultat } as Prisma.InputJsonValue };
  });
  if (!resultat) throw new Error("Peaking ga ingen plan");
  return resultat;
}
