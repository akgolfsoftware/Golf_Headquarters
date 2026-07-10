/**
 * scripts/migrate-app-feedback-2026-07-10.ts
 *
 * Additiv, kirurgisk migrasjon for AppFeedback (spor F6, jf. gotchas.md):
 * oppretter app_feedback via CREATE TABLE IF NOT EXISTS mot DIRECT_URL.
 * Rører KUN egen tabell — ingen drift på eksisterende skjema. Idempotent
 * (IF NOT EXISTS). Ingen @relation (isolert, plain-string-kobling).
 *
 * Kjøres med: npx tsx scripts/migrate-app-feedback-2026-07-10.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS "app_feedback" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tekst" TEXT NOT NULL,
    "side" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "app_feedback_status_createdAt_idx"
    ON "app_feedback" ("status", "createdAt")`,
];

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  for (const sql of STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.replace(/\s+/g, " ").slice(0, 90));
  }

  // Etter-verifisering
  const kolonner = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'app_feedback'`,
  );
  console.log(`app_feedback-kolonner: ${kolonner.length}/7`);
  if (kolonner.length !== 7) {
    throw new Error("Kolonne-verifisering feilet");
  }
  console.log("Ferdig — app_feedback er på plass.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
