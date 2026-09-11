import type { TodaySession } from "@/app/portal/actions";
import type { SessionStatus, SessionStatusV2, TrainingPlanSession } from "@/generated/prisma/client";
import { liveHrefForStatus } from "@/lib/portal-live/live-route";
import { translateMiljo } from "./translate-taxonomy";

export type PlanWeekRow = Pick<TrainingPlanSession,
  "id" | "title" | "scheduledAt" | "durationMin" | "status" | "pyramidArea" | "location" | "miljo" | "maalsetning"
> & {
  drills: { id: string; repMinutter: number | null; exercise: { name: string; durationMin: number | null } }[];
};

const PLAN_STATUS: Record<SessionStatus, SessionStatusV2 | null> = {
  PLANNED: "PLANNED", ACTIVE: "IN_PROGRESS", PAUSED: "IN_PROGRESS",
  COMPLETED: "COMPLETED", CANCELLED: "CANCELLED", SKIPPED: "SKIPPED", ABANDONED: null,
};
const minutes = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;

/** Eldre planøkt uten V2-speil. Beholder egen identitet og lagrede tidspunkt;
 * planlagt varighet er ikke målt aktivitet. Forlatte økter følger I dag-filteret. */
export function planWeekSession(row: PlanWeekRow): TodaySession | null {
  const status = PLAN_STATUS[row.status];
  if (status === null) return null;
  const durationMin = minutes(row.durationMin);
  const pyramidArea = row.pyramidArea;
  return {
    id: row.id, planSessionId: row.id, model: "plan", title: row.title,
    startTime: row.scheduledAt,
    endTime: new Date(row.scheduledAt.getTime() + durationMin * 60_000),
    status, avbruddAarsak: null,
    practiceType: pyramidArea === "SLAG" ? "RANDOM" : pyramidArea === "SPILL" ? "SPILL_TEST" : pyramidArea === "TURN" ? "KONKURRANSE" : "BLOKK",
    pyramidArea, durationMin,
    sted: row.location ?? (row.miljo ? translateMiljo(row.miljo) : null),
    maalsetning: row.maalsetning,
    drills: row.drills.map((d) => ({ id: d.id, name: d.exercise.name, durationMinutes: minutes(d.repMinutter ?? d.exercise.durationMin ?? 0) })),
    href: liveHrefForStatus("plan", row.status, row.id),
  };
}
