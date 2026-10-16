import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { estimerHullFraTotal } from "./estimer-fra-total";
import { scoreFraHull } from "./syntetiser-hurtig";
import { hullSchema } from "./schema";

describe("estimerHullFraTotal", () => {
  it("gir 18 hull hvis totalsum av slag = input score", () => {
    const hull = estimerHullFraTotal({ score: 90, putts: 32, coursePar: 72 });
    assert.equal(hull.length, 18);
    const sum = hull.reduce((s, h) => s + (scoreFraHull(h) ?? 0), 0);
    assert.equal(sum, 90);
    assert.ok(hull.every((h) => h.syntetisk === true));
    assert.equal(hullSchema.parse(hull[0]).syntetisk, true);
  });

  it("scratch-score (= par) gir par på hvert hull", () => {
    const hull = estimerHullFraTotal({ score: 72, coursePar: 72 });
    const sum = hull.reduce((s, h) => s + (scoreFraHull(h) ?? 0), 0);
    assert.equal(sum, 72);
  });

  it("høy score (langt over par) klemmes aldri over 15 slag på ett hull", () => {
    const hull = estimerHullFraTotal({ score: 200, coursePar: 72 });
    for (const h of hull) {
      assert.ok((scoreFraHull(h) ?? 0) <= 15);
    }
  });

  it("putt uten oppgitt verdi bruker syntetiserHurtigHull sin default", () => {
    const hull = estimerHullFraTotal({ score: 90, coursePar: 72 });
    assert.equal(hull.length, 18);
  });
});
