/**
 * Additiv DDL for mål-fremdrift (Fase 1.14b, godkjent 2026-07-27) — legger til
 * achievedAt, linkedPyramidArea og linkedTestId på goals. Gotcha: `prisma
 * migrate dev`/`db push` er blokkert (se .claude/rules/gotchas.md) — kirurgisk
 * ALTER TABLE mot DIRECT_URL. Idempotent, rører kun goals-tabellen.
 *
 *   npx tsx scripts/add-goal-progress-fields-2026-07-27.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE goals ADD COLUMN IF NOT EXISTS "achievedAt" timestamp(3);`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE goals ADD COLUMN IF NOT EXISTS "linkedPyramidArea" "PyramidArea";`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE goals ADD COLUMN IF NOT EXISTS "linkedTestId" text;`,
  );

  const fk = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'goals_linkedTestId_fkey'
     ) AS exists;`,
  );
  if (!fk[0]?.exists) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE goals ADD CONSTRAINT "goals_linkedTestId_fkey"
       FOREIGN KEY ("linkedTestId") REFERENCES test_definitions(id)
       ON DELETE SET NULL ON UPDATE CASCADE;`,
    );
  }

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "goals_linkedTestId_idx" ON goals ("linkedTestId");`,
  );

  console.log("goals: achievedAt/linkedPyramidArea/linkedTestId — OK (idempotent)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
