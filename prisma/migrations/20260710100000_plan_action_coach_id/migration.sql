-- PlanAction coach-scope: coachId for coach-spesifikk godkjenningskø (overnight W1)

ALTER TABLE "plan_actions" ADD COLUMN IF NOT EXISTS "coachId" TEXT;

CREATE INDEX IF NOT EXISTS "plan_actions_coachId_status_createdAt_idx"
  ON "plan_actions"("coachId", "status", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'plan_actions_coachId_fkey'
  ) THEN
    ALTER TABLE "plan_actions"
      ADD CONSTRAINT "plan_actions_coachId_fkey"
      FOREIGN KEY ("coachId") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;