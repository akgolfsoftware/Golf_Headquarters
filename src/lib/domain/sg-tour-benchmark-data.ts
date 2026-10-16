import "server-only";

import { prisma } from "@/lib/prisma";
import {
  assessTourRoundBenchmark,
  type SgTour,
  type SgTourCategory,
  type TourBenchmarkResult,
  type TourRoundCoverage,
} from "./sg-tour-benchmark";

const TOUR_CODE: Record<SgTour, string> = { pga: "pga", dp_world: "euro", korn_ferry: "kft" };
type Aggregate = { total: bigint; valid: bigint; rank: bigint };

function missingDataset(error: unknown, seen = new Set<object>()): boolean {
  if (!error || typeof error !== "object" || seen.has(error) || seen.size >= 12) return false;
  seen.add(error);
  const value = error as Record<string, unknown>;
  if ([value.code, value.originalCode].some((code) => code === "42P01" || code === "3F000")) return true;
  return [value.meta, value.cause, value.driverAdapterError].some((nested) => missingDataset(nested, seen));
}

/** Internt kildeoppslag. Sender bare antall, aldri DataGolf-rader, videre. */
export async function loadTourRoundCoverage(input: {
  tour: SgTour;
  category: SgTourCategory;
  yearFrom: number;
  yearTo: number;
  calibratedPlayerSg: number | null;
}): Promise<TourRoundCoverage> {
  if (!Number.isInteger(input.yearFrom) || !Number.isInteger(input.yearTo) ||
      input.yearFrom < 2000 || input.yearTo > 2100 || input.yearFrom > input.yearTo) {
    throw new RangeError("Ugyldig sesongintervall");
  }
  const threshold = input.calibratedPlayerSg;
  const rows = await prisma.$queryRaw<Aggregate[]>`
    with rounds as (
      select case ${input.category}
        when 'OTT' then sg.sg_ott
        when 'APP' then sg.sg_app
        when 'ARG' then sg.sg_arg
        when 'PUTT' then sg.sg_putt
      end as category_sg
      from dashboard.dg_rounds r
      join dashboard.dg_events e on e.id = r.event_id
      left join dashboard.dg_round_sg sg on sg.round_id = r.id
      where e.tour_code = ${TOUR_CODE[input.tour]}
        and e.year between ${input.yearFrom} and ${input.yearTo}
        and r.score_type = 'brutto'
    )
    select count(*) as total,
      count(category_sg) as valid,
      count(*) filter (where ${threshold}::double precision is not null and category_sg <= ${threshold}) as rank
    from rounds
  `;
  const row = rows[0];
  return {
    totalGrossRounds: Number(row?.total ?? 0),
    categoryRounds: Number(row?.valid ?? 0),
    atOrBelowPlayer: threshold == null ? null : Number(row?.rank ?? 0),
  };
}

/**
 * Ferdig runde → DataGolf-fordeling. DP World/kategori er per i dag tom;
 * uten dokumentert visningsrett og skala-kalibrering returneres ingen prosentil.
 */
export async function benchmarkCompletedRound(input: {
  tour: SgTour;
  category: SgTourCategory;
  yearFrom: number;
  yearTo: number;
  playerSg: number;
  playerBaselineVersion: string;
  licenseAllowsPlayerDisplay: boolean;
  playerToFieldOffset?: number;
}): Promise<TourBenchmarkResult | { status: "reference_unavailable"; sampleSize: 0 }> {
  const threshold = input.licenseAllowsPlayerDisplay && input.playerToFieldOffset != null
    ? input.playerSg + input.playerToFieldOffset : null;
  try {
    const coverage = await loadTourRoundCoverage({ ...input, calibratedPlayerSg: threshold });
    return assessTourRoundBenchmark({ ...input, coverage });
  } catch (error) {
    // Lokal HQ-testdatabase kan mangle pipeline-eide dashboard-tabeller.
    if (missingDataset(error)) return { status: "reference_unavailable", sampleSize: 0 };
    throw error;
  }
}
