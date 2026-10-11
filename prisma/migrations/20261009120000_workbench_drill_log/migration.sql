-- Record only (gotchas §Database). Kjøres via scripts/add-workbench-drill-log-2026-10-09.ts.
CREATE TABLE IF NOT EXISTS "workbench_drill_logs" (
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
    CONSTRAINT "workbench_drill_logs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "workbench_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "workbench_drill_logs_sessionId_drillId_key" ON "workbench_drill_logs"("sessionId", "drillId");
CREATE INDEX IF NOT EXISTS "workbench_drill_logs_playerId_updatedAt_idx" ON "workbench_drill_logs"("playerId", "updatedAt");
ALTER TABLE "position_task_logs" ADD COLUMN IF NOT EXISTS "workbenchSessionId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "position_task_logs_taskId_workbenchSessionId_hastighet_key" ON "position_task_logs"("taskId", "workbenchSessionId", "hastighet");
CREATE INDEX IF NOT EXISTS "position_task_logs_workbenchSessionId_idx" ON "position_task_logs"("workbenchSessionId");
