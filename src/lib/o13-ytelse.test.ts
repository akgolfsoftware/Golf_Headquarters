import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitizeMeta } from "./error-sanitize";
import { distanceToMeters, speedToMph } from "./trackman/canonical";

test("sanitering av 2000 felter med nøkler holder under 500 ms", () => {
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < 2000; i++) {
    obj[`felt${i}`] =
      i % 7 === 0 ? "sk_test_51YtelseNokkelABCDEFG" : `verdi-${i}`;
  }
  const start = performance.now();
  const out = sanitizeMeta(obj);
  const ms = performance.now() - start;
  assert.ok(ms < 500, `sanitering tok ${ms.toFixed(1)} ms`);
  const dump = JSON.stringify(out);
  assert.equal(dump.includes("sk_test_"), false);
  assert.match(dump, /nøkkel-fjernet/);
});

test("TrackMan-normalisering av 5000 verdier holder under 250 ms", () => {
  const start = performance.now();
  let siste: number | null = null;
  for (let i = 0; i < 5000; i++) {
    siste = speedToMph(40 + (i % 20), "m/s");
    distanceToMeters(150 + (i % 50), "yd");
  }
  const ms = performance.now() - start;
  assert.ok(ms < 250, `normalisering tok ${ms.toFixed(1)} ms`);
  assert.equal(typeof siste, "number");
});
