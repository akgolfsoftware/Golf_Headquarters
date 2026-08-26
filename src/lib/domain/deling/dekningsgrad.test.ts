/**
 * N5 · Dekningsgrad — «X av Y har gitt samtykke», aldri forkledd som «Y
 * spillere» eller «X spillere».
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { beregnDekningsgrad } from "./dekningsgrad";

test("0 % — ingen medlemmer har samtykket", () => {
  const r = beregnDekningsgrad({
    gruppemedlemmer: ["p1", "p2", "p3"],
    samtykketUserIds: [],
  });
  assert.deepEqual(r, { totalt: 3, samtykket: 0, prosentSamtykket: 0 });
});

test("delvis — 4 av 11 har samtykket", () => {
  const gruppemedlemmer = Array.from({ length: 11 }, (_, i) => `p${i + 1}`);
  const r = beregnDekningsgrad({
    gruppemedlemmer,
    samtykketUserIds: ["p1", "p2", "p3", "p4"],
  });
  assert.equal(r.totalt, 11);
  assert.equal(r.samtykket, 4);
  // 4/11 = 36,36...% -> avrundet 36
  assert.equal(r.prosentSamtykket, 36);
});

test("100 % — alle medlemmer har samtykket", () => {
  const r = beregnDekningsgrad({
    gruppemedlemmer: ["p1", "p2"],
    samtykketUserIds: ["p1", "p2"],
  });
  assert.deepEqual(r, { totalt: 2, samtykket: 2, prosentSamtykket: 100 });
});

test("0 medlemmer — 0 % uten NaN/Infinity", () => {
  const r = beregnDekningsgrad({ gruppemedlemmer: [], samtykketUserIds: [] });
  assert.deepEqual(r, { totalt: 0, samtykket: 0, prosentSamtykket: 0 });
});

test("duplikate medlems-id-er telles kun én gang", () => {
  const r = beregnDekningsgrad({
    gruppemedlemmer: ["p1", "p1", "p2"],
    samtykketUserIds: ["p1"],
  });
  assert.deepEqual(r, { totalt: 2, samtykket: 1, prosentSamtykket: 50 });
});

test("samtykke-id utenfor gruppemedlemmene teller ikke (utmeldt spiller med gammelt samtykke)", () => {
  const r = beregnDekningsgrad({
    gruppemedlemmer: ["p1", "p2"],
    samtykketUserIds: ["p1", "utmeldt-spiller"],
  });
  assert.deepEqual(r, { totalt: 2, samtykket: 1, prosentSamtykket: 50 });
});
