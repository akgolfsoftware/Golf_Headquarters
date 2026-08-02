/**
 * Navnevask for PublicPlayer. Idempotent. DRY-RUN som default.
 *
 *   npx tsx scripts/dedupe-player-names.ts          # rapport
 *   npx tsx scripts/dedupe-player-names.ts --apply  # utfør
 *
 * Logikk: src/lib/turneringer/dedupe-player-names.ts
 * Cron: /api/cron/dedupe-player-names (apply=true)
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { runDedupePlayerNames } from "../src/lib/turneringer/dedupe-player-names";

loadEnv({ path: ".env.local" });
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const APPLY = process.argv.includes("--apply");

async function main() {
  console.log(`=== dedupe-player-names ${APPLY ? "(APPLY)" : "(DRY-RUN)"} ===`);
  const r = await runDedupePlayerNames(prisma, { apply: APPLY });

  console.log(`\n[Tier 1 — trygg formaterings-merge]`);
  console.log(`  grupper slått sammen : ${r.mergedGroups}`);
  console.log(`  profiler fjernet     : ${r.mergedProfiles}`);
  console.log(`  entries flyttet      : ${r.movedEntries}`);
  console.log(`  entries droppet (dup): ${r.droppedEntries}`);
  if (r.skippedConflict)
    console.log(
      `  hoppet over (ulik fødselsår/dataGolfId): ${r.skippedConflict} — ${r.skippedNames.slice(0, 5).join(", ")}`,
    );

  console.log(
    `\n[Fase C — navnerens] markører fjernet fra visningsnavn: ${r.renamed}`,
  );
  console.log(
    `\n[Gjenstår til manuell review] middelnavn-varianter (samme fornavn+etternavn, ulikt fullnavn): ${r.fuzzyLeft}`,
  );
  console.log(`\nFerdig.${APPLY ? "" : " Kjør med --apply for å utføre."}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
