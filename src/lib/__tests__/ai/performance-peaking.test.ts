// Tester for Performance Peaking-agent.
//
// Kjør med:
//   npx tsx --test src/lib/__tests__/ai/performance-peaking.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  PERFORMANCE_PEAKING_SYSTEM,
  type PeakingPlanResult,
  type FaseUke,
  type BompaFase,
  type VolumNivaa,
  type IntensitetNivaa,
  type PyramidFokus,
} from "@/lib/ai/agents/performance-peaking";

describe("Performance Peaking — system-prompt", () => {
  it("nevner alle 5 Bompa-faser brukt av agenten", () => {
    for (const f of [
      "GRUNNTRENING",
      "OPPBYGGING",
      "SPESIALISERING",
      "KONKURRANSE",
      "TAPER",
    ]) {
      assert.ok(
        PERFORMANCE_PEAKING_SYSTEM.includes(f),
        `Mangler ${f} i system-prompt`,
      );
    }
  });

  it("nevner volum-nivåer LAVT/MIDDELS/HOYT", () => {
    assert.ok(PERFORMANCE_PEAKING_SYSTEM.includes("LAVT"));
    assert.ok(PERFORMANCE_PEAKING_SYSTEM.includes("MIDDELS"));
    assert.ok(PERFORMANCE_PEAKING_SYSTEM.includes("HOYT"));
  });

  it("nevner intensitets-nivåer LAV/MIDDELS/HOY", () => {
    assert.ok(PERFORMANCE_PEAKING_SYSTEM.includes("LAV"));
    assert.ok(PERFORMANCE_PEAKING_SYSTEM.includes("HOY"));
  });

  it("krever pyramide-fokus som summerer til 100", () => {
    assert.ok(PERFORMANCE_PEAKING_SYSTEM.includes("100"));
  });

  it("inneholder Bompa-skill og pyramide-skill", () => {
    // Pyramide-skill nevner FYS · TEK · SLAG · SPILL · TURN
    assert.ok(PERFORMANCE_PEAKING_SYSTEM.includes("FYS"));
    assert.ok(PERFORMANCE_PEAKING_SYSTEM.includes("TEK"));
    // Bompa-skill nevner GRUNNTRENING-blokken
    assert.ok(PERFORMANCE_PEAKING_SYSTEM.includes("GRUNNTRENING"));
  });
});

describe("Performance Peaking — type-shape", () => {
  it("BompaFase har 5 lovlige verdier", () => {
    const faser: BompaFase[] = [
      "GRUNNTRENING",
      "OPPBYGGING",
      "SPESIALISERING",
      "KONKURRANSE",
      "TAPER",
    ];
    assert.equal(faser.length, 5);
  });

  it("VolumNivaa har 3 verdier", () => {
    const v: VolumNivaa[] = ["LAVT", "MIDDELS", "HOYT"];
    assert.equal(v.length, 3);
  });

  it("IntensitetNivaa har 3 verdier", () => {
    const i: IntensitetNivaa[] = ["LAV", "MIDDELS", "HOY"];
    assert.equal(i.length, 3);
  });

  it("PyramidFokus har 5 akser", () => {
    const p: PyramidFokus = { fys: 20, tek: 20, slag: 20, spill: 20, turn: 20 };
    const sum = p.fys + p.tek + p.slag + p.spill + p.turn;
    assert.equal(sum, 100);
  });

  it("FaseUke har riktig form", () => {
    const u: FaseUke = {
      uke: 1,
      bompaFase: "GRUNNTRENING",
      volum: "HOYT",
      intensitet: "LAV",
      pyramidFokus: { fys: 50, tek: 30, slag: 15, spill: 5, turn: 0 },
      rasjonale: "Test",
    };
    assert.equal(u.bompaFase, "GRUNNTRENING");
    assert.equal(u.uke, 1);
  });

  it("PeakingPlanResult som retur-type", () => {
    const r: PeakingPlanResult = {
      spillerId: "s1",
      spillerNavn: "Test Spiller",
      tournamentId: "t1",
      tournamentNavn: "Test Cup",
      startDato: new Date().toISOString(),
      ukerTilTurnering: 6,
      fasePerUke: [
        {
          uke: 1,
          bompaFase: "GRUNNTRENING",
          volum: "HOYT",
          intensitet: "LAV",
          pyramidFokus: { fys: 50, tek: 30, slag: 15, spill: 5, turn: 0 },
          rasjonale: "Test",
        },
      ],
      generellRad: "Hold tempo gjennom perioden",
    };
    assert.equal(r.fasePerUke.length, 1);
    assert.equal(r.ukerTilTurnering, 6);
  });
});
