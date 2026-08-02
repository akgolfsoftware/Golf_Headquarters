/**
 * Additiv DDL for kalenderhendelser (I3, gotcha: migrate dev / db push er
 * blokkert). Lager calendar_events. Idempotent.
 *
 *   npx tsx scripts/migrate-calendar-events-i3-2026-07-14.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id          text PRIMARY KEY,
      "coachId"   text REFERENCES users(id) ON DELETE CASCADE,
      title       text NOT NULL,
      "startAt"   timestamptz NOT NULL,
      "endAt"     timestamptz NOT NULL,
      notes       text,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS calendar_events_coach_idx ON calendar_events ("coachId");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS calendar_events_start_end_idx ON calendar_events ("startAt", "endAt");`,
  );

  console.log("calendar_events OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
