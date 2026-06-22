/**
 * Tester for fys-score.ts — FYS testbatteri → samlet score (v1).
 * Kjøres med: npx tsx --test src/lib/__tests__/domain/fys-score.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  fysScore,
  justertVerdi,
  delscore,
  byggStallSpenn,
  FYS_VEKTER,
  type FysRaw,
} from "../../domain/fys-score";

const tom: FysRaw = {
  markloft: null,
  benkpress: null,
  lengde: null,
  ballkast: null,
  chs: null,
  kroppsvektKg: null,
};

test("styrkeløft justeres relativt til kroppsvekt; resten absolutt", () => {
  const raw: FysRaw = { ...tom, markloft: 120, benkpress: 90, lengde: 250, kroppsvektKg: 80 };
  assert.equal(justertVerdi(raw, "markloft"), 120 / 80); // 1.5
  assert.equal(justertVerdi(raw, "benkpress"), 90 / 80); // 1.125
  assert.equal(justertVerdi(raw, "lengde"), 250); // absolutt
});

test("styrkeløft uten kroppsvekt → null (ekskluderes)", () => {
  const raw: FysRaw = { ...tom, markloft: 120, kroppsvektKg: null };
  assert.equal(justertVerdi(raw, "markloft"), null);
});

test("delscore: beste i stallen = 100, proporsjonalt", () => {
  assert.equal(delscore(1.5, { min: 1.0, max: 1.5 }), 100); // beste
  assert.equal(delscore(0.75, { min: 0.5, max: 1.5 }), 50); // halvparten av beste
  assert.equal(delscore(null, { min: 1, max: 2 }), null);
});

test("vektene er Anders' tabell", () => {
  assert.equal(FYS_VEKTER.markloft, 1.0);
  assert.equal(FYS_VEKTER.benkpress, 1.0);
  assert.equal(FYS_VEKTER.lengde, 0.5);
  assert.equal(FYS_VEKTER.ballkast, 0.166);
  assert.equal(FYS_VEKTER.chs, 1.0);
});

test("samlet score = vektet snitt av delscorer", () => {
  // To spillere; beste setter 100 per test.
  const a: FysRaw = { markloft: 120, benkpress: 100, lengde: 260, ballkast: 600, chs: 115, kroppsvektKg: 80 };
  const b: FysRaw = { markloft: 90, benkpress: 70, lengde: 220, ballkast: 500, chs: 100, kroppsvektKg: 90 };
  const spenn = byggStallSpenn([a, b]);
  const ra = fysScore(a, spenn);
  // a er best i ALLE tester → alle delscorer 100 → samlet 100.
  assert.equal(ra.score, 100);
  assert.equal(ra.antallTester, 5);
  const rb = fysScore(b, spenn);
  // b er svakere i alle → score < 100, men > 0.
  assert.ok(rb.score != null && rb.score > 0 && rb.score < 100);
});

test("manglende tester re-vektes bort (delvis FYS gir fortsatt et tall)", () => {
  const a: FysRaw = { ...tom, chs: 115, kroppsvektKg: 80 };
  const b: FysRaw = { ...tom, chs: 100, kroppsvektKg: 90 };
  const spenn = byggStallSpenn([a, b]);
  const ra = fysScore(a, spenn);
  assert.equal(ra.antallTester, 1);
  assert.equal(ra.score, 100); // kun CHS, a er best
});

test("ingen tester logget → score null", () => {
  const spenn = byggStallSpenn([tom]);
  assert.equal(fysScore(tom, spenn).score, null);
});
