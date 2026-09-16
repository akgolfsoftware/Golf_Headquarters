/**
 * OW-3 fase 1 — kirurgisk DDL: additive felt på workbench_sessions for å ta
 * imot migrerte training_plan_sessions-rader (fase 2).
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Idempotent.
 *
 * Se docs/planer/ow-3-en-oekt-modell-2026-09-16.md for hele planen.
 *
 *   npx tsx scripts/ow3-fase1-utvid-workbench-session-2026-09-16.ts
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query(`
      ALTER TABLE "workbench_sessions"
        ADD COLUMN IF NOT EXISTS "planId" TEXT,
        ADD COLUMN IF NOT EXISTS "rationale" TEXT,
        ADD COLUMN IF NOT EXISTS "skillArea" TEXT,
        ADD COLUMN IF NOT EXISTS "pressureLevel" TEXT,
        ADD COLUMN IF NOT EXISTS "pPosisjoner" TEXT[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS "maalsetning" TEXT,
        ADD COLUMN IF NOT EXISTS "liveSnapshot" JSONB,
        ADD COLUMN IF NOT EXISTS "lFase" TEXT,
        ADD COLUMN IF NOT EXISTS "miljo" TEXT,
        ADD COLUMN IF NOT EXISTS "csNivaa" TEXT,
        ADD COLUMN IF NOT EXISTS "migrertFraTrainingPlanSessionId" TEXT;
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "workbench_sessions_migrertFraTrainingPlanSessionId_key"
      ON "workbench_sessions" ("migrertFraTrainingPlanSessionId");
    `);

    const { rows } = await client.query(`
      select column_name from information_schema.columns
      where table_name = 'workbench_sessions'
        and column_name in ('planId','rationale','skillArea','pressureLevel','pPosisjoner',
          'maalsetning','liveSnapshot','lFase','miljo','csNivaa','migrertFraTrainingPlanSessionId')
      order by column_name
    `);
    console.log(`OK — ${rows.length}/11 nye kolonner finnes på workbench_sessions:`, rows.map((r) => r.column_name));
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
