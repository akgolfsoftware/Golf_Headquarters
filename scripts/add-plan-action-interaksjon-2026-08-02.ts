/**
 * Additiv DDL: plan_actions."interaksjonId" — kobler et agent-forslag til
 * AgenticOS-interaksjonen (AiInteraksjon) som produserte det, slik at
 * godkjenning eller avvisning kan lukke læringsløkken.
 *
 * Kolonnen settes KUN av LLM-drevne agenter. De fleste agentene i
 * src/lib/agents/ er deterministiske regler uten modellkall og skal ikke
 * forurense AI-loggen — for dem forblir kolonnen null.
 *
 * Gotcha: `prisma migrate dev`/`db push` er blokkert i dette repoet (se
 * .claude/rules/gotchas.md) — kirurgisk ALTER TABLE mot DIRECT_URL. Idempotent.
 *
 *   npx tsx scripts/add-plan-action-interaksjon-2026-08-02.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE plan_actions ADD COLUMN IF NOT EXISTS "interaksjonId" text;`,
  );
  console.log('plan_actions."interaksjonId": OK (idempotent)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
