/**
 * Additiv DDL for PlayerBusyBlock — spillerens egen opptatte tid.
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md). Migrasjonsmappa er delvis
 * rekonstruert med stub-filer, og en replay fra bunnen feiler på
 * `20260510..._add_parent_role_and_tier_enum` («type Tier already exists»).
 * Kirurgisk CREATE TABLE mot DIRECT_URL er den dokumenterte veien.
 *
 * Idempotent — rører kun player_busy_blocks. Trygg å kjøre flere ganger.
 *
 *   npx tsx scripts/add-player-busy-blocks-2026-08-02.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS player_busy_blocks (
      "id"        text NOT NULL,
      "userId"    text NOT NULL,
      "title"     text NOT NULL,
      "startAt"   timestamp(3) NOT NULL,
      "endAt"     timestamp(3) NOT NULL,
      "kind"      text NOT NULL DEFAULT 'AVTALE',
      "recurring" text DEFAULT 'NONE',
      "isPrivate" boolean NOT NULL DEFAULT false,
      "note"      text,
      "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" timestamp(3) NOT NULL,
      CONSTRAINT player_busy_blocks_pkey PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "player_busy_blocks_userId_startAt_idx"
       ON player_busy_blocks ("userId", "startAt");`,
  );

  const fk = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'player_busy_blocks_userId_fkey'
     ) AS exists;`,
  );
  if (!fk[0]?.exists) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE player_busy_blocks ADD CONSTRAINT "player_busy_blocks_userId_fkey"
       FOREIGN KEY ("userId") REFERENCES users(id)
       ON DELETE CASCADE ON UPDATE CASCADE;`,
    );
  }

  // Deny-by-default mot PostgREST. Persondata (avtaletitler, delvis om
  // mindreårige) skal aldri kunne leses med anon-nøkkelen fra klient-bundlet.
  // Ingen policies: all tilgang går via Prisma/server, som eier-rollen bypasser.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE player_busy_blocks ENABLE ROW LEVEL SECURITY;`,
  );

  const kolonner = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) AS count FROM information_schema.columns
      WHERE table_name = 'player_busy_blocks';`,
  );
  const rls = await prisma.$queryRawUnsafe<{ relrowsecurity: boolean }[]>(
    `SELECT relrowsecurity FROM pg_class WHERE relname = 'player_busy_blocks';`,
  );

  console.log(
    `player_busy_blocks — OK. Kolonner: ${kolonner[0]?.count}/11, RLS: ${rls[0]?.relrowsecurity}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
