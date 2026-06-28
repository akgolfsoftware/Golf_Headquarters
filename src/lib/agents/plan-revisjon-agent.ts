// plan-revisjon: manuelt kjørbar agent. Coach velger en treningsplan + trigger
// i Mission Control; agenten foreslår konkrete plan-justeringer via Claude.
// Per-plan (ikke cron) — wrapper rundt foreslaPlanRevisjon, logget til AgentRun.

import type { Prisma } from "@/generated/prisma/client";
import { runAgent } from "./agent-runner";
import {
  foreslaPlanRevisjon,
  type PlanRevisionForslag,
  type PlanRevisionTrigger,
} from "@/lib/ai/agents/plan-revision";

export const AGENT_NAME = "plan-revisjon";

export async function runPlanRevisjon(opts: {
  planId: string;
  trigger: PlanRevisionTrigger;
}): Promise<PlanRevisionForslag> {
  let forslag: PlanRevisionForslag | null = null;
  await runAgent(AGENT_NAME, null, async () => {
    forslag = await foreslaPlanRevisjon(opts);
    return { output: { ...forslag } as Prisma.InputJsonValue };
  });
  if (!forslag) throw new Error("Plan-revisjon ga ingen forslag");
  return forslag;
}
