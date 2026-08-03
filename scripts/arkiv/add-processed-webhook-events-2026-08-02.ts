/**
 * Additiv DDL for ProcessedWebhookEvent — dedup-kvittering for webhook-events.
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i dette
 * prosjektet (se .claude/rules/gotchas.md). Kirurgisk CREATE TABLE mot DIRECT_URL er
 * den dokumenterte veien.
 *
 * Idempotent — rører kun processed_webhook_events. Trygg å kjøre flere ganger.
 *
 *   npx tsx scripts/add-processed-webhook-events-2026-08-02.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS processed_webhook_events (
      "id"          text NOT NULL,
      "source"      text NOT NULL,
      "eventId"     text NOT NULL,
      "eventType"   text NOT NULL,
      "processedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT processed_webhook_events_pkey PRIMARY KEY ("id")
    );
  `);

  // Unikheten ER dedup-mekanismen: INSERT ... ON CONFLICT DO NOTHING avgjør om
  // dette eventet allerede er behandlet.
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "processed_webhook_events_source_eventId_key"
       ON processed_webhook_events ("source", "eventId");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "processed_webhook_events_processedAt_idx"
       ON processed_webhook_events ("processedAt");`,
  );

  // Deny-by-default mot PostgREST — ingen policies, all tilgang går via Prisma/server.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;`,
  );

  const kolonner = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) AS count FROM information_schema.columns
      WHERE table_name = 'processed_webhook_events';`,
  );
  const rls = await prisma.$queryRawUnsafe<{ relrowsecurity: boolean }[]>(
    `SELECT relrowsecurity FROM pg_class WHERE relname = 'processed_webhook_events';`,
  );

  console.log(
    `processed_webhook_events — OK. Kolonner: ${kolonner[0]?.count}/5, RLS: ${rls[0]?.relrowsecurity}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
