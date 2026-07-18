/**
 * Additiv DDL for D5-anonymiseringsskjul (2026-07-18) — users."anonymisertAt".
 * Settes ved coach-godkjent GDPR-anonymisering sammen med deletedAt, så kontoen
 * faller ut av alle «aktiv bruker»-filtre, mens hard-delete-cronen ekskluderer
 * anonymisertAt != null (raden beholdes). Gotcha: `prisma migrate dev`/`db push`
 * er blokkert — kirurgisk ALTER TABLE mot DIRECT_URL. Idempotent.
 *
 *   npx tsx scripts/add-user-anonymisert-2026-07-18.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "anonymisertAt" timestamptz;`,
  );
  console.log('users."anonymisertAt": OK (idempotent)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
