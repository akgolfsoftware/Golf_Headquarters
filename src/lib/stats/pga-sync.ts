/**
 * PGA Tour stats-sync for /stats/pga (Fase 2 playground).
 *
 * Inneholder tre sync-funksjoner:
 *
 *  1. syncPgaSkillRatings — ett globalt prediksjonssett fra /preds/skill-ratings
 *     → PgaPlayerSeason. Kjøres ukentlig.
 *
 *  2. syncPgaPuttDistance — seed Broadie-estimater for putt-distance.
 *     DataGolf eksponerer ikke et putt-distance-endpoint per mai 2026.
 *     Kilde: Broadie (2014) + PGA Tour ShotLink-tall. Idempotent upsert.
 *
 *  3. syncPgaApproach — aggregerer proximity per yardage-bøtte fra
 *     DataGolf /preds/approach-skill → PgaApproachDistance. Kjøres ukentlig.
 *
 * Alle funksjoner er idempotente (upsert).
 */

import { prisma } from "@/lib/prisma";
import { getSkillRatings, type DGTour } from "@/lib/datagolf/client";
import { logError } from "@/lib/error-tracking";

// Ett globalt sett. PGA er en eldre lagringsnøkkel, ikke en påstand om tour-dekning.
const STATS_TOURS: DGTour[] = ["pga"]; // Historisk lagringsnøkkel for ett globalt sett.

function pct(value: number | undefined): number | null {
  // DataGolf returnerer accuracy/gir som 0-1, vi lagrer som 0-100
  if (value === undefined || value === null) return null;
  return value * 100;
}

function num(value: number | undefined): number | null {
  if (value === undefined || value === null) return null;
  return value;
}

async function syncOneTour(tour: DGTour): Promise<{ players: number }> {
  const rows = await getSkillRatings(tour);
  const year = new Date().getUTCFullYear();
  let count = 0;

  for (const r of rows) {
    if (!r.dg_id || !r.player_name) continue;

    const data = {
      dgPlayerId: r.dg_id,
      tour: String(tour),
      year,
      playerName: r.player_name,
      country: r.country ?? null,
      rounds: num(r.rounds) !== null ? Math.round(r.rounds!) : null,
      avgScore: num(r.avg_score),
      driveDist: null, // skill-ratings gir relativ lengde, ikke absolutt drive-lengde
      fairwayPct: null, // skill-ratings gir relative prosentpoeng
      girPct: pct(r.gir),
      puttsPerRound: num(r.putts_per_round),
      scrambling: pct(r.scrambling),
      sgTotal: num(r.sg_total),
      sgOtt: num(r.sg_ott),
      sgApp: num(r.sg_app),
      sgArg: num(r.sg_arg),
      sgPutt: num(r.sg_putt),
      source: "datagolf-skill-ratings-global",
    };

    await prisma.pgaPlayerSeason.upsert({
      where: {
        dgPlayerId_tour_year: {
          dgPlayerId: r.dg_id,
          tour: String(tour),
          year,
        },
      },
      create: data,
      update: data,
    });
    count++;
  }

  return { players: count };
}

/**
 * Cron-agent: lagrer ett globalt ferdighetssett under den eldre PGA-nøkkelen.
 * Kjøres ukentlig.
 */
export async function syncPgaSkillRatings(): Promise<{
  tours: number;
  totalPlayers: number;
  perTour: Record<string, number>;
}> {
  const perTour: Record<string, number> = {};
  let total = 0;

  for (const tour of STATS_TOURS) {
    try {
      const result = await syncOneTour(tour);
      perTour[tour] = result.players;
      total += result.players;
    } catch (error) {
      await logError({
        context: "pga-sync.syncOneTour",
        error,
        meta: { tour },
        severity: "warn",
      });
      perTour[tour] = -1;
    }
  }

  return {
    tours: STATS_TOURS.length,
    totalPlayers: total,
    perTour,
  };
}

/**
 * Helper for UI: hent topp N spillere for en gitt stat-kategori og tour.
 * Brukes av /stats/pga/[kategori].
 */
export type PgaStatCategory =
  | "driveDist"
  | "fairwayPct"
  | "girPct"
  | "puttsPerRound"
  | "sgTotal"
  | "avgScore"
  | "scrambling";

export async function getPgaTopN(
  category: PgaStatCategory,
  options: { tour?: string; year?: number; limit?: number; minRounds?: number } = {},
) {
  const tour = options.tour ?? "pga";
  const year = options.year ?? new Date().getUTCFullYear();
  const limit = options.limit ?? 20;
  const minRounds = options.minRounds ?? 20;

  // Lavere = bedre for avgScore og puttsPerRound
  const isLowerBetter = category === "avgScore" || category === "puttsPerRound";

  return prisma.pgaPlayerSeason.findMany({
    where: {
      tour,
      year,
      // DataGolf skill-ratings har rounds=null; minRounds<=0 dropper filteret.
      ...(minRounds > 0 ? { rounds: { gte: minRounds } } : {}),
      [category]: { not: null },
    },
    orderBy: {
      [category]: isLowerBetter ? "asc" : "desc",
    },
    take: limit,
    select: {
      dgPlayerId: true,
      playerName: true,
      country: true,
      rounds: true,
      [category]: true,
    },
  });
}

/**
 * Tour-gjennomsnitt for en gitt stat-kategori.
 * Brukes til "PGA Tour-snittet er X" på hub-siden.
 */
export async function getPgaTourAverage(
  category: PgaStatCategory,
  options: { tour?: string; year?: number; minRounds?: number } = {},
): Promise<{ average: number | null; count: number }> {
  const tour = options.tour ?? "pga";
  const year = options.year ?? new Date().getUTCFullYear();
  const minRounds = options.minRounds ?? 20;

  const agg = await prisma.pgaPlayerSeason.aggregate({
    where: {
      tour,
      year,
      // DataGolf skill-ratings har rounds=null; minRounds<=0 dropper filteret.
      ...(minRounds > 0 ? { rounds: { gte: minRounds } } : {}),
      [category]: { not: null },
    },
    _avg: { [category]: true },
    _count: { _all: true },
  });

  // Prisma's aggregate _avg is typed as Decimal | number depending on field.
  // Cast pragmatically.
  const avg = (agg._avg as Record<string, number | null>)[category];
  return {
    average: typeof avg === "number" ? avg : null,
    count: agg._count._all,
  };
}

// ---------------------------------------------------------------------------
// Putt distance — Broadie-estimater (DataGolf har ikke putt-distance-endpoint)
// ---------------------------------------------------------------------------

/**
 * Broadie-tall fra "Every Shot Counts" (2014) + PGA Tour ShotLink-aggregat.
 * top10AvgSunkPct er estimert fra offentlige elite-putting-aggregater.
 * proximityNext er gjennomsnittlig avstand til hull etter misset (estimert).
 */
const BROADIE_PUTT_DATA: Array<{
  distanceMeters: number;
  tourAvgSunkPct: number;
  top10AvgSunkPct: number;
  proximityNext: number;
}> = [
  { distanceMeters: 1,  tourAvgSunkPct: 99, top10AvgSunkPct: 100, proximityNext: 0.3 },
  { distanceMeters: 2,  tourAvgSunkPct: 94, top10AvgSunkPct: 97,  proximityNext: 0.6 },
  { distanceMeters: 3,  tourAvgSunkPct: 82, top10AvgSunkPct: 90,  proximityNext: 0.8 },
  { distanceMeters: 4,  tourAvgSunkPct: 64, top10AvgSunkPct: 75,  proximityNext: 1.0 },
  { distanceMeters: 5,  tourAvgSunkPct: 51, top10AvgSunkPct: 62,  proximityNext: 1.2 },
  { distanceMeters: 6,  tourAvgSunkPct: 42, top10AvgSunkPct: 53,  proximityNext: 1.4 },
  { distanceMeters: 8,  tourAvgSunkPct: 29, top10AvgSunkPct: 39,  proximityNext: 1.8 },
  { distanceMeters: 10, tourAvgSunkPct: 23, top10AvgSunkPct: 31,  proximityNext: 2.2 },
  { distanceMeters: 15, tourAvgSunkPct: 15, top10AvgSunkPct: 21,  proximityNext: 3.0 },
  { distanceMeters: 20, tourAvgSunkPct: 10, top10AvgSunkPct: 15,  proximityNext: 4.0 },
];

/**
 * Seed/sync putt-distance-data med Broadie-estimater.
 * Kjøres ukentlig, men data endres kun hvis vi bytter kilde.
 * Idempotent upsert på (year, distanceMeters).
 */
export async function syncPgaPuttDistance(): Promise<{ updated: number }> {
  const year = new Date().getUTCFullYear();
  let updated = 0;

  for (const row of BROADIE_PUTT_DATA) {
    const data = {
      tourAvgSunkPct: row.tourAvgSunkPct,
      top10AvgSunkPct: row.top10AvgSunkPct,
      proximityNext: row.proximityNext,
      source: "broadie-estimate",
    };

    await prisma.pgaPuttDistance.upsert({
      where: { year_distanceMeters: { year, distanceMeters: row.distanceMeters } },
      create: { year, distanceMeters: row.distanceMeters, ...data },
      update: data,
    });
    updated++;
  }

  return { updated };
}

// ---------------------------------------------------------------------------
// Approach distance — aggregert fra DataGolf /preds/approach-skill
// ---------------------------------------------------------------------------

/**
 * Detaljerte referanser bevares per spiller og faktisk kildeintervall.
 * Endpointet gir ikke en forventet-slag-tabell eller et PGA-toursnitt.
 * Eldre syntetiske PgaApproachDistance-rader brukes ikke av spillerverktøyet.
 */
export async function syncPgaApproach(): Promise<{ updated: number }> {
  const { syncDatagolfTak } = await import("@/lib/datagolf/tak-sync");
  const result = await syncDatagolfTak();
  return { updated: result.upserted };
}
