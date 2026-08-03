/**
 * Additiv DDL for øvelses-motorens radar-lag — radar_funn (RadarFunn-modellen,
 * besluttet 2026-07-27). Gotcha: `prisma migrate dev`/`db push` er blokkert i
 * dette repoet (se .claude/rules/gotchas.md) — kirurgisk CREATE TABLE mot
 * DIRECT_URL. Idempotent. KJØRES FØR koden deployes (siden leser tabellen).
 *
 *   npx tsx scripts/create-radar-funn-2026-07-27.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS radar_funn (
      id            text PRIMARY KEY,
      kilde         text NOT NULL,
      "kildeNavn"   text NOT NULL,
      tittel        text NOT NULL,
      url           text NOT NULL,
      sammendrag    text,
      "publisertAt" timestamp(3),
      behandlet     boolean NOT NULL DEFAULT false,
      "funnetAt"    timestamp(3) NOT NULL DEFAULT now()
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS radar_funn_behandlet_funnetat_idx ON radar_funn (behandlet, "funnetAt");`,
  );
  console.log("radar_funn: OK (idempotent)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
