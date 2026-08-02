import "server-only";

import { prisma } from "@/lib/prisma";
import {
  getSgBenchmarks as fetchSgBenchmarks,
  intelligenceConfigured,
  type SgBenchmark as ApiSgBenchmark,
} from "./client";
import { computeLevelGaps, type CategoryGap } from "./benchmark";

/**
 * Benchmark-provider — henter HCP-stratifiserte SG-benchmarks fra AK Golf
 * Intelligence sitt delbare lese-API (`/api/v1/sg/benchmarks`) via
 * `client.ts`. Intelligence er master for referansedata; HQ leser IKKE
 * lenger `dashboard.sg_benchmarks` direkte med SQL (byttet 2026-07-31,
 * se docs/ak-golf-intelligence-konsolidering.md).
 *
 * Manglende konfig (INTELLIGENCE_API_URL/KEY) eller API-nedetid (f.eks. 503)
 * gir tom liste — forbrukssiden viser tom-tilstand, samme som før.
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

const CATEGORIES: readonly SgBenchmarkCategory[] = ["OTT", "APP", "ARG", "PUTT"];

function num(v: string | number | null): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function map(r: ApiSgBenchmark): SgBenchmark | null {
  if (!CATEGORIES.includes(r.category as SgBenchmarkCategory)) return null;
  return {
    handicapLevel: Number(r.handicapLevel),
    category: r.category as SgBenchmarkCategory,
    expectedStrokes: num(r.expectedStrokes),
    pgaTourEquivalent: num(r.pgaTourEquivalent),
    avgScore72: num(r.avgScore72),
  };
}

/**
 * Henter SG-benchmarks. Uten `handicapLevel` → alle nivåer (sortert).
 * Returnerer [] hvis Intelligence-API-et er ukonfigurert, nede eller tomt.
 */
export async function getSgBenchmarks(handicapLevel?: number): Promise<SgBenchmark[]> {
  if (!intelligenceConfigured()) {
    console.warn(
      "[benchmark-provider] INTELLIGENCE_API_URL/KEY mangler — returnerer tom benchmark-liste",
    );
    return [];
  }
  try {
    const rows = await fetchSgBenchmarks(handicapLevel);
    return rows.map(map).filter((b): b is SgBenchmark => b !== null);
  } catch (err) {
    console.warn("[benchmark-provider] Intelligence-API utilgjengelig:", err);
    return [];
  }
}

/** Er benchmark-dataene tilgjengelige (minst én rad)? For å velge tom-tilstand vs visning. */
export async function benchmarksAvailable(): Promise<boolean> {
  if (!intelligenceConfigured()) return false;
  try {
    const rows = await fetchSgBenchmarks();
    return rows.length > 0;
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
