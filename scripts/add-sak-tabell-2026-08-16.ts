/**
 * Additiv DDL for Sak — Jarvis steg 1, samlet "venter på deg"-kø.
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md). Kirurgisk CREATE TABLE mot
 * DIRECT_URL er den dokumenterte veien (mønster fra
 * scripts/add-player-busy-blocks-2026-08-02.ts).
 *
 * Gjenbrukte IKKE KommandoTask (kommando_tasks): den er et smalt personlig
 * to-do-felt (title/status open|done/priority/dueAt) for kommando/-appen.
 * Sak dekker et annet domene — innkommende kommunikasjon på tvers av kanaler
 * (e-post/SMS/iMessage/Telegram/anrop/kalenderavvik/forfalte tasks) med
 * avsender, innhold, foreslått svar, kilde-id og SLA-frist. Å presse dette
 * inn i KommandoTask hadde krevd å bøye et ferdig, i bruk værende skjema —
 * en ny, riktig formet tabell er enklere og tryggere.
 *
 * Idempotent — rører kun tabellen "saker". Trygg å kjøre flere ganger.
 *
 *   npx tsx scripts/add-sak-tabell-2026-08-16.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "SakKanal" AS ENUM ('EPOST', 'SMS', 'IMESSAGE', 'TELEGRAM', 'ANROP', 'KALENDER', 'TASK');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "SakStatus" AS ENUM ('VENTER', 'GODKJENT', 'AVVIST', 'UTFORT', 'UTLOPT');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS saker (
      "id"            text NOT NULL,
      "kanal"         "SakKanal" NOT NULL,
      "avsender"      text,
      "emne"          text,
      "innhold"       text NOT NULL,
      "foreslattSvar" text,
      "status"        "SakStatus" NOT NULL DEFAULT 'VENTER',
      "kildeId"       text,
      "frist"         timestamp(3),
      "opprettet"     timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "oppdatert"     timestamp(3) NOT NULL,
      "provenance"    jsonb,
      CONSTRAINT saker_pkey PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "saker_status_frist_idx" ON saker ("status", "frist");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "saker_kanal_status_idx" ON saker ("kanal", "status");`,
  );

  // Deny-by-default mot PostgREST. Innhold i saker (e-post/SMS-tekst m.m.)
  // skal aldri kunne leses med anon-nøkkelen fra klient-bundlet.
  // Ingen policies: all tilgang går via Prisma/server, som eier-rollen bypasser.
  await prisma.$executeRawUnsafe(`ALTER TABLE saker ENABLE ROW LEVEL SECURITY;`);

  const kolonner = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*) AS count FROM information_schema.columns
      WHERE table_name = 'saker';`,
  );
  const rls = await prisma.$queryRawUnsafe<{ relrowsecurity: boolean }[]>(
    `SELECT relrowsecurity FROM pg_class WHERE relname = 'saker';`,
  );

  console.log(
    `saker — OK. Kolonner: ${kolonner[0]?.count}/12, RLS: ${rls[0]?.relrowsecurity}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
