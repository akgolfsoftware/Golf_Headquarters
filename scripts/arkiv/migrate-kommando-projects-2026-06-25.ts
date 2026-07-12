/**
 * scripts/migrate-kommando-projects-2026-06-25.ts
 *
 * Additiv migrasjon for AK Agency OS (Kommando) Etappe 2: oppretter
 * kommando_projects via CREATE TABLE IF NOT EXISTS mot DIRECT_URL (jf. gotchas.md).
 * Rører kun egen tabell. Idempotent.
 *
 * Kjøres med: npx tsx scripts/migrate-kommando-projects-2026-06-25.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS "kommando_projects" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "kommando_projects_userId_status_createdAt_idx"
    ON "kommando_projects" ("userId", "status", "createdAt")`,
];

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");
  for (const sql of STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.replace(/\s+/g, " ").slice(0, 70));
  }
  console.log("Ferdig — kommando_projects klar.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
