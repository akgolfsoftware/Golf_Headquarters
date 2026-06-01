/**
 * GolfBox-scraper for norske amatør/junior-turneringer (delsystem A).
 *
 * Henter terminliste + leaderboard fra GolfBox sine offentlige JSON-handlere
 * (scores.golfbox.dk) for norske tour-/føderasjonskunder. Ingen lisens, ingen
 * innlogging. Se docs/turnering-datakilder.md (§ VERIFISERT).
 *
 * Kjøres av GitHub Actions cron + manuelt:
 *   npx tsx scripts/scrape-golfbox.ts                 # schedule + leaderboards
 *   npx tsx scripts/scrape-golfbox.ts --mode=schedule
 *   npx tsx scripts/scrape-golfbox.ts --mode=leaderboards
 *   npx tsx scripts/scrape-golfbox.ts --limit=5       # MVP-test (færre events)
 *
 * Idempotent. Logger hver kjøring til AgentRun (mater CoachHQ Datakilder-siden).
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import {
  getSchedule,
  getLeaderboard,
  type GolfBoxLeaderboardEntry,
} from "../src/lib/scrapers/golfbox";
import {
  NO_TOUR_CUSTOMERS,
  classifyTour,
  golfboxSlugify,
  deriveStatus,
} from "../src/lib/scrapers/golfbox-customers";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const args = process.argv.slice(2);
const MODE =
  (args.find((a) => a.startsWith("--mode="))?.split("=")[1] as
    | "schedule"
    | "leaderboards"
    | "all"
    | undefined) ?? "all";
const LIMIT = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1]) || 0;

const NOW = new Date();

// ---------------------------------------------------------------------------
// AgentRun-logging
// ---------------------------------------------------------------------------

async function logRun(
  agentName: string,
  start: number,
  result: unknown,
  error?: unknown,
): Promise<void> {
  await prisma.agentRun.create({
    data: {
      agentName,
      status: error ? "ERROR" : "OK",
      duration: Date.now() - start,
      output: error ? undefined : (result as object),
      error: error ? String(error instanceof Error ? error.message : error) : null,
    },
  });
}

// ---------------------------------------------------------------------------
// Schedule sync
// ---------------------------------------------------------------------------

async function syncSchedules(): Promise<{ customers: number; events: number }> {
  let events = 0;

  for (const src of NO_TOUR_CUSTOMERS) {
    const sched = await getSchedule(src.customerId);
    for (const e of sched) {
      if (!e.startDate) continue;
      const cls = classifyTour(e.name, src.defaultTour);
      const year = e.startDate.getUTCFullYear();
      const slug = `${golfboxSlugify(e.name)}-${year}`;
      const status = deriveStatus(e.startDate, e.endDate, NOW);
      const format = e.type === "MatchPlay" ? "MATCH" : "STROKE";

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
          lastSyncAt: NOW,
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
          lastSyncAt: NOW,
        },
      });
      events++;
    }
  }

  return { customers: NO_TOUR_CUSTOMERS.length, events };
}

// ---------------------------------------------------------------------------
// Leaderboard sync — kun pågående + nylig fullførte (begrenser API-kall)
// ---------------------------------------------------------------------------

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

async function syncLeaderboards(): Promise<{
  tournaments: number;
  entries: number;
  playersCreated: number;
}> {
  const sevenDaysAgo = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Turneringer fra GolfBox-kildene som er live eller nylig ferdige.
  const origins = ["GOLFBOX", "SRIXON", "NORGESCUP", "OLYO", "MIDAM", "SENIOR", "NM"];
  let tournaments = await prisma.tournament.findMany({
    where: {
      sourceOrigin: { in: origins },
      sourceId: { not: null },
      OR: [
        { status: "IN_PROGRESS" },
        { status: "COMPLETED", endDate: { gte: sevenDaysAgo } },
      ],
    },
    orderBy: { startDate: "desc" },
  });
  if (LIMIT > 0) tournaments = tournaments.slice(0, LIMIT);

  let entries = 0;
  let playersCreated = 0;

  for (const t of tournaments) {
    const competitionId = Number(t.sourceId);
    if (!competitionId) continue;

    const lb = await getLeaderboard(competitionId);
    if (!lb || lb.entries.length === 0) continue;

    const cls = classifyTour(t.name, t.tour === "junior-no" ? "junior-no" : "amateur-no");
    const completed = t.status === "COMPLETED";
    let norske = 0;

    for (const e of lb.entries) {
      const fullName = `${e.firstName} ${e.lastName}`.trim();
      if (!fullName) continue;
      const country = (e.nationality ?? "").toUpperCase() || "XX";
      if (country === "NO") norske++;

      // Finn/opprett spiller (match på slug — navn-basert, ingen stabil GolfBox-id i schema)
      const baseSlug = golfboxSlugify(fullName) || `spiller-${competitionId}-${entries}`;
      let player = await prisma.publicPlayer.findUnique({ where: { slug: baseSlug } });
      if (!player) {
        player = await prisma.publicPlayer.create({
          data: {
            name: fullName,
            slug: baseSlug,
            country,
            tier: cls.playerTier,
            birthYear: e.birthYear ?? null,
          },
        });
        playersCreated++;
      }

      const rounds = {
        today: e.todayText,
        thru: e.thru,
        thruText: e.thruText,
        roundNames: lb.roundNames,
        roundScores: e.roundScores,
      };

      await prisma.publicPlayerEntry.upsert({
        where: { playerId_tournamentId: { playerId: player.id, tournamentId: t.id } },
        create: {
          playerId: player.id,
          tournamentId: t.id,
          status: entryStatus(e, completed),
          position: e.position,
          scoreToPar: e.toParValue,
          rounds,
        },
        update: {
          status: entryStatus(e, completed),
          position: e.position,
          scoreToPar: e.toParValue,
          rounds,
        },
      });
      entries++;
    }

    await prisma.tournament.update({
      where: { id: t.id },
      data: { norskeAntall: norske, lastSyncAt: NOW },
    });
  }

  return { tournaments: tournaments.length, entries, playersCreated };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`[golfbox] mode=${MODE} limit=${LIMIT || "—"}`);

  if (MODE === "schedule" || MODE === "all") {
    const start = Date.now();
    try {
      const r = await syncSchedules();
      console.log("[golfbox] schedule:", r);
      await logRun("golfbox-schedule", start, r);
    } catch (err) {
      console.error("[golfbox] schedule FEIL:", err);
      await logRun("golfbox-schedule", start, null, err);
    }
  }

  if (MODE === "leaderboards" || MODE === "all") {
    const start = Date.now();
    try {
      const r = await syncLeaderboards();
      console.log("[golfbox] leaderboards:", r);
      await logRun("golfbox-leaderboards", start, r);
    } catch (err) {
      console.error("[golfbox] leaderboards FEIL:", err);
      await logRun("golfbox-leaderboards", start, null, err);
    }
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
