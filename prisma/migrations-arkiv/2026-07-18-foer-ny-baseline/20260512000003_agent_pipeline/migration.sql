-- Fase 1.12: Agent-pipeline (Signal + PlanAction + AgentRun)
-- Applied: 2026-05-12 via psql

CREATE TABLE "signals" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "userId"     TEXT NOT NULL,
  "kind"       TEXT NOT NULL,
  "value"      DOUBLE PRECISION,
  "payload"    JSONB,
  "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "signals_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "signals_userId_kind_computedAt_idx" ON "signals"("userId", "kind", "computedAt");

CREATE TABLE "plan_actions" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "userId"     TEXT NOT NULL,
  "planId"     TEXT,
  "actionType" TEXT NOT NULL,
  "suggestion" JSONB NOT NULL,
  "status"     TEXT NOT NULL DEFAULT 'PENDING',
  "agentName"  TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "plan_actions_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "plan_actions_planId_fkey" FOREIGN KEY ("planId")
    REFERENCES "training_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "plan_actions_userId_status_createdAt_idx" ON "plan_actions"("userId", "status", "createdAt");

CREATE TABLE "agent_runs" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "agentName" TEXT NOT NULL,
  "userId"    TEXT,
  "status"    TEXT NOT NULL,
  "duration"  INTEGER NOT NULL,
  "output"    JSONB,
  "error"     TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "agent_runs_agentName_createdAt_idx" ON "agent_runs"("agentName", "createdAt");

-- RLS
ALTER TABLE "signals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_actions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agent_runs" ENABLE ROW LEVEL SECURITY;

-- signals: bruker leser egne, COACH/ADMIN ser alt. Skriving er service-role only (gjøres via Prisma som bypasser RLS uansett).
CREATE POLICY "signals_select" ON "signals"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "signals"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

-- plan_actions: bruker leser/oppdaterer egne (godkjenn/avvis), COACH/ADMIN ser alle
CREATE POLICY "plan_actions_select" ON "plan_actions"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "plan_actions"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

CREATE POLICY "plan_actions_update" ON "plan_actions"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "plan_actions"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

-- agent_runs: kun ADMIN leser
CREATE POLICY "agent_runs_admin_select" ON "agent_runs"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" = 'ADMIN'
    )
  );
