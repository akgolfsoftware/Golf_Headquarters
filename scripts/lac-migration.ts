import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "LacFase" AS ENUM ('LAER', 'AUTOMATISER', 'KONKURRERE');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  console.log("✓ LacFase enum");

  await prisma.$executeRawUnsafe(`
    ALTER TABLE exercise_definitions
      ADD COLUMN IF NOT EXISTS "lacFaser" "LacFase"[] DEFAULT '{}';
  `);
  console.log("✓ exercise_definitions.lacFaser");

  await prisma.$executeRawUnsafe(`
    ALTER TABLE training_plan_sessions
      ADD COLUMN IF NOT EXISTS "lacFase" "LacFase";
  `);
  console.log("✓ training_plan_sessions.lacFase");

  await prisma.$executeRawUnsafe(`
    ALTER TABLE facility_prefs
      ADD COLUMN IF NOT EXISTS "maxPuttM"            INT,
      ADD COLUMN IF NOT EXISTS "maxChipM"            INT,
      ADD COLUMN IF NOT EXISTS "maxWedgeM"           INT,
      ADD COLUMN IF NOT EXISTS "trackmanHrsPerWeek"  FLOAT,
      ADD COLUMN IF NOT EXISTS "canSwingAtHome"      BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "hasBunker"           BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "hasNetAndMat"        BOOLEAN DEFAULT false;
  `);
  console.log("✓ facility_prefs avstandsfelter");
  console.log("Migrering fullført.");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
