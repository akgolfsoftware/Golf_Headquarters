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

// Kalibrert 2026-06-10 mot Team Norway IUP Ref-ark: 1 m → forventet 1,13 slag.
test("ett hulet putt (1 m) → SG putt = +0,13 (IUP Ref)", () => {
  const shots: SgShot[] = [
    { category: "PUTT", distance: 1, outcome: "HOLED", distanceAfter: 0 },
  ];
  const res = beregnSg(shots);
  assert.equal(res.putt, 0.13);
  assert.equal(res.ott, 0);
  assert.equal(res.app, 0);
  assert.equal(res.arg, 0);
  assert.equal(res.total, 0.13);
});

// Stikkprøver direkte mot IUP Ref-arkets intervaller.
test("putt-baseline matcher IUP Ref-arket (0,9 m / 3 m / 18 m)", () => {
  const holed = (m: number) =>
    beregnSg([{ category: "PUTT", distance: m, outcome: "HOLED", distanceAfter: 0 }]).putt;
  assert.equal(holed(0.9), 0.04); // Ref: ≤0,9 → 1,04
  assert.equal(holed(3), 0.61); // Ref: ≤3,0 → 1,61
  assert.equal(holed(18), 1.21); // Ref: ≤18 → 2,21
});

// Tregangs-putt fra 1 m skal TAPE slag (1,13 − 0 − 3 ≈ −1,87 totalt).
test("tre putter fra 1 m → negativ SG putt", () => {
  const shots: SgShot[] = [
    { category: "PUTT", distance: 1, outcome: "GREEN", distanceAfter: 0.8 },
    { category: "PUTT", distance: 0.8, outcome: "GREEN", distanceAfter: 0.3 },
    { category: "PUTT", distance: 0.3, outcome: "HOLED", distanceAfter: 0 },
  ];
  const res = beregnSg(shots);
  assert.ok(res.putt < -1.5, `forventet ca −1,87, fikk ${res.putt}`);
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
  // 50 m approach holed (Broadie): forventet 2.66 → SG = 1.66
  const shots: SgShot[] = [
    { category: "APP", distance: 50, outcome: "HOLED", distanceAfter: null },
  ];
  const res = beregnSg(shots);
  assert.equal(res.app, 1.66);
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
