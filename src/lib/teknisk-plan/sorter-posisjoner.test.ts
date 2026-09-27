import { test } from "node:test";
import assert from "node:assert/strict";
import { medFasitNavn, sorterPosisjoner } from "./sorter-posisjoner";

test("mellomposisjoner ligger samlet under hoved-P, hovedfokus først", () => {
  const inn = [
    { pNummer: "P7.0", sortOrder: 0, hovedfokus: false },
    { pNummer: "P4.1", sortOrder: 3, hovedfokus: false },
    { pNummer: "P1.0", sortOrder: 1, hovedfokus: false },
    { pNummer: "P4.0", sortOrder: 2, hovedfokus: true },
    { pNummer: "P6.9", sortOrder: 4, hovedfokus: false },
  ];
  assert.deepEqual(
    sorterPosisjoner(inn).map((p) => p.pNummer),
    ["P4.0", "P4.1", "P7.0", "P1.0", "P6.9"],
  );
});

test("navn leses fra fasit, ikke fra lagret rad", () => {
  assert.equal(medFasitNavn({ pNummer: "P5.0", navn: "Transisjon" }).navn, "Halvveis ned (venstre arm parallell, maks lag)");
});
