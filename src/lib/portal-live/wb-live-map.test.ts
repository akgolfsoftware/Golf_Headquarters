import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapWbToLiveSessionData,
  mapWbToLiveSummary,
  wbStatusToPlanStatus,
  wbScheduledAtISO,
  type WbLiveInput,
} from "./wb-live-map";

function rad(overstyr: Partial<WbLiveInput> = {}): WbLiveInput {
  return {
    id: "wb-1",
    title: "Innspill 50–80 m",
    status: "COMPLETED",
    pyramid: "TEK",
    durationMinutes: 50,
    date: new Date(Date.UTC(2026, 8, 8)),
    startMinute: 9 * 60,
    location: "Range",
    notes: "Mål 8/12 i vindu",
    publishedAt: new Date(Date.UTC(2026, 8, 7)),
    createdAt: new Date(Date.UTC(2026, 8, 7)),
    drills: [
      {
        id: "d1",
        title: "Gate 20 m",
        description: null,
        durationMinutes: 20,
        sortOrder: 0,
      },
    ],
    ...overstyr,
  };
}

describe("wb-live-map", () => {
  it("PUBLISHED mappes til PLANNED for brief", () => {
    assert.equal(wbStatusToPlanStatus("PUBLISHED"), "PLANNED");
    assert.equal(wbStatusToPlanStatus("IN_PROGRESS"), "ACTIVE");
  });

  it("brief-payload har tittel og drills, ingen oppdiktede reps", () => {
    const data = mapWbToLiveSessionData(rad({ status: "PUBLISHED" }));
    assert.equal(data.title, "Innspill 50–80 m");
    assert.equal(data.drills.length, 1);
    assert.equal(data.totalPlannedReps, 0);
    assert.equal(data.completed, false);
    assert.equal(data.location, "Range");
    assert.equal(data.drills[0].durationMin, 20);
    assert.equal(data.drills[0].notes, null);
  });

  it("Plan, brief og oppsummering beholder Oslo-klokken gjennom sommer og vinter", () => {
    for (const [day, expected] of [
      ["2026-01-12", "2026-01-12T08:00:00.000Z"],
      ["2026-03-29", "2026-03-29T07:00:00.000Z"],
      ["2026-09-08", "2026-09-08T07:00:00.000Z"],
      ["2026-10-25", "2026-10-25T08:00:00.000Z"],
    ]) {
      const row = rad({ date: new Date(`${day}T00:00Z`) });
      assert.equal(wbScheduledAtISO(row.date, 540), expected);
      assert.equal(mapWbToLiveSessionData(row).scheduledAtISO, expected);
      const summary = mapWbToLiveSummary(row);
      assert.equal(summary.scheduledAtISO, expected);
      assert.equal(new Date(summary.endTimeISO).getTime() - new Date(expected).getTime(), 50 * 60_000);
    }
  });

  it("summary viser faktiske slag og dikter ikke opp varighet", () => {
    const s = mapWbToLiveSummary(rad(), [{ count: 12 }, { count: 8 }]);
    assert.equal(s.title, "Innspill 50–80 m");
    assert.equal(s.durationSec, 0);
    assert.equal(s.totalReps, 20);
    assert.equal(s.drillsCompleted, 0);
    assert.equal(s.existingLogs.length, 0);
    assert.equal(s.drills.length, 1);
  });
});
