import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatToPar,
  beregnBruttoScore,
  beregnParForSpilteHull,
  tellSpilteHull,
  kanLagres,
  formatSlagChip,
  finnManglendeHull,
  STANDARD_18_HOLES,
} from "./ph08-09-data";

describe("ph08-09-data", () => {
  it("formatToPar formaterer differanse mot par korrekt", () => {
    assert.equal(formatToPar(0), "E");
    assert.equal(formatToPar(3), "+3");
    assert.equal(formatToPar(-2), "−2");
  });

  it("beregnBruttoScore summerer brutto score over hull og ignorerer null/0", () => {
    const scores = [4, 4, 3, 5, null, 4, 3, 5, 4];
    assert.equal(beregnBruttoScore(scores), 32);
    assert.equal(beregnBruttoScore(scores, 0, 4), 16);
  });

  it("beregnParForSpilteHull summerer par kun for spilte hull", () => {
    const pars = STANDARD_18_HOLES.map((h) => h.par);
    const scores = Array(18).fill(null);
    scores[0] = 4; // Hull 1 (par 4)
    scores[1] = 5; // Hull 2 (par 4)
    scores[2] = 3; // Hull 3 (par 3)
    // Spilt 3 hull med pars 4, 4, 3 -> sum 11
    assert.equal(beregnParForSpilteHull(pars, scores), 11);
  });

  it("tellSpilteHull teller antall hull med gyldig score", () => {
    const scores = [4, 5, null, 3, null, null];
    assert.equal(tellSpilteHull(scores), 3);
  });

  it("kanLagres validerer 18 hull og 9 hull korrekt", () => {
    const full18 = Array(18).fill(4);
    assert.deepEqual(kanLagres(full18), { kanLagre: true, type: "18_hull", spilteHull: 18 });

    const front9 = [...Array(9).fill(4), ...Array(9).fill(null)];
    assert.deepEqual(kanLagres(front9), { kanLagre: true, type: "9_ut", spilteHull: 9 });

    const back9 = [...Array(9).fill(null), ...Array(9).fill(4)];
    assert.deepEqual(kanLagres(back9), { kanLagre: true, type: "9_inn", spilteHull: 9 });

    const uferdig = [4, 4, null, 4];
    assert.equal(kanLagres(uferdig).kanLagre, false);
    assert.equal(kanLagres(uferdig).type, "uferdig");
  });

  it("formatSlagChip formaterer slag og putter iht. fasit", () => {
    assert.equal(formatSlagChip(1, { lie: "Tee", meter: 342 }), "1 · TEE 342 M");
    assert.equal(formatSlagChip(2, { lie: "Fairway", meter: 68 }), "2 · FAIRWAY 68 M");
    assert.equal(formatSlagChip(3, { lie: "Putt", fot: 12 }), "3 · PUTT 12 FT");
  });

  it("finnManglendeHull identifiserer hull som mangler score", () => {
    const scores = [4, null, 3, 5, null];
    assert.deepEqual(finnManglendeHull(scores, 0, 5), [2, 5]);
  });
});
