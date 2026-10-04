import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  beregnSpredning,
  formaterDesimal,
  formaterSg,
  STANDARD_PH16_DATA,
} from "./ph16-stats-data";

describe("ph16-stats-data", () => {
  it("formaterer desimaltall korrekt uten .toFixed med komma som skilletegn", () => {
    assert.equal(formaterDesimal(null), "—");
    assert.equal(formaterDesimal(undefined), "—");
    assert.equal(formaterDesimal(0, 1), "0,0");
    assert.equal(formaterDesimal(75.2, 1), "75,2");
    assert.equal(formaterDesimal(-1.6, 1), "−1,6");
    assert.equal(formaterDesimal(101.25, 2), "101,25");
  });

  it("formaterer Strokes Gained med fortegn og norsk komma", () => {
    assert.equal(formaterSg(null), "—");
    assert.equal(formaterSg(0), "0,0");
    assert.equal(formaterSg(0.3), "+0,3");
    assert.equal(formaterSg(-1.6), "−1,6");
    assert.equal(formaterSg(-0.02), "0,0");
  });

  it("beregner 2D spredning og standardavvik for TrackMan-slag", () => {
    const punkter: Array<[number, number]> = [
      [-2, 140],
      [0, 145],
      [2, 150],
    ];
    const { mx, my, sdx, sdy } = beregnSpredning(punkter);
    assert.equal(mx, 0);
    assert.equal(my, 145);
    assert.ok(sdx > 1.6 && sdx < 1.7); // sqrt(8/3) ≈ 1.63
    assert.ok(sdy > 4.0 && sdy < 4.2); // sqrt(50/3) ≈ 4.08
  });

  it("leverer komplett datamodell for de fire delene i Stats", () => {
    const d = STANDARD_PH16_DATA;
    assert.ok(d.spiller.snittBrutto > 70);
    assert.equal(d.spiller.kategori, "D");
    assert.equal(d.spiller.nesteKategori, "C");
    assert.equal(d.sg.length, 4); // tee, innspill, naer, putt
    assert.ok(d.runder.length >= 10);
    assert.equal(d.trening.pyramide.rows.length, 5); // fys, tek, slag, spill, turn
    assert.ok(d.trening.trackman.koller.includes("7i"));
    assert.ok(d.tester.length >= 4);
  });
});
