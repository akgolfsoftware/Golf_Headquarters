/**
 * D4 — legger til `omraade`-kolonnen på test_definitions og backfiller de
 * testene som er entydig avklart i docs/testomrader-forslag-2026-08-15.md.
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md §Schema-endringer). Kirurgisk
 * ALTER TABLE mot DIRECT_URL er den dokumenterte veien for additive endringer.
 *
 * Idempotent — ADD COLUMN IF NOT EXISTS + UPDATE ... WHERE navn stemmer.
 * Trygg å kjøre flere ganger.
 *
 *   npx tsx scripts/add-test-omraade-2026-08-15.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

// Kun testene som er entydig avklart (docs/testomrader-forslag-2026-08-15.md
// del B + de to entydige i del D). FYS-testene skal eksplisitt IKKE ha
// omraade (delferdighet, ikke omrade, v3 §2.3) — de listes ikke her og
// forblir NULL. De 12 gjenstaende (del C + løse tråder i del D) venter på
// Anders' vurdering og forblir også NULL.
const BACKFILL: Record<string, string> = {
  // Del B — entydige (14 tester)
  "Drive treffsikkerhet": "TEE",
  "TN Driver Gate": "TEE",
  "Driver Basic": "TEE",
  "Chip-test 4 m": "CHIP",
  "Pitch 50 m": "PITCH",
  "TN Wedge Gate": "PITCH",
  "Wedge Variation": "PITCH",
  "TN Wedgetest": "PITCH",
  "TN Nærspill Gate": "CHIP",
  "8-ball Blocked": "CHIP",
  "8-ball Variation": "CHIP",
  "Inspill 160m": "INNSPILL_150",
  "Inspill 120m": "INNSPILL_100",
  "Inspill Variation": "INNSPILL_100",
  // Del D — de to entydige (Putt 2 m er markert "Entydig"; TN Slagtest måler
  // jern 7 ≈ 130-150 m, som ligger helt innenfor INNSPILL_100, ikke putt)
  "Putt 2 m": "PUTT_5_10",
  "TN Slagtest": "INNSPILL_100",
};

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE test_definitions ADD COLUMN IF NOT EXISTS omraade text;`,
  );

  let updated = 0;
  for (const [name, omraade] of Object.entries(BACKFILL)) {
    const result = await prisma.testDefinition.updateMany({
      where: { name, isCustom: false },
      data: { omraade },
    });
    if (result.count !== 1) {
      console.warn(`ADVARSEL: "${name}" traff ${result.count} rader (forventet 1)`);
    }
    updated += result.count;
  }

  const total = await prisma.testDefinition.count({ where: { isCustom: false } });
  const medOmraade = await prisma.testDefinition.count({
    where: { isCustom: false, omraade: { not: null } },
  });

  console.log(`omraade-kolonne OK. Backfillet: ${updated}/${Object.keys(BACKFILL).length}.`);
  console.log(`Status: ${medOmraade}/${total} standardtester har omraade (resten venter på Anders).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
