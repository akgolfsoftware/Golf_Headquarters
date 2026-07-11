import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ukedagerTilDagNr,
  fasiliteterTilFacilityPrefs,
  sesongmaalTilTittel,
  SESONGMAAL_TITTEL,
  lesTreningPreferanser,
  byggTreningPreferanser,
} from "@/lib/onboarding/trening-preferanser";

describe("ukedagerTilDagNr", () => {
  it("mapper man–søn til 1–7, sortert", () => {
    assert.deepEqual(ukedagerTilDagNr(["tor", "man", "lør"]), [1, 4, 6]);
  });
  it("ignorerer ukjente strenger", () => {
    assert.deepEqual(ukedagerTilDagNr(["man", "ukedag-x"]), [1]);
  });
});

describe("fasiliteterTilFacilityPrefs", () => {
  it("mapper alle fire fasiliteter riktig", () => {
    const ut = fasiliteterTilFacilityPrefs(["TRACKMAN", "GRESS_BANE", "STUDIO", "MATTE_PUTTING"]);
    assert.deepEqual(ut, { trackman: true, course9: true, course18: true, gym: true, putting: true });
  });
  it("setter kun det spilleren faktisk valgte", () => {
    const ut = fasiliteterTilFacilityPrefs(["TRACKMAN"]);
    assert.deepEqual(ut, { trackman: true });
    assert.equal("course9" in ut, false);
    assert.equal("gym" in ut, false);
  });
  it("tomt valg gir tomt objekt (rører ingenting)", () => {
    assert.deepEqual(fasiliteterTilFacilityPrefs([]), {});
  });
});

describe("sesongmaal-titler", () => {
  it("alle 9 sesongmål har en klarspråk-tittel", () => {
    const forventet = [
      "SENKE HCP", "VINNE KLUBBM.", "SPILLE NM", "COLLEGE USA", "UNDER PAR",
      "BEDRE PUTTING", "BEDRE IRON-SPILL", "MENTAL ROBUSTHET", "BLI PROFF",
    ];
    for (const m of forventet) {
      assert.ok(SESONGMAAL_TITTEL[m], `mangler tittel for ${m}`);
      assert.equal(sesongmaalTilTittel(m), SESONGMAAL_TITTEL[m]);
    }
  });
  it("ukjent mål faller tilbake til rå tekst", () => {
    assert.equal(sesongmaalTilTittel("UKJENT MÅL"), "UKJENT MÅL");
  });
});

describe("lesTreningPreferanser", () => {
  it("gyldig blob parses korrekt", () => {
    const res = lesTreningPreferanser({
      trening: { okterPerUke: 5, dager: [1, 3, 5], tidPaaDagen: "ETTER_SKOLE", drivkraft: ["Sosialt"] },
    });
    assert.deepEqual(res, { okterPerUke: 5, dager: [1, 3, 5], tidPaaDagen: "ETTER_SKOLE", drivkraft: ["Sosialt"] });
  });
  it("manglende preferences gir null", () => {
    assert.equal(lesTreningPreferanser(null), null);
    assert.equal(lesTreningPreferanser({}), null);
  });
  it("ugyldig blob gir null, kaster aldri", () => {
    assert.equal(lesTreningPreferanser({ trening: { okterPerUke: 99, dager: "ikke-array" } }), null);
    assert.equal(lesTreningPreferanser({ trening: "streng, ikke objekt" }), null);
  });
});

describe("byggTreningPreferanser", () => {
  it("bygger fra rå wizard-felt", () => {
    const res = byggTreningPreferanser({
      sessionFrequency: 5,
      traningsdager: ["man", "ons", "tor", "lør"],
      tidPaaDagen: "ETTER_SKOLE",
      drivkraft: ["Resultater", "Sosialt"],
    });
    assert.deepEqual(res, {
      okterPerUke: 5,
      dager: [1, 3, 4, 6],
      tidPaaDagen: "ETTER_SKOLE",
      drivkraft: ["Resultater", "Sosialt"],
    });
  });
  it("ugyldig tidPaaDagen faller til null i stedet for å kaste", () => {
    const res = byggTreningPreferanser({ sessionFrequency: 3, tidPaaDagen: "MIDNATT" });
    assert.equal(res.tidPaaDagen, null);
  });
  it("resultatet passerer sitt eget zod-schema (round-trip)", () => {
    const bygget = byggTreningPreferanser({ sessionFrequency: 4, traningsdager: ["tir", "tor"] });
    const lest = lesTreningPreferanser({ trening: bygget });
    assert.deepEqual(lest, bygget);
  });
});
