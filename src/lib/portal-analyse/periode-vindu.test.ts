import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  beregnPeriodeVindu,
  tolkPeriodeValg,
  PERIODE_VALG,
} from "./periode-vindu";

// Fast referansepunkt: torsdag 6. august 2026, kl. 14:00 norsk tid.
const TORSDAG = new Date(2026, 7, 6, 14, 0, 0);

describe("beregnPeriodeVindu", () => {
  test("dag dekker ett døgn", () => {
    const v = beregnPeriodeVindu("dag", TORSDAG);
    assert.equal(v.fra.getDate(), 6);
    assert.equal(v.til.getDate(), 7);
    assert.equal(v.til.getTime() - v.fra.getTime(), 24 * 60 * 60 * 1000);
  });

  test("uke starter mandag (norsk konvensjon)", () => {
    const v = beregnPeriodeVindu("uke", TORSDAG);
    assert.equal(v.fra.getDay(), 1, "mandag");
    assert.equal(v.fra.getDate(), 3, "3. august er mandagen i uke 32");
    assert.equal(v.til.getDate(), 10, "til neste mandag");
    assert.match(v.label, /^Uke \d+$/);
  });

  test("måned dekker hele måneden", () => {
    const v = beregnPeriodeVindu("maned", TORSDAG);
    assert.equal(v.fra.getDate(), 1);
    assert.equal(v.fra.getMonth(), 7, "august");
    assert.equal(v.til.getMonth(), 8, "til 1. september");
    assert.equal(v.label, "August 2026");
  });

  test("år dekker hele året", () => {
    const v = beregnPeriodeVindu("aar", TORSDAG);
    assert.equal(v.fra.getFullYear(), 2026);
    assert.equal(v.fra.getMonth(), 0);
    assert.equal(v.til.getFullYear(), 2027);
    assert.equal(v.label, "2026");
  });

  test("periode bruker spillerens egen treningsperiode", () => {
    const v = beregnPeriodeVindu("periode", TORSDAG, {
      startDate: new Date(2026, 6, 1),
      endDate: new Date(2026, 8, 30),
      navn: "Grunnperiode",
    });
    assert.equal(v.label, "Grunnperiode");
    assert.equal(v.fra.getMonth(), 6, "juli");
    assert.equal(v.til.getMonth(), 9, "dagen etter 30. september");
    assert.equal(v.fallback, undefined);
  });

  test("periode uten aktiv periode faller tilbake til måned og sier fra", () => {
    const v = beregnPeriodeVindu("periode", TORSDAG, null);
    assert.equal(v.fallback, "ingen-periode");
    assert.equal(v.label, "August 2026");
  });

  test("periode uten navn får nøytral etikett", () => {
    const v = beregnPeriodeVindu("periode", TORSDAG, {
      startDate: new Date(2026, 6, 1),
      endDate: new Date(2026, 8, 30),
      navn: "  ",
    });
    assert.equal(v.label, "Perioden");
  });

  test("alle valg gir et vindu der fra er før til", () => {
    for (const valg of PERIODE_VALG) {
      const v = beregnPeriodeVindu(valg, TORSDAG, {
        startDate: new Date(2026, 6, 1),
        endDate: new Date(2026, 8, 30),
        navn: "Grunnperiode",
      });
      assert.ok(v.fra < v.til, `${valg}: fra må være før til`);
    }
  });
});

describe("tolkPeriodeValg", () => {
  test("godtar kjente verdier", () => {
    assert.equal(tolkPeriodeValg("uke"), "uke");
    assert.equal(tolkPeriodeValg("aar"), "aar");
  });

  test("ukjent eller tom verdi gir måned", () => {
    assert.equal(tolkPeriodeValg("tull"), "maned");
    assert.equal(tolkPeriodeValg(null), "maned");
    assert.equal(tolkPeriodeValg(undefined), "maned");
  });
});
