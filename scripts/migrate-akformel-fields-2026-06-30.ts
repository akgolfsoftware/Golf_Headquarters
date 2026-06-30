/**
 * scripts/migrate-akformel-fields-2026-06-30.ts
 *
 * Fase 0 — AK-formel datakontrakt. Additiv, kirurgisk migrasjon (jf. gotchas.md:
 * migrate dev / db push er blokkert). Legger fire metodikk-felt på
 * training_plan_sessions så Workbench kan persistere hele AK-formelen:
 *   lFase (LFase), miljo (MMiljo), csNivaa (CSNivaa), pPosisjoner (TEXT[])
 * Enum-typene finnes allerede i DB (TrainingSessionV2 bruker dem) — ingen CREATE TYPE.
 * Rører KUN training_plan_sessions, og kun additivt (ADD COLUMN IF NOT EXISTS).
 *
 * Kjøres med: npx tsx scripts/migrate-akformel-fields-2026-06-30.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const ALTERS: string[] = [
  `ALTER TABLE "training_plan_sessions" ADD COLUMN IF NOT EXISTS "lFase" "LFase"`,
  `ALTER TABLE "training_plan_sessions" ADD COLUMN IF NOT EXISTS "miljo" "MMiljo"`,
  `ALTER TABLE "training_plan_sessions" ADD COLUMN IF NOT EXISTS "csNivaa" "CSNivaa"`,
  `ALTER TABLE "training_plan_sessions" ADD COLUMN IF NOT EXISTS "pPosisjoner" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`,
];

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  // 1) Bekreft at enum-typene finnes (skal alt være der via TrainingSessionV2).
  const types = await prisma.$queryRawUnsafe<{ typname: string }[]>(
    `SELECT typname FROM pg_type WHERE typname IN ('LFase','MMiljo','CSNivaa')`,
  );
  const found = new Set(types.map((t) => t.typname));
  for (const t of ["LFase", "MMiljo", "CSNivaa"]) {
    if (!found.has(t)) throw new Error(`Enum-type "${t}" mangler i DB — avbryter (skulle finnes via V2)`);
  }
  console.log("Enum-typer bekreftet:", [...found].join(", "));

  // 2) Legg til kolonnene additivt.
  for (const sql of ALTERS) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.replace(/\s+/g, " ").slice(0, 80));
  }

  // 3) Verifiser at de fire kolonnene nå finnes.
  const cols = await prisma.$queryRawUnsafe<{ column_name: string; data_type: string }[]>(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_name = 'training_plan_sessions'
       AND column_name IN ('lFase','miljo','csNivaa','pPosisjoner')
     ORDER BY column_name`,
  );
  console.log("Kolonner verifisert:");
  for (const c of cols) console.log(`  - ${c.column_name} (${c.data_type})`);
  if (cols.length !== 4) throw new Error(`Forventet 4 kolonner, fant ${cols.length}`);

  console.log("Ferdig — AK-formel-feltene er på training_plan_sessions.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
