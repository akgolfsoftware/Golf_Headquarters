import "server-only";
import { DAILY_BRIEF_IKKE_AKTIVERT } from "@/lib/ai/agents/daily-brief";

export const AGENT_NAME = "daily-brief";

// Cron og manuelle kall må stoppe før runAgent, spillerlesing og varsling.
// Cockpit bruker fersk, tilgangskontrollert status uavhengig av denne jobben.
export async function runDailyBrief(): Promise<never> {
  throw new Error(DAILY_BRIEF_IKKE_AKTIVERT);
}
