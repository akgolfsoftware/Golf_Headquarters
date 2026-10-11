import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  OMRADER,
  alderFraDato,
  d1,
  dekkerOmrader,
  samletDekning,
  testResultat,
  tilCapabilities,
  type FasSvar,
} from "@/lib/onboarding/oppstart";

const tom = (id: string): FasSvar => ({ id, name: id });

describe("OMRADER", () => {
  it("er de 19 treningsområdene", () => {
    assert.equal(OMRADER.length, 19);
    assert.equal(new Set(OMRADER).size, 19);
  });
});

describe("dekkerOmrader", () => {
  it("dekker ingenting uten svar", () => {
    assert.deepEqual(dekkerOmrader(tom("a")), []);
  });

  it("rangen dekker innspill og utslag etter lengde og driver", () => {
    const kort = dekkerOmrader({ ...tom("a"), range: true, rangeLen: 120, driver: true });
    assert.deepEqual(kort, ["Innspill ca. 100 m", "Innspill ca. 50 m"]);
    const lang = dekkerOmrader({ ...tom("a"), range: true, rangeLen: 240, driver: true });
    assert.equal(lang.includes("Utslag"), true);
    const utenDriver = dekkerOmrader({ ...tom("a"), range: true, rangeLen: 240, driver: false });
    assert.equal(utenDriver.includes("Utslag"), false);
  });

  it("puttinggreen dekker bånd opp til lengste putt", () => {
    const d = dekkerOmrader({ ...tom("a"), green: true, puttMax: 8 });
    assert.deepEqual(d, ["Putting 0–3 fot", "Putting 3–5 fot", "Putting 5–10 fot"]);
    assert.deepEqual(dekkerOmrader({ ...tom("a"), green: true }), []);
  });

  it("lob krever pitch, og banespill krever hull", () => {
    assert.equal(dekkerOmrader({ ...tom("a"), pitch: false, lob: true }).includes("Lob"), false);
    assert.equal(dekkerOmrader({ ...tom("a"), pitch: true, lob: true }).includes("Lob"), true);
    assert.equal(dekkerOmrader({ ...tom("a"), bane: true }).includes("Banespill"), false);
    assert.equal(dekkerOmrader({ ...tom("a"), bane: true, holes: 9 }).includes("Banespill"), true);
  });

  it("samlet dekning slår sammen flere steder uten dubletter", () => {
    const a: FasSvar = { ...tom("a"), chip: true };
    const b: FasSvar = { ...tom("b"), chip: true, styrke: true };
    assert.deepEqual(samletDekning([a, b]), ["Chip", "Styrke"]);
  });
});

describe("tilCapabilities", () => {
  it("omsetter ja-svar til DrillFasilitet-verdiene appen bruker", () => {
    const c = tilCapabilities({ ...tom("a"), range: true, chip: true, pitch: true, green: true, styrke: true, bev: true });
    assert.deepEqual(c, ["DRIVING_RANGE", "SHORT_GAME_AREA", "PUTTING_GREEN_KORT", "VEKTSTANG"]);
  });
});

describe("testResultat", () => {
  const avstander = { sw: 70, i7: 140, dr: 220 };

  it("finner størst svakhet relativt til avstanden", () => {
    const { rader, storste } = testResultat(
      {
        sw: [[68, 8], [70, 10]],
        i7: [[140, 14]],
        dr: [[220, 11]],
      },
      avstander,
    );
    assert.equal(rader[0].snittFeil, 9);
    assert.equal(storste?.id, "sw");
  });

  it("gir null, ikke 0, uten slag", () => {
    const { rader, storste } = testResultat({}, avstander);
    assert.equal(rader.every((r) => r.snittFeil === null && r.relativ === null), true);
    assert.equal(storste, null);
  });

  it("hopper over tomme felt i et slag", () => {
    const { rader } = testResultat({ sw: [[68, null], [70, 6]] }, avstander);
    assert.equal(rader[0].snittFeil, 6);
  });
});

describe("alderFraDato", () => {
  const naa = new Date(Date.UTC(2026, 8, 30));
  it("regner hele år", () => {
    assert.equal(alderFraDato("2010-09-30", naa), 16);
    assert.equal(alderFraDato("2010-10-01", naa), 15);
  });
  it("avviser ugyldig dato", () => {
    assert.equal(alderFraDato("2010-02-31", naa), null);
    assert.equal(alderFraDato("12.04.2010", naa), null);
    assert.equal(alderFraDato("2030-01-01", naa), null);
  });
});

describe("d1", () => {
  it("bruker komma og ekte minus, og — for manglende", () => {
    assert.equal(d1(3.14), "3,1");
    assert.equal(d1(-2.2), "−2,2");
    assert.equal(d1(null), "—");
  });
});
