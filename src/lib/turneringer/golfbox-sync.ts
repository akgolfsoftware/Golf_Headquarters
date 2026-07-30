/**
 * Delbar GolfBox-sync for norske amatør/junior-turneringer.
 *
 * Brukes av:
 * - Vercel cron `/api/cron/turneringer-ngf` (schedule + link + backfill)
 * - GitHub Actions `scripts/scrape-golfbox.ts` (schedule + leaderboards)
 *
 * Se docs/turnering-datakilder.md (§ VERIFISERT).
 */

import type { PrismaClient } from "@/generated/prisma/client";
import {
  getSchedule,
  getLeaderboard,
  type GolfBoxLeaderboardEntry,
} from "@/lib/scrapers/golfbox";
import {
  NO_TOUR_CUSTOMERS,
  classifyTour,
  golfboxSlugify,
  deriveStatus,
} from "@/lib/scrapers/golfbox-customers";
import { resolvePlayer } from "@/lib/scrapers/player-resolve";
import {
  materializePublicPlayerRounds,
  mirrorTournamentResultForLinkedUser,
} from "@/lib/turneringer/materialize-entry";

const GOLFBOX_ORIGINS = [
  "GOLFBOX",
  "SRIXON",
  "NORGESCUP",
  "OLYO",
  "MIDAM",
  "SENIOR",
  "NM",
  "OSTLANDS",
] as const;

export type SyncSchedulesResult = {
  customers: number;
  events: number;
  upcoming: number;
};

function buildNotes(opts: {
  region?: string;
  entryCloses: Date | null;
  entryOpens: Date | null;
}): string | undefined {
  const blob: Record<string, unknown> = {};
  if (opts.region) {
    blob.tour = "olyo";
    blob.krets = opts.region;
  }
  if (opts.entryCloses) {
    blob.entryCloses = opts.entryCloses.toISOString().slice(0, 10);
  }
  if (opts.entryOpens) {
    blob.entryOpens = opts.entryOpens.toISOString().slice(0, 10);
  }
  if (Object.keys(blob).length === 0) return undefined;
  return JSON.stringify(blob);
}

/**
 * Hent terminliste fra alle norske GolfBox-tour-kunder og upsert Tournament.
 */
export async function syncGolfBoxSchedules(
  prisma: PrismaClient,
  now: Date = new Date(),
): Promise<SyncSchedulesResult> {
  let events = 0;
  let upcoming = 0;

  for (const src of NO_TOUR_CUSTOMERS) {
    const sched = await getSchedule(src.customerId);
    for (const e of sched) {
      if (!e.startDate) continue;
      if (src.onlyMatching && !src.onlyMatching.test(e.name)) continue;

      const cls = classifyTour(e.name, src.defaultTour);
      const year = e.startDate.getUTCFullYear();
      const slug = `${golfboxSlugify(e.name)}-${year}`;
      const status = deriveStatus(e.startDate, e.endDate, now);
      const format = e.type === "MatchPlay" ? "MATCH" : "STROKE";
      const notes = buildNotes({
        region: src.region,
        entryCloses: e.entryCloses,
        entryOpens: e.entryOpens,
      });

      if (status === "UPCOMING") upcoming++;

      await prisma.tournament.upsert({
        where: { slug },
        create: {
          name: e.name,
          slug,
          startDate: e.startDate,
          endDate: e.endDate,
          format,
          sourceOrigin: cls.sourceOrigin,
          sourceId: String(e.competitionId),
          tour: cls.tour,
          country: "NO",
          location: e.venue,
          status,
          notes,
          lastSyncAt: now,
        },
        update: {
          name: e.name,
          startDate: e.startDate,
          endDate: e.endDate,
          format,
          sourceOrigin: cls.sourceOrigin,
          sourceId: String(e.competitionId),
          tour: cls.tour,
          location: e.venue,
          status,
          // notes: always refresh when we have structured data
          ...(notes !== undefined ? { notes } : {}),
          lastSyncAt: now,
        },
      });
      events++;
    }
  }

  return {
    customers: NO_TOUR_CUSTOMERS.length,
    events,
    upcoming,
  };
}

function entryStatus(
  e: GolfBoxLeaderboardEntry,
  tournamentCompleted: boolean,
): string {
  const p = (e.positionText ?? "").toUpperCase();
  if (p.includes("CUT")) return "CUT";
  if (p.includes("WD") || p.includes("DQ") || p.includes("RET")) return "WITHDREW";
  if (tournamentCompleted) return "FINISHED";
  return "TEED_OFF";
}

export type SyncLeaderboardsResult = {
  tournaments: number;
  entries: number;
  playersCreated: number;
  roundsMaterialized: number;
  resultsMirrored: number;
};

/**
 * Leaderboard-sync for live + nylig fullførte GolfBox-turneringer.
 * Materialiserer PublicPlayerRound og speiler TournamentResult ved linkedUser.
 */
export async function syncGolfBoxLeaderboards(
  prisma: PrismaClient,
  opts: { limit?: number; now?: Date } = {},
): Promise<SyncLeaderboardsResult> {
  const now = opts.now ?? new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let tournaments = await prisma.tournament.findMany({
    where: {
      sourceOrigin: { in: [...GOLFBOX_ORIGINS] },
      sourceId: { not: null },
      OR: [
        { status: "IN_PROGRESS" },
        { status: "COMPLETED", endDate: { gte: sevenDaysAgo } },
      ],
    },
    orderBy: { startDate: "desc" },
  });
  if (opts.limit && opts.limit > 0) tournaments = tournaments.slice(0, opts.limit);

  let entries = 0;
  let playersCreated = 0;
  let roundsMaterialized = 0;
  let resultsMirrored = 0;

  for (const t of tournaments) {
    const competitionId = Number(t.sourceId);
    if (!competitionId) continue;

    const lb = await getLeaderboard(competitionId);
    if (!lb || lb.entries.length === 0) continue;

    const cls = classifyTour(
      t.name,
      t.tour === "junior-no" ? "junior-no" : "amateur-no",
    );
    const completed = t.status === "COMPLETED";
    let norske = 0;

    for (const e of lb.entries) {
      const fullName = `${e.firstName} ${e.lastName}`.trim();
      if (!fullName) continue;
      const country = (e.nationality ?? "").toUpperCase() || "XX";
      if (country === "NO") norske++;

      const { player, created } = await resolvePlayer(prisma, {
        name: fullName,
        country,
        tier: cls.playerTier,
        birthYear: e.birthYear ?? null,
      });
      if (created) playersCreated++;

      const roundsJson = {
        today: e.todayText,
        thru: e.thru,
        thruText: e.thruText,
        roundNames: lb.roundNames,
        roundScores: e.roundScores,
      };

      const entry = await prisma.publicPlayerEntry.upsert({
        where: {
          playerId_tournamentId: {
            playerId: player.id,
            tournamentId: t.id,
          },
        },
        create: {
          playerId: player.id,
          tournamentId: t.id,
          status: entryStatus(e, completed),
          position: e.position,
          scoreToPar: e.toParValue,
          rounds: roundsJson,
        },
        update: {
          status: entryStatus(e, completed),
          position: e.position,
          scoreToPar: e.toParValue,
          rounds: roundsJson,
        },
      });
      entries++;

      const { rounds } = await materializePublicPlayerRounds(prisma, {
        entryId: entry.id,
        roundScores: e.roundScores,
        source: "GOLFBOX",
      });
      roundsMaterialized += rounds;

      const mir = await mirrorTournamentResultForLinkedUser(prisma, {
        tournamentId: t.id,
        publicPlayerId: player.id,
        position: e.position,
        scoreToPar: e.toParValue,
        totalScore: null,
        publicEntryStatus: entryStatus(e, completed),
      });
      if (mir.mirrored) resultsMirrored++;
    }

    await prisma.tournament.update({
      where: { id: t.id },
      data: { norskeAntall: norske, lastSyncAt: now },
    });
  }

  return {
    tournaments: tournaments.length,
    entries,
    playersCreated,
    roundsMaterialized,
    resultsMirrored,
  };
}
