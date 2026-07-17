/**
 * Additiv DDL for moderering-/GDPR-køen (D5, besluttet 2026-07-17) —
 * moderation_cases. Gotcha: `prisma migrate dev`/`db push` er blokkert i dette
 * repoet (se .claude/rules/gotchas.md) — kirurgisk CREATE TABLE mot DIRECT_URL.
 * Idempotent. KJØRES FØR koden deployes (siden leser tabellen).
 *
 *   npx tsx scripts/create-moderation-cases-2026-07-17.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS moderation_cases (
      id             text PRIMARY KEY,
      type           text NOT NULL,
      status         text NOT NULL DEFAULT 'OPEN',
      "userId"       text NOT NULL,
      "reporterId"   text,
      "targetType"   text,
      "targetId"     text,
      begrunnelse    text,
      "resolvedById" text,
      "resolvedAt"   timestamptz,
      "createdAt"    timestamptz NOT NULL DEFAULT now(),
      "updatedAt"    timestamptz NOT NULL DEFAULT now()
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS moderation_cases_status_type_idx ON moderation_cases (status, type);`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS moderation_cases_user_idx ON moderation_cases ("userId");`,
  );
  console.log("moderation_cases: OK (idempotent)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
