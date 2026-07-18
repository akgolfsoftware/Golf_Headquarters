
-- CreateEnum
CREATE TYPE "NgfKategori" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L');

-- AlterTable
ALTER TABLE "exercise_definitions" ADD COLUMN     "coachNotes" TEXT,
ADD COLUMN     "csTargetByKategori" JSONB,
ADD COLUMN     "defaultReps" INTEGER,
ADD COLUMN     "defaultSets" INTEGER,
ADD COLUMN     "environment" "SessionEnvironment"[] DEFAULT ARRAY[]::"SessionEnvironment"[],
ADD COLUMN     "intensitet" INTEGER,
ADD COLUMN     "kilde" TEXT,
ADD COLUMN     "lPhases" "LPhase"[] DEFAULT ARRAY[]::"LPhase"[],
ADD COLUMN     "maxHcp" DOUBLE PRECISION,
ADD COLUMN     "maxKategori" "NgfKategori",
ADD COLUMN     "minHcp" DOUBLE PRECISION,
ADD COLUMN     "minKategori" "NgfKategori",
ADD COLUMN     "morad" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "skillArea" "SkillArea",
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "utstyr" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "plan_templates" DROP COLUMN "active",
DROP COLUMN "payload",
DROP COLUMN "weeks",
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "byCoachId" TEXT,
ADD COLUMN     "disciplinFordeling" JSONB NOT NULL,
ADD COLUMN     "effectivenessAvg" DOUBLE PRECISION,
ADD COLUMN     "kategori" "NgfKategori" NOT NULL,
ADD COLUMN     "lPhase" "LPhase" NOT NULL,
ADD COLUMN     "maxAlder" INTEGER,
ADD COLUMN     "minAlder" INTEGER,
ADD COLUMN     "ukentligOktAntall" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "varighetUker" INTEGER NOT NULL DEFAULT 4;

-- CreateTable
CREATE TABLE "plan_template_sessions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "ukeNr" INTEGER NOT NULL,
    "dagNr" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "varighetMin" INTEGER NOT NULL,
    "pyramidArea" "PyramidArea" NOT NULL,
    "skillArea" "SkillArea",
    "environment" "SessionEnvironment" NOT NULL,
    "drillsJson" JSONB NOT NULL,
    "focus" TEXT,
    "notes" TEXT,

    CONSTRAINT "plan_template_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_effectiveness" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "templateId" TEXT,
    "userId" TEXT NOT NULL,
    "preSnapshot" JSONB NOT NULL,
    "postSnapshot" JSONB NOT NULL,
    "sgTotalDelta" DOUBLE PRECISION,
    "sgOttDelta" DOUBLE PRECISION,
    "sgAppDelta" DOUBLE PRECISION,
    "sgArgDelta" DOUBLE PRECISION,
    "sgPuttDelta" DOUBLE PRECISION,
    "hcpDelta" DOUBLE PRECISION,
    "completionRate" DOUBLE PRECISION NOT NULL,
    "selfRating" DOUBLE PRECISION,
    "coachRating" DOUBLE PRECISION,
    "notes" TEXT,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_effectiveness_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_template_sessions_templateId_idx" ON "plan_template_sessions"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_template_sessions_templateId_ukeNr_dagNr_key" ON "plan_template_sessions"("templateId", "ukeNr", "dagNr");

-- CreateIndex
CREATE UNIQUE INDEX "plan_effectiveness_planId_key" ON "plan_effectiveness"("planId");

-- CreateIndex
CREATE INDEX "plan_effectiveness_userId_idx" ON "plan_effectiveness"("userId");

-- CreateIndex
CREATE INDEX "plan_effectiveness_templateId_idx" ON "plan_effectiveness"("templateId");

-- CreateIndex
CREATE INDEX "exercise_definitions_skillArea_idx" ON "exercise_definitions"("skillArea");

-- CreateIndex
CREATE INDEX "exercise_definitions_minKategori_maxKategori_idx" ON "exercise_definitions"("minKategori", "maxKategori");

-- CreateIndex
CREATE INDEX "plan_templates_kategori_lPhase_idx" ON "plan_templates"("kategori", "lPhase");

-- CreateIndex
CREATE UNIQUE INDEX "plan_templates_kategori_lPhase_name_key" ON "plan_templates"("kategori", "lPhase", "name");

-- AddForeignKey
ALTER TABLE "plan_templates" ADD CONSTRAINT "plan_templates_byCoachId_fkey" FOREIGN KEY ("byCoachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_templates" ADD CONSTRAINT "plan_templates_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_template_sessions" ADD CONSTRAINT "plan_template_sessions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "plan_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_effectiveness" ADD CONSTRAINT "plan_effectiveness_planId_fkey" FOREIGN KEY ("planId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_effectiveness" ADD CONSTRAINT "plan_effectiveness_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "plan_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_effectiveness" ADD CONSTRAINT "plan_effectiveness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

