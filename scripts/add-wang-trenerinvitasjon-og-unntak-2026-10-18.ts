/**
 * WANG trenerinvitasjon og timeplanunntak (W4) — kirurgisk DDL.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Idempotent og additiv:
 * oppretter bare to nye WANG-tabeller med indekser og RLS på.
 *
 *   npx tsx scripts/add-wang-trenerinvitasjon-og-unntak-2026-10-18.ts
 */
import "./_env";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const MIGRATION_SQL = join(
  __dirname,
  "..",
  "prisma/migrations/20261018230000_wang_trenerinvitasjon_og_unntak/migration.sql",
);

const PRODUCTION_PROJECT_REF = "dcnxoztjtdqoidaekxry";

function assertSafeDatabase(url: string) {
  const parsed = new URL(url);
  const host = parsed.hostname.toLowerCase();
  const projectRef = parsed.username.split(".")[1] ?? null;
  const allowRemote = process.argv.includes("--allow-remote");
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".local");
  if (!isLocal && !allowRemote) {
    throw new Error(
      `Nekter å kjøre DDL mot ikke-lokal database (${host}). Bruk --allow-remote bare etter eksplisitt DB-godkjenning.`,
    );
  }
  if (
    !isLocal &&
    (projectRef !== PRODUCTION_PROJECT_REF || parsed.port !== "5432")
  ) {
    throw new Error(
      "Nekter å kjøre DDL: DIRECT_URL må peke til AK Golf HQ sin godkjente Supabase session pooler på port 5432.",
    );
  }
}

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  assertSafeDatabase(url);

  const sql = readFileSync(MIGRATION_SQL, "utf-8");
  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query(sql);
    const { rows } = await client.query(`
      select table_name, (select relrowsecurity from pg_class where relname = table_name) as rls
      from information_schema.tables
      where table_schema = 'public'
        and table_name in ('wang_trener_invitasjoner', 'wang_timeplan_unntak')
      order by table_name
    `);
    console.log(`OK — ${rows.length}/2 WANG-tabeller finnes:`, rows);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
