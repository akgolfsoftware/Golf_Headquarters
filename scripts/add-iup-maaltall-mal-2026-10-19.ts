/**
 * IUP-måltall (PH-11-MAL-IUP, 19.10.2026): spillerens eget mål per måltall og skoleår.
 * Kirurgisk DDL: ny tabell iup_maaltall_mal. Ingen eksisterende rader endres.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Idempotent og rent additivt.
 *
 *   npx tsx scripts/add-iup-maaltall-mal-2026-10-19.ts
 *   npx tsx scripts/add-iup-maaltall-mal-2026-10-19.ts --rollback
 */
import "./_env";
import { Client } from "pg";

const OPP = [
  `CREATE TABLE IF NOT EXISTS "iup_maaltall_mal" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "sesong" TEXT NOT NULL,
    "maaltall" TEXT NOT NULL,
    "verdi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "iup_maaltall_mal_userId_sesong_maaltall_key" ON "iup_maaltall_mal" ("userId", "sesong", "maaltall");`,
  `CREATE INDEX IF NOT EXISTS "iup_maaltall_mal_userId_idx" ON "iup_maaltall_mal" ("userId");`,
  // Samme lås som resten av public: ingen tilgang via Supabase-klientens anon/authenticated.
  `ALTER TABLE "iup_maaltall_mal" ENABLE ROW LEVEL SECURITY;`,
];

const NED = [`DROP TABLE IF EXISTS "iup_maaltall_mal";`];

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    for (const sql of process.argv.includes("--rollback") ? NED : OPP) await client.query(sql);
    const { rows } = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'iup_maaltall_mal' ORDER BY ordinal_position;`,
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
