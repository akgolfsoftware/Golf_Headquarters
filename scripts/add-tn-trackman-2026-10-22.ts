/**
 * TrackMan i Team Norway-testene (§TRACKMAN I TEAM NORWAY-TESTENE, Anders 22.10.2026, planfila §6.2 og §6.4):
 *   - trackman_sessions."akse": TEK eller SLAG, påkrevd ved ny import (gamle økter står uten og vises som «—»).
 *   - test_shot_trackman_links: hvilket TrackMan-slag et testforsøk kom fra, per testøkt og forsøk.
 *     Knyttet til testøkta (test_sessions), ikke resultatet, fordi koblingen gjøres mens testen pågår.
 *   - trackman_maal: egne mål og vinduer per spiller, kølle og parameter, med hvem og når.
 * Alt er rent additivt, ingen eksisterende rader endres.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Database). Idempotent.
 *
 *   npx tsx scripts/add-tn-trackman-2026-10-22.ts
 *   npx tsx scripts/add-tn-trackman-2026-10-22.ts --rollback   (fjerner bare tabellene og kolonnen)
 */
import "./_env";
import { Client } from "pg";

const TABELLER = ["test_shot_trackman_links", "trackman_maal"];

const OPP = [
  `ALTER TABLE "trackman_sessions" ADD COLUMN IF NOT EXISTS "akse" TEXT CHECK ("akse" IN ('TEK', 'SLAG'));`,
  `CREATE TABLE IF NOT EXISTS "test_shot_trackman_links" (
    "id" TEXT PRIMARY KEY,
    "testSessionId" TEXT NOT NULL REFERENCES "test_sessions"("id") ON DELETE CASCADE,
    "forsokIndeks" INTEGER NOT NULL CHECK ("forsokIndeks" >= 0),
    "trackManShotId" TEXT NOT NULL REFERENCES "trackman_shots"("id") ON DELETE CASCADE,
    "passerIkke" BOOLEAN NOT NULL DEFAULT false,
    "kobletAvId" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
    "kobletAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "test_shot_trackman_links_testSessionId_forsokIndeks_key" ON "test_shot_trackman_links" ("testSessionId", "forsokIndeks");`,
  `CREATE INDEX IF NOT EXISTS "test_shot_trackman_links_trackManShotId_idx" ON "test_shot_trackman_links" ("trackManShotId");`,
  `CREATE TABLE IF NOT EXISTS "trackman_maal" (
    "id" TEXT PRIMARY KEY,
    "spillerId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "kolle" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "maal" DOUBLE PRECISION,
    "vinduMin" DOUBLE PRECISION,
    "vinduMax" DOUBLE PRECISION,
    "settAvId" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
    "settAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK ("vinduMin" IS NULL OR "vinduMax" IS NULL OR "vinduMin" <= "vinduMax")
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "trackman_maal_spillerId_kolle_parameter_key" ON "trackman_maal" ("spillerId", "kolle", "parameter");`,
  // Samme lås som resten av public: ingen tilgang via Supabase-klientens anon/authenticated.
  ...TABELLER.map((t) => `ALTER TABLE "${t}" ENABLE ROW LEVEL SECURITY;`),
];

const NED = [
  `DROP TABLE IF EXISTS "trackman_maal";`,
  `DROP TABLE IF EXISTS "test_shot_trackman_links";`,
  `ALTER TABLE "trackman_sessions" DROP COLUMN IF EXISTS "akse";`,
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
        WHERE c.relname = ANY($1) GROUP BY c.relname, c.relrowsecurity ORDER BY c.relname;`,
      [TABELLER],
    );
    console.log(rows);
    const k = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'trackman_sessions' AND column_name = 'akse'`);
    console.log("trackman_sessions.akse:", k.rowCount === 1 ? "finnes" : "mangler");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
