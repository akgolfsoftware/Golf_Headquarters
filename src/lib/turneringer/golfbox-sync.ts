/**
 * Delbar GolfBox-sync for norske amatør/junior-turneringer.
 *
 * Brukes av:
 * - Vercel cron `/api/cron/turneringer-ngf` (schedule + link + backfill)
 * - GitHub Actions `scripts/scrape-golfbox.ts` (schedule + leaderboards)
 *
 * Se docs/turnering-datakilder.md (§ VERIFISERT).
 */

import type { Prisma, PrismaClient } from "@/generated/prisma/client";
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

export const GOLFBOX_ORIGINS = [
  "GOLFBOX",
  "SRIXON",
  "NORGESCUP",
  "OLYO",
  "NARVESEN",
  "MIDAM",
  "SENIOR",
  "NM",
  "OSTLANDS",
  "REGIONTOUR",
] as const;

export type SyncSchedulesResult = {
  customers: number;
  events: number;
  upcoming: number;
  failedCustomers: number[];
};

/** YYYY-MM-DD per dag i [start, end] (inkl.). Max 7 dager for å unngå støy. */
export function deriveRoundDates(start: Date, end: Date | null): string[] {
  const out: string[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  const endT = (end ?? start).getTime();
  let t = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
  );
  const endDay = Date.UTC(
    new Date(endT).getUTCFullYear(),
    new Date(endT).getUTCMonth(),
    new Date(endT).getUTCDate(),
  );
  for (let i = 0; i < 7 && t <= endDay; i++) {
    const d = new Date(t);
    out.push(d.toISOString().slice(0, 10));
    t += dayMs;
  }
  return out;
}

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
  const failedCustomers: number[] = [];

  for (const src of NO_TOUR_CUSTOMERS) {
    let sched: Awaited<ReturnType<typeof getSchedule>>;
    try { sched = await getSchedule(src.customerId); }
    catch { failedCustomers.push(src.customerId); continue; }
    for (const e of sched) {
      if (!e.startDate) continue;
      if (src.onlyMatching && !src.onlyMatching.test(e.name)) continue;

      const cls = classifyTour(e.name, src.defaultTour);
      const year = e.startDate.getUTCFullYear();
      const existing = await prisma.tournament.findFirst({
        where: { sourceOrigin: { in: [...GOLFBOX_ORIGINS] }, sourceId: String(e.competitionId) },
        orderBy: { createdAt: "asc" }, select: { id: true, slug: true, mergedIntoId: true },
      });
      if (existing?.mergedIntoId) continue;
      const slug = existing?.slug ?? `${golfboxSlugify(e.name)}-${year}-golfbox-${e.competitionId}`;
      const status = deriveStatus(e.startDate, e.endDate, now);
      const format = e.type === "MatchPlay" ? "MATCH" : "STROKE";
      const notes = buildNotes({
        region: src.region,
        entryCloses: e.entryCloses,
        entryOpens: e.entryOpens,
      });

      if (status === "UPCOMING") upcoming++;

      // Avled rundedatoer (én per dag i vindu) for planlegger-visning.
      const roundDates = deriveRoundDates(e.startDate, e.endDate);
      const registrationUrl = `https://scores.golfbox.dk/Components/Pages/Competition.aspx?CompetitionId=${e.competitionId}`;

      await prisma.tournament.upsert({
        where: existing ? { id: existing.id } : { slug },
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
          entryCloses: e.entryCloses,
          registrationUrl,
          roundDates,
          officialUrl: registrationUrl,
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
          entryCloses: e.entryCloses,
          registrationUrl,
          roundDates,
          officialUrl: registrationUrl,
        },
      });
      events++;
    }
  }

  return {
    customers: NO_TOUR_CUSTOMERS.length,
    events,
    upcoming,
    failedCustomers,
  };
}

export function entryStatus(
  e: GolfBoxLeaderboardEntry,
  tournamentCompleted: boolean,
): string {
  const p = (e.positionText ?? "").toUpperCase();
  if (p.includes("CUT")) return "CUT";
  if (p.includes("DQ")) return "DQ";
  if (p.includes("WD") || p.includes("RET")) return "WITHDREW";
  if (e.roundCompleted.length > 0 && e.roundCompleted.every(Boolean) && tournamentCompleted) return "FINISHED";
  if (!e.roundScores.some(s => s != null) && !e.thru) return "REGISTERED";
  return "TEED_OFF";
}

export function golfBoxTotal(e: GolfBoxLeaderboardEntry): number | null {
  if (!e.roundScores.length || !e.roundCompleted.every(Boolean) || e.roundCompleted.length !== e.roundScores.length || e.roundScores.some(s => s == null)) return null;
  return e.roundScores.reduce<number>((sum, score) => sum + (score ?? 0), 0);
}

export type SyncLeaderboardsResult = {
  tournaments: number;
  entries: number;
  playersCreated: number;
  roundsMaterialized: number;
  resultsMirrored: number;
  failedTournaments: string[];
};

/** Prisma where-klausul for GolfBox-turneringer som mangler et leaderboard-forsøk akkurat nå. */
export function golfBoxLeaderboardScope(now: Date): Prisma.TournamentWhereInput {
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    sourceOrigin: { in: [...GOLFBOX_ORIGINS] },
    sourceId: { not: null },
    mergedIntoId: null,
    OR: [
      { status: "IN_PROGRESS" },
      { status: "COMPLETED", endDate: { gte: sevenDaysAgo } },
      // Selvhelbredende: COMPLETED uten resultater blir værende i scope uansett
      // alder, i stedet for å falle permanent ut etter 7 dager (se gotchas/feillogg
      // 2026-08-17 — hele fjorårets Olyo/Norgescup/Srixon-sesong forsvant slik).
      { status: "COMPLETED", publicEntries: { none: {} } },
      // Rotasjon over hele arkivet tar også igjen delvise klasser og kildekorrigeringer.
      { status: "COMPLETED", leaderboardSnap: { is: null } },
      { status: "COMPLETED", leaderboardSnap: { fetchedAt: { lt: sevenDaysAgo } } },
    ],
  };
}

/** Øvre grense på hvor mange "COMPLETED uten resultater uansett alder"-turneringer én kjøring henter. */
const BACKFILL_SAFETY_LIMIT = 60;

/**
 * Hent + upsert leaderboard for én turnering. Delt kjerne brukt av både den
 * tilbakevendende syncen og backfill-scriptet.
 */
export async function processLeaderboardForTournament(
  prisma: PrismaClient,
  t: { id: string; name: string; tour: string | null; sourceId: string | null; status: string | null },
  now: Date,
): Promise<{
  entries: number;
  playersCreated: number;
  roundsMaterialized: number;
  resultsMirrored: number;
  incomplete?: boolean;
}> {
  let entries = 0;
  let playersCreated = 0;
  let roundsMaterialized = 0;
  let resultsMirrored = 0;

  const competitionId = Number(t.sourceId);
  if (!competitionId) return { entries, playersCreated, roundsMaterialized, resultsMirrored };

  const lb = await getLeaderboard(competitionId);
  if (!lb || lb.entries.length === 0) {
    await recordGolfBoxAttempt(prisma, t.id, now, { complete: false, empty: true });
    return { entries, playersCreated, roundsMaterialized, resultsMirrored, incomplete: true };
  }

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
      version: 2,
      source: "GOLFBOX",
      fetchedAt: now.toISOString(),
      complete: lb.failedClasses.length === 0,
      positionText: e.grossRanking ? e.positionText : null,
      grossRanking: e.grossRanking,
      today: e.todayText,
      thru: e.thru,
      thruText: e.thruText,
      roundNames: lb.roundNames,
      roundScores: e.roundScores,
      roundToPar: e.roundToPar,
      roundHoles: e.roundHoles,
      roundCompleted: e.roundCompleted,
    };
    const totalScore = golfBoxTotal(e);
    const status = entryStatus(e, completed);
    const result = await prisma.$transaction(async tx => {
    const entry = await tx.publicPlayerEntry.upsert({
      where: {
        playerId_tournamentId: {
          playerId: player.id,
          tournamentId: t.id,
        },
      },
      create: {
        playerId: player.id,
        tournamentId: t.id,
        status,
        position: e.position,
        scoreToPar: e.toParValue,
        totalScore,
        clubName: e.clubName,
        klasseNavn: e.klasseNavn,
        rounds: roundsJson,
      },
      update: {
        status,
        position: e.position,
        scoreToPar: e.toParValue,
        totalScore,
        clubName: e.clubName,
        klasseNavn: e.klasseNavn,
        rounds: roundsJson,
      },
    });
    const { rounds } = await materializePublicPlayerRounds(tx, {
      entryId: entry.id,
      roundScores: e.roundScores,
      source: "GOLFBOX",
      roundToPar: e.roundToPar,
      replace: true,
    });
    const mir = await mirrorTournamentResultForLinkedUser(tx, {
      tournamentId: t.id,
      publicPlayerId: player.id,
      position: e.position,
      scoreToPar: e.toParValue,
      totalScore,
      publicEntryStatus: status,
    });
    return { rounds, mirrored: mir.mirrored };
    });
    entries++;
    roundsMaterialized += result.rounds;
    if (result.mirrored) resultsMirrored++;
  }

  await prisma.tournament.update({
    where: { id: t.id },
    data: { norskeAntall: norske, lastSyncAt: now },
  });
  await recordGolfBoxAttempt(prisma, t.id, now, { complete: lb.failedClasses.length === 0, failedClasses: lb.failedClasses, entries });

  return { entries, playersCreated, roundsMaterialized, resultsMirrored, incomplete: lb.failedClasses.length > 0 };
}

async function recordGolfBoxAttempt(prisma: PrismaClient, tournamentId: string, now: Date, details: Prisma.InputJsonObject) {
  const payload = { version: 2, ...details };
  await prisma.leaderboardSnapshot.upsert({ where: { tournamentId },
    create: { tournamentId, source: "GOLFBOX", fetchedAt: now, payload },
    update: { source: "GOLFBOX", fetchedAt: now, payload },
  });
}

export type LeaderboardScopeCandidate = {
  status: string | null;
  endDate: Date | null;
};

/**
 * Del kandidatlisten (allerede filtrert av golfBoxLeaderboardScope) i "live/nylig"
 * (aldri kuttet) og "backfill" (eldre COMPLETED uten resultater, kuttet ved
 * BACKFILL_SAFETY_LIMIT). Ren funksjon — testbar uten DB.
 */
export function partitionLiveRecentAndBackfill<T extends LeaderboardScopeCandidate>(
  candidates: T[],
  now: Date,
): { liveOrRecent: T[]; backfill: T[] } {
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const liveOrRecent = candidates.filter(
    (t) =>
      t.status === "IN_PROGRESS" ||
      (t.status === "COMPLETED" && t.endDate != null && t.endDate.getTime() >= sevenDaysAgo.getTime()),
  );
  const backfill = candidates.filter((t) => !liveOrRecent.includes(t));
  return { liveOrRecent, backfill };
}

/**
 * Leaderboard-sync for live + nylig fullførte GolfBox-turneringer, pluss en
 * selvhelbredende backfill-gren for eldre COMPLETED-turneringer som aldri fikk
 * resultater (se golfBoxLeaderboardScope).
 */
export async function syncGolfBoxLeaderboards(
  prisma: PrismaClient,
  opts: { limit?: number; now?: Date } = {},
): Promise<SyncLeaderboardsResult> {
  const now = opts.now ?? new Date();

  const candidates = await prisma.tournament.findMany({
    where: golfBoxLeaderboardScope(now),
    orderBy: [{ startDate: "desc" }, { id: "asc" }],
    include: { leaderboardSnap: { select: { fetchedAt: true } } },
  });

  // IN_PROGRESS / nylig COMPLETED er alltid en liten, tidsbegrenset mengde og
  // skal aldri kuttes. Sikkerhetsgrensen gjelder kun backfill-grenen (eldre
  // COMPLETED-turneringer uten resultater), slik at én time med feil på mange
  // gamle turneringer aldri lar jobben vokse ukontrollert.
  candidates.sort((a, b) => (a.leaderboardSnap?.fetchedAt.getTime() ?? 0) - (b.leaderboardSnap?.fetchedAt.getTime() ?? 0));
  const { liveOrRecent, backfill } = partitionLiveRecentAndBackfill(candidates, now);
  let tournaments = [...liveOrRecent, ...backfill.slice(0, BACKFILL_SAFETY_LIMIT)];

  if (opts.limit && opts.limit > 0) tournaments = tournaments.slice(0, opts.limit);

  let entries = 0;
  let playersCreated = 0;
  let roundsMaterialized = 0;
  let resultsMirrored = 0;
  const failedTournaments: string[] = [];

  for (const t of tournaments) {
    try {
    const res = await processLeaderboardForTournament(prisma, t, now);
    entries += res.entries;
    playersCreated += res.playersCreated;
    roundsMaterialized += res.roundsMaterialized;
    resultsMirrored += res.resultsMirrored;
    if (res.incomplete) failedTournaments.push(t.id);
    } catch {
      failedTournaments.push(t.id);
      await recordGolfBoxAttempt(prisma, t.id, now, { complete: false, failed: true });
    }
  }

  return {
    tournaments: tournaments.length,
    entries,
    playersCreated,
    roundsMaterialized,
    resultsMirrored,
    failedTournaments,
  };
}
