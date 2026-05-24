/**
 * Tester for pyramid-weighting.ts.
 *
 * Kjøres med:
 *   npx tsx --test src/lib/__tests__/domain/pyramid-weighting.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  vurderPyramide,
  type PyramidFordeling,
  type PyramidOkt,
} from "../../domain/pyramid-weighting";

// ---------------------------------------------------------------------------
// Hjelper
// ---------------------------------------------------------------------------

const STANDARD_IDEAL: PyramidFordeling = {
  fys: 0.15,
  tek: 0.25,
  slag: 0.25,
  spill: 0.2,
  turn: 0.15,
};

function okter(...kategorier: ReadonlyArray<PyramidOkt["pyramid"]>): PyramidOkt[] {
  return kategorier.map((p) => ({ pyramid: p }));
}

// ---------------------------------------------------------------------------
// Tester
// ---------------------------------------------------------------------------

test("tomt input → faktisk 0, anbefaling om å starte", () => {
  const res = vurderPyramide(STANDARD_IDEAL, []);
  assert.equal(res.faktisk.fys, 0);
  assert.equal(res.faktisk.tek, 0);
  assert.equal(res.faktisk.slag, 0);
  assert.equal(res.faktisk.spill, 0);
  assert.equal(res.faktisk.turn, 0);
  assert.ok(res.anbefaling.includes("Ingen økter"));
});

test("perfekt match → anbefaling sier fortsett som nå", () => {
  // 20 økter med fordeling som matcher ideal:
  // FYS=3, TEK=5, SLAG=5, SPILL=4, TURN=3 → 15/25/25/20/15 %
  const liste: PyramidOkt[] = [
    ...okter("FYS", "FYS", "FYS"),
    ...okter("TEK", "TEK", "TEK", "TEK", "TEK"),
    ...okter("SLAG", "SLAG", "SLAG", "SLAG", "SLAG"),
    ...okter("SPILL", "SPILL", "SPILL", "SPILL"),
    ...okter("TURN", "TURN", "TURN"),
  ];
  const res = vurderPyramide(STANDARD_IDEAL, liste);
  assert.equal(res.faktisk.fys, 0.15);
  assert.equal(res.faktisk.tek, 0.25);
  assert.ok(res.anbefaling.includes("følger planen"));
});

test("for mye fys → anbefaling peker på fys", () => {
  // 10 økter, alle FYS → 100 % FYS
  const liste = okter("FYS", "FYS", "FYS", "FYS", "FYS", "FYS", "FYS", "FYS", "FYS", "FYS");
  const res = vurderPyramide(STANDARD_IDEAL, liste);
  assert.equal(res.faktisk.fys, 1);
  assert.ok(res.avvik.fys > 0, "fys-avvik skal være positivt (for mye)");
  assert.ok(res.anbefaling.toLowerCase().includes("fysisk"));
  assert.ok(res.anbefaling.includes("for mye"));
});

test("for lite turn → anbefaling peker på turnering", () => {
  // 20 økter, mye TEK/SLAG/SPILL, ingen TURN
  const liste: PyramidOkt[] = [
    ...okter("FYS", "FYS", "FYS"),
    ...okter("TEK", "TEK", "TEK", "TEK", "TEK", "TEK", "TEK"),
    ...okter("SLAG", "SLAG", "SLAG", "SLAG", "SLAG", "SLAG"),
    ...okter("SPILL", "SPILL", "SPILL", "SPILL"),
    // 0 TURN
  ];
  const res = vurderPyramide(STANDARD_IDEAL, liste);
  assert.equal(res.faktisk.turn, 0);
  assert.ok(res.avvik.turn < 0, "turn-avvik skal være negativt (for lite)");
});

test("avvik = faktisk − ideal", () => {
  const liste = okter("FYS", "FYS", "TEK", "TEK"); // 50/50/0/0/0
  const res = vurderPyramide(STANDARD_IDEAL, liste);
  assert.equal(Math.round(res.avvik.fys * 100) / 100, 0.35); // 0.5 − 0.15
  assert.equal(Math.round(res.avvik.tek * 100) / 100, 0.25); // 0.5 − 0.25
  assert.equal(Math.round(res.avvik.slag * 100) / 100, -0.25);
});

test("faktisk-fordeling summerer til 1.0 (innenfor flyte-toleranse)", () => {
  const liste = okter("FYS", "TEK", "SLAG", "SPILL", "TURN", "TEK", "SLAG");
  const res = vurderPyramide(STANDARD_IDEAL, liste);
  const sum = res.faktisk.fys + res.faktisk.tek + res.faktisk.slag + res.faktisk.spill + res.faktisk.turn;
  assert.ok(Math.abs(sum - 1) < 1e-9, `sum ${sum} skal være ≈ 1`);
});
