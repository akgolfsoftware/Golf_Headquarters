/**
 * Additiv DDL for fokus-spiller pin (D3, godkjent 2026-07-17) —
 * coach_pinned_players. Gotcha: `prisma migrate dev`/`db push` er blokkert
 * (se .claude/rules/gotchas.md) — kirurgisk CREATE TABLE mot DIRECT_URL.
 * Idempotent. KJØRES FØR koden deployes (cockpit leser tabellen).
 *
 *   npx tsx scripts/create-coach-pinned-players-2026-07-17.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS coach_pinned_players (
      id          text PRIMARY KEY,
      "coachId"   text NOT NULL,
      "playerId"  text NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT coach_pinned_players_unique UNIQUE ("coachId", "playerId")
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS coach_pinned_players_coach_idx ON coach_pinned_players ("coachId");`,
  );
  console.log("coach_pinned_players: OK (idempotent)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
