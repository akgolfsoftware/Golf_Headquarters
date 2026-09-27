/**
 * Tester for belastningsberegning (sRPE) på økt- og ukenivå (Oppgave 3).
 *
 * Kjøres med:
 *   npx tsx --test src/lib/__tests__/domain/workbench-load.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";

import { computeSessionLoad, computeWeeklyLoad, RPE_SKALA } from "../../domain/workbench/load";

test("RPE_SKALA dekker 1 til 10 med beskrivelser", () => {
  for (let rpe = 1; rpe <= 10; rpe++) {
    assert.ok(RPE_SKALA[rpe], `Mangler RPE ${rpe}`);
    assert.ok(RPE_SKALA[rpe].kort.length > 0);
  }
});

test("computeSessionLoad beregner minutter * perceivedEffort", () => {
  // Planlagt 60 min, effort 5 -> 300
  const l1 = computeSessionLoad({ durationMinutes: 60, perceivedEffort: 5 });
  assert.equal(l1, 300);

  // actualMinutes overstyrer planlagt durationMinutes
  const l2 = computeSessionLoad({ durationMinutes: 60, actualMinutes: 75, perceivedEffort: 6 });
  assert.equal(l2, 450);

  // Ugyldig eller manglende perceivedEffort gir null
  assert.equal(computeSessionLoad({ durationMinutes: 60, perceivedEffort: null }), null);
  assert.equal(computeSessionLoad({ durationMinutes: 60, perceivedEffort: undefined }), null);
  assert.equal(computeSessionLoad({ durationMinutes: 60, perceivedEffort: 0 }), null);
  assert.equal(computeSessionLoad({ durationMinutes: 60, perceivedEffort: 11 }), null);
});

test("computeWeeklyLoad summerer opplevd belastning på tvers av uken", () => {
  const sessions = [
    { durationMinutes: 60, actualMinutes: 60, perceivedEffort: 4, status: "COMPLETED" }, // 240
    { durationMinutes: 90, actualMinutes: 80, perceivedEffort: 6, status: "COMPLETED" }, // 480
    { durationMinutes: 45, perceivedEffort: null, status: "COMPLETED" }, // unrated
    { durationMinutes: 60, perceivedEffort: 5, status: "PUBLISHED" }, // 300
  ];

  const res = computeWeeklyLoad(sessions);
  assert.equal(res.totalLoad, 240 + 480 + 300); // 1020
  assert.equal(res.ratedSessionsCount, 3);
  assert.equal(res.totalSessionsCount, 4);
  assert.equal(res.averageEffort, 5); // (4+6+5)/3 = 5.0
  assert.equal(res.completedMinutes, 60 + 80 + 45); // 185
});
