-- Sprint G: Coach-feedback på fullført live-økt
-- Adds coachFeedback fields to TrainingPlanSessionLog

ALTER TABLE "training_plan_session_logs"
  ADD COLUMN "coachFeedback"     TEXT,
  ADD COLUMN "coachFeedbackAt"   TIMESTAMP(3),
  ADD COLUMN "coachFeedbackById" TEXT;

CREATE INDEX "training_plan_session_logs_coachFeedbackAt_idx"
  ON "training_plan_session_logs"("coachFeedbackAt");
