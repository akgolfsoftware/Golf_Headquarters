/**
 * WANG opptak og koordinering mellom skolene (nattkjøring 18.10.2026, pakke W3).
 * Kirurgisk DDL: wang_opptak, wang_kandidater, wang_kandidat_stjerner, wang_kandidat_kontakter.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Idempotent og rent additivt.
 *
 *   npx tsx scripts/add-wang-opptak-2026-10-18.ts
 *   npx tsx scripts/add-wang-opptak-2026-10-18.ts --rollback
 */
import "./_env";
import { Client } from "pg";

const TABELLER = ["wang_opptak", "wang_kandidater", "wang_kandidat_stjerner", "wang_kandidat_kontakter"];

const OPP = [
  `CREATE TABLE IF NOT EXISTS "wang_opptak" (
    "id" TEXT PRIMARY KEY,
    "groupId" TEXT NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
    "skoleaar" TEXT NOT NULL,
    "plasser" INTEGER,
    "updatedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "wang_opptak_groupId_skoleaar_key" ON "wang_opptak" ("groupId", "skoleaar");`,
  `CREATE TABLE IF NOT EXISTS "wang_kandidater" (
    "id" TEXT PRIMARY KEY,
    "groupId" TEXT NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
    "skoleaar" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "klubb" TEXT,
    "fodselsaar" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SOKT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS "wang_kandidater_groupId_skoleaar_idx" ON "wang_kandidater" ("groupId", "skoleaar");`,
  `CREATE INDEX IF NOT EXISTS "wang_kandidater_skoleaar_idx" ON "wang_kandidater" ("skoleaar");`,
  `CREATE TABLE IF NOT EXISTS "wang_kandidat_stjerner" (
    "id" TEXT PRIMARY KEY,
    "kandidatId" TEXT NOT NULL REFERENCES "wang_kandidater"("id") ON DELETE CASCADE,
    "groupId" TEXT NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "wang_kandidat_stjerner_kandidatId_groupId_key" ON "wang_kandidat_stjerner" ("kandidatId", "groupId");`,
  `CREATE TABLE IF NOT EXISTS "wang_kandidat_kontakter" (
    "id" TEXT PRIMARY KEY,
    "kandidatId" TEXT NOT NULL REFERENCES "wang_kandidater"("id") ON DELETE CASCADE,
    "groupId" TEXT NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
    "personRolle" TEXT NOT NULL,
    "personNavn" TEXT NOT NULL,
    "mottaker" TEXT NOT NULL,
    "kontaktetAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS "wang_kandidat_kontakter_kandidatId_kontaktetAt_idx" ON "wang_kandidat_kontakter" ("kandidatId", "kontaktetAt");`,
  // Samme lås som resten av public: ingen tilgang via Supabase-klientens anon/authenticated.
  ...TABELLER.map((t) => `ALTER TABLE "${t}" ENABLE ROW LEVEL SECURITY;`),
];

const NED = [...TABELLER].reverse().map((t) => `DROP TABLE IF EXISTS "${t}";`);

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    for (const sql of process.argv.includes("--rollback") ? NED : OPP) await client.query(sql);
    const { rows } = await client.query(
      `SELECT c.relname AS tabell, c.relrowsecurity AS rls, count(a.attname)::int AS kolonner
         FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
        WHERE c.relname = ANY($1) GROUP BY c.relname, c.relrowsecurity ORDER BY c.relname;`,
      [TABELLER],
    );
    console.log(rows);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
