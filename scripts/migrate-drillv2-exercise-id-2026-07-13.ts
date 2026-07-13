/**
 * scripts/migrate-drillv2-exercise-id-2026-07-13.ts
 *
 * Kirurgisk additiv migrasjon (gotchas.md): kobler live-øktenes driller
 * (training_drills_v2) til øvelsesbanken (exercise_definitions) med nullable
 * "exerciseId" + indeks + FK (ON DELETE SET NULL). Bølge 4 i
 * mobil/desktop-forbedringene (PR #10).
 *
 * MERK: SQL-en ble kjørt mot prod 2026-07-13 via Supabase MCP
 * (apply_migration: add_exercise_id_to_training_drills_v2). Scriptet her er
 * dokumentasjon + idempotent re-kjøring for andre miljøer.
 * Kjøres med: npx tsx scripts/migrate-drillv2-exercise-id-2026-07-13.ts
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
    `ALTER TABLE "training_drills_v2" ADD COLUMN IF NOT EXISTS "exerciseId" TEXT;`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "training_drills_v2_exerciseId_idx" ON "training_drills_v2"("exerciseId");`,
  );
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'training_drills_v2_exerciseId_fkey'
      ) THEN
        ALTER TABLE "training_drills_v2"
          ADD CONSTRAINT "training_drills_v2_exerciseId_fkey"
          FOREIGN KEY ("exerciseId") REFERENCES "exercise_definitions"("id")
          ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  console.log("OK: training_drills_v2.exerciseId + indeks + FK er på plass.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
