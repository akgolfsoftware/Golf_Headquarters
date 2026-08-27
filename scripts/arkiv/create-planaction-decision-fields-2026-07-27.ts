/**
 * Additiv DDL: beslutningsfangst-felter på plan_actions (eval-grunnlag).
 * Gotcha: `prisma migrate dev`/`db push` er blokkert i dette repoet (se
 * .claude/rules/gotchas.md) — kirurgisk ALTER TABLE mot DIRECT_URL. Idempotent.
 *
 * Feltene speiler PlanSuggestion-mønsteret (decidedAt/decidedById/reason):
 * uten dem er «godkjent uendret»-raten (hovedmetrikk for AI-kvalitet) umulig å
 * måle, og coach-redigeringer ødelegger originalforslaget for alltid.
 *
 *   npx tsx scripts/create-planaction-decision-fields-2026-07-27.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE plan_actions
      ADD COLUMN IF NOT EXISTS "decidedAt"            timestamptz,
      ADD COLUMN IF NOT EXISTS "decidedById"          text,
      ADD COLUMN IF NOT EXISTS "rejectReason"         text,
      ADD COLUMN IF NOT EXISTS "decisionNote"         text,
      ADD COLUMN IF NOT EXISTS "originalSuggestion"   jsonb,
      ADD COLUMN IF NOT EXISTS "editedBeforeApproval" boolean NOT NULL DEFAULT false;
  `);

  console.log("plan_actions: beslutningsfangst-felter på plass.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
