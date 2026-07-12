/**
 * scripts/migrate-fys-logging-2026-07-09.ts
 *
 * Additiv, kirurgisk migrasjon for bølge 3 (fysisk logging, jf. gotchas.md):
 * - fys_okter.type (styrke/rotasjon/mobilitet/kondisjon) — TEXT (ikke enum → mest additiv-trygt).
 * - fys_ovelse_rader.loggSettData JSONB — per-sett [{vekt, reps}] for SettRepsLogger.
 * - fys_ovelse_rader intervall/puls (kondisjonsøkter): intervallSerier, intervallMinutter,
 *   pulssone (S1–S5), pause.
 * Tonnasje/volum LAGRES IKKE — beregnes i TonnasjeHero fra sett-data.
 * Rører KUN egne kolonner — ingen drift. Idempotent (ADD COLUMN IF NOT EXISTS).
 * Kjøres mot DIRECT_URL via PrismaPg. ALDRI migrate dev/db push.
 *
 * Kjøres med: npx tsx scripts/migrate-fys-logging-2026-07-09.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const ALTERS: string[] = [
  // Økt-type på fysisk økt (styrke/rotasjon/mobilitet/kondisjon)
  `ALTER TABLE "fys_okter" ADD COLUMN IF NOT EXISTS "type" TEXT`,
  // Ekte per-sett-logging (vekt × reps per sett) — bærer det loggBelastningKg/loggRepsPerSett ikke kan
  `ALTER TABLE "fys_ovelse_rader" ADD COLUMN IF NOT EXISTS "loggSettData" JSONB`,
  // Intervall/puls for kondisjonsøkter
  `ALTER TABLE "fys_ovelse_rader" ADD COLUMN IF NOT EXISTS "intervallSerier" INTEGER`,
  `ALTER TABLE "fys_ovelse_rader" ADD COLUMN IF NOT EXISTS "intervallMinutter" INTEGER`,
  `ALTER TABLE "fys_ovelse_rader" ADD COLUMN IF NOT EXISTS "pulssone" TEXT`,
  `ALTER TABLE "fys_ovelse_rader" ADD COLUMN IF NOT EXISTS "pause" TEXT`,
];

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  for (const sql of ALTERS) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.replace(/\s+/g, " ").slice(0, 90));
  }

  // Etter-verifisering
  const okt = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'fys_okter' AND column_name = 'type'`,
  );
  const rad = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'fys_ovelse_rader'
       AND column_name IN ('loggSettData','intervallSerier','intervallMinutter','pulssone','pause')`,
  );
  console.log(`fys_okter.type: ${okt.length}/1 · fys_ovelse_rader nye: ${rad.length}/5`);
  if (okt.length !== 1 || rad.length !== 5) {
    throw new Error("Kolonne-verifisering feilet");
  }
  console.log("Ferdig — fysisk-logging-felter er på plass.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
