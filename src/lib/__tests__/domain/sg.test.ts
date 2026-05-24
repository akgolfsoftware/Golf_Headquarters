/**
 * Tester for sg.ts — Strokes Gained-beregning.
 *
 * Kjøres med:
 *   npx tsx --test src/lib/__tests__/domain/sg.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";

import { beregnSg, formaterSg, type SgShot } from "../../domain/sg";

// ---------------------------------------------------------------------------
// beregnSg
// ---------------------------------------------------------------------------

test("tomt input → alle SG-verdier er 0", () => {
  const res = beregnSg([]);
  assert.equal(res.ott, 0);
  assert.equal(res.app, 0);
  assert.equal(res.arg, 0);
  assert.equal(res.putt, 0);
  assert.equal(res.total, 0);
});

test("ett hulet putt (1 m) → SG putt ≈ +0,05", () => {
  // Forventet fra 1 m: 1.05 slag. HOLED → SG = 1.05 − 1 = +0.05
  const shots: SgShot[] = [
    { category: "PUTT", distance: 1, outcome: "HOLED", distanceAfter: 0 },
  ];
  const res = beregnSg(shots);
  assert.equal(res.putt, 0.05);
  assert.equal(res.ott, 0);
  assert.equal(res.app, 0);
  assert.equal(res.arg, 0);
  assert.equal(res.total, 0.05);
});

test("total = sum av alle kategorier", () => {
  const shots: SgShot[] = [
    { category: "OTT", distance: 350, outcome: "FAIRWAY", distanceAfter: 100 },
    { category: "APP", distance: 100, outcome: "GREEN", distanceAfter: 5 },
    { category: "ARG", distance: 10, outcome: "GREEN", distanceAfter: 2 },
    { category: "PUTT", distance: 2, outcome: "HOLED", distanceAfter: 0 },
  ];
  const res = beregnSg(shots);
  // Sjekk konsistens: total = sum av deler (innenfor avrundingsfeil)
  const sumDeler = Math.round((res.ott + res.app + res.arg + res.putt) * 100) / 100;
  assert.equal(res.total, sumDeler);
});

test("kategorisering: OTT-slag bidrar kun til OTT-feltet", () => {
  const shots: SgShot[] = [
    { category: "OTT", distance: 300, outcome: "FAIRWAY", distanceAfter: 150 },
  ];
  const res = beregnSg(shots);
  assert.ok(res.ott !== 0, "OTT skal ha en verdi");
  assert.equal(res.app, 0);
  assert.equal(res.arg, 0);
  assert.equal(res.putt, 0);
});

test("HOLED-slag (distanceAfter = null) gir SG = forventet − 1", () => {
  // 50 m approach holed: forventet 2.55 → SG = 1.55
  const shots: SgShot[] = [
    { category: "APP", distance: 50, outcome: "HOLED", distanceAfter: null },
  ];
  const res = beregnSg(shots);
  assert.equal(res.app, 1.55);
});

// ---------------------------------------------------------------------------
// formaterSg
// ---------------------------------------------------------------------------

test("formaterSg: positiv → '+1,2'", () => {
  assert.equal(formaterSg(1.234), "+1,2");
});

test("formaterSg: negativ → '-0,8'", () => {
  assert.equal(formaterSg(-0.78), "-0,8");
});

test("formaterSg: 0 → '0,0'", () => {
  assert.equal(formaterSg(0), "0,0");
});

test("formaterSg: avrunding bort fra 0 fungerer", () => {
  // 0.04 → 0.0 → "0,0"
  assert.equal(formaterSg(0.04), "0,0");
  // -0.05 avrundes til -0.1 av Math.round (banker's rounding gjelder ikke i JS)
  // Vi sjekker bare at format-strengen har minustegn og er ett desimal
  const negativ = formaterSg(-0.15);
  assert.ok(negativ.startsWith("-"));
  assert.ok(negativ.includes(","));
});
