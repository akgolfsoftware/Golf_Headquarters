/**
 * Additiv DDL for JarvisInnstilling — Jarvis skjerm 11 av 12 (Innstillinger).
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md). Kirurgisk CREATE TABLE mot
 * DIRECT_URL er den dokumenterte veien (mønster fra
 * scripts/add-sak-tabell-2026-08-16.ts).
 *
 * Idempotent — rører kun tabellen "jarvis_innstillinger". Trygg å kjøre
 * flere ganger.
 *
 * IKKE KJØRT MOT EKTE DB i denne økten (ingen ekte DIRECT_URL tilgjengelig
 * i sandkassen dette ble skrevet i) — kun typesjekket. Kjøres av Anders
 * eller i en oppfølgingsøkt med ekte tilkobling:
 *
 *   npx tsx scripts/add-jarvis-innstillinger-2026-08-17.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS jarvis_innstillinger (
      "id"                    text NOT NULL,
      "userId"                text NOT NULL,
      "kanalGmail"            boolean NOT NULL DEFAULT true,
      "kanalImessage"         boolean NOT NULL DEFAULT true,
      "kanalTelegram"         boolean NOT NULL DEFAULT true,
      "kanalAnrop"            boolean NOT NULL DEFAULT true,
      "kanalKalender"         boolean NOT NULL DEFAULT true,
      "slaTerskelTimer"       integer NOT NULL DEFAULT 6,
      "stemmeAktivert"        boolean NOT NULL DEFAULT true,
      "stilleTidsromAktivert" boolean NOT NULL DEFAULT true,
      "oppdatert"             timestamp(3) NOT NULL,
      CONSTRAINT jarvis_innstillinger_pkey PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "jarvis_innstillinger_userId_key" ON jarvis_innstillinger ("userId");`,
  );

  // Deny-by-default mot PostgREST — samme mønster som saker. All tilgang
  // går via Prisma/server, som eier-rollen bypasser.
  await prisma.$executeRawUnsafe(`ALTER TABLE jarvis_innstillinger ENABLE ROW LEVEL SECURITY;`);

  const kolonner = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) AS count FROM information_schema.columns
      WHERE table_name = 'jarvis_innstillinger';`,
  );
  const rls = await prisma.$queryRawUnsafe<{ relrowsecurity: boolean }[]>(
    `SELECT relrowsecurity FROM pg_class WHERE relname = 'jarvis_innstillinger';`,
  );

  console.log(
    `jarvis_innstillinger — OK. Kolonner: ${kolonner[0]?.count}/10, RLS: ${rls[0]?.relrowsecurity}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
