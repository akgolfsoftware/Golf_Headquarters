/**
 * WAGR-turneringssynk: oppdager norske WAGR-spillere OG henter fulle
 * turneringsresultater (runde-for-runde brutto) — ett event-drevet script.
 *
 * Bakgrunn (verifisert 2026-08-17): wagr_snapshots var tom i prod og hadde
 * ingen automatisk oppdagelses-mekanisme. Playwright viste seg IKKE nødvendig
 * i drift — både spillerens turneringsliste og hvert events fulle leaderboard
 * (inkl. runde-for-runde brutto) hentes med ren fetch (se src/lib/wagr/wagr-client.ts).
 *
 * Strategi (breddeorientert, selv-utvidende):
 *   1. Start med et lite sett kjente norske WAGR-spiller-ID-er (bootstrap).
 *   2. For hver spiller: hent turneringslisten (getPlayerEvents).
 *   3. For hvert IKKE besøkt event: hent fullt leaderboard (getEventLeaderboard).
 *      Alle deltagere med nationality="Norway" prosesseres — ikke bare spilleren
 *      vi startet fra — det er SLIK nye norske spillere oppdages organisk.
 *   4. Nye norske spillere legges i køen (breddeutvidelse), opp til --limit.
 *   5. Upsert Tournament(sourceOrigin="WAGR") + PublicPlayerEntry + runder for
 *      hver norsk deltager, via samme resolvePlayer()/materializePublicPlayerRounds()
 *      som GolfBox-pipelinen (unngår dobbel spillermatching-logikk).
 *
 * Bruk:
 *   npx tsx scripts/sync-wagr-results.ts                   # dry-run (default), maks 20 spillere
 *   npx tsx scripts/sync-wagr-results.ts --apply            # faktisk skriving
 *   npx tsx scripts/sync-wagr-results.ts --apply --limit=50 # utvid volumtaket
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import {
  getPlayerEvents,
  getEventLeaderboard,
  buildWagrPlayerSlug,
} from "../src/lib/wagr/wagr-client";
import { resolvePlayer } from "../src/lib/scrapers/player-resolve";
import { materializePublicPlayerRounds } from "../src/lib/turneringer/materialize-entry";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const LIMIT = args.find((a) => a.startsWith("--limit="))
  ? parseInt(args.find((a) => a.startsWith("--limit="))!.split("=")[1], 10)
  : 20;

// Bootstrap: kjente norske WAGR-spiller-ID-er (fra scripts/seed-wagr-benchmark.ts,
// re-verifisert mai 2026). Kun mathias-aase-41993 er bekreftet aktiv (200) i denne
// økten — de øvrige tre kan ha gått ut av rankingen (302 = proff, se
// wagr-borte-betyr-proff-regelen) og hoppes automatisk over.
const BOOTSTRAP_WAGR_IDS = [41993, 40145, 39620]; // Mathias Aase, Marcus Audun Goosen, Benjamin Killingstad

const PAUSE_MS = 700; // samme presedens som wagr-sync.ts

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isNorwegian(nationality: string | null): boolean {
  return (nationality ?? "").trim().toLowerCase() === "norway";
}

async function main(): Promise<void> {
  console.log("=== WAGR-turneringssynk ===");
  console.log(APPLY ? "MODUS: --apply (skriver til DB)" : "MODUS: dry-run (ingen skriving)");
  console.log(`Maks spillere denne kjøringen: ${LIMIT}\n`);

  const visitedPlayerIds = new Set<number>();
  const visitedEventLinks = new Set<string>();
  const queue: number[] = [...BOOTSTRAP_WAGR_IDS];

  let tournamentsUpserted = 0;
  let entriesUpserted = 0;
  let roundsMaterialized = 0;
  let playersCreated = 0;
  let playersDiscovered = 0;
  let eventsProcessed = 0;
  let eventsSkipped = 0;

  while (queue.length > 0 && visitedPlayerIds.size < LIMIT) {
    const wagrPlayerId = queue.shift()!;
    if (visitedPlayerIds.has(wagrPlayerId)) continue;
    visitedPlayerIds.add(wagrPlayerId);

    let events;
    try {
      await sleep(PAUSE_MS);
      events = await getPlayerEvents(wagrPlayerId);
    } catch (err) {
      console.log(`  [wagrId ${wagrPlayerId}] feil ved henting av events: ${(err as Error).message}`);
      continue;
    }

    console.log(`[wagrId ${wagrPlayerId}] ${events.length} turneringer registrert`);

    for (const ev of events) {
      if (visitedEventLinks.has(ev.eventDetailsLink)) continue;
      visitedEventLinks.add(ev.eventDetailsLink);

      await sleep(PAUSE_MS);
      const lb = await getEventLeaderboard(ev.eventDetailsLink).catch(() => null);
      if (!lb) {
        eventsSkipped++;
        continue;
      }
      eventsProcessed++;

      const norwegian = lb.results.filter((r) => isNorwegian(r.nationality));
      if (norwegian.length === 0) continue;

      console.log(
        `  event "${lb.details.eventName}" (${ev.eventDetailsLink}): ${norwegian.length} norske deltagere`,
      );

      if (!APPLY) {
        for (const r of norwegian) {
          if (!visitedPlayerIds.has(r.wagrPlayerId) && !queue.includes(r.wagrPlayerId)) {
            queue.push(r.wagrPlayerId);
            playersDiscovered++;
          }
        }
        tournamentsUpserted++;
        entriesUpserted += norwegian.length;
        continue;
      }

      if (!lb.details.startDate) {
        console.log(`  [hopper over] "${lb.details.eventName}" mangler startdato`);
        continue;
      }

      // --apply: faktisk skriving
      const slug = `wagr-${ev.eventDetailsLink}`;
      const tournament = await prisma.tournament.upsert({
        where: { slug },
        create: {
          name: lb.details.eventName,
          slug,
          startDate: lb.details.startDate,
          endDate: lb.details.endDate,
          format: "STROKE",
          sourceOrigin: "WAGR",
          sourceId: ev.eventDetailsLink,
          tour: "amateur-no",
          country: "NO",
          status: "COMPLETED",
          lastSyncAt: new Date(),
        },
        update: {
          name: lb.details.eventName,
          startDate: lb.details.startDate,
          endDate: lb.details.endDate ?? undefined,
          lastSyncAt: new Date(),
        },
      });
      tournamentsUpserted++;

      for (const r of norwegian) {
        const { player, created } = await resolvePlayer(prisma, {
          name: r.playerName,
          country: "NO",
          tier: "amateur",
        });
        if (created) playersCreated++;

        const fresh = await prisma.publicPlayer.findUnique({
          where: { id: player.id },
          select: { wagrId: true },
        });
        if (!fresh?.wagrId) {
          const wagrSlug = buildWagrPlayerSlug(r.playerName, r.wagrPlayerId);
          await prisma.publicPlayer
            .update({ where: { id: player.id }, data: { wagrId: wagrSlug } })
            .catch(() => {
              // wagrId allerede brukt av en annen rad (sjelden race) — ikke fatalt.
            });
        }

        const entry = await prisma.publicPlayerEntry.upsert({
          where: { playerId_tournamentId: { playerId: player.id, tournamentId: tournament.id } },
          create: {
            playerId: player.id,
            tournamentId: tournament.id,
            status: "FINISHED",
            position: parseInt(r.finishPosition ?? "", 10) || null,
            scoreToPar: null,
            rounds: { totalScore: r.totalScore, roundScores: r.roundScores },
          },
          update: {
            status: "FINISHED",
            position: parseInt(r.finishPosition ?? "", 10) || null,
            rounds: { totalScore: r.totalScore, roundScores: r.roundScores },
          },
        });
        entriesUpserted++;

        const { rounds } = await materializePublicPlayerRounds(prisma, {
          entryId: entry.id,
          roundScores: r.roundScores,
          source: "WAGR",
        });
        roundsMaterialized += rounds;

        if (!visitedPlayerIds.has(r.wagrPlayerId) && !queue.includes(r.wagrPlayerId)) {
          queue.push(r.wagrPlayerId);
          playersDiscovered++;
        }
      }
    }
  }

  console.log("\n=== SAMMENDRAG ===");
  console.log(`Spillere besøkt:           ${visitedPlayerIds.size}`);
  console.log(`Nye spillere oppdaget (kø): ${playersDiscovered}`);
  console.log(`Events behandlet:          ${eventsProcessed}`);
  console.log(`Events hoppet over:        ${eventsSkipped}`);
  console.log(`Turneringer upsert:        ${tournamentsUpserted}`);
  console.log(`Entries upsert:            ${entriesUpserted}`);
  if (APPLY) {
    console.log(`Nye PublicPlayer:          ${playersCreated}`);
    console.log(`Runder materialisert:      ${roundsMaterialized}`);
  } else {
    console.log("\nDry-run ferdig. Kjør med --apply for å faktisk skrive.");
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal feil:", err);
  process.exit(1);
});
