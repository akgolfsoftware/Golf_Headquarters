import { test } from "node:test";
import assert from "node:assert/strict";
import {
  STANDARD_MAL,
  parseTargetAllocation,
  applyPyramidSuggestion,
} from "../training/target-allocation";

test("parseTargetAllocation: null → standard", () => {
  assert.deepEqual(parseTargetAllocation(null), STANDARD_MAL);
});

test("parseTargetAllocation: ugyldig blob → standard (zod-validert)", () => {
  assert.deepEqual(parseTargetAllocation({ FYS: 10 }), STANDARD_MAL);
  assert.deepEqual(parseTargetAllocation("tull"), STANDARD_MAL);
});

test("parseTargetAllocation: gyldig fordeling beholdes", () => {
  const a = { FYS: 10, TEK: 20, SLAG: 40, SPILL: 20, TURN: 10 };
  assert.deepEqual(parseTargetAllocation(a), a);
});

test("applyPyramidSuggestion: helhetsforslag (fordeling) erstatter målet", () => {
  const ny = applyPyramidSuggestion(STANDARD_MAL, {
    fordeling: { FYS: 5, TEK: 25, SLAG: 40, SPILL: 20, TURN: 10 },
  });
  assert.deepEqual(ny, { FYS: 5, TEK: 25, SLAG: 40, SPILL: 20, TURN: 10 });
});

test("applyPyramidSuggestion: enkelt-område-nudge setter kun det området", () => {
  const ny = applyPyramidSuggestion(STANDARD_MAL, { omrade: "SLAG", malProsent: 45 });
  assert.equal(ny.SLAG, 45);
  assert.equal(ny.TEK, STANDARD_MAL.TEK); // resten urørt
});

test("applyPyramidSuggestion: uanvendbart forslag → uendret", () => {
  const ny = applyPyramidSuggestion(STANDARD_MAL, { forklaring: "bare tekst" });
  assert.deepEqual(ny, STANDARD_MAL);
});

test("applyPyramidSuggestion: ukjent område ignoreres", () => {
  const ny = applyPyramidSuggestion(STANDARD_MAL, { omrade: "XXX", malProsent: 99 });
  assert.deepEqual(ny, STANDARD_MAL);
});
