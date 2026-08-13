/**
 * Additiv DDL for AgenticOS AI-datamodellen: ai_models, routing_rules,
 * ai_prompts, ai_costs. Vedtatt av Anders 13.08.2026 (nattrapport spm. 3:
 * datamodellen bygges FØR hub-signering).
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md §Schema-endringer). Kirurgisk
 * CREATE TABLE mot DIRECT_URL er den dokumenterte veien.
 *
 * Idempotent — rører kun de fire nye tabellene. Trygg å kjøre flere ganger.
 *
 *   npx tsx scripts/add-agenticos-ai-tables-2026-08-13.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ai_models (
      "id"             text NOT NULL,
      "name"           text NOT NULL,
      "provider"       text NOT NULL DEFAULT 'anthropic',
      "modelId"        text NOT NULL,
      "inputUsdPer1M"  double precision,
      "outputUsdPer1M" double precision,
      "active"         boolean NOT NULL DEFAULT true,
      "createdAt"      timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT ai_models_pkey PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "ai_models_name_key" ON ai_models ("name");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "ai_models_modelId_key" ON ai_models ("modelId");`,
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS routing_rules (
      "id"        text NOT NULL,
      "agentName" text NOT NULL,
      "aiModelId" text NOT NULL,
      "active"    boolean NOT NULL DEFAULT true,
      "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT routing_rules_pkey PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "routing_rules_agentName_key" ON routing_rules ("agentName");`,
  );
  const fk = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'routing_rules_aiModelId_fkey'
     ) AS exists;`,
  );
  if (!fk[0]?.exists) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE routing_rules ADD CONSTRAINT "routing_rules_aiModelId_fkey"
       FOREIGN KEY ("aiModelId") REFERENCES ai_models(id)
       ON DELETE CASCADE ON UPDATE CASCADE;`,
    );
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ai_prompts (
      "id"        text NOT NULL,
      "agentName" text NOT NULL,
      "version"   integer NOT NULL DEFAULT 1,
      "content"   text NOT NULL,
      "active"    boolean NOT NULL DEFAULT true,
      "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT ai_prompts_pkey PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "ai_prompts_agentName_version_key"
       ON ai_prompts ("agentName", "version");`,
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ai_costs (
      "id"           text NOT NULL,
      "agentName"    text NOT NULL,
      "agentRunId"   text,
      "modelId"      text NOT NULL,
      "inputTokens"  integer NOT NULL DEFAULT 0,
      "outputTokens" integer NOT NULL DEFAULT 0,
      "costUsd"      double precision,
      "createdAt"    timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT ai_costs_pkey PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "ai_costs_agentName_createdAt_idx"
       ON ai_costs ("agentName", "createdAt");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "ai_costs_createdAt_idx" ON ai_costs ("createdAt");`,
  );

  // Deny-by-default mot PostgREST. Ingen policies: all tilgang går via
  // Prisma/server, som eier-rollen bypasser.
  for (const tabell of ["ai_models", "routing_rules", "ai_prompts", "ai_costs"]) {
    await prisma.$executeRawUnsafe(`ALTER TABLE ${tabell} ENABLE ROW LEVEL SECURITY;`);
  }

  for (const tabell of ["ai_models", "routing_rules", "ai_prompts", "ai_costs"]) {
    const rls = await prisma.$queryRawUnsafe<{ relrowsecurity: boolean }[]>(
      `SELECT relrowsecurity FROM pg_class WHERE relname = '${tabell}';`,
    );
    const kolonner = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT count(*) AS count FROM information_schema.columns
        WHERE table_name = '${tabell}';`,
    );
    console.log(`${tabell} — OK. Kolonner: ${kolonner[0]?.count}, RLS: ${rls[0]?.relrowsecurity}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
