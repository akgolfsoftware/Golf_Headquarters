/**
 * Additiv DDL for Fokus-spillere i cockpit (D3, godkjent 2026-07-17) —
 * coach_fokus_pins. Gotcha: `prisma migrate dev`/`db push` er blokkert i dette
 * repoet (se .claude/rules/gotchas.md) — kirurgisk CREATE TABLE mot DIRECT_URL.
 * Idempotent. KJØRES FØR koden deployes (cockpiten leser tabellen).
 *
 *   npx tsx scripts/create-coach-fokus-pins-2026-07-17.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS coach_fokus_pins (
      id          text PRIMARY KEY,
      "coachId"   text NOT NULL,
      "playerId"  text NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS coach_fokus_pins_coachId_playerId_key ON coach_fokus_pins ("coachId", "playerId");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS coach_fokus_pins_coachId_idx ON coach_fokus_pins ("coachId");`,
  );
  // AGENT-BRIEF-regel: nye tabeller MÅ ha RLS på i samme migrering — uten
  // policies er tabellen stengt for PostgREST-roller; Prisma (eier) er upåvirket.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE coach_fokus_pins ENABLE ROW LEVEL SECURITY;`,
  );
  console.log("coach_fokus_pins: OK (idempotent)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
