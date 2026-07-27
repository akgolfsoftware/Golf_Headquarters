/**
 * Additiv DDL: ai_eval_results — lagring av LLM-dommer-scoringer. Idempotent.
 * Kirurgisk DDL mot DIRECT_URL (migrate dev/db push er blokkert — gotchas.md).
 *
 *   npx tsx scripts/create-ai-eval-results-2026-07-27.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ai_eval_results (
      id            text PRIMARY KEY,
      "subjectType" text NOT NULL,
      "subjectId"   text NOT NULL,
      rubric        jsonb NOT NULL,
      model         text NOT NULL,
      "promptHash"  text NOT NULL,
      "createdAt"   timestamptz NOT NULL DEFAULT now()
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS ai_eval_results_subject_idx ON ai_eval_results ("subjectType", "subjectId", "createdAt");`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE ai_eval_results ENABLE ROW LEVEL SECURITY;`,
  );
  console.log("ai_eval_results på plass (tabell + indeks + RLS).");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
