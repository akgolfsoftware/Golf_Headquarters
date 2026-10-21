/**
 * Referanse › WAGR i Team Norway-trenerflaten (Anders 21.10.2026, beslutninger.md
 * §TEAM NORWAY-TRENERFLATEN BYGGES I HQ, punkt 5): tabellene wagr_ref_groups,
 * wagr_ref_group_members, wagr_ref_players og wagr_ref_results. Rent additivt, ingen
 * eksisterende rader endres. Pipelines (mandagsjobben i ak-golf-pipelines) skriver radene.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Idempotent.
 *
 *   npx tsx scripts/add-wagr-ref-tabeller-2026-10-21.ts
 *   npx tsx scripts/add-wagr-ref-tabeller-2026-10-21.ts --rollback   (fjerner bare det dette skriptet la til)
 */
import "./_env";
import { Client } from "pg";

const TABELLER = ["wagr_ref_groups", "wagr_ref_group_members", "wagr_ref_players", "wagr_ref_results"];

const OPP = [
  `CREATE TABLE IF NOT EXISTS "wagr_ref_groups" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "selection" TEXT,
    "gender" TEXT,
    "onlyYear" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "wagrDate" DATE NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "wagr_ref_players" (
    "wagrPlayerId" INTEGER PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "gender" TEXT,
    "rank" INTEGER,
    "pointsAvg" DOUBLE PRECISION,
    "divisor" DOUBLE PRECISION,
    "bestRank" INTEGER,
    "wins" INTEGER,
    "yearEndRanks" JSONB NOT NULL DEFAULT '{}',
    "yearStats" JSONB NOT NULL DEFAULT '{}',
    "wagrDate" DATE NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "wagr_ref_group_members" (
    "groupId" TEXT NOT NULL REFERENCES "wagr_ref_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "wagrPlayerId" INTEGER NOT NULL REFERENCES "wagr_ref_players"("wagrPlayerId") ON DELETE CASCADE ON UPDATE CASCADE,
    "level" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY ("groupId", "wagrPlayerId")
  );`,
  `CREATE INDEX IF NOT EXISTS "wagr_ref_group_members_wagrPlayerId_idx" ON "wagr_ref_group_members" ("wagrPlayerId");`,
  `CREATE TABLE IF NOT EXISTS "wagr_ref_results" (
    "id" TEXT PRIMARY KEY,
    "wagrPlayerId" INTEGER NOT NULL REFERENCES "wagr_ref_players"("wagrPlayerId") ON DELETE CASCADE ON UPDATE CASCADE,
    "wagrEventId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "week" INTEGER,
    "date" DATE,
    "country" TEXT,
    "city" TEXT,
    "finish" TEXT,
    "power" DOUBLE PRECISION,
    "points" DOUBLE PRECISION,
    "eventType" TEXT,
    "format" TEXT,
    "rounds" JSONB NOT NULL DEFAULT '[]',
    "fieldSize" INTEGER,
    "rankBefore" INTEGER,
    "rankAfter" INTEGER
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "wagr_ref_results_wagrPlayerId_wagrEventId_key" ON "wagr_ref_results" ("wagrPlayerId", "wagrEventId");`,
  `CREATE INDEX IF NOT EXISTS "wagr_ref_results_wagrPlayerId_year_idx" ON "wagr_ref_results" ("wagrPlayerId", "year");`,
  // Samme lås som resten av public: ingen tilgang via Supabase-klientens anon/authenticated.
  ...TABELLER.map((t) => `ALTER TABLE "${t}" ENABLE ROW LEVEL SECURITY;`),
];

const NED = [
  `DROP TABLE IF EXISTS "wagr_ref_results";`,
  `DROP TABLE IF EXISTS "wagr_ref_group_members";`,
  `DROP TABLE IF EXISTS "wagr_ref_players";`,
  `DROP TABLE IF EXISTS "wagr_ref_groups";`,
];

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
         JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
        WHERE c.relname = ANY($1) GROUP BY c.relname, c.relrowsecurity ORDER BY c.relname;`,
      [TABELLER],
    );
    console.table(rows);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
