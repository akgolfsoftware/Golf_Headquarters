/**
 * Turneringsplaner for referansespillerne (Anders 20.10.2026): tabellen wagr_reference_plans med
 * lås (RLS) og stempling av hvem som lagret. Siden teamnorwayref.vercel.app skriver hit med den
 * innloggede trenerens HQ-konto. Rent additivt, ingen eksisterende rader endres. Idempotent.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy (`.claude/rules/gotchas.md`
 * §Schema-endringer). Hele migration.sql kjøres som ett skript (dollar-quotede funksjoner).
 *
 *   npx tsx scripts/add-wagr-reference-plans-2026-10-20.ts
 *   npx tsx scripts/add-wagr-reference-plans-2026-10-20.ts --rollback   (fjerner bare det dette skriptet la til)
 */
import "./_env";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const OPP = readFileSync(
  join(__dirname, "..", "prisma/migrations/20261020140000_wagr_reference_plans/migration.sql"),
  "utf-8",
);

const NED = `
DROP TABLE IF EXISTS "wagr_reference_plans";
DROP FUNCTION IF EXISTS "wagr_reference_plans_stamp"();
DROP FUNCTION IF EXISTS "wagr_reference_plans_editor"();
`;

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(process.argv.includes("--rollback") ? NED : OPP);
    const { rows } = await client.query(
      `SELECT c.relname AS tabell, c.relrowsecurity AS rls,
              (SELECT count(*)::int FROM pg_policies p WHERE p.tablename = c.relname) AS regler
         FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
        WHERE c.relname = 'wagr_reference_plans';`,
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
