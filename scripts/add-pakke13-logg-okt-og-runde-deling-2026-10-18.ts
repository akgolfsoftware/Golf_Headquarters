/**
 * Kirurgisk DDL — PlayerHQ pakke 13. Logg økt i etterkant: pyramide, område, sted,
 * belastning og fokus på `training_logs`, og `sgArea` valgfri (fysisk og teknisk økt har
 * ikke SG-område). Del runde: `rounds.sharedWithCoach` (standard true, som i dag).
 * Additivt og bakoverkompatibelt; ingen rader endres.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Idempotent.
 *
 *   npx tsx scripts/add-pakke13-logg-okt-og-runde-deling-2026-10-18.ts
 */
import "./_env";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const SQL = join(__dirname, "..", "prisma/migrations/20261018120000_pakke13_logg_okt_og_runde_deling/migration.sql");

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(readFileSync(SQL, "utf-8"));
    const { rows } = await client.query(`
      select column_name, is_nullable from information_schema.columns
      where table_schema = 'public' and table_name = 'training_logs'
        and column_name in ('pyramid','area','location','effort','focus','sgArea')
      order by column_name
    `);
    console.log(rows.map((r) => `${r.column_name}${r.is_nullable === "YES" ? " (valgfri)" : ""}`).join(", "));
    const { rows: delt } = await client.query(`
      select count(*)::int as n from information_schema.columns
      where table_schema = 'public' and table_name = 'rounds' and column_name = 'sharedWithCoach'
    `);
    console.log(`rounds.sharedWithCoach: ${delt[0].n === 1 ? "finnes" : "mangler"}`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
