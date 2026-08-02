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
 * Delbar logikk: src/lib/turneringer/golfbox-sync.ts
 * (samme kode som Vercel cron turneringer-ngf for schedule).
 *
 * Idempotent. Logger hver kjøring til AgentRun.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import {
  syncGolfBoxSchedules,
  syncGolfBoxLeaderboards,
} from "../src/lib/turneringer/golfbox-sync";
import {
  linkPublicPlayersByExactName,
  backfillTournamentResultsForLinkedUsers,
} from "../src/lib/turneringer/link-public-players";

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
const LIMIT =
  Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1]) || 0;

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
      error: error
        ? String(error instanceof Error ? error.message : error)
        : null,
    },
  });
}

async function main() {
  console.log(`[golfbox] mode=${MODE} limit=${LIMIT || "—"}`);

  if (MODE === "schedule" || MODE === "all") {
    const start = Date.now();
    try {
      const r = await syncGolfBoxSchedules(prisma);
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
      const r = await syncGolfBoxLeaderboards(prisma, {
        limit: LIMIT || undefined,
      });
      console.log("[golfbox] leaderboards:", r);
      await logRun("golfbox-leaderboards", start, r);
    } catch (err) {
      console.error("[golfbox] leaderboards FEIL:", err);
      await logRun("golfbox-leaderboards", start, null, err);
    }
  }

  // Etter data: eksakt navne-link + speil resultater til PlayerHQ-profiler
  if (MODE === "all" || MODE === "leaderboards") {
    const start = Date.now();
    try {
      const link = await linkPublicPlayersByExactName(prisma);
      const backfill = await backfillTournamentResultsForLinkedUsers(prisma);
      const r = { link, backfill };
      console.log("[golfbox] link+backfill:", r);
      await logRun("golfbox-link-backfill", start, r);
    } catch (err) {
      console.error("[golfbox] link+backfill FEIL:", err);
      await logRun("golfbox-link-backfill", start, null, err);
    }
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
