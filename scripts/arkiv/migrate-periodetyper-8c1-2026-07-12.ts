/**
 * scripts/migrate-periodetyper-8c1-2026-07-12.ts
 *
 * 8c.1-datagrunnmur (Anders' årsplan-bestilling 2026-07-12, plan Del 8c —
 * bestillingen er godkjenningen). Kirurgisk og additivt:
 *  1) LPhase-enum += TESTUKE, FERIE, TRENINGSSAMLING, HELDAGSSAMLING
 *  2) period_blocks += weeklySessionBudget JSONB (øktbudsjett per område)
 *  3) NY tabell group_period_blocks (gruppens egen årsplan) m/ FK til groups
 *
 * NB: ALTER TYPE ADD VALUE kan ikke kjøres i transaksjon — hvert kall er
 * egen autocommit-statement via $executeRawUnsafe.
 * Kjøres med: npx tsx scripts/migrate-periodetyper-8c1-2026-07-12.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  for (const v of ["TESTUKE", "FERIE", "TRENINGSSAMLING", "HELDAGSSAMLING"]) {
    await prisma.$executeRawUnsafe(`ALTER TYPE "LPhase" ADD VALUE IF NOT EXISTS '${v}'`);
    console.log(`enum-verdi OK: ${v}`);
  }

  await prisma.$executeRawUnsafe(
    `ALTER TABLE "period_blocks" ADD COLUMN IF NOT EXISTS "weeklySessionBudget" JSONB`,
  );
  console.log("kolonne OK: period_blocks.weeklySessionBudget");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "group_period_blocks" (
      "id"                  TEXT NOT NULL,
      "groupId"             TEXT NOT NULL,
      "lPhase"              "LPhase" NOT NULL,
      "startDate"           TIMESTAMP(3) NOT NULL,
      "endDate"             TIMESTAMP(3) NOT NULL,
      "focus"               TEXT,
      "weeklyVolMin"        INTEGER,
      "weeklyVolMax"        INTEGER,
      "weeklySessionBudget" JSONB,
      "notes"               TEXT,
      "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"           TIMESTAMP(3) NOT NULL,
      CONSTRAINT "group_period_blocks_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "group_period_blocks_groupId_fkey" FOREIGN KEY ("groupId")
        REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "group_period_blocks_groupId_startDate_idx" ON "group_period_blocks"("groupId", "startDate")`,
  );
  console.log("tabell OK: group_period_blocks");

  // Verifisering
  const enumVerdier = await prisma.$queryRawUnsafe<{ enumlabel: string }[]>(
    `SELECT enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'LPhase' ORDER BY e.enumsortorder`,
  );
  console.log("LPhase i DB:", enumVerdier.map((r) => r.enumlabel).join(", "));
  const kol = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'period_blocks' AND column_name = 'weeklySessionBudget'`,
  );
  const tab = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_period_blocks'`,
  );
  if (enumVerdier.length !== 7 || kol.length !== 1 || tab.length !== 1) throw new Error("Verifisering feilet");
  console.log("Ferdig — 8c.1-grunnmuren er på plass.");
}

main()
  .catch((e) => { console.error("FEIL:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
