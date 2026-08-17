/**
 * Additiv DDL for kanonisk gruppetaksonomi + aktivt medlemskap (plan G1).
 *
 * - groups.slug            — kanonisk oppslagsnøkkel (erstatter fritekst-navn)
 * - groups.program         — kobling til PlayerProgram-enum for kanoniske grupper
 * - groups.managedByAkGolf — markøren resolveTilgang bruker for gratis full tilgang
 * - group_members.endedAt  — null = aktivt medlemskap; satt = utmeldt (soft-end)
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md §Schema-endringer). Kirurgisk
 * ALTER TABLE mot DIRECT_URL er den dokumenterte veien.
 *
 * Idempotent — rører kun groups og group_members, kun additivt.
 *
 *   npx tsx scripts/add-gruppe-taksonomi-2026-08-16.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE groups ADD COLUMN IF NOT EXISTS "slug" text;`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "groups_slug_key" ON groups ("slug");`,
  );
  // PlayerProgram-typen finnes i basen fra før (players-enum) — gjenbrukes her.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE groups ADD COLUMN IF NOT EXISTS "program" "PlayerProgram";`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE groups ADD COLUMN IF NOT EXISTS "managedByAkGolf" boolean NOT NULL DEFAULT false;`,
  );

  await prisma.$executeRawUnsafe(
    `ALTER TABLE group_members ADD COLUMN IF NOT EXISTS "endedAt" timestamp(3);`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "group_members_groupId_role_endedAt_idx"
       ON group_members ("groupId", "role", "endedAt");`,
  );

  const grupper = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) AS count FROM information_schema.columns
      WHERE table_name = 'groups'
        AND column_name IN ('slug', 'program', 'managedByAkGolf');`,
  );
  const medlemmer = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) AS count FROM information_schema.columns
      WHERE table_name = 'group_members' AND column_name = 'endedAt';`,
  );

  console.log(
    `gruppe-taksonomi — OK. groups: ${grupper[0]?.count}/3 nye kolonner, group_members: ${medlemmer[0]?.count}/1.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
