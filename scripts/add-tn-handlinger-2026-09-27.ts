/**
 * Team Norway — handlinger på alle skjermer (Anders 27.09.2026: «ta alt nå»).
 * Kirurgisk DDL: tn_posts.editedAt, tn_uttak, tn_spillerstatus, tn_college.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Idempotent og rent additivt.
 *
 *   npx tsx scripts/add-tn-handlinger-2026-09-27.ts
 *   npx tsx scripts/add-tn-handlinger-2026-09-27.ts --rollback
 */
import "./_env";
import { Client } from "pg";

const OPP = [
  `ALTER TABLE "tn_posts" ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP(3);`,
  `CREATE TABLE IF NOT EXISTS "tn_uttak" (
    "id" TEXT PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "arrangement" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "begrunnelse" TEXT,
    "decidedById" TEXT NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "tn_uttak_groupId_userId_arrangement_key" ON "tn_uttak" ("groupId", "userId", "arrangement");`,
  `CREATE INDEX IF NOT EXISTS "tn_uttak_groupId_arrangement_idx" ON "tn_uttak" ("groupId", "arrangement");`,
  `CREATE TABLE IF NOT EXISTS "tn_spillerstatus" (
    "id" TEXT PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aar" INTEGER NOT NULL,
    "lisensStatus" TEXT,
    "lisensBetaltDato" DATE,
    "helseattestUtloper" DATE,
    "antidopingSignert" DATE,
    "updatedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "tn_spillerstatus_groupId_userId_aar_key" ON "tn_spillerstatus" ("groupId", "userId", "aar");`,
  `CREATE TABLE IF NOT EXISTS "tn_college" (
    "id" TEXT PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skole" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startDato" DATE,
    "notat" TEXT,
    "updatedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "tn_college_groupId_userId_key" ON "tn_college" ("groupId", "userId");`,
  // Samme lås som resten av public: ingen tilgang via Supabase-klientens anon/authenticated.
  `ALTER TABLE "tn_uttak" ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE "tn_spillerstatus" ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE "tn_college" ENABLE ROW LEVEL SECURITY;`,
];

const NED = [
  `DROP TABLE IF EXISTS "tn_college";`,
  `DROP TABLE IF EXISTS "tn_spillerstatus";`,
  `DROP TABLE IF EXISTS "tn_uttak";`,
  `ALTER TABLE "tn_posts" DROP COLUMN IF EXISTS "editedAt";`,
];

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    for (const sql of process.argv.includes("--rollback") ? NED : OPP) await client.query(sql);
    const { rows } = await client.query(
      `SELECT table_name, count(*)::int AS kolonner FROM information_schema.columns WHERE table_name IN ('tn_uttak','tn_spillerstatus','tn_college') OR (table_name = 'tn_posts' AND column_name = 'editedAt') GROUP BY table_name ORDER BY table_name;`,
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
