/**
 * PGA Tour stats-sync for /stats/pga (Fase 2 playground).
 *
 * Henter sesong-aggregat fra DataGolf /preds/skill-ratings og upsert-er
 * til PgaPlayerSeason-tabellen. Kjøres ukentlig via cron-agent.
 *
 * DataGolf returnerer skill-ratings basert på siste 2 års data, vektet
 * mot nylige resultater. Vi lagrer som "current year"-snapshot.
 *
 * Idempotent — upsert på (dgPlayerId, tour, year).
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
      rounds: { gte: minRounds },
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
      rounds: { gte: minRounds },
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
