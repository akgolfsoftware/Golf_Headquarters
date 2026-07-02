import { test } from "node:test";
import assert from "node:assert/strict";
import { beregnBelastning } from "../health/belastning";

const NAA = new Date("2026-06-28T12:00:00Z");
const dagerSiden = (n: number) => new Date(NAA.getTime() - n * 86_400_000);

test("ingen hendelser → harData false, ingen ratio", () => {
  const r = beregnBelastning([], NAA);
  assert.equal(r.harData, false);
  assert.equal(r.ratio, null);
  assert.equal(r.prosentAvNormalt, null);
});

test("jevn last (samme hver dag i 28 d) → ~100 % av normalt", () => {
  const hendelser = Array.from({ length: 28 }, (_, i) => ({ at: dagerSiden(i), min: 60 }));
  const r = beregnBelastning(hendelser, NAA);
  assert.equal(r.harData, true);
  // akutt 7×60/7 = 60/dag, kronisk 28×60/28 = 60/dag → ratio 1
  assert.equal(r.prosentAvNormalt, 100);
});

test("topp siste uke → ratio > 1 (over normalt)", () => {
  const hendelser = [
    ...Array.from({ length: 7 }, (_, i) => ({ at: dagerSiden(i), min: 120 })), // tung uke
    ...Array.from({ length: 21 }, (_, i) => ({ at: dagerSiden(i + 7), min: 30 })), // rolig før
  ];
  const r = beregnBelastning(hendelser, NAA);
  assert.equal(r.harData, true);
  assert.ok(r.ratio !== null && r.ratio > 1.3, `forventet ratio > 1.3, fikk ${r.ratio}`);
});

test("rolig siste uke etter tung periode → ratio < 1 (under normalt)", () => {
  const hendelser = [
    ...Array.from({ length: 7 }, (_, i) => ({ at: dagerSiden(i), min: 20 })), // rolig uke
    ...Array.from({ length: 21 }, (_, i) => ({ at: dagerSiden(i + 7), min: 90 })), // tung før
  ];
  const r = beregnBelastning(hendelser, NAA);
  assert.ok(r.ratio !== null && r.ratio < 1, `forventet ratio < 1, fikk ${r.ratio}`);
});
