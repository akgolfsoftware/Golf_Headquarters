/**
 * «Alle norske» på teamnorwayref.vercel.app (Anders 20.10.2026): funksjonene alle_norske_sok() og
 * alle_norske_profil(), som anon kan kalle, pluss tre hjelperegler. Låsen (født 2005 eller tidligere,
 * norsk, kjent fødselsår) står i alle_norske_synlig(). Rent additivt, ingen tabeller eller rader
 * endres. Idempotent.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy (`.claude/rules/gotchas.md`
 * §Schema-endringer). Hele migration.sql kjøres som ett skript (dollar-quotede funksjoner).
 *
 *   npx tsx scripts/add-alle-norske-sok-2026-10-20.ts
 *   npx tsx scripts/add-alle-norske-sok-2026-10-20.ts --rollback   (fjerner bare det dette skriptet la til)
 */
import "./_env";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const OPP = readFileSync(
  join(__dirname, "..", "prisma/migrations/20261020180000_alle_norske_sok/migration.sql"),
  "utf-8",
);

const NED = `
DROP FUNCTION IF EXISTS "alle_norske_profil"(text);
DROP FUNCTION IF EXISTS "alle_norske_sok"(text, text, integer, text);
DROP FUNCTION IF EXISTS "alle_norske_nokkel"(text);
DROP FUNCTION IF EXISTS "alle_norske_er_netto"(text);
DROP FUNCTION IF EXISTS "alle_norske_synlig"(text, integer, boolean);
`;

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(process.argv.includes("--rollback") ? NED : OPP);
    const { rows } = await client.query(
      `SELECT p.proname AS funksjon, p.prosecdef AS security_definer,
              has_function_privilege('anon', p.oid, 'EXECUTE') AS anon,
              has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated
         FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace AND n.nspname = 'public'
        WHERE p.proname LIKE 'alle\\_norske\\_%' ORDER BY 1;`,
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
