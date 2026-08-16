/**
 * Test- og delingsdatamodellen (plan T1):
 *
 * - test_definitions.erCanon + backfill av CANON-batteriet (20 protokoller —
 *   «Putt Speed Control» ligger som to gjennomføringsvarianter i basen, så
 *   21 rader markeres; det forklarer det gamle 20-vs-21-avviket)
 * - talent_tracking: testNivaaer/sisteTestSyncAt/autoInnmeldt (T4-syncen)
 * - users.profilKilde (sporing av TalentHQ-inngang)
 * - nye tabeller delings_samtykker + ekstern_leser_grupper (T8, RLS på)
 *
 * Gotcha: prisma migrate-kommandoene er blokkert (gotchas.md §Schema-
 * endringer) — kirurgisk DDL mot DIRECT_URL. Idempotent.
 *
 *   npx tsx scripts/add-test-deling-datamodell-2026-08-16.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

/**
 * CANON v3.5-batteriets 20 protokoller mappet til test_definitions.name.
 * Kilde: prisma/seed-data/ngf-test-battery.json (20 tester) mot faktiske
 * DB-navn (verifisert 2026-08-16). Putt Speed Control → to varianter.
 */
const CANON_TESTNAVN = [
  "Driver Basic",
  "Inspill Basis", // batteriet: «Inspill Basic»
  "Wedge Variation",
  "8-ball Variation", // batteriet: «8-Ball Variation»
  "Putt 1-3m",
  "TN Driver Gate", // batteriet: «Driver Gate»
  "TN Putt Gate",
  "TN Nærspill Gate",
  "TN VISA Express",
  "Putt Speed 1x5", // batteriet: «Putt Speed Control» (variant 1 av 2)
  "Putt Speed 3x3", // batteriet: «Putt Speed Control» (variant 2 av 2)
  "TN Wedge Gate",
  "Trapbar Deadlift", // batteriet: «Trapbarmarkløft»
  "Benkpress",
  "Standing Long Jump", // batteriet: «Stille lengde»
  "Ball Throw", // batteriet: «Ballkast knestående»
  "Clubhead Speed (CHS)",
  "PEI Test Bane",
  "Inspill 120m",
  "Inspill 160m",
  "Inspill Variation",
] as const;

async function main() {
  // ── 1. Kolonner ──────────────────────────────────────────────────────────
  for (const ddl of [
    `ALTER TABLE test_definitions ADD COLUMN IF NOT EXISTS "erCanon" boolean NOT NULL DEFAULT false;`,
    `ALTER TABLE talent_tracking ADD COLUMN IF NOT EXISTS "testNivaaer" jsonb;`,
    `ALTER TABLE talent_tracking ADD COLUMN IF NOT EXISTS "sisteTestSyncAt" timestamp(3);`,
    `ALTER TABLE talent_tracking ADD COLUMN IF NOT EXISTS "autoInnmeldt" boolean NOT NULL DEFAULT false;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "profilKilde" text;`,
  ]) {
    await prisma.$executeRawUnsafe(ddl);
  }

  // ── 2. delings_samtykker (append-only, RLS) ──────────────────────────────
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS delings_samtykker (
      "id"               text NOT NULL,
      "userId"           text NOT NULL,
      "scope"            text NOT NULL,
      "mottakerGruppeId" text NOT NULL,
      "gitt"             boolean NOT NULL,
      "tekstVersjon"     text NOT NULL,
      "gittAvUserId"     text NOT NULL,
      "gittAvRolle"      text NOT NULL,
      "createdAt"        timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT delings_samtykker_pkey PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "delings_samtykker_userId_scope_mottakerGruppeId_createdAt_idx"
       ON delings_samtykker ("userId", "scope", "mottakerGruppeId", "createdAt");`,
  );
  for (const [conname, ddl] of [
    [
      "delings_samtykker_userId_fkey",
      `ALTER TABLE delings_samtykker ADD CONSTRAINT "delings_samtykker_userId_fkey"
       FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;`,
    ],
    [
      "delings_samtykker_mottakerGruppeId_fkey",
      `ALTER TABLE delings_samtykker ADD CONSTRAINT "delings_samtykker_mottakerGruppeId_fkey"
       FOREIGN KEY ("mottakerGruppeId") REFERENCES groups(id) ON DELETE CASCADE ON UPDATE CASCADE;`,
    ],
  ] as const) {
    const finnes = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${conname}') AS exists;`,
    );
    if (!finnes[0]?.exists) await prisma.$executeRawUnsafe(ddl);
  }
  // PII/samtykkedata — aldri lesbart med anon-nøkkel.
  await prisma.$executeRawUnsafe(`ALTER TABLE delings_samtykker ENABLE ROW LEVEL SECURITY;`);

  // ── 3. ekstern_leser_grupper (RLS) ───────────────────────────────────────
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ekstern_leser_grupper (
      "id"            text NOT NULL,
      "userId"        text NOT NULL,
      "groupId"       text NOT NULL,
      "opprettetAvId" text,
      "createdAt"     timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "revokedAt"     timestamp(3),
      CONSTRAINT ekstern_leser_grupper_pkey PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "ekstern_leser_grupper_userId_groupId_key"
       ON ekstern_leser_grupper ("userId", "groupId");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "ekstern_leser_grupper_userId_revokedAt_idx"
       ON ekstern_leser_grupper ("userId", "revokedAt");`,
  );
  for (const [conname, ddl] of [
    [
      "ekstern_leser_grupper_userId_fkey",
      `ALTER TABLE ekstern_leser_grupper ADD CONSTRAINT "ekstern_leser_grupper_userId_fkey"
       FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;`,
    ],
    [
      "ekstern_leser_grupper_groupId_fkey",
      `ALTER TABLE ekstern_leser_grupper ADD CONSTRAINT "ekstern_leser_grupper_groupId_fkey"
       FOREIGN KEY ("groupId") REFERENCES groups(id) ON DELETE CASCADE ON UPDATE CASCADE;`,
    ],
  ] as const) {
    const finnes = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${conname}') AS exists;`,
    );
    if (!finnes[0]?.exists) await prisma.$executeRawUnsafe(ddl);
  }
  await prisma.$executeRawUnsafe(`ALTER TABLE ekstern_leser_grupper ENABLE ROW LEVEL SECURITY;`);

  // ── 4. Canon-backfill ────────────────────────────────────────────────────
  const treff = await prisma.testDefinition.updateMany({
    where: { name: { in: [...CANON_TESTNAVN] }, isCustom: false },
    data: { erCanon: true },
  });
  const antallCanon = await prisma.testDefinition.count({ where: { erCanon: true } });
  const manglende: string[] = [];
  for (const navn of CANON_TESTNAVN) {
    const n = await prisma.testDefinition.count({ where: { name: navn, isCustom: false } });
    if (n === 0) manglende.push(navn);
  }

  console.log(
    `test/deling-datamodell — OK. Canon: ${treff.count} oppdatert, ${antallCanon} totalt (forventet 21).`,
  );
  if (manglende.length) {
    console.warn(`ADVARSEL — canon-navn uten DB-treff: ${manglende.join(", ")}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
