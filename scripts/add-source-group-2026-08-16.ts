/**
 * Additiv DDL for duplikatfri gruppeplan-utrulling (plan G3).
 *
 * - period_blocks.sourceGroupId           — perioden ble rullet ut fra denne gruppens årsplan
 * - training_plan_sessions.sourceGroupId  — økten ble opprettet av denne gruppens malutrulling
 *
 * Begge er plain FK → groups.id med ON DELETE SET NULL (slettes gruppen mister
 * radene kun kildesporingen — aldri selve planen), pluss indeks for dedup-oppslag.
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md §Schema-endringer). Kirurgisk
 * ALTER TABLE mot DIRECT_URL er den dokumenterte veien.
 *
 * Idempotent — rører kun period_blocks og training_plan_sessions, kun additivt.
 *
 *   npx tsx scripts/add-source-group-2026-08-16.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

/** ADD CONSTRAINT har ingen IF NOT EXISTS — sjekk pg_constraint først. */
async function leggTilFk(tabell: string, constraintNavn: string) {
  await prisma.$executeRawUnsafe(
    `DO $$
     BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${constraintNavn}') THEN
         ALTER TABLE ${tabell}
           ADD CONSTRAINT "${constraintNavn}"
           FOREIGN KEY ("sourceGroupId") REFERENCES groups (id) ON DELETE SET NULL;
       END IF;
     END $$;`,
  );
}

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE period_blocks ADD COLUMN IF NOT EXISTS "sourceGroupId" text;`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "period_blocks_sourceGroupId_idx"
       ON period_blocks ("sourceGroupId");`,
  );
  await leggTilFk("period_blocks", "period_blocks_sourceGroupId_fkey");

  await prisma.$executeRawUnsafe(
    `ALTER TABLE training_plan_sessions ADD COLUMN IF NOT EXISTS "sourceGroupId" text;`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "training_plan_sessions_sourceGroupId_idx"
       ON training_plan_sessions ("sourceGroupId");`,
  );
  await leggTilFk("training_plan_sessions", "training_plan_sessions_sourceGroupId_fkey");

  const kolonner = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) AS count FROM information_schema.columns
      WHERE column_name = 'sourceGroupId'
        AND table_name IN ('period_blocks', 'training_plan_sessions');`,
  );
  const fk = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) AS count FROM pg_constraint
      WHERE conname IN ('period_blocks_sourceGroupId_fkey', 'training_plan_sessions_sourceGroupId_fkey');`,
  );

  console.log(
    `source-group — OK. sourceGroupId-kolonner: ${kolonner[0]?.count}/2, FK-constraints: ${fk[0]?.count}/2.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
