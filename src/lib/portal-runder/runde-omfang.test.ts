import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  utledRundeOmfang,
  sgVisning,
  snittForHullantall,
  erKjentSgMetode,
} from "./runde-omfang";

/** Ni hull, par 36 — den runden som avdekket feilen 21.09.2026. */
const NI_HULL = [4, 3, 5, 4, 4, 3, 4, 5, 4].map((par) => ({ par, strokes: par }));

describe("utledRundeOmfang", () => {
  it("uten scorekort er antall hull, par og mot par ukjent", () => {
    const o = utledRundeOmfang([], 42);
    assert.equal(o.antallSpilteHull, null);
    assert.equal(o.par, null, "banens totalpar skal aldri påføres en runde vi ikke vet lengden på");
    assert.equal(o.motPar, null);
    assert.equal(o.harScorekort, false);
    assert.equal(o.brutto, 42, "lagret total er eneste kjente score uten scorekort");
  });

  it("nihullsrunde måles mot par 36, aldri mot par 72", () => {
    const hull = NI_HULL.map((h, i) => ({ ...h, strokes: i === 0 ? h.par + 4 : h.par }));
    const o = utledRundeOmfang(hull, 999);
    assert.equal(o.antallSpilteHull, 9);
    assert.equal(o.par, 36);
    assert.equal(o.brutto, 40);
    assert.equal(o.motPar, 4);
    assert.notEqual(o.motPar, 40 - 72);
  });

  it("brutto er summen av spilte hull, ikke den lagrede totalen", () => {
    // Lagret total er feil/utdatert; scorekortet er sannheten.
    const o = utledRundeOmfang(NI_HULL, 100);
    assert.equal(o.brutto, 36);
    assert.equal(o.motPar, 0);
  });

  it("atten hull summerer par og mot par over alle hullene", () => {
    const hull = Array.from({ length: 18 }, () => ({ par: 4, strokes: 5 }));
    const o = utledRundeOmfang(hull, 90);
    assert.equal(o.antallSpilteHull, 18);
    assert.equal(o.par, 72);
    assert.equal(o.brutto, 90);
    assert.equal(o.motPar, 18);
  });
});

describe("sgVisning", () => {
  it("skjuler SG uten lagret verdi", () => {
    assert.deepEqual(sgVisning(null, "beregnet"), { vis: false, grunn: "ingen-verdi" });
  });

  it("skjuler SG når metoden er ukjent — et tall uten kilde kan ikke vises", () => {
    assert.deepEqual(sgVisning(-1.2, null), { vis: false, grunn: "ukjent-metode" });
    assert.deepEqual(sgVisning(-1.2, "gjettet"), { vis: false, grunn: "ukjent-metode" });
  });

  it("viser håndtastet og beregnet SG uten estimatmerke", () => {
    for (const kilde of ["manual", "beregnet"]) {
      const v = sgVisning(-0.8, kilde);
      assert.equal(v.vis, true);
      assert.equal(v.vis && v.erEstimat, false);
      assert.ok(v.vis && v.forklaring.length > 0, "metoden må kunne forklares");
    }
  });

  it("merker estimat fra totalscore eksplisitt som estimat", () => {
    const v = sgVisning(2.5, "estimert");
    assert.equal(v.vis, true);
    assert.equal(v.vis && v.erEstimat, true);
  });

  it("erKjentSgMetode godtar bare de tre lagrede metodene", () => {
    assert.equal(erKjentSgMetode("manual"), true);
    assert.equal(erKjentSgMetode("beregnet"), true);
    assert.equal(erKjentSgMetode("estimert"), true);
    assert.equal(erKjentSgMetode(""), false);
    assert.equal(erKjentSgMetode(undefined), false);
  });
});

describe("snittForHullantall", () => {
  const runder = [
    { antallSpilteHull: 18, brutto: 80 },
    { antallSpilteHull: 18, brutto: 84 },
    { antallSpilteHull: 9, brutto: 42 },
    { antallSpilteHull: null, brutto: 77 },
  ];

  it("en nihullsrunde flytter ikke 18-hullssnittet", () => {
    const s = snittForHullantall(runder, 18);
    assert.deepEqual(s, { snitt: 82, antall: 2 });
  });

  it("runder uten kjent lengde holdes utenfor snittet", () => {
    assert.equal(snittForHullantall(runder, 9)?.antall, 1);
    assert.equal(snittForHullantall([{ antallSpilteHull: null, brutto: 77 }], 18), null);
  });
});
