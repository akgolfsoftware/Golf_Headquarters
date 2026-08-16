/**
 * T4 · TestResult → talentprofil — ren beregning: benchmark-stigen, trend
 * innen samme test, milepæler kun ved forbedring.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  beregnBenchmarkNivaa,
  beregnTestNivaaer,
  utledMilepaeler,
  type CanonResultat,
} from "@/lib/domain/talent-sync";
import type { Benchmarks } from "@/lib/admin/test-benchmarks";

const STIGE_HOYERE: Benchmarks = {
  unit: "meters",
  direction: "higher",
  source: "test",
  levels: [
    { id: "pga_top40", label: "PGA topp 40", value: 273, confidence: "measured" },
    { id: "elite_junior", label: "Elite junior", value: 250, confidence: "measured" },
    { id: "scratch", label: "Scratch", value: 230, confidence: "measured" },
  ],
} as Benchmarks;

const STIGE_LAVERE: Benchmarks = {
  ...STIGE_HOYERE,
  direction: "lower",
  levels: [
    { id: "pga_top40", label: "PGA topp 40", value: 5, confidence: "measured" },
    { id: "scratch", label: "Scratch", value: 9, confidence: "measured" },
  ],
} as Benchmarks;

function resultat(overrides: Partial<CanonResultat>): CanonResultat {
  return {
    testId: "t1",
    testNavn: "Driver Basic",
    pyramidArea: "SLAG",
    score: 255,
    takenAt: new Date("2026-08-10T10:00:00Z"),
    benchmarks: STIGE_HOYERE,
    ...overrides,
  };
}

test("benchmark-nivå: beste nådde nivå vinner (higher)", () => {
  assert.equal(beregnBenchmarkNivaa(280, STIGE_HOYERE)?.id, "pga_top40");
  assert.equal(beregnBenchmarkNivaa(255, STIGE_HOYERE)?.id, "elite_junior");
  assert.equal(beregnBenchmarkNivaa(200, STIGE_HOYERE), null);
});

test("benchmark-nivå: lower-retning (lavere er bedre, f.eks. PEI)", () => {
  assert.equal(beregnBenchmarkNivaa(4.5, STIGE_LAVERE)?.id, "pga_top40");
  assert.equal(beregnBenchmarkNivaa(7, STIGE_LAVERE)?.id, "scratch");
  assert.equal(beregnBenchmarkNivaa(12, STIGE_LAVERE), null);
});

test("nyeste resultat per område vinner; antall telles", () => {
  const nivaaer = beregnTestNivaaer([
    resultat({ score: 240, takenAt: new Date("2026-08-01T10:00:00Z") }),
    resultat({ score: 255, takenAt: new Date("2026-08-10T10:00:00Z") }),
    resultat({ testId: "t2", testNavn: "Putt 1-3m", pyramidArea: "SPILL", score: 80, benchmarks: null }),
  ]);
  assert.equal(nivaaer.SLAG.sisteScore, 255);
  assert.equal(nivaaer.SLAG.antallTester, 2);
  assert.equal(nivaaer.SLAG.benchmarkNivaa, "elite_junior");
  assert.equal(nivaaer.SPILL.benchmarkNivaa, null);
});

test("trend beregnes innen samme test og respekterer direction", () => {
  const opp = beregnTestNivaaer([
    resultat({ score: 255, takenAt: new Date("2026-08-10T10:00:00Z") }),
    resultat({ score: 240, takenAt: new Date("2026-08-01T10:00:00Z") }),
  ]);
  assert.equal(opp.SLAG.trend, "opp");

  const lavereBedre = beregnTestNivaaer([
    resultat({ benchmarks: STIGE_LAVERE, score: 5, takenAt: new Date("2026-08-10T10:00:00Z") }),
    resultat({ benchmarks: STIGE_LAVERE, score: 8, takenAt: new Date("2026-08-01T10:00:00Z") }),
  ]);
  assert.equal(lavereBedre.SLAG.trend, "opp", "lavere score med direction lower er fremgang");

  const annenTest = beregnTestNivaaer([
    resultat({ score: 255 }),
    resultat({ testId: "t9", testNavn: "Annen", score: 999, takenAt: new Date("2026-08-01T10:00:00Z") }),
  ]);
  assert.equal(annenTest.SLAG.trend, null, "aldri trend på tvers av ulike tester");
});

test("milepæl kun ved FORBEDRET benchmark-nivå", () => {
  const res = [resultat({ score: 255 })];
  const nye = beregnTestNivaaer(res);
  const naa = new Date("2026-08-16T12:00:00Z");

  const forsteGang = utledMilepaeler(null, nye, res, naa);
  assert.equal(forsteGang.length, 1);
  assert.match(forsteGang[0].tittel, /Elite junior/);

  const uendret = utledMilepaeler(nye, nye, res, naa);
  assert.equal(uendret.length, 0);

  const bedreRes = [resultat({ score: 280, takenAt: new Date("2026-08-15T10:00:00Z") })];
  const bedre = utledMilepaeler(nye, beregnTestNivaaer(bedreRes), bedreRes, naa);
  assert.equal(bedre.length, 1);
  assert.match(bedre[0].tittel, /PGA topp 40/);

  const svakereRes = [resultat({ score: 235, takenAt: new Date("2026-08-15T10:00:00Z") })];
  const svakere = utledMilepaeler(nye, beregnTestNivaaer(svakereRes), svakereRes, naa);
  assert.equal(svakere.length, 0, "tilbakegang gir aldri milepæl");
});
