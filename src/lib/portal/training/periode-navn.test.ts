import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { periodeTypeFraNavn, periodeTypeFraNavnMedEkstra, ukjenteNavn } from "./periode-navn";

describe("periodeTypeFraNavn", () => {
  // De fem navnene som faktisk ligger i prod 2026-07-29.
  test("mapper navnene som finnes i basen", () => {
    assert.equal(periodeTypeFraNavn("GRUNN"), "GRUNN");
    assert.equal(periodeTypeFraNavn("SPES"), "SPESIALISERING");
    assert.equal(periodeTypeFraNavn("TURN"), "TURNERING");
    assert.equal(periodeTypeFraNavn("Testuke"), "EVALUERING");
  });

  // Anders 2026-07-29: restsesongen av turneringsperioden, ikke oppbygging.
  test("TURN-rest er turneringsperiode", () => {
    assert.equal(periodeTypeFraNavn("TURN-rest"), "TURNERING");
  });

  test("tåler store/små bokstaver og mellomrom", () => {
    assert.equal(periodeTypeFraNavn("  grunn "), "GRUNN");
    assert.equal(periodeTypeFraNavn("TESTUKE"), "EVALUERING");
  });

  // Kjernen: ukjent navn skal gi null, ikke en tilfeldig periode. Gjetting her
  // ville latt økter valideres mot feil krav uten at noe så galt ut.
  test("ukjent navn gir null, ikke en gjetning", () => {
    assert.equal(periodeTypeFraNavn("Sommersamling"), null);
    assert.equal(periodeTypeFraNavn(""), null);
  });

  test("ukjenteNavn samler opp det som må avklares", () => {
    assert.deepEqual(ukjenteNavn(["GRUNN", "Sommersamling", "TURN", "Sommersamling"]), [
      "Sommersamling",
    ]);
    assert.deepEqual(ukjenteNavn(["GRUNN", "SPES"]), []);
  });
});

// Coach-lagte mappinger (PeriodeNavnMapping) supplerer ordboken uten kodeendring.
describe("periodeTypeFraNavnMedEkstra", () => {
  test("hardkodet ordbok slår alltid ekstra-mappinger", () => {
    assert.equal(periodeTypeFraNavnMedEkstra("GRUNN", { grunn: "FERIE" }), "GRUNN");
  });

  test("ukjent navn løses via ekstra-mappingen, normalisert", () => {
    assert.equal(
      periodeTypeFraNavnMedEkstra("  Sommersamling ", { sommersamling: "TURNERING" }),
      "TURNERING",
    );
  });

  test("fortsatt ukjent uten treff i noen av kildene", () => {
    assert.equal(periodeTypeFraNavnMedEkstra("Vintersamling", { sommersamling: "TURNERING" }), null);
  });

  test("ukjenteNavn respekterer ekstra-mappinger", () => {
    assert.deepEqual(
      ukjenteNavn(["GRUNN", "Sommersamling"], { sommersamling: "TURNERING" }),
      [],
    );
  });
});
