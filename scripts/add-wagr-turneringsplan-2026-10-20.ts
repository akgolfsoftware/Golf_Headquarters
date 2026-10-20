/**
 * Turneringsplanleggeren med WAGR-anslag (Anders 20.10.2026): tabellene wagr_model_runs,
 * wagr_plan_events og wagr_player_strengths, og kolonnen tournament_entries."wagrPlanEventId".
 * Alt er rent additivt, ingen eksisterende rader endres. Pipelines skriver radene.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Idempotent.
 *
 *   npx tsx scripts/add-wagr-turneringsplan-2026-10-20.ts
 *   npx tsx scripts/add-wagr-turneringsplan-2026-10-20.ts --rollback   (fjerner bare det dette skriptet la til)
 */
import "./_env";
import { Client } from "pg";

const TABELLER = ["wagr_model_runs", "wagr_plan_events", "wagr_player_strengths"];

const OPP = [
  `CREATE TABLE IF NOT EXISTS "wagr_model_runs" (
    "id" TEXT PRIMARY KEY,
    "season" INTEGER NOT NULL,
    "builtAt" DATE NOT NULL,
    "sigma" DOUBLE PRECISION NOT NULL,
    "form" DOUBLE PRECISION NOT NULL,
    "pointsCurve" JSONB NOT NULL,
    "powerEdges" JSONB NOT NULL,
    "fieldProfiles" JSONB NOT NULL,
    "rankingCurves" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS "wagr_model_runs_season_builtAt_idx" ON "wagr_model_runs" ("season", "builtAt");`,
  `CREATE TABLE IF NOT EXISTS "wagr_plan_events" (
    "id" TEXT PRIMARY KEY,
    "season" INTEGER NOT NULL,
    "wagrEventId" INTEGER NOT NULL,
    "modelRunId" TEXT NOT NULL REFERENCES "wagr_model_runs"("id") ON DELETE RESTRICT,
    "name" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "days" INTEGER NOT NULL,
    "dateEstimated" BOOLEAN NOT NULL DEFAULT true,
    "country" TEXT,
    "region" TEXT,
    "course" TEXT,
    "power" DOUBLE PRECISION,
    "eventType" TEXT,
    "ageLimit" TEXT,
    "series" TEXT,
    "genders" TEXT NOT NULL,
    "field" JSONB,
    "wagrUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "wagr_plan_events_season_wagrEventId_key" ON "wagr_plan_events" ("season", "wagrEventId");`,
  `CREATE INDEX IF NOT EXISTS "wagr_plan_events_season_startDate_idx" ON "wagr_plan_events" ("season", "startDate");`,
  `CREATE INDEX IF NOT EXISTS "wagr_plan_events_modelRunId_idx" ON "wagr_plan_events" ("modelRunId");`,
  `CREATE TABLE IF NOT EXISTS "wagr_player_strengths" (
    "id" TEXT PRIMARY KEY,
    "modelRunId" TEXT NOT NULL REFERENCES "wagr_model_runs"("id") ON DELETE CASCADE,
    "wagrPlayerId" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "theta" DOUBLE PRECISION,
    "rounds" INTEGER NOT NULL,
    "rank" INTEGER,
    "pointsAvg" DOUBLE PRECISION,
    "counting" JSONB NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "wagr_player_strengths_modelRunId_wagrPlayerId_key" ON "wagr_player_strengths" ("modelRunId", "wagrPlayerId");`,
  `CREATE INDEX IF NOT EXISTS "wagr_player_strengths_wagrPlayerId_idx" ON "wagr_player_strengths" ("wagrPlayerId");`,
  `ALTER TABLE "tournament_entries" ADD COLUMN IF NOT EXISTS "wagrPlanEventId" TEXT;`,
  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tournament_entries_wagrPlanEventId_fkey') THEN
       ALTER TABLE "tournament_entries" ADD CONSTRAINT "tournament_entries_wagrPlanEventId_fkey"
         FOREIGN KEY ("wagrPlanEventId") REFERENCES "wagr_plan_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
     END IF;
   END $$;`,
  `CREATE INDEX IF NOT EXISTS "tournament_entries_wagrPlanEventId_idx" ON "tournament_entries" ("wagrPlanEventId");`,
  // Samme lås som resten av public: ingen tilgang via Supabase-klientens anon/authenticated.
  ...TABELLER.map((t) => `ALTER TABLE "${t}" ENABLE ROW LEVEL SECURITY;`),
];

const NED = [
  `ALTER TABLE "tournament_entries" DROP CONSTRAINT IF EXISTS "tournament_entries_wagrPlanEventId_fkey";`,
  `DROP INDEX IF EXISTS "tournament_entries_wagrPlanEventId_idx";`,
  `ALTER TABLE "tournament_entries" DROP COLUMN IF EXISTS "wagrPlanEventId";`,
  `DROP TABLE IF EXISTS "wagr_player_strengths";`,
  `DROP TABLE IF EXISTS "wagr_plan_events";`,
  `DROP TABLE IF EXISTS "wagr_model_runs";`,
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
         JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
        WHERE c.relname = ANY($1) GROUP BY c.relname, c.relrowsecurity ORDER BY c.relname;`,
      [TABELLER],
    );
    console.table(rows);
    const kol = await client.query(
      `SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tournament_entries' AND column_name = 'wagrPlanEventId';`,
    );
    console.log(`tournament_entries."wagrPlanEventId": ${kol.rowCount ? "finnes" : "mangler"}`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
