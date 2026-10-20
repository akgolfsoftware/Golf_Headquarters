import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { filtrerValg, grupperValg, type NedtrekkValg } from "./nedtrekk-filter";

const TESTER: NedtrekkValg[] = [
  { verdi: "driver-basic", navn: "Driver Basic", gruppe: "Golfslag" },
  { verdi: "naerspill-gate", navn: "Nærspill Gate", gruppe: "Teknikk" },
  { verdi: "putt-gate", navn: "Putt Gate", gruppe: "Teknikk" },
  { verdi: "benkpress", navn: "Benkpress", gruppe: "Fysisk" },
];

describe("filtrerValg", () => {
  it("tomt søk gir alle valg i samme rekkefølge", () => {
    assert.deepEqual(filtrerValg(TESTER, "  ").map((v) => v.verdi), ["driver-basic", "naerspill-gate", "putt-gate", "benkpress"]);
  });
  it("treffer uten hensyn til store og små bokstaver", () => {
    assert.deepEqual(filtrerValg(TESTER, "GATE").map((v) => v.verdi), ["naerspill-gate", "putt-gate"]);
  });
  it("æ, ø og å er egne bokstaver", () => {
    assert.deepEqual(filtrerValg(TESTER, "nær").map((v) => v.verdi), ["naerspill-gate"]);
    assert.deepEqual(filtrerValg(TESTER, "naer").length, 0);
  });
  it("alle ord må treffe, og gruppen teller med", () => {
    assert.deepEqual(filtrerValg(TESTER, "teknikk putt").map((v) => v.verdi), ["putt-gate"]);
  });
});

describe("grupperValg", () => {
  it("beholder gruppenes rekkefølge", () => {
    assert.deepEqual(grupperValg(TESTER).map((g) => [g.gruppe, g.valg.length]), [["Golfslag", 1], ["Teknikk", 2], ["Fysisk", 1]]);
  });
});
