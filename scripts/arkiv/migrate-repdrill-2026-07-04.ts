/**
 * scripts/migrate-repdrill-2026-07-04.ts
 *
 * Additiv, kirurgisk migrasjon for bølge 2 (drill-nivå datamodell, jf. gotchas.md):
 * - Ny enum-type RepType (de fire låste rep-typene).
 * - Rep-type + volum-kolonner på session_drills OG training_drills_v2.
 * - pyramidArea + skillArea på session_drills (alle-seks-per-drill).
 * Kjøres mot DIRECT_URL via PrismaPg-adapter. Rører KUN egne kolonner/typer —
 * ingen drift på eksisterende skjema. Idempotent (IF NOT EXISTS / guardet CREATE TYPE).
 *
 * Kjøres med: npx tsx scripts/migrate-repdrill-2026-07-04.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

// CREATE TYPE har ingen IF NOT EXISTS — guardes i en DO-blokk.
const CREATE_ENUM = `
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RepType') THEN
    CREATE TYPE "RepType" AS ENUM ('SVINGER_UTEN_BALL', 'BALLER_SLATT', 'TID', 'SETT_REPS');
  END IF;
END $$;`;

const ALTERS: string[] = [
  // session_drills — alle-seks-per-drill + rep-type/volum
  `ALTER TABLE "session_drills" ADD COLUMN IF NOT EXISTS "pyramidArea" "PyramidArea"`,
  `ALTER TABLE "session_drills" ADD COLUMN IF NOT EXISTS "skillArea" "SkillArea"`,
  `ALTER TABLE "session_drills" ADD COLUMN IF NOT EXISTS "repType" "RepType"`,
  `ALTER TABLE "session_drills" ADD COLUMN IF NOT EXISTS "repAntall" INTEGER`,
  `ALTER TABLE "session_drills" ADD COLUMN IF NOT EXISTS "repMinutter" INTEGER`,
  `ALTER TABLE "session_drills" ADD COLUMN IF NOT EXISTS "repSett" INTEGER`,
  `ALTER TABLE "session_drills" ADD COLUMN IF NOT EXISTS "repReps" INTEGER`,
  // training_drills_v2 — rep-type/volum (aksene finnes alt)
  `ALTER TABLE "training_drills_v2" ADD COLUMN IF NOT EXISTS "repType" "RepType"`,
  `ALTER TABLE "training_drills_v2" ADD COLUMN IF NOT EXISTS "repAntall" INTEGER`,
  `ALTER TABLE "training_drills_v2" ADD COLUMN IF NOT EXISTS "repMinutter" INTEGER`,
  `ALTER TABLE "training_drills_v2" ADD COLUMN IF NOT EXISTS "repSett" INTEGER`,
  `ALTER TABLE "training_drills_v2" ADD COLUMN IF NOT EXISTS "repReps" INTEGER`,
];

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  // 1. Enum
  await prisma.$executeRawUnsafe(CREATE_ENUM);
  console.log("OK: RepType-enum bekreftet/opprettet");

  // 2. Pre-sjekk at enum-typene ALTER-ene refererer finnes
  const types = await prisma.$queryRawUnsafe<{ typname: string }[]>(
    `SELECT typname FROM pg_type WHERE typname IN ('PyramidArea','SkillArea','RepType')`,
  );
  const found = new Set(types.map((t) => t.typname));
  for (const t of ["PyramidArea", "SkillArea", "RepType"]) {
    if (!found.has(t)) throw new Error(`Enum-type "${t}" mangler i DB — avbryter`);
  }
  console.log("Enum-typer bekreftet:", [...found].join(", "));

  // 3. Kolonner
  for (const sql of ALTERS) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.replace(/\s+/g, " ").slice(0, 80));
  }

  // 4. Etter-verifisering
  const sd = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'session_drills'
       AND column_name IN ('pyramidArea','skillArea','repType','repAntall','repMinutter','repSett','repReps')`,
  );
  const tv2 = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'training_drills_v2'
       AND column_name IN ('repType','repAntall','repMinutter','repSett','repReps')`,
  );
  console.log(`session_drills: ${sd.length}/7 nye kolonner · training_drills_v2: ${tv2.length}/5`);
  if (sd.length !== 7 || tv2.length !== 5) {
    throw new Error("Kolonne-verifisering feilet");
  }

  console.log("Ferdig — rep-type + volum + alle-seks-per-drill er på plass.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
