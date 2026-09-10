import type { WeekDay, WeekPlanProgress } from "@/app/portal/actions";
import { tellerIEtterlevelse } from "@/lib/domain/okt-status";

/** Samme synlige økter som Plan. Minuttene er øktenes planlagte varighet,
 * også for fullførte økter; dette er ikke målt aktiv treningstid. */
export function weekPlanProgress(week: readonly Pick<WeekDay, "sessions">[]): WeekPlanProgress {
  const progress: WeekPlanProgress = {
    plannedMin: 0,
    completedMin: 0,
    plannedByAxis: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 },
    completedByAxis: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 },
  };
  for (const day of week) {
    for (const session of day.sessions) {
      if (!tellerIEtterlevelse({ status: session.status, avbruddAarsak: session.avbruddAarsak ?? null })) continue;
      const minutes = Number.isFinite(session.durationMin) ? Math.max(0, session.durationMin) : 0;
      progress.plannedMin += minutes;
      progress.plannedByAxis[session.pyramidArea] += minutes;
      if (session.status === "COMPLETED") {
        progress.completedMin += minutes;
        progress.completedByAxis[session.pyramidArea] += minutes;
      }
    }
  }
  return progress;
}

export function weekSessionCounts(week: readonly Pick<WeekDay, "sessions">[]) {
  const sessions = week.flatMap((day) => day.sessions);
  return {
    total: sessions.filter((s) => s.status !== "CANCELLED" && s.status !== "SKIPPED").length,
    completed: sessions.filter((s) => s.status === "COMPLETED").length,
  };
}
