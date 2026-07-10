/**
 * scripts/migrate-innboks-epost-2026-07-10.ts
 *
 * Additiv, kirurgisk migrasjon for AgencyOS e-post-innboks (jf. gotchas.md):
 * oppretter innboks_epost via CREATE TABLE IF NOT EXISTS mot DIRECT_URL.
 * Rører KUN egen tabell — ingen drift på eksisterende skjema. Idempotent
 * (IF NOT EXISTS). Ingen @relation (isolert, plain-string-kobling).
 *
 * Kjøres med: npx tsx scripts/migrate-innboks-epost-2026-07-10.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS "innboks_epost" (
    "id" TEXT PRIMARY KEY,
    "fraEpost" TEXT NOT NULL,
    "fraNavn" TEXT,
    "emne" TEXT NOT NULL,
    "brodtekst" TEXT NOT NULL,
    "mottattAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'NY',
    "utkastSvar" TEXT,
    "utkastGenerertAt" TIMESTAMP(3),
    "sendtAt" TIMESTAMP(3),
    "sendtAv" TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS "innboks_epost_status_mottattAt_idx"
    ON "innboks_epost" ("status", "mottattAt")`,
];

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  for (const sql of STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.replace(/\s+/g, " ").slice(0, 90));
  }

  // Etter-verifisering
  const kolonner = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'innboks_epost'`,
  );
  console.log(`innboks_epost-kolonner: ${kolonner.length}/11`);
  if (kolonner.length !== 11) {
    throw new Error("Kolonne-verifisering feilet");
  }
  console.log("Ferdig — innboks_epost er på plass.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
