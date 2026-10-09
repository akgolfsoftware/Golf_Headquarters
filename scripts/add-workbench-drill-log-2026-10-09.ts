/**
 * Live-økt lagrer det som skjer (krav 2, Anders 09.10.2026).
 *
 * Rent tillegg, ingen rader endres:
 * - ny tabell `workbench_drill_logs` (reps, område, sted, avstand og kommentar
 *   per øvelse i en WorkbenchSession)
 * - ny kolonne `position_task_logs.workbenchSessionId` med unik nøkkel
 *   (taskId, workbenchSessionId, hastighet), så en fullført økt teller mot
 *   oppgaven i teknisk plan bare én gang
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Målet må oppgis eksplisitt
 * som host:port/database, ellers stopper skriptet. Idempotent.
 *
 *   WB_DRILL_LOG_EXPECT_TARGET=<host>:<port>/<database> npx tsx scripts/add-workbench-drill-log-2026-10-09.ts
 *
 * Produksjon: kjøres først når Anders har sagt ja.
 */
import "./_env";
import { Client } from "pg";

export const WORKBENCH_DRILL_LOG_SQL = [
  `CREATE TABLE IF NOT EXISTS "workbench_drill_logs" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "drillId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "loggedById" TEXT NOT NULL,
    "drillTittel" TEXT NOT NULL,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "motorikk" TEXT,
    "omraade" TEXT,
    "sted" TEXT,
    "avstand" TEXT,
    "kommentar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "workbench_drill_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workbench_drill_logs_sessionId_fkey" FOREIGN KEY ("sessionId")
      REFERENCES "workbench_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "workbench_drill_logs_sessionId_drillId_key" ON "workbench_drill_logs"("sessionId", "drillId")`,
  `CREATE INDEX IF NOT EXISTS "workbench_drill_logs_playerId_updatedAt_idx" ON "workbench_drill_logs"("playerId", "updatedAt")`,
  `ALTER TABLE "position_task_logs" ADD COLUMN IF NOT EXISTS "workbenchSessionId" TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "position_task_logs_taskId_workbenchSessionId_hastighet_key" ON "position_task_logs"("taskId", "workbenchSessionId", "hastighet")`,
  `CREATE INDEX IF NOT EXISTS "position_task_logs_workbenchSessionId_idx" ON "position_task_logs"("workbenchSessionId")`,
];

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const parsed = new URL(url);
  const target = `${parsed.hostname}:${parsed.port}${parsed.pathname}`;
  const expected = process.env.WB_DRILL_LOG_EXPECT_TARGET;
  if (!expected || expected !== target) {
    throw new Error("DIRECT_URL samsvarer ikke med WB_DRILL_LOG_EXPECT_TARGET.");
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("BEGIN");
    for (const sql of WORKBENCH_DRILL_LOG_SQL) await client.query(sql);
    await client.query("COMMIT");
    const { rows } = await client.query(
      `select table_name, column_name from information_schema.columns
       where (table_name = 'workbench_drill_logs') or (table_name = 'position_task_logs' and column_name = 'workbenchSessionId')
       order by table_name, ordinal_position`,
    );
    console.log(`Kolonner etter kjøring: ${rows.length}`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await client.end();
  }
}

if (process.argv[1]?.endsWith("add-workbench-drill-log-2026-10-09.ts")) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : "Ukjent feil");
    process.exit(1);
  });
}
