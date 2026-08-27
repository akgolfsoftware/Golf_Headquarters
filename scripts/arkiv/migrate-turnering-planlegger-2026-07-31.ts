/**
 * Additive schema for Turneringsplanlegger.
 * Idempotent. Kjør: npx tsx scripts/migrate-turnering-planlegger-2026-07-31.ts
 */
import "./_env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // Enum-verdi CLAIMED_REGISTERED (Postgres)
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TYPE "TournamentEntryStatus" ADD VALUE IF NOT EXISTS 'CLAIMED_REGISTERED';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Tournament-felt
  await prisma.$executeRawUnsafe(`
    ALTER TABLE tournaments
      ADD COLUMN IF NOT EXISTS "entryCloses" timestamptz,
      ADD COLUMN IF NOT EXISTS "registrationUrl" text,
      ADD COLUMN IF NOT EXISTS "roundDates" jsonb,
      ADD COLUMN IF NOT EXISTS "recommendedLevel" text;
  `);

  // TournamentEntry-felt
  await prisma.$executeRawUnsafe(`
    ALTER TABLE tournament_entries
      ADD COLUMN IF NOT EXISTS "planTier" text NOT NULL DEFAULT 'B',
      ADD COLUMN IF NOT EXISTS "playerClaimedRegisteredAt" timestamptz,
      ADD COLUMN IF NOT EXISTS "playerConfirmedRegisteredAt" timestamptz;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS tournament_entries_user_status_idx
      ON tournament_entries ("userId", "entryStatus");
  `);

  console.log("migrate-turnering-planlegger: OK");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
