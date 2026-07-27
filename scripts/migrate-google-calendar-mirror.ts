/**
 * Kirurgisk migrasjon: google_calendar_events + sync-token-felter.
 *
 * `prisma migrate dev` og `db push` er begge ødelagt i dette prosjektet
 * (se .claude/rules/gotchas.md §Schema-endringer). Denne rører KUN egne
 * tabeller/kolonner og er idempotent.
 *
 * Kjør: npx tsx scripts/migrate-google-calendar-mirror.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/**
 * Finn .env.local ved å gå oppover i katalogtreet.
 * Kjøres scriptet fra en git-worktree (.claude/worktrees/<gren>/) finnes
 * ikke .env.local der — den ligger bare i hovedmappa. Uten dette søket
 * feiler scriptet med «DIRECT_URL mangler» avhengig av hvor du står.
 */
function finnEnvFil(): string | null {
  let katalog = resolve(process.cwd());
  for (let i = 0; i < 8; i++) {
    const kandidat = join(katalog, ".env.local");
    if (existsSync(kandidat)) return kandidat;
    const forelder = dirname(katalog);
    if (forelder === katalog) break;
    katalog = forelder;
  }
  return null;
}

const envFil = finnEnvFil();
if (envFil) {
  dotenv.config({ path: envFil });
  console.log(`Leser miljøvariabler fra: ${envFil}\n`);
}

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DIRECT_URL/DATABASE_URL mangler — fant ingen .env.local i denne mappa eller noen mappe over.",
  );
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const STEG: Array<{ navn: string; sql: string }> = [
  {
    navn: "google_calendar_events",
    sql: `
      CREATE TABLE IF NOT EXISTS "google_calendar_events" (
        "id" TEXT NOT NULL,
        "subscriptionId" TEXT NOT NULL,
        "googleEventId" TEXT NOT NULL,
        "iCalUid" TEXT,
        "summary" TEXT NOT NULL,
        "description" TEXT,
        "location" TEXT,
        "startAt" TIMESTAMP(3) NOT NULL,
        "endAt" TIMESTAMP(3) NOT NULL,
        "allDay" BOOLEAN NOT NULL DEFAULT false,
        "status" TEXT NOT NULL DEFAULT 'confirmed',
        "transparency" TEXT NOT NULL DEFAULT 'opaque',
        "recurringEventId" TEXT,
        "htmlLink" TEXT,
        "googleUpdatedAt" TIMESTAMP(3),
        "bookingId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "google_calendar_events_pkey" PRIMARY KEY ("id")
      )`,
  },
  {
    navn: "FK → google_calendar_subscriptions",
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'google_calendar_events_subscriptionId_fkey'
        ) THEN
          ALTER TABLE "google_calendar_events"
            ADD CONSTRAINT "google_calendar_events_subscriptionId_fkey"
            FOREIGN KEY ("subscriptionId") REFERENCES "google_calendar_subscriptions"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$`,
  },
  {
    navn: "unique (subscriptionId, googleEventId)",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "google_calendar_events_subscriptionId_googleEventId_key"
          ON "google_calendar_events" ("subscriptionId", "googleEventId")`,
  },
  {
    navn: "index (subscriptionId, startAt)",
    sql: `CREATE INDEX IF NOT EXISTS "google_calendar_events_subscriptionId_startAt_idx"
          ON "google_calendar_events" ("subscriptionId", "startAt")`,
  },
  {
    navn: "index (startAt, endAt)",
    sql: `CREATE INDEX IF NOT EXISTS "google_calendar_events_startAt_endAt_idx"
          ON "google_calendar_events" ("startAt", "endAt")`,
  },
  {
    navn: "index (iCalUid)",
    sql: `CREATE INDEX IF NOT EXISTS "google_calendar_events_iCalUid_idx"
          ON "google_calendar_events" ("iCalUid")`,
  },
  {
    navn: "index (bookingId)",
    sql: `CREATE INDEX IF NOT EXISTS "google_calendar_events_bookingId_idx"
          ON "google_calendar_events" ("bookingId")`,
  },
  {
    navn: "subscriptions.syncToken",
    sql: `ALTER TABLE "google_calendar_subscriptions" ADD COLUMN IF NOT EXISTS "syncToken" TEXT`,
  },
  {
    navn: "subscriptions.mirrorFrom",
    sql: `ALTER TABLE "google_calendar_subscriptions" ADD COLUMN IF NOT EXISTS "mirrorFrom" TIMESTAMP(3)`,
  },
  {
    navn: "subscriptions.mirrorTo",
    sql: `ALTER TABLE "google_calendar_subscriptions" ADD COLUMN IF NOT EXISTS "mirrorTo" TIMESTAMP(3)`,
  },
  // ── Skille «vis i kalender» fra «blokkér booking» (2026-07-27) ────────
  {
    navn: "subscriptions.visIKalender",
    sql: `ALTER TABLE "google_calendar_subscriptions"
          ADD COLUMN IF NOT EXISTS "visIKalender" BOOLEAN NOT NULL DEFAULT false`,
  },
  {
    // Kalendere som allerede var pull-aktive ble vist implisitt før skillet —
    // behold den oppførselen så ingenting forsvinner fra kalenderen.
    navn: "sett visIKalender for eksisterende pull-kalendere",
    sql: `UPDATE "google_calendar_subscriptions"
          SET "visIKalender" = true
          WHERE "syncPull" = true AND "active" = true AND "visIKalender" = false`,
  },
  // ── Steg 3: hva vi har pushet UT til Google, og hvor ──────────────────
  {
    navn: "pushed_calendar_events",
    sql: `
      CREATE TABLE IF NOT EXISTS "pushed_calendar_events" (
        "id" TEXT NOT NULL,
        "subscriptionId" TEXT NOT NULL,
        "googleEventId" TEXT NOT NULL,
        "kildeType" TEXT NOT NULL,
        "kildeId" TEXT NOT NULL,
        "startAt" TIMESTAMP(3) NOT NULL,
        "endAt" TIMESTAMP(3) NOT NULL,
        "sistPushetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "pushed_calendar_events_pkey" PRIMARY KEY ("id")
      )`,
  },
  {
    navn: "FK pushed → google_calendar_subscriptions",
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'pushed_calendar_events_subscriptionId_fkey'
        ) THEN
          ALTER TABLE "pushed_calendar_events"
            ADD CONSTRAINT "pushed_calendar_events_subscriptionId_fkey"
            FOREIGN KEY ("subscriptionId") REFERENCES "google_calendar_subscriptions"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$`,
  },
  {
    navn: "unique (subscriptionId, kildeType, kildeId)",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "pushed_calendar_events_subscriptionId_kildeType_kildeId_key"
          ON "pushed_calendar_events" ("subscriptionId", "kildeType", "kildeId")`,
  },
  {
    navn: "index (kildeType, kildeId)",
    sql: `CREATE INDEX IF NOT EXISTS "pushed_calendar_events_kildeType_kildeId_idx"
          ON "pushed_calendar_events" ("kildeType", "kildeId")`,
  },
  {
    navn: "index (googleEventId)",
    sql: `CREATE INDEX IF NOT EXISTS "pushed_calendar_events_googleEventId_idx"
          ON "pushed_calendar_events" ("googleEventId")`,
  },
  // Eksisterende bookinger som allerede er pushet: ta med koblingen inn i den
  // nye tabellen, slik at de oppdateres/slettes riktig framover i stedet for
  // å bli duplisert ved neste push. Kun push-kalendere, og kun der raden ikke
  // finnes fra før.
  {
    navn: "migrer eksisterende Booking.googleEventId",
    sql: `
      INSERT INTO "pushed_calendar_events"
        ("id", "subscriptionId", "googleEventId", "kildeType", "kildeId", "startAt", "endAt")
      SELECT
        gen_random_uuid()::text,
        s."id",
        b."googleEventId",
        'BOOKING',
        b."id",
        b."startAt",
        b."endAt"
      FROM "bookings" b
      JOIN "service_types" st ON st."id" = b."serviceTypeId"
      JOIN "google_calendar_connections" c ON c."userId" = st."coachUserId"
      JOIN "google_calendar_subscriptions" s
        ON s."connectionId" = c."id" AND s."syncPush" = true AND s."active" = true
      WHERE b."googleEventId" IS NOT NULL
      ON CONFLICT ("subscriptionId", "kildeType", "kildeId") DO NOTHING`,
  },
];

async function main() {
  for (const steg of STEG) {
    await prisma.$executeRawUnsafe(steg.sql);
    console.log(`  ok: ${steg.navn}`);
  }
  const rader = await prisma.$queryRawUnsafe<Array<{ n: bigint }>>(
    `SELECT count(*)::bigint AS n FROM "google_calendar_events"`,
  );
  console.log(`\nFerdig. google_calendar_events har ${rader[0]?.n ?? 0} rader.`);
}

main()
  .catch((e) => {
    console.error("Migrasjon feilet:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
