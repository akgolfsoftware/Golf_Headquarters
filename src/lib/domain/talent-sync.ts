/**
 * TestResult → talentprofil (plan T4) — REN beregning, ingen IO.
 *
 * Bygger `TalentTracking.testNivaaer` fra spillerens CANON-testresultater +
 * benchmark-stigen i `TestDefinition.protocol.benchmarks` (parseBenchmarks).
 * Skrives KUN av synken (src/lib/talent/test-sync.ts) — coachens fem manuelle
 * radar-akser (fysisk/teknikk/taktikk/mental/motivasjon) røres ALDRI.
 *
 * Regler:
 * - Per pyramideområde: nyeste resultat vinner («sisteScore»).
 * - Benchmark-nivå: beste nivå i stigen som er nådd (levels er ordnet beste
 *   først i seed-dataene; direction avgjør om høyere eller lavere er bedre).
 * - Trend beregnes INNEN samme test (siste vs. forrige score, justert for
 *   direction) — aldri på tvers av tester med ulike måleenheter.
 * - Milepæl når et område når et BEDRE benchmark-nivå enn sist lagret.
 */

import { z } from "zod";
import type { Benchmarks } from "@/lib/admin/test-benchmarks";

export const testNivaaSchema = z.object({
  sisteScore: z.number(),
  sisteDato: z.string(), // ISO
  antallTester: z.number().int().min(0),
  benchmarkNivaa: z.string().nullable(),
  benchmarkLabel: z.string().nullable(),
  trend: z.enum(["opp", "ned", "flat"]).nullable(),
  testNavn: z.string(),
});

export const testNivaaerSchema = z.record(z.string(), testNivaaSchema);

export type TestNivaa = z.infer<typeof testNivaaSchema>;
export type TestNivaaer = z.infer<typeof testNivaaerSchema>;

export interface CanonResultat {
  testId: string;
  testNavn: string;
  pyramidArea: string;
  score: number;
  takenAt: Date;
  benchmarks: Benchmarks | null;
}

/** Beste nivå i stigen som er nådd — null når under hele skalaen. */
export function beregnBenchmarkNivaa(
  score: number,
  benchmarks: Benchmarks | null,
): { id: string; label: string } | null {
  if (!benchmarks) return null;
  const bedre = (a: number, b: number) =>
    benchmarks.direction === "lower" ? a <= b : a >= b;
  for (const level of benchmarks.levels) {
    if (bedre(score, level.value)) return { id: level.id, label: level.label };
  }
  return null;
}

/** Nivåets posisjon i stigen (0 = beste). -1 når null/ukjent. */
export function nivaaPosisjon(nivaaId: string | null, benchmarks: Benchmarks | null): number {
  if (!nivaaId || !benchmarks) return -1;
  return benchmarks.levels.findIndex((l) => l.id === nivaaId);
}

export function beregnTestNivaaer(resultater: CanonResultat[]): TestNivaaer {
  const perOmraade = new Map<string, CanonResultat[]>();
  for (const r of resultater) {
    const liste = perOmraade.get(r.pyramidArea) ?? [];
    liste.push(r);
    perOmraade.set(r.pyramidArea, liste);
  }

  const ut: TestNivaaer = {};
  for (const [omraade, liste] of perOmraade) {
    const sortert = [...liste].sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime());
    const nyeste = sortert[0];

    // Trend: innen samme test som det nyeste resultatet.
    const sammeTest = sortert.filter((r) => r.testId === nyeste.testId);
    let trend: TestNivaa["trend"] = null;
    if (sammeTest.length >= 2) {
      const forrige = sammeTest[1];
      const retning = nyeste.benchmarks?.direction === "lower" ? -1 : 1;
      const diff = (nyeste.score - forrige.score) * retning;
      trend = diff > 0 ? "opp" : diff < 0 ? "ned" : "flat";
    }

    const nivaa = beregnBenchmarkNivaa(nyeste.score, nyeste.benchmarks);
    ut[omraade] = {
      sisteScore: nyeste.score,
      sisteDato: nyeste.takenAt.toISOString(),
      antallTester: liste.length,
      benchmarkNivaa: nivaa?.id ?? null,
      benchmarkLabel: nivaa?.label ?? null,
      trend,
      testNavn: nyeste.testNavn,
    };
  }
  return ut;
}

export interface Milepael {
  tittel: string;
  dato: string;
  beskrivelse: string;
}

/**
 * Nye milepæler: områder som har nådd et BEDRE benchmark-nivå enn i forrige
 * lagrede tilstand. Sammenligningen skjer per område via posisjon i stigen —
 * benchmarks trengs for retning, så vi bruker det nyeste resultatets stige.
 */
export function utledMilepaeler(
  gamle: TestNivaaer | null,
  nye: TestNivaaer,
  resultater: CanonResultat[],
  naa: Date,
): Milepael[] {
  const milepaeler: Milepael[] = [];
  for (const [omraade, nytt] of Object.entries(nye)) {
    if (!nytt.benchmarkNivaa) continue;
    const gammelt = gamle?.[omraade];
    const benchmarks =
      resultater.find((r) => r.pyramidArea === omraade && r.benchmarks)?.benchmarks ?? null;
    const nyPos = nivaaPosisjon(nytt.benchmarkNivaa, benchmarks);
    const gammelPos = nivaaPosisjon(gammelt?.benchmarkNivaa ?? null, benchmarks);
    const forbedret = nyPos !== -1 && (gammelPos === -1 || nyPos < gammelPos);
    if (forbedret) {
      milepaeler.push({
        tittel: `${omraade}: ${nytt.benchmarkLabel}`,
        dato: naa.toISOString().slice(0, 10),
        beskrivelse: `Nådde nivået ${nytt.benchmarkLabel} i ${omraade} (${nytt.testNavn}).`,
      });
    }
  }
  return milepaeler;
}
