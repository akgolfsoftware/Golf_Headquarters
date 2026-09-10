import assert from "node:assert/strict";
import { test } from "node:test";
import { workbenchWeekSession } from "./workbench-week";
import type { WbRow } from "@/lib/workbench/wb-map";
function row(date: string, status = "PUBLISHED"): WbRow {
  return { id: "same-session", title: "Innspill", date: new Date(date), startMinute: 540,
    durationMinutes: 50, status, pyramid: "SLAG", location: "Range", notes: "8 av 12", drills: [] } as unknown as WbRow;
}
test("Plan beholder Workbench-identitet, mål og norsk klokkeslett sommer/vinter", () => {
  for (const [date, utc] of [["2026-09-10", "07:00"], ["2026-01-10", "08:00"]]) {
    const mapped = workbenchWeekSession(row(date));
    assert.equal(mapped.id, "same-session"); assert.equal(mapped.maalsetning, "8 av 12");
    assert.equal(mapped.startTime.toISOString(), `${date}T${utc}:00.000Z`);
    assert.equal(mapped.durationMin, 50);
    assert.equal(mapped.href, "/portal/live/same-session/brief");
  }
});
test("Plan følger øktens aktive og fullførte status", () => {
  assert.equal(workbenchWeekSession(row("2026-09-10", "IN_PROGRESS")).href, "/portal/live/same-session/tapper");
  assert.equal(workbenchWeekSession(row("2026-09-10", "COMPLETED")).href, "/portal/live/same-session/summary");
});
