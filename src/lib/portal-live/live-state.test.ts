import assert from "node:assert/strict";
import { test } from "node:test";
import { mapWbToLiveSummary } from "./wb-live-map";
import { adjustLiveRep, livePayload, markLiveDrill, restoreLiveState } from "./live-state";
import { completedLiveDrills } from "./live-summary";
import { byggLiveDrillKoRad } from "@/lib/offline-queue/live-drill-kladd";
const session = () => mapWbToLiveSummary({ id: "s", title: "Syntetisk økt", date: new Date(0), startMinute: 540, durationMinutes: 30, status: "IN_PROGRESS", pyramid: "TEK", location: null, notes: null, publishedAt: null, createdAt: new Date(0), drills: [0, 1].map((i) => ({ id: `d${i}`, title: "Øvelse", description: null, durationMinutes: 15, sortOrder: i })) });
test("autosendte logger fullfører ikke øvelser", () => {
  const data = session();
  data.existingLogs = [{ drillId: "d0", repsTotal: 8, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 8, repsHit: 0, successRate: 0, notes: null, loggedAt: "2026-09-11T12:00Z" }];
  assert.deepEqual(restoreLiveState(data, null).drills.map((d) => d.status), ["active", "queued"]);
});
test("lokal angre til null vinner over server; pause og klokke gjenopptas", () => {
  const data = session();
  data.existingLogs = [{ drillId: "d0", repsTotal: 8, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 8, repsHit: 0, successRate: 0, notes: null, loggedAt: "2026-09-11T12:00Z" }];
  const cached = { ...byggLiveDrillKoRad("bruker-a", "s", livePayload(restoreLiveState(session(), null)), 120, new Date("2026-09-10")), paused: true, drillSec: 70 };
  const restored = restoreLiveState(data, cached);
  assert.equal(restored.drills[0].repsTotal, 0);
  assert.equal(restored.totalSec, 120); assert.equal(restored.drillSec, 70); assert.equal(restored.paused, true);
  assert.equal(restoreLiveState(data, { ...cached, sessionId: "other" }).drills[0].repsTotal, 8);
});
test("fullfør og angre beholder tall og tid, og gir høyst én aktiv øvelse", () => {
  let state = restoreLiveState(session(), null);
  for (let i = 0; i < 8; i++) state = adjustLiveRep(state, "d0", "repsHit", 1);
  state = { ...state, totalSec: 90, drillSec: 90 };
  state = markLiveDrill(state, "d0", true);
  assert.equal(state.drills[0].actualDurationSec, 90); assert.equal(state.drillSec, 0);
  state = markLiveDrill(state, "d1", true);
  state = markLiveDrill(state, "d0", false);
  assert.equal(state.drillSec, 90); assert.equal(state.totalSec, 90);
  state = adjustLiveRep(state, "d0", "repsHit", -1);
  assert.equal(state.drills[0].repsTotal, 7);
  assert.equal(state.drills.filter((d) => d.status === "active").length, 1);
  assert.equal(livePayload({ ...state, drillSec: 100 })[0].actualDurationSec, 100);
});
test("sammendrag teller bare eksplisitt ferdige øvelser, med eldre fallback", () => {
  const data = session();
  data.existingLogs = [{ drillId: "d0" }, { drillId: "d0" }, { drillId: "d1" }] as typeof data.existingLogs;
  assert.deepEqual(completedLiveDrills(data), ["d0", "d1"]);
  data.completedSummary = { liveSummary: { completedDrillIds: [] } };
  assert.deepEqual(completedLiveDrills(data), []);
  data.completedSummary = { liveSummary: { completedDrillIds: ["d1", "d1", "other", null] } };
  assert.deepEqual(completedLiveDrills(data), ["d1"]);
});
