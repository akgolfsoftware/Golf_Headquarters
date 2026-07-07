/**
 * Additiv DDL for WANG treningsplanlegger (gotcha: migrate dev / db push er blokkert).
 * Legger schoolYear-kolonne på users + lager training_periods. Idempotent.
 *
 *   npx tsx scripts/create-wang-treningsplanlegger-tables-2026-07-07.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "schoolYear" text;`,
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS training_periods (
      id           text PRIMARY KEY,
      "groupId"    text,
      "schoolYear" text NOT NULL,
      name         text NOT NULL,
      "startDate"  timestamptz NOT NULL,
      "endDate"    timestamptz NOT NULL,
      tone         text,
      note         text,
      "createdAt"  timestamptz NOT NULL DEFAULT now(),
      "updatedAt"  timestamptz NOT NULL DEFAULT now()
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS training_periods_group_start_idx ON training_periods ("groupId", "startDate");`,
  );

  console.log("users.schoolYear + training_periods OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
