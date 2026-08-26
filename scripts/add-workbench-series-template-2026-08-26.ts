/**
 * Additiv DDL for Workbench serie + mal (natt-plan B5, 26.08.2026).
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md). Kirurgisk ALTER TABLE mot
 * DIRECT_URL er den dokumenterte veien.
 *
 * Legger til tre kolonner på workbench_sessions:
 * - seriesId (text, nullable)   — grupperer økter opprettet med "gjenta"
 * - seriesIndex (int, nullable) — 0-basert rekkefølge i serien
 * - isTemplate (boolean, default false) — lagret som mal i kildepanelet
 *
 * Idempotent — kun ADD COLUMN IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.
 * Ingen eksisterende kolonner røres, ingen data slettes.
 *
 *   npx tsx scripts/add-workbench-series-template-2026-08-26.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE workbench_sessions ADD COLUMN IF NOT EXISTS "seriesId" text;`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE workbench_sessions ADD COLUMN IF NOT EXISTS "seriesIndex" integer;`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE workbench_sessions ADD COLUMN IF NOT EXISTS "isTemplate" boolean NOT NULL DEFAULT false;`,
  );

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "workbench_sessions_seriesId_idx" ON workbench_sessions ("seriesId");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "workbench_sessions_playerId_isTemplate_idx" ON workbench_sessions ("playerId", "isTemplate");`,
  );

  const kolonner = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name = 'workbench_sessions'
        AND column_name IN ('seriesId', 'seriesIndex', 'isTemplate');`,
  );

  console.log(
    `workbench_sessions — OK. Nye kolonner til stede: ${kolonner.map((k) => k.column_name).join(", ")}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
