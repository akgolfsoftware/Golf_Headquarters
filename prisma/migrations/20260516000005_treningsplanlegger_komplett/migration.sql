-- Treningsplanlegger (Masterplan Sesjon 0) — Prisma-grunnlag
-- Applied: 2026-05-16

-- CreateEnum
CREATE TYPE "LFase" AS ENUM ('L_KROPP', 'L_ARM', 'L_KOLLE', 'L_BALL', 'L_AUTO');

-- CreateEnum
CREATE TYPE "CSNivaa" AS ENUM ('CS50', 'CS60', 'CS70', 'CS80', 'CS90', 'CS100');

-- CreateEnum
CREATE TYPE "MMiljo" AS ENUM ('M0', 'M1', 'M2', 'M3', 'M4', 'M5');

-- CreateEnum
CREATE TYPE "PRPress" AS ENUM ('PR1', 'PR2', 'PR3', 'PR4', 'PR5');

-- CreateEnum
CREATE TYPE "PracticeType" AS ENUM ('BLOKK', 'RANDOM', 'KONKURRANSE', 'SPILL_TEST');

-- CreateEnum
CREATE TYPE "PeriodeType" AS ENUM ('GRUNN', 'SPESIALISERING', 'TURNERING', 'EVALUERING', 'FERIE');

-- AlterTable: TrainingPlan
ALTER TABLE "training_plans" ADD COLUMN "periodeType" "PeriodeType";
ALTER TABLE "training_plans" ADD COLUMN "pyramidOverride" JSONB;

-- CreateTable
CREATE TABLE "training_sessions_v2" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "studentId" TEXT,
    "groupId" TEXT,
    "coachId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "miljo" "MMiljo" NOT NULL,
    "practiceType" "PracticeType" NOT NULL,
    "notes" TEXT,
    "isCoachCreated" BOOLEAN NOT NULL DEFAULT true,
    "rrule" TEXT,
    "recurringGroupId" TEXT,
    "isException" BOOLEAN NOT NULL DEFAULT false,
    "generertFra" TEXT,
    "generertFraId" TEXT,
    "regelBrudd" JSONB,
    "trengerOppmerksomhet" BOOLEAN NOT NULL DEFAULT false,
    "drillLoggInterval" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "training_sessions_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_drills_v2" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "repetitions" INTEGER,
    "drillLoggInterval" INTEGER NOT NULL DEFAULT 1,
    "pyramide" "PyramidArea" NOT NULL,
    "omraade" TEXT,
    "lFase" "LFase",
    "csNivaa" "CSNivaa",
    "miljo" "MMiljo",
    "prPress" "PRPress",
    "pPosisjoner" TEXT[],
    "lifeKode" TEXT,
    "componentFocus" TEXT,
    "slowMotionMode" BOOLEAN NOT NULL DEFAULT false,
    "fysTreningstype" TEXT,
    "fysMuskelgruppe" TEXT,
    "fysOvelse" TEXT,
    "fysSett" INTEGER,
    "fysReps" INTEGER,
    "fysVektKg" DOUBLE PRECISION,
    "fysVektProsent" INTEGER,
    "fysTempo" TEXT,
    "fysPauseSek" INTEGER,
    "fysVarighetMin" INTEGER,
    "fysIntensitetsSone" INTEGER,
    "fysDistanseM" INTEGER,
    "fysAktivitet" TEXT,
    "fysBevegelighetType" TEXT,
    "fysHoldSek" INTEGER,
    "notes" TEXT,
    CONSTRAINT "training_drills_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drill_logs_v2" (
    "id" TEXT NOT NULL,
    "drillId" TEXT NOT NULL,
    "loggedBy" TEXT NOT NULL,
    "successRate" INTEGER NOT NULL,
    "notes" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "drill_logs_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locked_anchors" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "pyramide" "PyramidArea" NOT NULL,
    "ukedag" INTEGER NOT NULL,
    "startTid" TEXT NOT NULL,
    "sluttTid" TEXT NOT NULL,
    "startDato" TIMESTAMP(3) NOT NULL,
    "sluttDato" TIMESTAMP(3) NOT NULL,
    "varighetMin" INTEGER NOT NULL,
    "beskrivelse" TEXT,
    "fysMuskelgruppe" TEXT,
    "fysTreningstype" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "locked_anchors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_patterns" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "pyramide" "PyramidArea" NOT NULL,
    "rrule" TEXT NOT NULL,
    "startDato" TIMESTAMP(3) NOT NULL,
    "sluttDato" TIMESTAMP(3),
    "startTid" TEXT NOT NULL,
    "varighetMin" INTEGER NOT NULL,
    "beskrivelse" TEXT,
    "fysMuskelgruppe" TEXT,
    "fysTreningstype" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recurring_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "period_volume_recipes" (
    "id" TEXT NOT NULL,
    "trainingPlanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "period_volume_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "period_recipe_okter" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "pyramide" "PyramidArea" NOT NULL,
    "antallPerUke" INTEGER NOT NULL,
    "varighetMin" INTEGER NOT NULL,
    "fysTreningstype" TEXT,
    "fysMuskelgruppeRotasjon" TEXT[],
    "preferertUkedag" INTEGER,
    "preferertTid" TEXT,
    "notat" TEXT,
    CONSTRAINT "period_recipe_okter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conditional_rules" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "trainingPlanId" TEXT,
    "navn" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parametere" JSONB NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "prioritet" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conditional_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drill_maler" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "kategori" TEXT NOT NULL,
    "pyramide" "PyramidArea" NOT NULL,
    "erFavoritt" BOOLEAN NOT NULL DEFAULT false,
    "erGlobal" BOOLEAN NOT NULL DEFAULT false,
    "bruktAntall" INTEGER NOT NULL DEFAULT 0,
    "sistBrukt" TIMESTAMP(3),
    "omraade" TEXT,
    "lFase" "LFase",
    "csNivaa" "CSNivaa",
    "miljo" "MMiljo",
    "prPress" "PRPress",
    "pPosisjoner" TEXT[],
    "componentFocus" TEXT,
    "fysTreningstype" TEXT,
    "fysMuskelgruppe" TEXT,
    "fysOvelse" TEXT,
    "fysSett" INTEGER,
    "fysReps" INTEGER,
    "fysVektProsent" INTEGER,
    "fysVarighetMin" INTEGER,
    "fysIntensitetsSone" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "drill_maler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okt_maler" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "kategori" TEXT NOT NULL,
    "pyramide" "PyramidArea" NOT NULL,
    "periodeType" "PeriodeType",
    "kategoriAK" TEXT,
    "erFavoritt" BOOLEAN NOT NULL DEFAULT false,
    "erGlobal" BOOLEAN NOT NULL DEFAULT false,
    "bruktAntall" INTEGER NOT NULL DEFAULT 0,
    "sistBrukt" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL,
    "practiceType" "PracticeType" NOT NULL,
    "notat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "okt_maler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okt_mal_driller" (
    "id" TEXT NOT NULL,
    "malId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "pyramide" "PyramidArea" NOT NULL,
    "navn" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "omraade" TEXT,
    "lFase" "LFase",
    "csNivaa" "CSNivaa",
    CONSTRAINT "okt_mal_driller_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_sessions_v2_studentId_startTime_idx" ON "training_sessions_v2"("studentId", "startTime");
CREATE INDEX "training_sessions_v2_coachId_startTime_idx" ON "training_sessions_v2"("coachId", "startTime");
CREATE INDEX "training_drills_v2_sessionId_idx" ON "training_drills_v2"("sessionId");
CREATE INDEX "drill_logs_v2_drillId_idx" ON "drill_logs_v2"("drillId");
CREATE INDEX "locked_anchors_studentId_idx" ON "locked_anchors"("studentId");
CREATE INDEX "recurring_patterns_studentId_idx" ON "recurring_patterns"("studentId");
CREATE UNIQUE INDEX "period_volume_recipes_trainingPlanId_key" ON "period_volume_recipes"("trainingPlanId");
CREATE INDEX "period_recipe_okter_recipeId_idx" ON "period_recipe_okter"("recipeId");
CREATE INDEX "conditional_rules_studentId_idx" ON "conditional_rules"("studentId");
CREATE INDEX "conditional_rules_trainingPlanId_idx" ON "conditional_rules"("trainingPlanId");
CREATE INDEX "drill_maler_coachId_idx" ON "drill_maler"("coachId");
CREATE INDEX "drill_maler_pyramide_idx" ON "drill_maler"("pyramide");
CREATE INDEX "okt_maler_coachId_idx" ON "okt_maler"("coachId");
CREATE INDEX "okt_maler_pyramide_idx" ON "okt_maler"("pyramide");
CREATE INDEX "okt_mal_driller_malId_idx" ON "okt_mal_driller"("malId");

-- AddForeignKey
ALTER TABLE "training_drills_v2" ADD CONSTRAINT "training_drills_v2_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_sessions_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "drill_logs_v2" ADD CONSTRAINT "drill_logs_v2_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "training_drills_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "period_recipe_okter" ADD CONSTRAINT "period_recipe_okter_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "period_volume_recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "okt_mal_driller" ADD CONSTRAINT "okt_mal_driller_malId_fkey" FOREIGN KEY ("malId") REFERENCES "okt_maler"("id") ON DELETE CASCADE ON UPDATE CASCADE;
