/**
 * Regresjonsvakt (22.09.2026): PEI lagres som brøk (0,038 = 3,8 %), mens
 * benchmark-stigen er i prosent. Uten normalisering traff «lavere er bedre»
 * alltid øverste nivå, og hver eneste PEI-test rapporterte PGA topp 40 —
 * med falske milepæler skrevet til talentprofilen som følge.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { beregnBenchmarkNivaa } from "@/lib/domain/talent-sync";
import { achievedLevel, type Benchmarks } from "@/lib/admin/test-benchmarks";

const STIGE_PEI: Benchmarks = {
  unit: "pei_percent",
  direction: "lower",
  source: "test",
  levels: [
    { id: "pga_top40", label: "PGA topp 40", value: 4.8, confidence: "measured" },
    { id: "scratch", label: "Scratch", value: 11.3, confidence: "measured" },
  ],
} as Benchmarks;

const STIGE_METER: Benchmarks = {
  unit: "meters",
  direction: "higher",
  source: "test",
  levels: [
    { id: "pga_top40", label: "PGA topp 40", value: 273, confidence: "measured" },
    { id: "elite_junior", label: "Elite junior", value: 250, confidence: "measured" },
  ],
} as Benchmarks;

test("PEI-brøk normaliseres til prosent før benchmark-sammenligning", () => {
  // 0,038 = 3,8 % — bedre enn 4,8 %, altså et ekte PGA-nivå.
  assert.equal(beregnBenchmarkNivaa(0.038, STIGE_PEI)?.id, "pga_top40");
  // 0,09 = 9 % — mellom nivåene, skal lande på Scratch.
  assert.equal(beregnBenchmarkNivaa(0.09, STIGE_PEI)?.id, "scratch");
  // 0,15 = 15 % — under hele stigen.
  assert.equal(beregnBenchmarkNivaa(0.15, STIGE_PEI), null);
});

test("en middelmådig PEI gir ikke lenger falskt toppnivå", () => {
  // Selve feilen: uten normalisering ga 0,09 <= 4,8 treff på PGA topp 40.
  assert.notEqual(beregnBenchmarkNivaa(0.09, STIGE_PEI)?.id, "pga_top40");
});

test("PEI allerede lagret som prosent behandles likt", () => {
  assert.equal(beregnBenchmarkNivaa(3.8, STIGE_PEI)?.id, "pga_top40");
  assert.equal(beregnBenchmarkNivaa(9, STIGE_PEI)?.id, "scratch");
});

test("normaliseringen rører ikke stiger i andre enheter", () => {
  assert.equal(beregnBenchmarkNivaa(255, STIGE_METER)?.id, "elite_junior");
});

test("talent-sync og achievedLevel er enige — de hadde drevet fra hverandre", () => {
  for (const verdi of [0.02, 0.038, 0.048, 0.09, 0.113, 0.15, 3.8, 9, 12]) {
    assert.equal(
      beregnBenchmarkNivaa(verdi, STIGE_PEI)?.id ?? null,
      achievedLevel(STIGE_PEI, verdi)?.id ?? null,
      `uenighet om ${verdi}`,
    );
  }
});
