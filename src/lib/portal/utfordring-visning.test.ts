import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { datoKort, datoLang, plassTekst } from "./utfordring-visning";

describe("utfordring-visning", () => {
  it("viser dato i Oslo-tid, også rett etter midnatt UTC", () => {
    assert.equal(datoLang(new Date("2026-09-30T12:00:00Z")), "30.09.2026");
    assert.equal(datoKort(new Date("2026-09-29T22:30:00Z")), "30.09");
  });
  it("manglende verdier blir null eller tankestrek", () => {
    assert.equal(datoLang(null), null);
    assert.equal(datoKort(undefined), null);
    assert.equal(plassTekst(null), "—");
    assert.equal(plassTekst(2), "2");
  });
});
