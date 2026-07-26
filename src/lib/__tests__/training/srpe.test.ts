// Ren enhetstest — beregnSRpe har ingen avhengigheter.
import { test } from "node:test";
import assert from "node:assert/strict";
import { beregnSRpe } from "@/lib/training/srpe";

test("sRPE = RPE × varighet i minutter", () => {
  assert.deepEqual(beregnSRpe(7, 5400), { durationMin: 90, sRpe: 630 });
  assert.deepEqual(beregnSRpe(3, 3600), { durationMin: 60, sRpe: 180 });
});

test("uten varighet lagres RPE alene (sRpe null)", () => {
  assert.deepEqual(beregnSRpe(7, null), { durationMin: null, sRpe: null });
  assert.deepEqual(beregnSRpe(7, 0), { durationMin: null, sRpe: null });
});

test("uten RPE er sRpe null selv med varighet", () => {
  assert.deepEqual(beregnSRpe(undefined, 3600), { durationMin: 60, sRpe: null });
});

test("korte økter rundes aldri til 0 minutter", () => {
  assert.deepEqual(beregnSRpe(5, 20), { durationMin: 1, sRpe: 5 });
});
