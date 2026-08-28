import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  byggMaanedPrikker,
  erHvileTittel,
  formatIntervallPunkt,
  formatKlokkePunkt,
  fremdriftPst,
  minutterIgjen,
  velgIDagTilstand,
} from "./idag-visning";

describe("idag-visning", () => {
  it("formaterer klokke med punktum", () => {
    assert.equal(formatKlokkePunkt(9 * 60), "09.00");
    assert.equal(formatKlokkePunkt(9 * 60 + 50), "09.50");
    assert.equal(formatIntervallPunkt(9 * 60, 50), "09.00–09.50");
  });

  it("regner minutter igjen bare inne i øktvinduet", () => {
    assert.equal(minutterIgjen(9 * 60, 50, 8 * 60), null);
    assert.equal(minutterIgjen(9 * 60, 50, 9 * 60 + 9), 41);
    assert.equal(minutterIgjen(9 * 60, 50, 10 * 60), 0);
  });

  it("fremdrift er 0 før start og 100 etter slutt", () => {
    assert.equal(fremdriftPst(9 * 60, 50, 8 * 60), 0);
    assert.equal(fremdriftPst(9 * 60, 50, 9 * 60 + 9), 18);
    assert.equal(fremdriftPst(9 * 60, 50, 11 * 60), 100);
  });

  it("velger tilstand i fasit-rekkefølge", () => {
    assert.equal(velgIDagTilstand({ feil: true, pagaende: true, harStartbarOkt: true, harHvile: false, ukeHarOkter: true }), "feil");
    assert.equal(velgIDagTilstand({ feil: false, pagaende: true, harStartbarOkt: true, harHvile: false, ukeHarOkter: true }), "pagar");
    assert.equal(velgIDagTilstand({ feil: false, pagaende: false, harStartbarOkt: true, harHvile: true, ukeHarOkter: true }), "okt");
    assert.equal(velgIDagTilstand({ feil: false, pagaende: false, harStartbarOkt: false, harHvile: true, ukeHarOkter: true }), "hvile");
    assert.equal(velgIDagTilstand({ feil: false, pagaende: false, harStartbarOkt: false, harHvile: false, ukeHarOkter: true }), "tom-dag");
    assert.equal(velgIDagTilstand({ feil: false, pagaende: false, harStartbarOkt: false, harHvile: false, ukeHarOkter: false }), "tom-uke");
  });

  it("prikk-måned: mandag først, i dag er ring ikke fyll", () => {
    // 1. august 2026 er lørdag → 5 tomme ruter (M–F)
    const prikker = byggMaanedPrikker({
      aar: 2026,
      maned: 8,
      idag: 22,
      ferdige: new Set([1, 3, 22]),
    });
    const tomme = prikker.filter((p) => p.tom).length;
    assert.equal(tomme, 5);
    const dager = prikker.filter((p) => !p.tom);
    const dag22 = dager[21];
    assert.ok(dag22);
    assert.equal(dag22.idag, true);
    assert.equal(dag22.fylt, false);
    const dag1 = dager[0];
    assert.equal(dag1.fylt, true);
    assert.equal(dag1.idag, false);
  });

  it("gjenkjenner hvile-tittel", () => {
    assert.equal(erHvileTittel("Hvile"), true);
    assert.equal(erHvileTittel("  hvile "), true);
    assert.equal(erHvileTittel("Innspill 50–80 m"), false);
  });
});
