/**
 * Additivt grunnlag for felles testarrangement med flere stasjoner.
 *
 * Eldre `test_days` er fortsatt enkeltstående dager når `eventId IS NULL`.
 * Et fellesarrangement samler flere `test_days`; hver barnrad er én stasjon,
 * med dagens eksisterende protokoll, deltakerkø, TestSession og TestResult.
 * Ingen eksisterende resultat eller TestDay-rad blir skrevet om.
 *
 * Kjør kun etter at prosjekt/miljø og database er kontrollert:
 *   TN_TESTDAY_EVENTS_EXPECT_TARGET=<vert:port/database> npx tsx scripts/add-tn-testday-events-2026-10-02.ts
 * Rollback kan bare kjøres når arrangementstabellen og event-kolonnen er tom:
 *   npx tsx scripts/add-tn-testday-events-2026-10-02.ts --rollback
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const parsed = new URL(url);
  const target = `${parsed.hostname}:${parsed.port || "5432"}${parsed.pathname}`;
  const expected = process.env.TN_TESTDAY_EVENTS_EXPECT_TARGET;
  if (!expected || expected !== target) throw new Error("DIRECT_URL samsvarer ikke med TN_TESTDAY_EVENTS_EXPECT_TARGET.");
  const rollback = process.argv.includes("--rollback");
  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query("BEGIN");
    if (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost") {
      const identity = await client.query<{ name: string }>(`
        SELECT name FROM public._testbatteri_identity WHERE name = 'ak-hq-testbatteri-20261002'
      `);
      if (identity.rowCount !== 1) throw new Error("Testdatabasens identitet stemmer ikke.");
    }
    if (rollback) {
      const { rows } = await client.query<{ events: number; linked_days: number }>(`
        SELECT
          (SELECT count(*)::int FROM "test_day_events") AS events,
          (SELECT count(*)::int FROM "test_days" WHERE "eventId" IS NOT NULL) AS linked_days
      `);
      if (rows[0].events !== 0 || rows[0].linked_days !== 0) {
        throw new Error("Rollback stoppet: arrangement eller koblede testdager finnes.");
      }
      await client.query(`DROP TABLE "test_day_events"`);
      await client.query(`ALTER TABLE "test_days" DROP COLUMN "stationName", DROP COLUMN "eventId"`);
      await client.query("COMMIT");
      console.log("Tomt testdag-arrangement rullet tilbake.");
      return;
    }

    const enumCheck = await client.query<{ exists: boolean }>(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'TestDayStatus'
      ) AS exists
    `);
    if (!enumCheck.rows[0].exists) {
      throw new Error("TestDayStatus finnes ikke. Kjør godkjent TN-testdag-DDL først.");
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS "test_day_events" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "organizerGroupId" TEXT NOT NULL,
        "organizerId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "location" TEXT,
        "scheduledAt" TIMESTAMP(3) NOT NULL,
        "status" "TestDayStatus" NOT NULL DEFAULT 'PLANNED',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "test_day_events_organizerGroupId_fkey"
          FOREIGN KEY ("organizerGroupId") REFERENCES "groups"("id") ON DELETE CASCADE,
        CONSTRAINT "test_day_events_organizerId_fkey"
          FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await client.query(`ALTER TABLE "test_days" ADD COLUMN IF NOT EXISTS "eventId" TEXT`);
    await client.query(`ALTER TABLE "test_days" ADD COLUMN IF NOT EXISTS "stationName" TEXT`);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "test_days" ADD CONSTRAINT "test_days_eventId_fkey"
          FOREIGN KEY ("eventId") REFERENCES "test_day_events"("id") ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS "test_day_events_organizerGroupId_status_idx" ON "test_day_events"("organizerGroupId", "status")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "test_day_events_organizerId_idx" ON "test_day_events"("organizerId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "test_day_events_scheduledAt_idx" ON "test_day_events"("scheduledAt")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "test_days_eventId_idx" ON "test_days"("eventId")`);

    // Arrangementet er bare tilgjengelig gjennom serverhandlinger som gjør
    // ny rolle- og gruppesjekk. Vanlige Supabase-klientroller får ingen rader.
    await client.query(`ALTER TABLE "test_day_events" ENABLE ROW LEVEL SECURITY`);
    await client.query(`
      DO $$ DECLARE role_name TEXT;
      BEGIN
        FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
            EXECUTE format('REVOKE ALL ON TABLE "test_day_events" FROM %I', role_name);
          END IF;
        END LOOP;
      END $$
    `);

    const { rows } = await client.query(`
      SELECT
        (SELECT count(*)::int FROM "test_day_events") AS events,
        (SELECT count(*)::int FROM "test_days" WHERE "eventId" IS NOT NULL) AS linked_stations
    `);
    await client.query("COMMIT");
    console.log(`test_day_events klar — ${rows[0].events} arrangementer, ${rows[0].linked_stations} koblede stasjoner`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  // Errors may contain connection details; only print the static failure reason
  // for the preflight checks above. Driver errors are reduced to their class.
  const safe = error instanceof Error && /^(DIRECT_URL mangler|DIRECT_URL samsvarer ikke|Testdatabasens identitet stemmer ikke|TestDayStatus finnes ikke|Rollback stoppet)/.test(error.message)
    ? error.message
    : "Databaseoperasjonen kunne ikke fullføres.";
  console.error(safe);
  process.exitCode = 1;
});
