import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hullNumre, lesSgTekst, raskSum, stegScore, tilHullDetaljer, type RaskHull } from "./rask-score";

const h = (nr: number, par: number | null, score: number | null, o: Partial<RaskHull> = {}): RaskHull => ({
  nr, par, lengde: null, score, putter: null, fairway: null, gir: null, ...o,
});

describe("rask score", () => {
  it("velger hullene for 18, første ni og siste ni", () => {
    assert.deepEqual(hullNumre("ut"), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.equal(hullNumre("inn")[0], 10);
    assert.equal(hullNumre("18").length, 18);
  });

  it("første trykk gir par, uten par står hullet tomt", () => {
    assert.equal(stegScore(h(1, 4, null), 1), 4);
    assert.equal(stegScore(h(1, null, null), 1), null);
    assert.equal(stegScore(h(1, 4, 1), -1), 1);
  });

  it("summerer bare førte hull med par, og hull-detaljer krever par og score på alle", () => {
    assert.deepEqual(raskSum([h(1, 4, 5), h(2, 3, null)]), { ført: 1, brutto: 5, par: 4 });
    assert.equal(tilHullDetaljer([h(1, 4, 5), h(2, null, 3)]), null);
    assert.deepEqual(tilHullDetaljer([h(1, 4, 5, { fairway: "venstre", putter: 2, gir: false }), h(2, 3, 3, { fairway: "ja" })]), [
      { nr: 1, par: 4, strokes: 5, putts: 2, fairway: false, gir: false },
      { nr: 2, par: 3, strokes: 3, putts: null, fairway: null, gir: null },
    ]);
  });

  it("leser SG med komma og ekte minus", () => {
    assert.equal(lesSgTekst("−0,8"), -0.8);
    assert.equal(lesSgTekst("+0,3"), 0.3);
    assert.equal(lesSgTekst(""), null);
    assert.equal(lesSgTekst("abc"), undefined);
  });
});
