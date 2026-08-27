/**
 * Additiv DDL for per-trener capability-styring (plan G6).
 *
 * - user_capabilities — GRANT/REVOKE-override per bruker oppå rolle-defaulten
 *   i src/lib/auth/cbac.ts (leses av src/lib/auth/effective-capabilities.ts).
 *   ADMIN er immun mot overrides — håndheves i kode, ikke her.
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md §Schema-endringer). Kirurgisk
 * CREATE TABLE mot DIRECT_URL er den dokumenterte veien.
 *
 * Idempotent — rører kun user_capabilities. Trygg å kjøre flere ganger.
 *
 *   npx tsx scripts/add-user-capabilities-2026-08-16.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_capabilities (
      "id"          text NOT NULL,
      "userId"      text NOT NULL,
      "capability"  text NOT NULL,
      "mode"        text NOT NULL,
      "grantedById" text,
      "note"        text,
      "createdAt"   timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"   timestamp(3) NOT NULL,
      CONSTRAINT user_capabilities_pkey PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "user_capabilities_userId_capability_key"
       ON user_capabilities ("userId", "capability");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "user_capabilities_userId_idx"
       ON user_capabilities ("userId");`,
  );

  // FK-er via pg_constraint-sjekk (mønster: add-agenticos-ai-tables-2026-08-13).
  const fkUser = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'user_capabilities_userId_fkey'
     ) AS exists;`,
  );
  if (!fkUser[0]?.exists) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE user_capabilities ADD CONSTRAINT "user_capabilities_userId_fkey"
       FOREIGN KEY ("userId") REFERENCES users(id)
       ON DELETE CASCADE ON UPDATE CASCADE;`,
    );
  }
  const fkGranter = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'user_capabilities_grantedById_fkey'
     ) AS exists;`,
  );
  if (!fkGranter[0]?.exists) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE user_capabilities ADD CONSTRAINT "user_capabilities_grantedById_fkey"
       FOREIGN KEY ("grantedById") REFERENCES users(id)
       ON DELETE SET NULL ON UPDATE CASCADE;`,
    );
  }

  // RLS på som på øvrige tabeller — all tilgang går via service-rollen/Prisma.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE user_capabilities ENABLE ROW LEVEL SECURITY;`,
  );

  const kolonner = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) AS count FROM information_schema.columns
      WHERE table_name = 'user_capabilities';`,
  );
  console.log(
    `user-capabilities — OK. user_capabilities: ${kolonner[0]?.count}/8 kolonner.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
