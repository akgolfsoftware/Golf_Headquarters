/**
 * Additiv DDL for varsel-batching (leveranse G4 — planendrings-varsling til
 * valgt coach).
 *
 * - notifications.groupKey — grupperingsnøkkel for samlevarsler, f.eks.
 *   «plan-endring:<spillerId>:<YYYY-MM-DD>» (Oslo-dag). Null = enkeltvarsel.
 * - notifications.count    — antall hendelser samlet i raden (default 1).
 * - Indeks (userId, groupKey, readAt) — oppslaget «finnes ulest rad i dagens
 *   vindu?» i varsleCoachOmPlanendring.
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md §Schema-endringer). Kirurgisk
 * ALTER TABLE mot DIRECT_URL er den dokumenterte veien.
 *
 * Idempotent — rører kun notifications, kun additivt. Kjøres fra HOVEDMAPPA
 * (worktrees har ikke .env.local):
 *
 *   npx tsx scripts/add-notification-batching-2026-08-16.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "groupKey" text;`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "count" integer NOT NULL DEFAULT 1;`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "notifications_userId_groupKey_readAt_idx"
       ON notifications ("userId", "groupKey", "readAt");`,
  );

  const kolonner = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) AS count FROM information_schema.columns
      WHERE table_name = 'notifications'
        AND column_name IN ('groupKey', 'count');`,
  );

  console.log(
    `notification-batching — OK. notifications: ${kolonner[0]?.count}/2 nye kolonner.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
