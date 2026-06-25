import type { PlanStatus } from "@/generated/prisma/client";
import type { WorkbenchData } from "./load-workbench";

export type WorkbenchRole = "player" | "coach";

/** Én-linjers kontekst over ukevisningen («hvorfor denne uken»). */
export type WorkbenchInsights = {
  line: string;
  periodLabel: string | null;
  weaknessLine: string | null;
  sessionCount: number;
  plannedMinutes: number;
};

export type WorkbenchContext = {
  data: WorkbenchData;
  insights: WorkbenchInsights;
  hasWeekSessions: boolean;
  planStatus: PlanStatus | null;
};