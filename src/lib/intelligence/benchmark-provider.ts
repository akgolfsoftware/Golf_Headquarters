import "server-only";

import { prisma } from "@/lib/prisma";
import { computeLevelGaps, type CategoryGap } from "./benchmark";

/**
 * Benchmark-provider — leser HCP-stratifiserte SG-benchmarks fra AK Golf
 * Intelligence sitt `dashboard`-schema.
 *
 * HQ og Intelligence deler samme Postgres (besluttet 2026-06-30), så HQ leser
 * dashboard-tabellene direkte i stedet for via HTTP-API-et. Tabellen
 * `dashboard.sg_benchmarks` er HCP × kategori (OTT/APP/ARG/PUTT) med forventet
 * strokes-gained per nivå (Broadie-baserte seed-verdier; rikere DataGolf-
 * percentiler fylles av en separat backfill).
 *
 * Ved feil/tom tabell returneres tom liste — forbrukssiden viser tom-tilstand.
 */

export type SgBenchmarkCategory = "OTT" | "APP" | "ARG" | "PUTT";

export type SgBenchmark = {
  handicapLevel: number;
  category: SgBenchmarkCategory;
  /** Forventet strokes-gained mot scratch for dette nivået/kategorien. */
  expectedStrokes: number | null;
  /** PGA-tour-ekvivalent (0 i seed; fylles senere). */
  pgaTourEquivalent: number | null;
  /** Forventet 72-hulls score for nivået (kan være null). */
  avgScore72: number | null;
};

type RawRow = {
  handicap_level: number;
  category: string;
  expected_strokes: string | number | null;
  pga_tour_equivalent: string | number | null;
  avg_score_72: string | number | null;
};

function num(v: string | number | null): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function map(r: RawRow): SgBenchmark {
  return {
    handicapLevel: Number(r.handicap_level),
    category: r.category as SgBenchmarkCategory,
    expectedStrokes: num(r.expected_strokes),
    pgaTourEquivalent: num(r.pga_tour_equivalent),
    avgScore72: num(r.avg_score_72),
  };
}

/**
 * Henter SG-benchmarks. Uten `handicapLevel` → alle nivåer (sortert).
 * Returnerer [] hvis dashboard-schemaet er utilgjengelig eller tomt.
 */
export async function getSgBenchmarks(handicapLevel?: number): Promise<SgBenchmark[]> {
  try {
    const rows =
      handicapLevel === undefined
        ? await prisma.$queryRaw<RawRow[]>`
            SELECT handicap_level, category, expected_strokes, pga_tour_equivalent, avg_score_72
            FROM dashboard.sg_benchmarks
            ORDER BY handicap_level, category`
        : await prisma.$queryRaw<RawRow[]>`
            SELECT handicap_level, category, expected_strokes, pga_tour_equivalent, avg_score_72
            FROM dashboard.sg_benchmarks
            WHERE handicap_level = ${handicapLevel}
            ORDER BY category`;
    return rows.map(map);
  } catch (err) {
    console.warn("[benchmark-provider] dashboard.sg_benchmarks utilgjengelig:", err);
    return [];
  }
}

/** Er benchmark-dataene tilgjengelige (minst én rad)? For å velge tom-tilstand vs visning. */
export async function benchmarksAvailable(): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<{ n: number }[]>`
      SELECT count(*)::int AS n FROM dashboard.sg_benchmarks`;
    return (rows[0]?.n ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Henter en spillers nivå-posisjon + slag-gap per kategori, basert på nyeste
 * registrerte SG (`BrukerSgInput`) mot benchmark-stigen. Tom liste hvis spilleren
 * ikke har SG-data eller benchmarkene er utilgjengelige (forbruk viser tom-tilstand).
 */
export async function getPlayerBenchmarkGaps(userId: string): Promise<CategoryGap[]> {
  const [latest, benchmarks] = await Promise.all([
    prisma.brukerSgInput.findFirst({
      where: { userId },
      orderBy: { dato: "desc" },
      select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    }),
    getSgBenchmarks(),
  ]);
  if (!latest || benchmarks.length === 0) return [];
  return computeLevelGaps(
    { OTT: latest.sgOtt, APP: latest.sgApp, ARG: latest.sgArg, PUTT: latest.sgPutt },
    benchmarks,
  );
}
