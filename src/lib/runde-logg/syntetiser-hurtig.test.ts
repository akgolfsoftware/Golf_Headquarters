import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { syntetiserHurtigHull, scoreFraHull } from "./syntetiser-hurtig";
import { deriverHullScore } from "./deriver-hullscore";
import { hullTilSgShots } from "./til-sg-shots";

describe("syntetiserHurtigHull", () => {
  it("par 4 med 4 slag gir gyldig kjede og score 4", () => {
    const h = syntetiserHurtigHull({
      holeNumber: 1,
      par: 4,
      lengdeMeter: 350,
      strokes: 4,
    });
    assert.equal(scoreFraHull(h), 4);
    assert.equal(h.slag.at(-1)?.resultat.iHull, true);
    const der = deriverHullScore(h);
    assert.equal(der.strokes, 4);
    // SG-motor må ikke kaste
    assert.ok(hullTilSgShots(h).length >= 1);
  });

  it("birdie på par 3 = 2 slag", () => {
    const h = syntetiserHurtigHull({
      holeNumber: 3,
      par: 3,
      lengdeMeter: 145,
      strokes: 2,
      putts: 1,
    });
    assert.equal(scoreFraHull(h), 2);
    assert.equal(deriverHullScore(h).putts, 1);
  });

  it("kaster ved 0 slag", () => {
    assert.throws(() =>
      syntetiserHurtigHull({
        holeNumber: 1,
        par: 4,
        lengdeMeter: 300,
        strokes: 0,
      }),
    );
  });
});
