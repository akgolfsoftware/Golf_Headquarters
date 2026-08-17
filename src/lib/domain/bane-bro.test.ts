/**
 * Bane-bro — navnematching (AP0.4).
 *
 * Kjernen i testen: matcheren skal ALDRI gjette. Verken `Bane.navn` eller
 * `CourseDefinition.name` er unike i skjemaet, så flertydighet er et reelt
 * scenario — og en feil bro sender spilleren til feil banekart.
 *
 * Kjør med: npm test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { normaliserBanenavn, velgEntydigBane, type BaneKandidat } from "./bane-bro";

const bane = (id: string, navn: string, klubb = "", kortNavn: string | null = null): BaneKandidat => ({
  id,
  navn,
  kortNavn,
  klubb,
});

describe("normaliserBanenavn", () => {
  it("stripper klubb-suffikser til samme nøkkel", () => {
    const forventet = "onsøy";
    for (const variant of ["Onsøy Golfklubb", "Onsøy GK", "Onsøy golfbane", "  ONSØY  "]) {
      assert.equal(normaliserBanenavn(variant), forventet, variant);
    }
  });

  it("beholder æ/ø/å (norske banenavn skiller på dem)", () => {
    assert.equal(normaliserBanenavn("Mørk Golfklubb"), "mørk");
    assert.notEqual(normaliserBanenavn("Mørk"), normaliserBanenavn("Mork"));
  });

  it("kollapser skilletegn og dobbeltmellomrom", () => {
    assert.equal(normaliserBanenavn("Huseby & Hankø"), "huseby hankø");
    assert.equal(normaliserBanenavn("Moss  &  Rygge  GK"), "moss rygge");
  });

  it("tomt eller rent skilletegn gir tom nøkkel", () => {
    assert.equal(normaliserBanenavn(""), "");
    assert.equal(normaliserBanenavn("  --  "), "");
    assert.equal(normaliserBanenavn("Golfklubb"), "");
  });
});

describe("velgEntydigBane", () => {
  const baner = [
    bane("b1", "Onsøy Golfklubb", "Onsøy GK"),
    bane("b2", "Gamle Fredrikstad Golfklubb", "GFGK", "Gamle Fredrikstad"),
    bane("b3", "Borregaard Golfklubb", "Borregaard GK"),
  ];

  it("finner entydig treff på navn, uansett suffiks-variant", () => {
    assert.deepEqual(velgEntydigBane("Onsøy GK", baner), { status: "treff", baneId: "b1" });
    assert.deepEqual(velgEntydigBane("Onsøy Golfbane", baner), { status: "treff", baneId: "b1" });
  });

  it("finner treff via kortNavn", () => {
    assert.deepEqual(velgEntydigBane("Gamle Fredrikstad", baner), {
      status: "treff",
      baneId: "b2",
    });
  });

  it("finner treff via klubb", () => {
    assert.deepEqual(velgEntydigBane("GFGK", baner), { status: "treff", baneId: "b2" });
  });

  it("ukjent navn gir «ingen» — aldri et tilfeldig treff", () => {
    assert.deepEqual(velgEntydigBane("Oslo Golfklubb", baner), { status: "ingen" });
  });

  it("tomt navn gir «ingen»", () => {
    assert.deepEqual(velgEntydigBane("", baner), { status: "ingen" });
    assert.deepEqual(velgEntydigBane("Golfklubb", baner), { status: "ingen" });
  });

  it("FLERTYDIG når to ULIKE baner normaliserer likt — ingen gjetting", () => {
    const tvetydige = [bane("x1", "Skjeberg Golfklubb"), bane("x2", "Skjeberg GK")];
    assert.deepEqual(velgEntydigBane("Skjeberg", tvetydige), { status: "flertydig", antall: 2 });
  });

  it("en bane blir aldri flertydig med seg selv (navn = kortNavn = klubb)", () => {
    const enBane = [bane("y1", "Askim Golfklubb", "Askim GK", "Askim")];
    assert.deepEqual(velgEntydigBane("Askim", enBane), { status: "treff", baneId: "y1" });
  });

  it("tom baneliste gir «ingen»", () => {
    assert.deepEqual(velgEntydigBane("Onsøy", []), { status: "ingen" });
  });
});
