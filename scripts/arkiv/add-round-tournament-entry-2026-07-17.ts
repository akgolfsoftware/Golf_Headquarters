/**
 * Additiv DDL for live turneringsrunde (D6c, godkjent 2026-07-17) —
 * legger kolonnen rounds."tournamentEntryId" + indeks. Gotcha:
 * `prisma migrate dev`/`db push` er blokkert (se .claude/rules/gotchas.md)
 * — kirurgisk ALTER TABLE mot DIRECT_URL. Idempotent. KJØRES FØR deploy.
 *
 *   npx tsx scripts/add-round-tournament-entry-2026-07-17.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE rounds ADD COLUMN IF NOT EXISTS "tournamentEntryId" text;`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS rounds_tournament_entry_idx ON rounds ("tournamentEntryId");`,
  );
  console.log('rounds."tournamentEntryId": OK (idempotent)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
