/**
 * fmtSluttverdi (src/lib/v2/hooks.ts) — samme sluttformat som useCountUp viser når tellingen
 * er ferdig: komma-desimal, unicode-minus, «+» kun når kilden har det. STEG 19.7.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fmtSluttverdi } from "@/lib/v2/hooks";

test("heltall og ikke-numeriske strenger passerer uendret", () => {
  assert.equal(fmtSluttverdi(42), "42");
  assert.equal(fmtSluttverdi("68%"), "68%");
  assert.equal(fmtSluttverdi("…"), "…");
});

test("desimaler beholder kildens antall og skrives med komma", () => {
  assert.equal(fmtSluttverdi("1.25"), "1,25");
  assert.equal(fmtSluttverdi("0,5"), "0,5");
});

test("fortegn: unicode-minus alltid, pluss kun når kilden har det", () => {
  assert.equal(fmtSluttverdi("-1.5"), "−1,5");
  assert.equal(fmtSluttverdi("+2,1"), "+2,1");
  assert.equal(fmtSluttverdi(-3), "−3");
});
