/**
 * Additiv DDL for coach-satt periode-fordeling (fase 1, godkjent 2026-07-18) —
 * periode_fordelinger. Gotcha: `prisma migrate dev`/`db push` er blokkert
 * (se .claude/rules/gotchas.md) — kirurgisk CREATE TABLE mot DIRECT_URL.
 * Idempotent. KJØRES FØR koden deployes (resolveren tåler fravær, men UI-lagring
 * krever tabellen).
 *
 *   npx tsx scripts/create-periode-fordelinger-2026-07-18.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS periode_fordelinger (
      id              text PRIMARY KEY,
      "periodeType"   text NOT NULL,
      "minFys"        integer NOT NULL,
      "maxFys"        integer NOT NULL,
      "minTek"        integer NOT NULL,
      "maxTek"        integer NOT NULL,
      "minSlag"       integer NOT NULL,
      "maxSlag"       integer NOT NULL,
      "minSpill"      integer NOT NULL,
      "maxSpill"      integer NOT NULL,
      "minTurn"       integer NOT NULL,
      "maxTurn"       integer NOT NULL,
      "oppdatertAvId" text,
      "oppdatertAt"   timestamptz NOT NULL DEFAULT now()
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "periode_fordelinger_periodeType_key" ON periode_fordelinger ("periodeType");`,
  );
  console.log("periode_fordelinger: OK (idempotent)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
