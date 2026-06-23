 
/**
 * Golfstat.com NCAA per-runde brutto-score scraper (STUB — krever Playwright)
 *
 * Status: Skjelett klar. Trenger Playwright-installasjon og
 * faktisk parser-implementasjon mot golfstat.com sin spillerprofil.
 *
 * STRATEGI:
 *   1. For hver norsk college-spiller (PublicPlayer where tier='college')
 *   2. Søk på golfstat.com etter navn + universitet
 *   3. Naviger til spillerprofil
 *   4. Parse "Career Stats" eller per-sesong "Tournament Results"
 *   5. For hver event: hent (tournament, date, position, rounds[score per round])
 *   6. Upsert som Tournament (sourceOrigin=NCAA, tour=ncaa-d1-m/f) +
 *      PublicPlayerEntry med rounds-JSON
 *
 * UTFORDRINGER (krever løsning før produksjon):
 *   - Golfstat har JS-rendret innhold (Playwright nødvendig)
 *   - Søk-mapping mellom navn og golfstat-profil-URL er ikke deterministisk
 *   - 60 spillere × ~30 events × 4 sesonger = ~7200 turnerings-rader
 *   - Rate-limiting + User-Agent rotasjon
 *
 * KOMMANDO NÅR FERDIG:
 *   npm install -D playwright
 *   npx tsx scripts/scrape-golfstat-ncaa.ts --limit=5    # MVP-test
 *   npx tsx scripts/scrape-golfstat-ncaa.ts              # full sync
 *
 * RUNTIME: ~4-6 timer for full sync. Bør flyttes til akgolf-pipelines-repo.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const GOLFSTAT_BASE = "https://www.golfstat.com";
const DELAY_MIN_MS = 3000;
const DELAY_MAX_MS = 7000;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AKGolfBot/1.0 (+akgolf.no)";

// ---------------------------------------------------------------------------
// Stub: Hent norske college-spillere fra DB
// ---------------------------------------------------------------------------

async function hentCollegeSpillere(limit?: number) {
  return prisma.publicPlayer.findMany({
    where: {
      country: "NO",
      tier: "college",
    },
    select: { id: true, slug: true, name: true, bio: true },
    take: limit,
  });
}

function parseUniversity(bio: string | null): string | null {
  if (!bio) return null;
  const match = bio.match(/^([^·]+) · D[123]/);
  return match ? match[1].trim() : null;
}

// ---------------------------------------------------------------------------
// Stub: Scrape én college-spiller på golfstat
// ---------------------------------------------------------------------------

type GolfstatEvent = {
  tournamentName: string;
  date: Date;
  position: number | null;
  totalScore: number | null;
  rounds: Array<{ n: number; score: number }>;
  season: string;
};

async function scrapeGolfstatProfile(
  _name: string,
  _university: string,
): Promise<GolfstatEvent[]> {
  // TODO: Implementér Playwright-flow
  // 1. const browser = await chromium.launch();
  // 2. const page = await browser.newPage({ userAgent: USER_AGENT });
  // 3. await page.goto(GOLFSTAT_BASE + '/search');
  // 4. await page.fill('input[name="q"]', `${name} ${university}`);
  // 5. Klikk første match, naviger til profil
  // 6. Iterer per sesong, parse tournament-tabeller
  // 7. await browser.close();
  console.warn(
    `[scrape-golfstat] STUB — Playwright ikke implementert (referer ${GOLFSTAT_BASE})`,
  );
  return [];
}

// ---------------------------------------------------------------------------
// Stub: Upsert til DB
// ---------------------------------------------------------------------------

async function upsertNcaaEvent(
  _playerId: string,
  _event: GolfstatEvent,
  _gender: "M" | "F",
  _division: string,
): Promise<void> {
  // TODO: Lag Tournament med sourceOrigin="NCAA",
  // tour="ncaa-d1-m" | "ncaa-d1-f" osv, upsert
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

  console.log("Golfstat NCAA scraper STUB");
  console.log(`User-Agent: ${USER_AGENT}`);
  console.log(`Delay: ${DELAY_MIN_MS}-${DELAY_MAX_MS} ms mellom requests\n`);

  const spillere = await hentCollegeSpillere(limit);
  console.log(`Fant ${spillere.length} norske college-spillere i DB\n`);

  let scraped = 0;

  for (const s of spillere) {
    const university = parseUniversity(s.bio);
    if (!university) {
      console.log(`  ${s.name}: kunne ikke parse university, hopper over`);
      continue;
    }

    console.log(`Scraper ${s.name} @ ${university} ...`);
    const events = await scrapeGolfstatProfile(s.name, university);

    for (const e of events) {
      // Parse gender + division fra bio: "University X · D1 · F"
      const divMatch = s.bio?.match(/D(\d)/);
      const genderMatch = s.bio?.match(/· ([MF])\b/);
      const division = divMatch ? `d${divMatch[1]}` : "d1";
      const gender = (genderMatch?.[1] as "M" | "F") ?? "M";
      await upsertNcaaEvent(s.id, e, gender, division);
      scraped++;
    }

    await sleep(randomDelay());
  }

  console.log(`\n✓ Ferdig — ${scraped} events scrapet`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("FEIL:", err);
  process.exit(1);
});
