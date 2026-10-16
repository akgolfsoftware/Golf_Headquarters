import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TEE_CLUBS,
  getHoleGeo,
  getClubOptions,
  computeRiskPercent,
  evaluateClubOptions,
  getRecommendedClub,
} from "./ph20-data";

describe("ph20-data", () => {
  it("har forhåndsdefinerte køller med carry og spredning", () => {
    assert.equal(TEE_CLUBS["Driver"].carry, 228);
    assert.equal(TEE_CLUBS["Driver"].hw, 14);
    assert.equal(TEE_CLUBS["PW"].carry, 113);
  });

  it("returnerer jern/wedges for par 3 sortert etter nærhet til hulllengde", () => {
    const opts150 = getClubOptions(3, 150);
    assert.ok(opts150.includes("7i"));
    assert.ok(!opts150.includes("Driver"));
    assert.ok(!opts150.includes("3W"));
  });

  it("returnerer Driver, 3W og 4H for par 4 og par 5", () => {
    const optsPar4 = getClubOptions(4, 380);
    assert.deepEqual(optsPar4, ["Driver", "3W", "4H"]);
    const optsPar5 = getClubOptions(5, 490);
    assert.deepEqual(optsPar5, ["Driver", "3W", "4H"]);
  });

  it("beregner geometri og filtrerer bort bunkere forbi green eller for nær tee", () => {
    const geo = getHoleGeo(0, 350);
    assert.ok(geo.bunkers.length > 0);
    for (const b of geo.bunkers) {
      assert.ok(b.d < 350 - 2);
      assert.ok(b.d > 120);
    }
  });

  it("beregner risiko for slag der spredning treffer hindre", () => {
    const geo = getHoleGeo(0, 360);
    const riskDriver = computeRiskPercent("Driver", geo);
    assert.equal(typeof riskDriver, "number");
    assert.ok(riskDriver >= 0);
    assert.ok(riskDriver <= 100);
  });

  it("evaluerer alternativer og velger anbefalt kølle", () => {
    const geo = getHoleGeo(0, 360);
    const opts = getClubOptions(4, 360);
    const { scored, recommended } = evaluateClubOptions(4, 360, opts, geo);

    assert.equal(scored.length, 3);
    assert.ok(opts.includes(recommended));
    const best = scored.find((s) => s.club === recommended);
    assert.ok(best !== undefined);
  });

  it("getRecommendedClub gir et gyldig køllenavn", () => {
    const recPar3 = getRecommendedClub(2, 3, 150);
    assert.equal(recPar3, "7i");
    const recPar4 = getRecommendedClub(0, 4, 360);
    assert.equal(typeof recPar4, "string");
  });
});
