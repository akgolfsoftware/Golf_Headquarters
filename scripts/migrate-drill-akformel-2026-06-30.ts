/**
 * scripts/migrate-drill-akformel-2026-06-30.ts
 *
 * Del B (drill-nivå fordeling) — datafundament. Additiv, kirurgisk migrasjon
 * (jf. gotchas.md). Legger AK-formel per drill på session_drills:
 *   lFase (LFase), miljo (MMiljo), csNivaa (CSNivaa), prPress (PRPress), pPosisjoner (TEXT[])
 * Enum-typene finnes allerede i DB (TrainingDrillV2/TrainingSessionV2 bruker dem) — ingen CREATE TYPE.
 * Rører KUN session_drills, og kun additivt (ADD COLUMN IF NOT EXISTS). csTarget beholdes.
 *
 * Kjøres med: npx tsx scripts/migrate-drill-akformel-2026-06-30.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const ALTERS: string[] = [
  `ALTER TABLE "session_drills" ADD COLUMN IF NOT EXISTS "lFase" "LFase"`,
  `ALTER TABLE "session_drills" ADD COLUMN IF NOT EXISTS "miljo" "MMiljo"`,
  `ALTER TABLE "session_drills" ADD COLUMN IF NOT EXISTS "csNivaa" "CSNivaa"`,
  `ALTER TABLE "session_drills" ADD COLUMN IF NOT EXISTS "prPress" "PRPress"`,
  `ALTER TABLE "session_drills" ADD COLUMN IF NOT EXISTS "pPosisjoner" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`,
];

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  const types = await prisma.$queryRawUnsafe<{ typname: string }[]>(
    `SELECT typname FROM pg_type WHERE typname IN ('LFase','MMiljo','CSNivaa','PRPress')`,
  );
  const found = new Set(types.map((t) => t.typname));
  for (const t of ["LFase", "MMiljo", "CSNivaa", "PRPress"]) {
    if (!found.has(t)) throw new Error(`Enum-type "${t}" mangler i DB — avbryter`);
  }
  console.log("Enum-typer bekreftet:", [...found].join(", "));

  for (const sql of ALTERS) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.replace(/\s+/g, " ").slice(0, 80));
  }

  const cols = await prisma.$queryRawUnsafe<{ column_name: string; data_type: string }[]>(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_name = 'session_drills'
       AND column_name IN ('lFase','miljo','csNivaa','prPress','pPosisjoner')
     ORDER BY column_name`,
  );
  console.log("Kolonner verifisert:");
  for (const c of cols) console.log(`  - ${c.column_name} (${c.data_type})`);
  if (cols.length !== 5) throw new Error(`Forventet 5 kolonner, fant ${cols.length}`);

  console.log("Ferdig — AK-formel per drill er på session_drills.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
