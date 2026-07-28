/**
 * Additiv DDL: snittscore stemplet ved anonymisering (2026-07-28).
 * Anders' beslutning: ved kontosletting beholdes data, aggregert til
 * spillernivå — snittscore skal overleve uansett hva som senere ryddes.
 *
 * Gotcha: `prisma migrate dev`/`db push` er blokkert i dette repoet (se
 * .claude/rules/gotchas.md) — kirurgisk DDL mot DIRECT_URL. Idempotent.
 *
 *   npx tsx scripts/migrate-gdpr-snittscore-2026-07-28.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE users
       ADD COLUMN IF NOT EXISTS "snittScoreVedSletting" double precision,
       ADD COLUMN IF NOT EXISTS "antallRunderVedSletting" integer;`,
  );
  console.log("GDPR snittscore-kolonner OK (idempotent)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
