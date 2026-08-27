/**
 * Additiv DDL for «valgt coach» (plan G2).
 *
 * - users.primaryCoachId — spillerens ENE valgte coach. Plain FK mot users.id
 *   med ON DELETE SET NULL (slettes coachen hardt, nullstilles valget) + indeks
 *   for oppslaget «hvilke spillere har denne coachen som valgt».
 *
 * Settes av admin-UI (settValgtCoach) og backfill-scriptet
 * (scripts/backfill-valgt-coach-2026-08-16.ts). Eneste lovlige leser er
 * resolveValgtCoachId i src/lib/domain/valgt-coach.ts.
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md §Schema-endringer). Kirurgisk
 * ALTER TABLE mot DIRECT_URL er den dokumenterte veien.
 *
 * Idempotent — rører kun users, kun additivt.
 *
 *   npx tsx scripts/add-primary-coach-2026-08-16.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "primaryCoachId" text;`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "users_primaryCoachId_idx" ON users ("primaryCoachId");`,
  );
  // ADD CONSTRAINT har ingen IF NOT EXISTS — sjekk pg_constraint for idempotens.
  await prisma.$executeRawUnsafe(
    `DO $$ BEGIN
       IF NOT EXISTS (
         SELECT 1 FROM pg_constraint WHERE conname = 'users_primaryCoachId_fkey'
       ) THEN
         ALTER TABLE users ADD CONSTRAINT "users_primaryCoachId_fkey"
           FOREIGN KEY ("primaryCoachId") REFERENCES users (id)
           ON DELETE SET NULL ON UPDATE CASCADE;
       END IF;
     END $$;`,
  );

  const kolonne = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) AS count FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'primaryCoachId';`,
  );
  const fk = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) AS count FROM pg_constraint
      WHERE conname = 'users_primaryCoachId_fkey';`,
  );

  console.log(
    `primary-coach — OK. users.primaryCoachId: ${kolonne[0]?.count}/1 kolonne, FK: ${fk[0]?.count}/1.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
