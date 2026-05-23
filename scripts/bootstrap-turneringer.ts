/**
 * Initial bootstrap av /turneringer-data.
 * Kjør én gang etter første deploy: `npx tsx scripts/bootstrap-turneringer.ts`
 *
 * Etter dette tar Vercel-cron over.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import {
  syncDataGolfSchedules,
  syncNorwegianPlayers,
  syncLiveLeaderboards,
} from "@/lib/turneringer/sync";

async function main() {
  console.log("Bootstrap /turneringer...");

  console.log("\n1. Syncer DataGolf-schedule (6 tours)...");
  const sch = await syncDataGolfSchedules();
  console.log(`   ✓ ${sch.events} events, ${sch.tours} tours`);

  console.log("\n2. Syncer norske spillere fra DataGolf...");
  const pl = await syncNorwegianPlayers();
  console.log(`   ✓ ${pl.added} nye, ${pl.updated} oppdatert`);

  console.log("\n3. Syncer live leaderboards...");
  const lb = await syncLiveLeaderboards();
  console.log(`   ✓ ${lb.entries} entries`);

  console.log("\nBootstrap ferdig.");
  process.exit(0);
}

main().catch((err) => {
  console.error("FEIL:", err);
  process.exit(1);
});
