/**
 * aggregateSg — enhetstester (AP0.3). Ren aggregering, håndregnet fasit.
 * Kjør med: npm test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { aggregateSg, formatSg } from "./sg";

describe("aggregateSg", () => {
  it("tom liste gir null-aggregat", () => {
    const agg = aggregateSg([]);
    assert.equal(agg.total, null);
    assert.equal(agg.rundeAntall, 0);
    assert.equal(agg.snittScore, null);
  });

  it("snitter per felt og hopper over null (ikke som 0)", () => {
    const agg = aggregateSg([
      { score: 72, sgTotal: 2.0, sgOtt: 1.0, sgApp: null, sgArg: null, sgPutt: -0.5 },
      { score: 76, sgTotal: 1.0, sgOtt: null, sgApp: null, sgArg: 0.4, sgPutt: -1.5 },
    ]);
    assert.equal(agg.total, 1.5);
    assert.equal(agg.ott, 1.0); // kun én runde har OTT — snitt av den alene
    assert.equal(agg.app, null); // ingen data ≠ 0
    assert.equal(agg.arg, 0.4);
    assert.equal(agg.putt, -1.0);
    assert.equal(agg.rundeAntall, 2);
    assert.equal(agg.snittScore, 74);
  });
});

describe("formatSg", () => {
  it("norsk fortegnsformat med komma", () => {
    assert.equal(formatSg(1.23), "+1,2");
    assert.equal(formatSg(-0.35), "-0,3");
    assert.equal(formatSg(0), "+0,0");
    assert.equal(formatSg(null), "—");
  });
});
