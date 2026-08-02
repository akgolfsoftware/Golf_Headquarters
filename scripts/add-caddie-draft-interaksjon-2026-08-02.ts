/**
 * Additiv DDL: caddie_drafts."interaksjonId" — kobler et utkast til
 * AgenticOS-interaksjonen (AiInteraksjon) som produserte det, slik at en
 * godkjenning eller avvisning kan lukke læringsløkken på riktig Caddie-tur.
 *
 * Gotcha: `prisma migrate dev`/`db push` er blokkert i dette repoet (se
 * .claude/rules/gotchas.md) — kirurgisk ALTER TABLE mot DIRECT_URL. Idempotent.
 * Kolonnen er nullbar, så eksisterende utkast er upåvirket og koden tåler at
 * scriptet ikke er kjørt ennå.
 *
 *   npx tsx scripts/add-caddie-draft-interaksjon-2026-08-02.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE caddie_drafts ADD COLUMN IF NOT EXISTS "interaksjonId" text;`,
  );
  console.log('caddie_drafts."interaksjonId": OK (idempotent)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
