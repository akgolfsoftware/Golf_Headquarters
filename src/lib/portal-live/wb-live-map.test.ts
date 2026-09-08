import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapWbToLiveSessionData,
  mapWbToLiveSummary,
  wbStatusToPlanStatus,
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
  });

  it("summary-payload har varighet fra planen, 0 reps", () => {
    const s = mapWbToLiveSummary(rad());
    assert.equal(s.title, "Innspill 50–80 m");
    assert.equal(s.durationSec, 50 * 60);
    assert.equal(s.totalReps, 0);
    assert.equal(s.drillsCompleted, 0);
    assert.equal(s.existingLogs.length, 0);
    assert.equal(s.drills.length, 1);
  });
});
