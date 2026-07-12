/**
 * scripts/migrate-round-type-2026-07-10.ts
 *
 * Additiv, kirurgisk migrasjon for slag-for-slag SG-føringen:
 * - rounds.roundType TEXT ('turnering' | 'trening') — null = ukjent (alle
 *   eksisterende runder forblir ærlig umerket).
 * Rører KUN egen kolonne. Idempotent (IF NOT EXISTS).
 * Kjøres mot DIRECT_URL via PrismaPg. ALDRI migrate dev/db push.
 *
 * Kjøres med: npx tsx scripts/migrate-round-type-2026-07-10.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  await prisma.$executeRawUnsafe(
    `ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "roundType" TEXT`,
  );
  console.log('OK: ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "roundType" TEXT');

  const kolonner = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'rounds' AND column_name = 'roundType'`,
  );
  console.log(`rounds.roundType: ${kolonner.length}/1`);
  if (kolonner.length !== 1) throw new Error("Kolonne-verifisering feilet");
  console.log("Ferdig — roundType er på plass.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
