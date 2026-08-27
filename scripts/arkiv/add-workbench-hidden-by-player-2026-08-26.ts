/**
 * Additiv DDL for Workbench godkjenning (natt-plan B6/Loop 3T, 26.08.2026).
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md). Kirurgisk ALTER TABLE mot
 * DIRECT_URL er den dokumenterte veien (samme mønster som
 * add-workbench-series-template-2026-08-26.ts, B5).
 *
 * Legger til én kolonne på workbench_sessions:
 * - hiddenByPlayer (boolean, default false) — spilleren har avvist et
 *   forslag fra coach/gruppe, eller valgt "Ikke delta" (WB-10). Skjuler
 *   økten for spilleren uten å slette den.
 *
 * Idempotent — kun ADD COLUMN IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.
 * Ingen eksisterende kolonner røres, ingen data slettes.
 *
 *   npx tsx scripts/add-workbench-hidden-by-player-2026-08-26.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE workbench_sessions ADD COLUMN IF NOT EXISTS "hiddenByPlayer" boolean NOT NULL DEFAULT false;`,
  );

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "workbench_sessions_playerId_hiddenByPlayer_idx" ON workbench_sessions ("playerId", "hiddenByPlayer");`,
  );

  const kolonner = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name = 'workbench_sessions'
        AND column_name = 'hiddenByPlayer';`,
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
