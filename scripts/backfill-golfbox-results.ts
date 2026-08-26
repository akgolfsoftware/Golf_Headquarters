/**
 * Engangs-backfill: henter resultater for alle GolfBox-turneringer (Olyo, Srixon,
 * Norgescup, Østlandstour m.fl.) som er COMPLETED men aldri fikk
 * public_player_entries — fordi syncGolfBoxLeaderboards() tidligere hadde et
 * 7-dagers tidsvindu som lot enhver slik turnering falle permanent ut av scope
 * (fikset i golfbox-sync.ts, se golfBoxLeaderboardScope). Denne fiksen er
 * selvhelbredende for FREMTIDIGE turneringer via den vanlige timelige jobben —
 * dette scriptet dekker kun det eksisterende etterslepet.
 *
 * Bruk:
 *   npx tsx scripts/backfill-golfbox-results.ts              # dry-run (default) — rapport, ingen skriving
 *   npx tsx scripts/backfill-golfbox-results.ts --apply       # faktisk henting + skriving
 *   npx tsx scripts/backfill-golfbox-results.ts --apply --limit=10   # begrens antall turneringer denne kjøringen
 *   npx tsx scripts/backfill-golfbox-results.ts --apply --alle       # ALLE COMPLETED, også de med entries
 *
 * --alle: re-hent også turneringer som allerede HAR entries. Nødvendig etter
 * klasse-fiksen 25.08.2026 (getLeaderboard henter nå alle brutto-klasser, ikke
 * bare GolfBox' default-klasse) — turneringer synket før fiksen mangler jente-
 * og øvrige ikke-default-klasser selv om de har entries fra default-klassen.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import {
  GOLFBOX_ORIGINS,
  processLeaderboardForTournament,
} from "../src/lib/turneringer/golfbox-sync";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const ALLE = args.includes("--alle");
const LIMIT = args.find((a) => a.startsWith("--limit="))
  ? parseInt(args.find((a) => a.startsWith("--limit="))!.split("=")[1], 10)
  : undefined;

async function main(): Promise<void> {
  console.log(
    ALLE
      ? "=== GolfBox backfill: ALLE COMPLETED-turneringer (også med entries) ==="
      : "=== GolfBox backfill: COMPLETED-turneringer uten resultater ===",
  );
  console.log(APPLY ? "MODUS: --apply (skriver til DB)" : "MODUS: dry-run (ingen skriving)");
  if (LIMIT) console.log(`Maks turneringer denne kjøringen: ${LIMIT}`);
  console.log("");

  const targets = await prisma.tournament.findMany({
    where: {
      sourceOrigin: { in: [...GOLFBOX_ORIGINS] },
      sourceId: { not: null },
      status: "COMPLETED",
      ...(ALLE ? {} : { publicEntries: { none: {} } }),
    },
    select: { id: true, name: true, tour: true, sourceId: true, status: true, sourceOrigin: true, endDate: true },
    // Nyeste først: årets turneringer (der manglene faktisk merkes) fikses tidlig i kjøringen.
    orderBy: { endDate: "desc" },
  });

  const perOrigin = new Map<string, number>();
  for (const t of targets) {
    const key = t.sourceOrigin ?? "UKJENT";
    perOrigin.set(key, (perOrigin.get(key) ?? 0) + 1);
  }

  console.log(`Fant ${targets.length} COMPLETED-turneringer uten resultater:`);
  for (const [origin, count] of [...perOrigin.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${origin.padEnd(12)} ${count}`);
  }
  console.log("");

  if (!APPLY) {
    console.log("Dry-run ferdig. Kjør med --apply for å faktisk hente og skrive resultater.");
    await prisma.$disconnect();
    return;
  }

  const toProcess = LIMIT ? targets.slice(0, LIMIT) : targets;
  const now = new Date();

  let totalEntries = 0;
  let totalPlayersCreated = 0;
  let totalRounds = 0;
  let totalMirrored = 0;
  let ingenLeaderboard = 0;
  let feilet = 0;

  for (const [i, t] of toProcess.entries()) {
    process.stdout.write(`[${i + 1}/${toProcess.length}] ${t.name} (${t.sourceOrigin})... `);
    try {
      const res = await processLeaderboardForTournament(prisma, t, now);
      if (res.entries === 0) {
        ingenLeaderboard++;
        console.log("ingen leaderboard-data funnet");
      } else {
        totalEntries += res.entries;
        totalPlayersCreated += res.playersCreated;
        totalRounds += res.roundsMaterialized;
        totalMirrored += res.resultsMirrored;
        console.log(`${res.entries} entries, ${res.roundsMaterialized} runder`);
      }
    } catch (err) {
      feilet++;
      console.log(`FEIL: ${(err as Error).message}`);
    }
  }

  console.log("\n=== SAMMENDRAG ===");
  console.log(`Turneringer behandlet:     ${toProcess.length}`);
  console.log(`Entries opprettet/oppdatert: ${totalEntries}`);
  console.log(`Nye spillere:              ${totalPlayersCreated}`);
  console.log(`Runder materialisert:      ${totalRounds}`);
  console.log(`TournamentResult speilet:  ${totalMirrored}`);
  console.log(`Ingen leaderboard funnet:  ${ingenLeaderboard}`);
  console.log(`Feilet:                    ${feilet}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal feil:", err);
  process.exit(1);
});
