/**
 * GolfBox-scraper for norske amatør/junior-turneringer (delsystem A).
 *
 * Henter KUN terminliste (kommende turneringer + påmeldingsfrister) fra
 * GolfBox sine offentlige JSON-handlere (scores.golfbox.dk) for norske
 * tour-/føderasjonskunder. Ingen lisens, ingen innlogging.
 *
 * Rettet 27.09.2026 (beslutninger.md §PIPELINES ER ENESTE KILDE, punkt 5):
 * denne skriver IKKE lenger turneringsRESULTATER — det gjør kun
 * ak-golf-pipelines nå. syncGolfBoxLeaderboards er fjernet herfra (definisjonen
 * lever fortsatt i golfbox-sync.ts, kalles bare ikke fra dette skriptet).
 * Lenking (User<->PublicPlayer) og speiling av ALLEREDE innhentede
 * public_player_entries er intern app-logikk, ikke ekstern datainnhenting —
 * den kjører fortsatt.
 *
 * Se docs/turnering-datakilder.md (§ VERIFISERT).
 *
 * Kjøres av GitHub Actions cron + manuelt:
 *   npx tsx scripts/scrape-golfbox.ts
 *
 * Delbar logikk: src/lib/turneringer/golfbox-sync.ts
 * (samme kode som Vercel cron turneringer-ngf for schedule).
 *
 * Idempotent. Logger hver kjøring til AgentRun.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { syncGolfBoxSchedules } from "../src/lib/turneringer/golfbox-sync";
import {
  linkPublicPlayersByExactName,
  backfillTournamentResultsForLinkedUsers,
} from "../src/lib/turneringer/link-public-players";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });


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
  console.log("[golfbox] kalender + frister (resultater kommer fra ak-golf-pipelines)");

  {
    const start = Date.now();
    try {
      const r = await syncGolfBoxSchedules(prisma);
      console.log("[golfbox] schedule:", r);
      const error = r.failedCustomers.length ? new Error(`${r.failedCustomers.length} GolfBox-kunder kunne ikke hentes`) : undefined;
      if (error) process.exitCode = 1;
      await logRun("golfbox-schedule", start, r, error);
    } catch (err) {
      process.exitCode = 1;
      console.error("[golfbox] schedule FEIL:", err);
      await logRun("golfbox-schedule", start, null, err);
    }
  }

  // Intern app-logikk (ikke ekstern datainnhenting): koble User<->PublicPlayer
  // på eksakt navn, og speil ALLEREDE innhentede public_player_entries
  // (skrevet av pipelines) til PlayerHQ-profiler.
  {
    const start = Date.now();
    try {
      const link = await linkPublicPlayersByExactName(prisma);
      const backfill = await backfillTournamentResultsForLinkedUsers(prisma);
      const r = { link, backfill };
      console.log("[golfbox] link+backfill:", r);
      await logRun("golfbox-link-backfill", start, r);
    } catch (err) {
      process.exitCode = 1;
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
