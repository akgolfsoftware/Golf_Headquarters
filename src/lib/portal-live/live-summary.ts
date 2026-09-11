import type { LiveV2Session } from "@/components/portal/live/types";

/** Nye økter bruker spillerens ferdigmarkering, eldre økter loggene som før. */
export function completedLiveDrills(data: Pick<LiveV2Session, "drills" | "existingLogs" | "completedSummary">): string[] {
  const root = data.completedSummary;
  const summary = root && typeof root === "object" && "liveSummary" in root ? root.liveSummary : null;
  const ids = summary && typeof summary === "object" && "completedDrillIds" in summary ? summary.completedDrillIds : null;
  const candidates = Array.isArray(ids) ? ids : data.existingLogs.map((log) => log.drillId);
  return [...new Set(candidates.filter((id): id is string => typeof id === "string" && data.drills.some((drill) => drill.id === id)))];
}
