import test from "node:test";
import assert from "node:assert/strict";
import { computeSessionLoad, computeWeeklyLoad } from "./load";

test("registrerte null minutter gir null belastning uten planlagt reserveverdi", () => {
  const session = { durationMinutes: 60, actualMinutes: 0, perceivedEffort: 5, status: "COMPLETED" };
  assert.equal(computeSessionLoad(session), 0);
  const week = computeWeeklyLoad([session]);
  assert.equal(week.totalLoad, 0);
  assert.equal(week.completedMinutes, 0);
  assert.equal(week.ratedSessionsCount, 1);
});

test("registrert tid styrer belastningen mens eksisterende plananslag bevares for ukjent tid", () => {
  assert.equal(computeSessionLoad({ durationMinutes: 60, actualMinutes: 45, perceivedEffort: 5 }), 225);
  assert.equal(computeSessionLoad({ durationMinutes: 60, actualMinutes: null, perceivedEffort: 5 }), 300);
  assert.equal(computeSessionLoad({ durationMinutes: 60, actualMinutes: 0, perceivedEffort: null }), null);
});
