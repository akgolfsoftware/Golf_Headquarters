-- CreateEnum
CREATE TYPE "PressureLevel" AS ENUM ('PR1', 'PR2', 'PR3', 'PR4', 'PR5');

-- AlterTable: ExerciseDefinition
ALTER TABLE "exercise_definitions" ADD COLUMN "durationMin" INTEGER;
ALTER TABLE "exercise_definitions" ADD COLUMN "createdBy" TEXT;
ALTER TABLE "exercise_definitions" ADD COLUMN "parametersJson" JSONB;
ALTER TABLE "exercise_definitions" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "exercise_definitions" ALTER COLUMN "lPhase" DROP NOT NULL;

-- AlterTable: TrainingPlanSession
ALTER TABLE "training_plan_sessions" ADD COLUMN "pressureLevel" "PressureLevel";

-- AddForeignKey
ALTER TABLE "exercise_definitions" ADD CONSTRAINT "exercise_definitions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
