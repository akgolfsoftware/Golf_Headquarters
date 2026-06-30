import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { computeLevelGaps } from "./benchmark";
import type { SgBenchmark } from "./benchmark-provider";

// Delsett av den seedede stigen (dashboard.sg_benchmarks), APP-kategorien:
// 0:-0.8  5:-2.0  10:-3.5  15:-5.0
const ladder: SgBenchmark[] = [
  { handicapLevel: 0, category: "APP", expectedStrokes: -0.8, pgaTourEquivalent: 0, avgScore72: null },
  { handicapLevel: 5, category: "APP", expectedStrokes: -2.0, pgaTourEquivalent: 0, avgScore72: null },
  { handicapLevel: 10, category: "APP", expectedStrokes: -3.5, pgaTourEquivalent: 0, avgScore72: null },
  { handicapLevel: 15, category: "APP", expectedStrokes: -5.0, pgaTourEquivalent: 0, avgScore72: null },
  // OTT-rad så vi tester filtrering per kategori
  { handicapLevel: 5, category: "OTT", expectedStrokes: -1.2, pgaTourEquivalent: 0, avgScore72: null },
];

function app(gaps: ReturnType<typeof computeLevelGaps>) {
  return gaps.find((g) => g.category === "APP")!;
}

describe("computeLevelGaps", () => {
  it("plasserer spiller mellom to nivåer og regner slag-gap til det bedre", () => {
    // sgApp = -2.5 ligger mellom nivå 10 (-3.5) og nivå 5 (-2.0)
    const g = app(computeLevelGaps({ APP: -2.5 }, ladder));
    assert.equal(g.nextLevel, 5);
    assert.equal(g.slagGap, 0.5); // -2.0 - (-2.5)
    assert.ok(g.impliedLevel! > 5 && g.impliedLevel! < 10, "implied HCP mellom 5 og 10");
  });

  it("spiller bedre enn toppnivået → på topp, ingen gap", () => {
    const g = app(computeLevelGaps({ APP: 0.5 }, ladder));
    assert.equal(g.impliedLevel, 0);
    assert.equal(g.nextLevel, null);
    assert.equal(g.slagGap, null);
  });

  it("spiller dårligere enn bunn-nivået → klamret til bunn med gap opp", () => {
    const g = app(computeLevelGaps({ APP: -7.0 }, ladder));
    assert.equal(g.impliedLevel, 15);
    assert.equal(g.nextLevel, 15);
    assert.equal(g.slagGap, 2.0); // -5.0 - (-7.0)
  });

  it("manglende SG → alt null", () => {
    const g = app(computeLevelGaps({ APP: null }, ladder));
    assert.equal(g.playerSg, null);
    assert.equal(g.impliedLevel, null);
    assert.equal(g.slagGap, null);
  });

  it("returnerer alle fire kategorier selv uten data", () => {
    const gaps = computeLevelGaps({}, ladder);
    assert.deepEqual(
      gaps.map((g) => g.category),
      ["OTT", "APP", "ARG", "PUTT"],
    );
  });
});
