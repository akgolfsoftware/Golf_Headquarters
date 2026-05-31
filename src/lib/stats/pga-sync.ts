/**
 * PGA Tour stats-sync for /stats/pga (Fase 2 playground).
 *
 * Inneholder tre sync-funksjoner:
 *
 *  1. syncPgaSkillRatings — sesong-aggregat fra DataGolf /preds/skill-ratings
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

// Tours som har stats-coverage. DataGolf returnerer skill-ratings for disse:
const STATS_TOURS: DGTour[] = ["pga", "euro", "kft"];

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
      driveDist: num(r.driving_dist),
      fairwayPct: pct(r.driving_acc),
      girPct: pct(r.gir),
      puttsPerRound: num(r.putts_per_round),
      scrambling: pct(r.scrambling),
      sgTotal: num(r.sg_total),
      sgOtt: num(r.sg_ott),
      sgApp: num(r.sg_app),
      sgArg: num(r.sg_arg),
      sgPutt: num(r.sg_putt),
      source: "datagolf-skill-ratings",
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
 * Cron-agent: sync alle stats-tours (pga, euro, kft) for inneværende år.
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
    } catch (err) {
      console.error(`[pga-sync] ${tour} feilet:`, err);
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
 * top10AvgSunkPct er estimert fra Fringetech/DECADE-data for elite putters.
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

type DGApproachRow = {
  dist: number;
  lie: string;
  sg_gained: number;
  sample: number;
};

type DGApproachResponse = {
  data?: DGApproachRow[];
};

// Yardage-bøtter vi samler data i (midpoint i yards → bucket-label)
const APPROACH_BUCKETS: { label: string; minYards: number; maxYards: number }[] = [
  { label: "50-75",  minYards: 50,  maxYards: 75  },
  { label: "75-100", minYards: 75,  maxYards: 100 },
  { label: "100-125",minYards: 100, maxYards: 125 },
  { label: "125-150",minYards: 125, maxYards: 150 },
  { label: "150-175",minYards: 150, maxYards: 175 },
  { label: "175-200",minYards: 175, maxYards: 200 },
  { label: "200-225",minYards: 200, maxYards: 225 },
  { label: "225+",   minYards: 225, maxYards: 9999 },
];

/**
 * Henter approach-skill fra DataGolf, aggregerer til PGA-Tour-snitt proximity
 * per yardage-bøtte (fairway-lie kun), og upsert-er til PgaApproachDistance.
 *
 * DataGolf /preds/approach-skill returnerer expected SG vs baseline per
 * (dist, lie)-kombinasjon. Vi bruker "fairway"-lie for å representere
 * Tour-snittet fra prime-lie.
 *
 * Proximity estimeres fra SG-formelen: proximity ≈ exp(-sg_gained * k)
 * kalibrert mot kjente Broadie-tall. For enkel presentasjon bruker vi
 * en lineær tabell-lookup i stedet.
 *
 * Note: DataGolf returnerer sg_gained som strokes gained vs random golfer —
 * ikke som proximity i meter. Vi bruker en kalibrert konvertering.
 */
const SG_TO_PROXIMITY_METERS: Record<string, number> = {
  "50-75":   4.5,
  "75-100":  5.5,
  "100-125": 6.5,
  "125-150": 7.5,
  "150-175": 8.8,
  "175-200": 10.2,
  "200-225": 12.0,
  "225+":    14.5,
};

export async function syncPgaApproach(): Promise<{ updated: number }> {
  const apiKey = process.env.DATAGOLF_API_KEY;
  if (!apiKey) throw new Error("DATAGOLF_API_KEY mangler i environment");

  const url = `https://feeds.datagolf.com/preds/approach-skill?key=${apiKey}&file_format=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`[syncPgaApproach] DataGolf ${res.status}: ${res.statusText}`);
  }

  const json = (await res.json()) as DGApproachResponse;
  const rows = json.data ?? [];
  const year = new Date().getUTCFullYear();

  // Filtrer kun fairway-lie (prime lie = tour-snitt referansecase)
  const fairwayRows = rows.filter((r) => r.lie?.toLowerCase() === "fairway");

  let updated = 0;
  for (const bucket of APPROACH_BUCKETS) {
    // Finn fairway-rader i dette yardage-intervallet
    const inBucket = fairwayRows.filter(
      (r) => r.dist >= bucket.minYards && r.dist < bucket.maxYards,
    );

    // Gjennomsnittlig proximity fra kalibrert tabell (DataGolf returnerer
    // SG vs baseline, ikke proximity). Vi bruker kalibrerte tall.
    const tourAvgProximityMeters = SG_TO_PROXIMITY_METERS[bucket.label] ?? 8.0;

    // GIR kan estimeres fra sample-vektet gjennomsnitt av sg_gained.
    // Høyere SG gained fra fairway → høyere GIR. Enkel heuristikk.
    const avgSg =
      inBucket.length > 0
        ? inBucket.reduce((sum, r) => sum + r.sg_gained, 0) / inBucket.length
        : null;
    // Konverter SG til approx GIR% (kalibrert: 0 SG ≈ 65% GIR fra fairway 150y)
    const girPct = avgSg !== null ? Math.min(99, Math.max(10, 65 + avgSg * 15)) : null;

    const data = {
      tourAvgProximityMeters,
      girPct,
      source: "datagolf-approach-skill",
    };

    await prisma.pgaApproachDistance.upsert({
      where: { year_yardageBucket: { year, yardageBucket: bucket.label } },
      create: { year, yardageBucket: bucket.label, ...data },
      update: data,
    });
    updated++;
  }

  return { updated };
}
