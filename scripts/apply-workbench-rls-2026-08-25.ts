/**
 * Slår på RLS + policies for workbench_sessions og workbench_drills.
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (se .claude/rules/gotchas.md §Schema-endringer). Kirurgisk
 * kjøring mot DIRECT_URL er den dokumenterte veien.
 *
 * Kjører hele migration.sql som ett multi-statement-script via `pg` (samme
 * mønster som scripts/audit-rls.ts) — IKKE Prisma sin $executeRawUnsafe, som
 * bruker extended protocol og ikke tillater flere statements (og ville delt
 * opp den dollar-quotede funksjonskroppen feil om vi splittet selv på ";").
 *
 * Idempotent — CREATE OR REPLACE FUNCTION og DROP POLICY IF EXISTS + CREATE
 * POLICY. Trygg å kjøre flere ganger. Rører kun de to Workbench-tabellene
 * (pluss én ny hjelpefunksjon, workbench_coach_has_player_access).
 *
 *   npx tsx scripts/apply-workbench-rls-2026-08-25.ts
 *
 * Rollback: npx tsx scripts/apply-workbench-rls-2026-08-25.ts --rollback
 */
import { Client } from "pg";
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import { join } from "node:path";

loadEnv({ path: ".env.local" });

const direct = process.env.DIRECT_URL;
if (!direct) {
  console.error("DIRECT_URL mangler i .env.local");
  process.exit(1);
}

const MIGRATION_SQL = join(
  __dirname,
  "..",
  "prisma/migrations/20260825140000_workbench_rls/migration.sql",
);

const ROLLBACK_SQL = `
DROP POLICY IF EXISTS "workbench_sessions_select" ON "workbench_sessions";
DROP POLICY IF EXISTS "workbench_sessions_insert" ON "workbench_sessions";
DROP POLICY IF EXISTS "workbench_sessions_update" ON "workbench_sessions";
DROP POLICY IF EXISTS "workbench_sessions_delete" ON "workbench_sessions";
DROP POLICY IF EXISTS "workbench_drills_select" ON "workbench_drills";
DROP POLICY IF EXISTS "workbench_drills_write" ON "workbench_drills";
ALTER TABLE "workbench_sessions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "workbench_drills" DISABLE ROW LEVEL SECURITY;
DROP FUNCTION IF EXISTS "workbench_coach_has_player_access"(text, text);
`;

async function main() {
  const rollback = process.argv.includes("--rollback");
  const sql = rollback ? ROLLBACK_SQL : readFileSync(MIGRATION_SQL, "utf-8");

  const client = new Client({ connectionString: direct });
  await client.connect();
  try {
    await client.query(sql);
    console.log(rollback ? "OK — RLS rullet tilbake." : "OK — RLS + policies opprettet.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
