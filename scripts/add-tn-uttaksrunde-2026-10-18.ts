/**
 * Team Norway uttak: frist og antall plasser per uttaksrunde (nattkjøring 18.10.2026, pakke T1).
 * Kirurgisk DDL: ny tabell tn_uttaksrunde. Ingen eksisterende rader endres.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Idempotent og rent additivt.
 *
 *   npx tsx scripts/add-tn-uttaksrunde-2026-10-18.ts
 *   npx tsx scripts/add-tn-uttaksrunde-2026-10-18.ts --rollback
 */
import "./_env";
import { Client } from "pg";

const OPP = [
  `CREATE TABLE IF NOT EXISTS "tn_uttaksrunde" (
    "id" TEXT PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "arrangement" TEXT NOT NULL,
    "frist" DATE,
    "plasser" INTEGER,
    "reserver" INTEGER,
    "updatedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "tn_uttaksrunde_groupId_arrangement_key" ON "tn_uttaksrunde" ("groupId", "arrangement");`,
  // Samme lås som resten av public: ingen tilgang via Supabase-klientens anon/authenticated.
  `ALTER TABLE "tn_uttaksrunde" ENABLE ROW LEVEL SECURITY;`,
];

const NED = [`DROP TABLE IF EXISTS "tn_uttaksrunde";`];

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    for (const sql of process.argv.includes("--rollback") ? NED : OPP) await client.query(sql);
    const { rows } = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tn_uttaksrunde' ORDER BY ordinal_position;`,
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
