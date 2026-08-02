/**
 * Additiv DDL for AgenticOS-loggen — ai_interaksjoner (AiInteraksjon-modellen).
 * Gotcha: `prisma migrate dev`/`db push` er blokkert i dette repoet (se
 * .claude/rules/gotchas.md) — kirurgisk CREATE TABLE mot DIRECT_URL.
 * Idempotent. KJØRES FØR koden deployes (loggInteraksjon skriver til tabellen).
 *
 *   npx tsx scripts/create-ai-interaksjoner-2026-08-02.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ai_interaksjoner (
      id               text PRIMARY KEY,
      "promptId"       text NOT NULL,
      "promptVersjon"  integer NOT NULL,
      intent           text NOT NULL,
      domene           text NOT NULL,
      rolle            text NOT NULL,
      modell           text NOT NULL,
      "tokensInn"      integer,
      "tokensUt"       integer,
      "kostUsd"        double precision,
      "latencyMs"      integer,
      "kontekstKilder" text[] NOT NULL DEFAULT '{}',
      "guardTreff"     text[] NOT NULL DEFAULT '{}',
      eskalert         boolean NOT NULL DEFAULT false,
      "userId"         text,
      "agentNavn"      text,
      "referanseId"    text,
      utfall           text NOT NULL DEFAULT 'PENDING',
      rating           integer,
      begrunnelse      text,
      "createdAt"      timestamp(3) NOT NULL DEFAULT now(),
      "resolvedAt"     timestamp(3)
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS ai_interaksjoner_prompt_idx
       ON ai_interaksjoner ("promptId", "promptVersjon", "createdAt");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS ai_interaksjoner_utfall_idx
       ON ai_interaksjoner (utfall, "createdAt");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS ai_interaksjoner_user_idx
       ON ai_interaksjoner ("userId", "createdAt");`,
  );

  console.log("ai_interaksjoner: OK (idempotent)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
