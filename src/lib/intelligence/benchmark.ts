// Benchmark-motor (ren logikk) — plasserer en spillers SG per kategori på
// HCP-benchmark-stigen og regner slag-gap til neste (bedre) nivå.
//
// Stigen kommer fra `dashboard.sg_benchmarks` (se benchmark-provider.ts):
// forventet strokes-gained vs scratch per HCP-nivå × kategori. Lavere HCP =
// bedre = høyere (mindre negativ) forventet SG. En spillers SG sammenlignes på
// samme skala (SG vs scratch) for å finne hvilket nivå de tilsvarer.
//
// MERK (v1): den seedede stigen er forventnings-verdier (Broadie), ikke en
// fordeling — så vi gir nivå-posisjon + slag-gap, IKKE percentil. Percentil
// krever den rikere DataGolf-fordelingen (utsatt backfill).
//
// Ren funksjon, ingen DB/server-only → enhetstestbar.

import type { SgBenchmark, SgBenchmarkCategory } from "./benchmark-provider";

export type CategoryGap = {
  category: SgBenchmarkCategory;
  /** Spillerens SG vs scratch for kategorien (null hvis ukjent). */
  playerSg: number | null;
  /** Interpolert HCP-nivå spilleren tilsvarer (lavere = bedre). Null hvis ukjent. */
  impliedLevel: number | null;
  /** Neste bedre nivå på stigen (lavere HCP). Null hvis allerede på toppnivå. */
  nextLevel: number | null;
  /** Slag spilleren må vinne i kategorien for å nå nextLevel. Null hvis ukjent / på topp. */
  slagGap: number | null;
};

const CATEGORIES: SgBenchmarkCategory[] = ["OTT", "APP", "ARG", "PUTT"];

type LadderRow = { handicapLevel: number; expectedStrokes: number };

function ladderFor(category: SgBenchmarkCategory, benchmarks: SgBenchmark[]): LadderRow[] {
  return benchmarks
    .filter((b) => b.category === category && b.expectedStrokes != null)
    .map((b) => ({ handicapLevel: b.handicapLevel, expectedStrokes: b.expectedStrokes as number }))
    .sort((a, b) => a.handicapLevel - b.handicapLevel); // 0,5,10,… ; forventet SG synker
}

function gapForCategory(
  category: SgBenchmarkCategory,
  playerSg: number | null | undefined,
  benchmarks: SgBenchmark[],
): CategoryGap {
  const ladder = ladderFor(category, benchmarks);
  if (playerSg == null || ladder.length === 0) {
    return { category, playerSg: playerSg ?? null, impliedLevel: null, nextLevel: null, slagGap: null };
  }

  // Beste (laveste HCP) nivå spilleren minst tilsvarer: første rad de når.
  const bestMetIdx = ladder.findIndex((row) => playerSg >= row.expectedStrokes);

  // Bedre enn toppnivået → på topp, ingenting å hente.
  if (bestMetIdx === 0) {
    return { category, playerSg, impliedLevel: ladder[0].handicapLevel, nextLevel: null, slagGap: null };
  }

  // Dårligere enn alle nivåer → under stigens bunn.
  if (bestMetIdx === -1) {
    const worst = ladder[ladder.length - 1];
    return {
      category,
      playerSg,
      impliedLevel: worst.handicapLevel,
      nextLevel: worst.handicapLevel,
      slagGap: round2(worst.expectedStrokes - playerSg),
    };
  }

  const current = ladder[bestMetIdx];
  const better = ladder[bestMetIdx - 1];
  const span = better.expectedStrokes - current.expectedStrokes;
  const frac = span === 0 ? 0 : (playerSg - current.expectedStrokes) / span;
  const impliedLevel = current.handicapLevel + frac * (better.handicapLevel - current.handicapLevel);

  return {
    category,
    playerSg,
    impliedLevel: round2(impliedLevel),
    nextLevel: better.handicapLevel,
    slagGap: round2(better.expectedStrokes - playerSg),
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

/**
 * Ren motor: gitt spillerens SG per kategori + benchmark-stigen, returner
 * nivå-posisjon + slag-gap per kategori (OTT/APP/ARG/PUTT).
 */
export function computeLevelGaps(
  playerSgByCategory: Partial<Record<SgBenchmarkCategory, number | null>>,
  benchmarks: SgBenchmark[],
): CategoryGap[] {
  return CATEGORIES.map((category) =>
    gapForCategory(category, playerSgByCategory[category], benchmarks),
  );
}
