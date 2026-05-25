/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * WAGR per-runde brutto-score scraper (STUB — krever Playwright)
 *
 * Status: Skjelett klar. Trenger Playwright-installasjon og
 * faktisk parser-implementasjon mot WAGR sin Next.js-renderede
 * spillerprofil-side.
 *
 * STRATEGI:
 *   1. For hver norsk WAGR-spiller (hentes fra PublicPlayer where bio LIKE '%WAGR%')
 *   2. Naviger til https://www.wagr.com/players/{wagrId}
 *   3. Vent på Next.js-data (window.__NEXT_DATA__ eller hydrated DOM)
 *   4. Parse "Tournament Results"-seksjonen
 *   5. For hver event: hent (event name, date, position, score per round)
 *   6. Upsert som Tournament (sourceOrigin=WAGR) + PublicPlayerEntry med rounds-JSON
 *
 * UTFORDRINGER (krever løsning før produksjon):
 *   - WAGR har anti-bot / rate-limiting (sett User-Agent, jitter delay 2-5s)
 *   - WagrId mangler i PublicPlayer-modellen — må mappes via navn først
 *   - Profilside-strukturen kan endres (bygg robust med fallbacks)
 *   - 100+ spillere × ~30 events = 3000+ profilside-requests (~3 timer)
 *
 * KOMMANDO NÅR FERDIG:
 *   npm install -D playwright
 *   npx tsx scripts/scrape-wagr-rounds.ts --limit=5    # MVP-test
 *   npx tsx scripts/scrape-wagr-rounds.ts              # full sync (langsom)
 *
 * RUNTIME: ~3 timer for full sync. Bør kjøres som nightly cron i
 * akgolf-pipelines-repo (eget Python/TS-prosjekt med dedikert host).
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Konfig
// ---------------------------------------------------------------------------

const WAGR_BASE = "https://www.wagr.com/players";
const DELAY_MIN_MS = 2000;
const DELAY_MAX_MS = 5000;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AKGolfBot/1.0 (+akgolf.no)";

// ---------------------------------------------------------------------------
// Stub: Hent norske WAGR-spillere fra DB
// ---------------------------------------------------------------------------

async function hentWagrSpillere(limit?: number) {
  return prisma.publicPlayer.findMany({
    where: {
      country: "NO",
      bio: { contains: "WAGR" },
    },
    select: { id: true, slug: true, name: true, birthYear: true, ngfId: true },
    take: limit,
  });
}

// ---------------------------------------------------------------------------
// Stub: Scrape én WAGR-spillerprofil
// ---------------------------------------------------------------------------

type WagrEvent = {
  eventName: string;
  date: Date;
  position: number | null;
  rounds: Array<{ n: number; score: number }>;
};

async function scrapeWagrProfile(_wagrId: string): Promise<WagrEvent[]> {
  // TODO: Implementér Playwright-flow
  // 1. const browser = await chromium.launch();
  // 2. const page = await browser.newPage({ userAgent: USER_AGENT });
  // 3. await page.goto(`${WAGR_BASE}/${wagrId}`);
  // 4. await page.waitForSelector('[data-testid="tournament-results"]');
  // 5. const events = await page.$$eval('.event-row', rows => rows.map(parseRow));
  // 6. await browser.close();
  console.warn(
    `[scrape-wagr] STUB — Playwright ikke implementert (referer ${WAGR_BASE}/X)`,
  );
  return [];
}

// ---------------------------------------------------------------------------
// Stub: Upsert til DB
// ---------------------------------------------------------------------------

async function upsertWagrEvent(
  _playerId: string,
  _event: WagrEvent,
): Promise<void> {
  // TODO: Lag Tournament med sourceOrigin="WAGR", upsert
  // PublicPlayerEntry med rounds-JSON.
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay() {
  return DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS);
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;

  console.log("WAGR rundscore-scraper STUB");
  console.log(`User-Agent: ${USER_AGENT}`);
  console.log(`Delay: ${DELAY_MIN_MS}-${DELAY_MAX_MS} ms mellom requests`);
  console.log(`Limit: ${limit ?? "ingen"}\n`);

  const spillere = await hentWagrSpillere(limit);
  console.log(`Fant ${spillere.length} norske WAGR-spillere i DB\n`);

  let scrapedEvents = 0;

  for (const s of spillere) {
    if (!s.ngfId) {
      console.log(`  ${s.name}: mangler WAGR-ID, hopper over`);
      continue;
    }

    console.log(`Scraper ${s.name} (${s.ngfId}) ...`);
    const events = await scrapeWagrProfile(s.ngfId);

    for (const e of events) {
      await upsertWagrEvent(s.id, e);
      scrapedEvents++;
    }

    await sleep(randomDelay());
  }

  console.log(`\n✓ Ferdig — ${scrapedEvents} events scrapet`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("FEIL:", err);
  process.exit(1);
});
