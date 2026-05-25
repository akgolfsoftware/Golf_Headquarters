// Tester for Vinn Tilbake-agent.
//
// Kjør med:
//   npx tsx --test src/lib/__tests__/ai/vinn-tilbake.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  VINN_TILBAKE_SYSTEM,
  type InaktivSpillerForslag,
} from "@/lib/ai/agents/vinn-tilbake";

describe("Vinn Tilbake — system-prompt", () => {
  it("krever fornavn i meldingen", () => {
    assert.ok(VINN_TILBAKE_SYSTEM.includes("fornavn"));
  });

  it("har maks-grense på 80 ord", () => {
    assert.ok(VINN_TILBAKE_SYSTEM.includes("80 ord"));
  });

  it("krever konkret invitasjon", () => {
    assert.ok(VINN_TILBAKE_SYSTEM.includes("konkret invitasjon"));
  });

  it("forbyr emoji og utropstegn", () => {
    assert.ok(/[Aa]ldri\s+emoji/.test(VINN_TILBAKE_SYSTEM));
    assert.ok(/[Aa]ldri\s+utropstegn/.test(VINN_TILBAKE_SYSTEM));
  });

  it("forbyr 'Hei [navn]' format-start", () => {
    assert.ok(VINN_TILBAKE_SYSTEM.includes('"Hei'));
  });
});

describe("Vinn Tilbake — type-shape", () => {
  it("InaktivSpillerForslag har påkrevde felter", () => {
    const f: InaktivSpillerForslag = {
      spillerId: "s1",
      spillerName: "Per Hansen",
      sistAktiv: new Date("2026-04-01"),
      dagerInaktiv: 54,
      foreslattMelding: "Per, savner deg på range — la oss booke en time.",
      sisteFokus: "Putting",
      sisteMaal: "HCP under 5",
    };
    assert.equal(f.dagerInaktiv, 54);
    assert.equal(f.spillerName, "Per Hansen");
    assert.ok(f.foreslattMelding.length > 0);
  });

  it("sistAktiv kan være null (aldri-aktiv spiller)", () => {
    const f: InaktivSpillerForslag = {
      spillerId: "s2",
      spillerName: "Ny Spiller",
      sistAktiv: null,
      dagerInaktiv: 999,
      foreslattMelding: "Test",
      sisteFokus: null,
      sisteMaal: null,
    };
    assert.equal(f.sistAktiv, null);
  });
});
