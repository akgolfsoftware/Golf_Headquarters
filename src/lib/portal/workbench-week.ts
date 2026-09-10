import type { TodaySession } from "@/app/portal/actions";
import type { WbRow } from "@/lib/workbench/wb-map";
import { asPyramid } from "@/lib/portal-live/wb-live-map";
import { liveHrefForStatus } from "@/lib/portal-live/live-route";
import { osloInstant } from "@/lib/jarvis/dagen";

/** Les samme øktrad som I dag; ingen speil eller ny økt opprettes. */
export function workbenchWeekSession(row: WbRow): TodaySession {
  const startTime = osloInstant(row.date.getUTCFullYear(), row.date.getUTCMonth() + 1,
    row.date.getUTCDate(), Math.floor(row.startMinute / 60), row.startMinute % 60);
  const pyramidArea = asPyramid(row.pyramid);
  return {
    model: "wb", id: row.id, title: row.title, startTime,
    endTime: new Date(startTime.getTime() + row.durationMinutes * 60_000),
    status: row.status === "IN_PROGRESS" ? "IN_PROGRESS" : row.status === "COMPLETED" ? "COMPLETED" : "PLANNED",
    practiceType: pyramidArea === "SLAG" ? "RANDOM" : pyramidArea === "SPILL" ? "SPILL_TEST" : pyramidArea === "TURN" ? "KONKURRANSE" : "BLOKK",
    pyramidArea, durationMin: row.durationMinutes, sted: row.location,
    maalsetning: row.notes,
    drills: row.drills.map((d) => ({ id: d.id, name: d.title, durationMinutes: d.durationMinutes })),
    href: liveHrefForStatus("wb", row.status, row.id),
  };
}
