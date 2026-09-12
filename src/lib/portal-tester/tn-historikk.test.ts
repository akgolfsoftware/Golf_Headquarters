import assert from "node:assert/strict";
import { test } from "node:test";
import { tnProtocol } from "./tn-catalog";
import { tnScore } from "./tn-scoring";
import {
  tnHistorikkForVariant,
  tnHistorikkRader,
  tnKanAngreUtkast,
  tnKorrigeringKreverNyOkt,
} from "./tn-historikk";

const putt = tnProtocol("putt-1-3m")!;
const allOnes = Object.fromEntries(putt.rows.map((_, i) => [String(i + 1), { strokes: 1 }]));
const firstTwo = Object.fromEntries(putt.rows.map((_, i) => [String(i + 1), { strokes: i === 0 ? 2 : 1 }]));
const first = tnScore(putt, allOnes);
const second = tnScore(putt, firstTwo);

test("historikk beholder flere forsøk av samme variant og dropper avvikende score", () => {
  const rader = tnHistorikkRader([
    { id: "a", testId: "tn-v3-putt-1-3m", score: first.score, details: first, takenAt: new Date("2026-09-01") },
    { id: "b", testId: "tn-v3-putt-1-3m", score: second.score, details: second, takenAt: new Date("2026-09-02") },
    { id: "c", testId: "tn-v3-putt-1-3m", score: first.score + 1, details: first, takenAt: new Date("2026-09-03") },
    { id: "d", testId: "tn-v3-wedge-variation", score: first.score, details: first, takenAt: new Date("2026-09-04") },
  ]);
  assert.deepEqual(rader.map((rad) => rad.id), ["a", "b"]);
  assert.equal(rader[0]?.score, 25);
  assert.equal(rader[1]?.score, 26);
  assert.equal(rader[0]?.comparisonKey, rader[1]?.comparisonKey);
  assert.equal(tnHistorikkForVariant(rader, "putt-1-3m", 25).length, 2);
  assert.equal(tnHistorikkForVariant(rader, "putt-1-3m", 24).length, 0);
});

test("korrigering av fullført test krever ny økt; angre gjelder bare utkast", () => {
  assert.equal(tnKorrigeringKreverNyOkt("COMPLETED"), true);
  assert.equal(tnKorrigeringKreverNyOkt("IN_PROGRESS"), false);
  assert.equal(tnKorrigeringKreverNyOkt("ABORTED"), false);
  assert.equal(tnKanAngreUtkast("IN_PROGRESS"), true);
  assert.equal(tnKanAngreUtkast("COMPLETED"), false);
  assert.equal(tnKanAngreUtkast("ABORTED"), false);
});
