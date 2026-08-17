/**
 * Golfstat.com NCAA per-runde brutto-score-importer.
 *
 * Supplement til scripts/import-clippd-college.ts — dekker turneringer/spillere
 * Clippd ikke har. Ren fetch (src/lib/golfstat/golfstat-client.ts), ingen
 * Playwright — verifisert 2026-08-17 at hele pipelinen (turneringsindeks,
 * runde-for-runde brutto-score) er statisk, server-rendret HTML.
 *
 * Strategi:
 *   1. Hent alle aktive/nylige turnerings-ID-er fra golfstat.com forsiden.
 *   2. For hver turnering: hent full spillerliste med runde-for-runde brutto.
 *   3. Match hver spiller mot kjente norske college-spillere (PublicPlayer
 *      tier='college', country='NO') med navnLikhet() (samme matcher som
 *      Clippd-importeren). Kun treff ≥ 0.5 beholdes.
 *   4. Upsert Tournament (sourceOrigin="NCAA", sourceId="golfstat-{tid}" — eget
 *      navnerom fra Clippds "clippd-{id}", slik at de aldri kolliderer på
 *      sourceId selv om det er samme reelle turnering fra to kilder).
 *
 * Bruk:
 *   npx tsx scripts/scrape-golfstat-ncaa.ts --dry-run      # rapport, ingen skriving
 *   npx tsx scripts/scrape-golfstat-ncaa.ts --apply         # faktisk skriving
 *   npx tsx scripts/scrape-golfstat-ncaa.ts --apply --limit=10   # begrens antall turneringer
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import {
  getActiveTournamentIds,
  getTournamentInfo,
  getPlayerScores,
} from "../src/lib/golfstat/golfstat-client";
import { navnLikhet } from "../src/lib/scrapers/navn-matching";
import { materializePublicPlayerRounds } from "../src/lib/turneringer/materialize-entry";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const LIMIT = args.find((a) => a.startsWith("--limit="))
  ? parseInt(args.find((a) => a.startsWith("--limit="))!.split("=")[1], 10)
  : undefined;

// navnLikhet() er bygget for Clippds bruk: rangere et lite sett SØKERESULTATER
// for ett bestemt navn. Her sveipes den i stedet mot store, ukjente feltvis-lister
// (60-150 spillere per turnering) — da gir 0.5 mange falske treff på felles
// fornavn alene (f.eks. "Thomas Hurley" → "Thomas Tollefsen" scoret 0.65 i
// verifisering 2026-08-17, ren tilfeldighet på "Thomas"). Observert klart skille
// i ekte data: falske treff endte på 0.53-0.65, ekte treff (samme person, kort
// mellomnavn-variant) på 0.77+. 0.75 er satt bevisst konservativt — heller
// glipp et ekte treff enn å skrive feil resultat på en navngitt spiller.
const MIN_MATCH_SCORE = 0.75;

async function main(): Promise<void> {
  console.log("=== Golfstat NCAA-importer ===");
  console.log(APPLY ? "MODUS: --apply (skriver til DB)" : "MODUS: dry-run (ingen skriving)");
  if (LIMIT) console.log(`Maks turneringer denne kjøringen: ${LIMIT}`);
  console.log("");

  const norskeSpillere = await prisma.publicPlayer.findMany({
    where: { country: "NO", tier: "college", isActive: true },
    select: { id: true, name: true },
  });
  console.log(`${norskeSpillere.length} norske college-spillere i DB å matche mot\n`);

  if (norskeSpillere.length === 0) {
    console.log("Ingen norske college-spillere å matche mot — avslutter.");
    await prisma.$disconnect();
    return;
  }

  const tournamentIds = await getActiveTournamentIds();
  const toProcess = LIMIT ? tournamentIds.slice(0, LIMIT) : tournamentIds;
  console.log(`Fant ${tournamentIds.length} turnerings-ID-er på golfstat.com (behandler ${toProcess.length})\n`);

  let tournamentsWithNorwegians = 0;
  let entriesUpserted = 0;
  let roundsMaterialized = 0;
  let skippedExisting = 0;

  for (const tid of toProcess) {
    const [info, players] = await Promise.all([getTournamentInfo(tid), getPlayerScores(tid)]);
    if (!info || players.length === 0) continue;

    const matches = players
      .map((p) => {
        let best = { player: norskeSpillere[0], score: 0 };
        for (const sp of norskeSpillere) {
          const score = navnLikhet(p.playerName, sp.name);
          if (score > best.score) best = { player: sp, score };
        }
        return { golfstatRow: p, match: best };
      })
      .filter((m) => m.match.score >= MIN_MATCH_SCORE);

    if (matches.length === 0) continue;
    tournamentsWithNorwegians++;

    console.log(
      `[tid ${tid}] "${info.name}": ${matches.length} norske treff av ${players.length} spillere`,
    );
    for (const { golfstatRow, match } of matches) {
      console.log(
        `  ${golfstatRow.playerName} → ${match.player.name} (score ${match.score.toFixed(2)}), R: ${golfstatRow.roundScores.join(",")}`,
      );
    }

    if (!APPLY) continue;

    const sourceId = `golfstat-${tid}`;
    const existing = await prisma.tournament.findFirst({ where: { sourceId }, select: { id: true } });
    if (existing) {
      skippedExisting++;
      continue; // enkel idempotens — full oppdateringslogikk kan legges til senere ved behov
    }
    if (!info.date) continue;

    const slug = `${info.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-golfstat-${tid}`;
    const tournament = await prisma.tournament.create({
      data: {
        name: info.name,
        slug,
        startDate: info.date,
        endDate: info.date,
        format: "STROKE",
        sourceOrigin: "NCAA",
        sourceId,
        tour: "college",
        status: "COMPLETED",
        lastSyncAt: new Date(),
      },
    });

    for (const { golfstatRow, match } of matches) {
      const entry = await prisma.publicPlayerEntry.upsert({
        where: { playerId_tournamentId: { playerId: match.player.id, tournamentId: tournament.id } },
        create: {
          playerId: match.player.id,
          tournamentId: tournament.id,
          status: "FINISHED",
          position: golfstatRow.position,
          scoreToPar: null,
          rounds: { totalScore: golfstatRow.total, roundScores: golfstatRow.roundScores },
        },
        update: {
          status: "FINISHED",
          position: golfstatRow.position,
          rounds: { totalScore: golfstatRow.total, roundScores: golfstatRow.roundScores },
        },
      });
      entriesUpserted++;

      const { rounds } = await materializePublicPlayerRounds(prisma, {
        entryId: entry.id,
        roundScores: golfstatRow.roundScores,
        source: "NCAA",
      });
      roundsMaterialized += rounds;
    }
  }

  console.log("\n=== SAMMENDRAG ===");
  console.log(`Turneringer med norske spillere: ${tournamentsWithNorwegians}`);
  console.log(`Entries upsert:                  ${entriesUpserted}`);
  if (APPLY) {
    console.log(`Runder materialisert:            ${roundsMaterialized}`);
    console.log(`Hoppet over (fantes fra før):    ${skippedExisting}`);
  } else {
    console.log("\nDry-run ferdig. Kjør med --apply for å faktisk skrive.");
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal feil:", err);
  process.exit(1);
});
