// Tester for SG Interpretation-agent.
//
// Kjør med:
//   npx tsx --test src/lib/__tests__/ai/sg-interpretation.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  SG_INTERPRETATION_SYSTEM,
  type SgInterpretationResult,
  type SgKategoriKode,
  type SgTrend,
} from "@/lib/ai/agents/sg-interpretation";

describe("SG Interpretation — system-prompt", () => {
  it("nevner alle 4 SG-kategorier", () => {
    for (const k of ["OTT", "APP", "ARG", "PUTT"]) {
      assert.ok(
        SG_INTERPRETATION_SYSTEM.includes(k),
        `Mangler ${k} i system-prompt`,
      );
    }
  });

  it("nevner trend OPP/FLAT/NED", () => {
    assert.ok(SG_INTERPRETATION_SYSTEM.includes("OPP"));
    assert.ok(SG_INTERPRETATION_SYSTEM.includes("FLAT"));
    assert.ok(SG_INTERPRETATION_SYSTEM.includes("NED"));
  });

  it("krever drill-anbefalinger (3-5)", () => {
    assert.ok(SG_INTERPRETATION_SYSTEM.includes("3-5"));
    assert.ok(SG_INTERPRETATION_SYSTEM.includes("drills"));
  });

  it("inneholder sg-interpretation skill-kunnskap", () => {
    // SG-skill nevner PGA Top 40-benchmark.
    assert.ok(SG_INTERPRETATION_SYSTEM.includes("PGA Tour Top 40"));
  });
});

describe("SG Interpretation — type-shape", () => {
  it("SgKategoriKode har 4 lovlige verdier", () => {
    const koder: SgKategoriKode[] = ["OTT", "APP", "ARG", "PUTT"];
    assert.equal(koder.length, 4);
  });

  it("SgTrend har 3 lovlige verdier", () => {
    const trender: SgTrend[] = ["OPP", "FLAT", "NED"];
    assert.equal(trender.length, 3);
  });

  it("SgInterpretationResult fungerer som retur-type", () => {
    const r: SgInterpretationResult = {
      spillerId: "s1",
      spillerNavn: "Test Spiller",
      runderTatt: 10,
      sammendrag: "Test sammendrag",
      perKategori: {
        ott: { verdi: -0.5, tolkning: "Test", trend: "OPP" },
        app: { verdi: -1.2, tolkning: "Test", trend: "FLAT" },
        arg: { verdi: -0.8, tolkning: "Test", trend: "NED" },
        putt: { verdi: 0.1, tolkning: "Test", trend: "OPP" },
      },
      svakesteKategori: "APP",
      anbefalteDrills: ["Drill 1", "Drill 2", "Drill 3"],
    };
    assert.equal(r.svakesteKategori, "APP");
    assert.equal(r.anbefalteDrills.length, 3);
    assert.equal(r.perKategori.app.trend, "FLAT");
  });

  it("svakesteKategori kan være null (ingen data)", () => {
    const r: SgInterpretationResult = {
      spillerId: "s1",
      spillerNavn: "Test",
      runderTatt: 0,
      sammendrag: "Ingen data",
      perKategori: {
        ott: { verdi: null, tolkning: "Ingen", trend: "FLAT" },
        app: { verdi: null, tolkning: "Ingen", trend: "FLAT" },
        arg: { verdi: null, tolkning: "Ingen", trend: "FLAT" },
        putt: { verdi: null, tolkning: "Ingen", trend: "FLAT" },
      },
      svakesteKategori: null,
      anbefalteDrills: [],
    };
    assert.equal(r.svakesteKategori, null);
    assert.equal(r.anbefalteDrills.length, 0);
  });
});
