/**
 * Additiv DDL for GroupPeriodGoal — elevens egne fokusområder per periode.
 *
 * Bærer det andre sporet i WANG-årsplanen («Min utviklingsplan») og hele
 * IUP-samtalen. Uten denne tabellen har begge flatene ingen kilde.
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md §Schema-endringer). Kirurgisk
 * CREATE TABLE mot DIRECT_URL er den dokumenterte veien.
 *
 * Idempotent — rører kun group_period_goals og typen PeriodGoalStatus.
 *
 *   npx tsx scripts/add-group-period-goals-2026-08-15.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // CREATE TYPE har ingen IF NOT EXISTS før PG 15 på alle stier — sjekk først.
  const type = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PeriodGoalStatus') AS exists;`,
  );
  if (!type[0]?.exists) {
    await prisma.$executeRawUnsafe(
      `CREATE TYPE "PeriodGoalStatus" AS ENUM ('IKKE_STARTET', 'PAA_VEI', 'NAADD');`,
    );
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS group_period_goals (
      "id"              text NOT NULL,
      "userId"          text NOT NULL,
      "periodBlockId"   text NOT NULL,
      "akse"            "PyramidArea" NOT NULL,
      "tittel"          text NOT NULL,
      "egentidMinUke"   integer NOT NULL,
      "maalemetode"     text,
      "status"          "PeriodGoalStatus" NOT NULL DEFAULT 'IKKE_STARTET',
      "egenvurdering"   integer,
      "trenervurdering" integer,
      "kommentar"       text,
      "createdAt"       timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"       timestamp(3) NOT NULL,
      CONSTRAINT group_period_goals_pkey PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "group_period_goals_userId_periodBlockId_idx"
       ON group_period_goals ("userId", "periodBlockId");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "group_period_goals_periodBlockId_idx"
       ON group_period_goals ("periodBlockId");`,
  );

  // Vurderingsskalaen er 1–5. Håndheves i basen så en feil i UI ikke kan
  // skrive en verdi ingen skjerm kan tegne.
  const sjekk = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'group_period_goals_vurdering_check'
     ) AS exists;`,
  );
  if (!sjekk[0]?.exists) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE group_period_goals ADD CONSTRAINT "group_period_goals_vurdering_check"
         CHECK (
           ("egenvurdering"   IS NULL OR ("egenvurdering"   BETWEEN 1 AND 5)) AND
           ("trenervurdering" IS NULL OR ("trenervurdering" BETWEEN 1 AND 5)) AND
           "egentidMinUke" >= 0
         );`,
    );
  }

  const fkUser = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'group_period_goals_userId_fkey'
     ) AS exists;`,
  );
  if (!fkUser[0]?.exists) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE group_period_goals ADD CONSTRAINT "group_period_goals_userId_fkey"
       FOREIGN KEY ("userId") REFERENCES users(id)
       ON DELETE CASCADE ON UPDATE CASCADE;`,
    );
  }

  const fkBlock = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'group_period_goals_periodBlockId_fkey'
     ) AS exists;`,
  );
  if (!fkBlock[0]?.exists) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE group_period_goals ADD CONSTRAINT "group_period_goals_periodBlockId_fkey"
       FOREIGN KEY ("periodBlockId") REFERENCES group_period_blocks(id)
       ON DELETE CASCADE ON UPDATE CASCADE;`,
    );
  }

  // Deny-by-default mot PostgREST. Dette er persondata om mindreårige elever
  // (fokusområder, vurderinger, trenerkommentarer) og skal aldri kunne leses
  // med anon-nøkkelen fra klient-bundlet. Ingen policies: all tilgang går via
  // Prisma/server, som eier-rollen bypasser.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE group_period_goals ENABLE ROW LEVEL SECURITY;`,
  );

  const kolonner = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) AS count FROM information_schema.columns
      WHERE table_name = 'group_period_goals';`,
  );
  const rls = await prisma.$queryRawUnsafe<{ relrowsecurity: boolean }[]>(
    `SELECT relrowsecurity FROM pg_class WHERE relname = 'group_period_goals';`,
  );

  console.log(
    `group_period_goals — OK. Kolonner: ${kolonner[0]?.count}/13, RLS: ${rls[0]?.relrowsecurity}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
