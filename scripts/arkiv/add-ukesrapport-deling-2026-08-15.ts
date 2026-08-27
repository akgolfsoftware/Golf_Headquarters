/**
 * Additiv DDL: ukesrapport_delinger (D3 · deling av ukesdigest).
 *
 * Kjøres kirurgisk mot DIRECT_URL, ikke via `prisma migrate` — se
 * .claude/rules/gotchas.md §Schema-endringer: migrate dev/deploy og db push er
 * alle ødelagte i dette prosjektet. Skriptet rører KUN sin egen tabell.
 *
 *   npx tsx scripts/add-ukesrapport-deling-2026-08-15.ts
 *
 * Idempotent: kan kjøres flere ganger uten effekt.
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
    CREATE TABLE IF NOT EXISTS "ukesrapport_delinger" (
      "id"       TEXT NOT NULL,
      "coachId"  TEXT NOT NULL,
      "playerId" TEXT NOT NULL,
      "ar"       INTEGER NOT NULL,
      "uke"      INTEGER NOT NULL,
      "deltAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ukesrapport_delinger_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "ukesrapport_delinger_playerId_ar_uke_key"
      ON "ukesrapport_delinger" ("playerId", "ar", "uke");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ukesrapport_delinger_coachId_deltAt_idx"
      ON "ukesrapport_delinger" ("coachId", "deltAt");
  `);

  const rader = await prisma.ukesrapportDeling.count();
  console.log(`ukesrapport_delinger OK — ${rader} rader.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
