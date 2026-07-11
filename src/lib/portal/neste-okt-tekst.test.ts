import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { nesteOktTekst } from "./neste-okt-tekst";

const NAA = new Date(2026, 6, 15, 10, 0); // onsdag 15. juli 2026

describe("nesteOktTekst", () => {
  it("ingen neste økt gir planlegg-uka-teksten", () => {
    const r = nesteOktTekst(null, "/x", NAA);
    assert.equal(r.tekst, "Ingen økt planlagt — planlegg uka?");
    assert.equal(r.href, "/portal/planlegge/workbench");
  });

  it("i morgen", () => {
    const r = nesteOktTekst({ tittel: "Nærspill", startTime: new Date(2026, 6, 16, 8, 0) }, "/y", NAA);
    assert.equal(r.tekst, "I morgen: Nærspill");
    assert.equal(r.href, "/y");
  });

  it("i dag (senere samme dag)", () => {
    const r = nesteOktTekst({ tittel: "Fysisk", startTime: new Date(2026, 6, 15, 18, 0) }, "/z", NAA);
    assert.equal(r.tekst, "I dag: Fysisk");
  });

  it("innen uka viser ukedag", () => {
    // 15. juli 2026 er en onsdag → 18. juli er lørdag (3 dager frem)
    const r = nesteOktTekst({ tittel: "Slag", startTime: new Date(2026, 6, 18, 9, 0) }, "/w", NAA);
    assert.equal(r.tekst, "Lørdag: Slag");
  });

  it("mer enn 6 dager frem viser dato", () => {
    const r = nesteOktTekst({ tittel: "Turnering", startTime: new Date(2026, 6, 25, 9, 0) }, "/v", NAA);
    assert.equal(r.tekst, "25.7: Turnering");
  });
});
