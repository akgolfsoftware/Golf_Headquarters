import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { initialWorkbenchLiveSnapshot, parseWorkbenchLiveSnapshot } from "./live";

describe("Workbench Live-snapshot", () => {
  it("starter første øvelse og gir tre serier per øvelse", () => {
    const snapshot = initialWorkbenchLiveSnapshot(["d1", "d2"], "2026-09-21T10:00:00.000Z");
    assert.deepEqual(snapshot.drills.map((drill) => drill.status), ["active", "queued"]);
    assert.deepEqual(snapshot.seriesTargets, { d1: 3, d2: 3 });
  });

  it("beholder gyldig progresjon og legger til nye øvelser trygt", () => {
    const snapshot = parseWorkbenchLiveSnapshot({
      startedAtISO: "2026-09-21T10:00:00.000Z",
      totalSec: 120,
      updatedAtISO: "2026-09-21T10:02:00.000Z",
      drills: [{ drillId: "d1", reps: 9, elapsedSec: 120, status: "done" }],
      seriesTargets: { d1: 4 },
    }, ["d1", "d2"], "2026-09-21T10:00:00.000Z");
    assert.deepEqual(snapshot.drills.map((drill) => [drill.drillId, drill.status]), [["d1", "done"], ["d2", "active"]]);
    assert.deepEqual(snapshot.seriesTargets, { d1: 4, d2: 3 });
  });
});
