/**
 * Additiv DDL: skoletid_bekreftelser (D6 · skoletidsbekreftelse).
 *
 * Kjøres kirurgisk mot DIRECT_URL, ikke via `prisma migrate` — se
 * .claude/rules/gotchas.md §Schema-endringer. Rører KUN sin egen tabell.
 *
 *   npx tsx scripts/add-skoletid-bekreftelse-2026-08-15.ts
 *
 * Idempotent.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const connectionString = process.env.DIRECT_URL;
  if (!connectionString) throw new Error("DIRECT_URL mangler i .env.local");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "skoletid_bekreftelser" (
      "id"            TEXT NOT NULL,
      "playerId"      TEXT NOT NULL,
      "bekreftetAvId" TEXT NOT NULL,
      "semester"      TEXT NOT NULL,
      "bekreftetAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "skoletid_bekreftelser_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "skoletid_bekreftelser_playerId_semester_key"
      ON "skoletid_bekreftelser" ("playerId", "semester");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "skoletid_bekreftelser_bekreftetAvId_idx"
      ON "skoletid_bekreftelser" ("bekreftetAvId");
  `);

  const rader = await prisma.skoletidBekreftelse.count();
  console.log(`skoletid_bekreftelser OK — ${rader} rader.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
