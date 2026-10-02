-- CreateEnum
CREATE TYPE "RoundPlayStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "RoundDraftStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- AlterTable
ALTER TABLE "rounds" ADD COLUMN     "benchmarkLevelSnapshot" TEXT,
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "playStatus" "RoundPlayStatus" NOT NULL DEFAULT 'COMPLETED',
ADD COLUMN     "sgEngineVersion" TEXT,
ADD COLUMN     "sgReferenceSetId" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "teeId" TEXT,
ADD COLUMN     "weatherPrecipitation" TEXT,
ADD COLUMN     "weatherSource" TEXT,
ADD COLUMN     "weatherTemperatureC" DOUBLE PRECISION,
ADD COLUMN     "weatherWindDirection" TEXT,
ADD COLUMN     "weatherWindMps" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "shots" ADD COLUMN     "courseHoleId" TEXT,
ADD COLUMN     "endDistanceToPinM" DOUBLE PRECISION,
ADD COLUMN     "endLie" "ShotLie",
ADD COLUMN     "holed" BOOLEAN,
ADD COLUMN     "intendedAimDistanceM" DOUBLE PRECISION,
ADD COLUMN     "intendedAimLateralM" DOUBLE PRECISION,
ADD COLUMN     "measurementMethod" TEXT,
ADD COLUMN     "missLateralM" DOUBLE PRECISION,
ADD COLUMN     "missLongShortM" DOUBLE PRECISION,
ADD COLUMN     "penaltyStrokes" SMALLINT NOT NULL DEFAULT 0,
ADD COLUMN     "penaltyType" TEXT,
ADD COLUMN     "positionAccuracyM" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "putt_details" ADD COLUMN     "puttDirection" TEXT,
ADD COLUMN     "returnOfShotId" TEXT;

-- AlterTable
ALTER TABLE "hole_scores" ADD COLUMN     "courseHoleId" TEXT,
ADD COLUMN     "firstPuttFt" DOUBLE PRECISION,
ADD COLUMN     "handicapIndexSnapshot" INTEGER,
ADD COLUMN     "penalties" INTEGER,
ADD COLUMN     "teeLengthMSnapshot" INTEGER;

-- CreateTable
CREATE TABLE "round_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientRequestId" TEXT NOT NULL,
    "validatedPayload" JSONB NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "draftStatus" "RoundDraftStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "round_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_tees" (
    "id" TEXT NOT NULL,
    "baneId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "course_rating" DOUBLE PRECISION NOT NULL,
    "slope_rating" INTEGER NOT NULL,
    "par" INTEGER,
    "source" TEXT,
    "validFrom" DATE,
    "validTo" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_tees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_hole_tees" (
    "teeId" TEXT NOT NULL,
    "holeId" TEXT NOT NULL,
    "baneId" TEXT NOT NULL,
    "lengthM" INTEGER NOT NULL,
    "teeLat" DOUBLE PRECISION,
    "teeLng" DOUBLE PRECISION,
    "source" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_hole_tees_pkey" PRIMARY KEY ("teeId","holeId")
);

-- CreateTable
CREATE TABLE "sg_reference_sets" (
    "id" TEXT NOT NULL,
    "levelCode" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceVersion" TEXT NOT NULL,
    "licenceNote" TEXT,
    "validFrom" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "engineCompatibleVersion" TEXT NOT NULL,

    CONSTRAINT "sg_reference_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strokes_gained_baselines" (
    "id" TEXT NOT NULL,
    "referenceSetId" TEXT NOT NULL,
    "phase" "SgCategory" NOT NULL,
    "lie" "ShotLie" NOT NULL,
    "teePar" INTEGER NOT NULL DEFAULT 0,
    "distanceM" DOUBLE PRECISION NOT NULL,
    "expectedStrokes" DOUBLE PRECISION NOT NULL,
    "sampleSize" INTEGER,
    "sourceRow" TEXT,

    CONSTRAINT "strokes_gained_baselines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shot_sg_results" (
    "shotId" TEXT NOT NULL,
    "referenceSetId" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "phase" "SgCategory" NOT NULL,
    "expectedStart" DOUBLE PRECISION NOT NULL,
    "expectedEnd" DOUBLE PRECISION NOT NULL,
    "penaltyStrokes" SMALLINT NOT NULL DEFAULT 0,
    "sgValue" DOUBLE PRECISION NOT NULL,
    "inputQuality" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shot_sg_results_pkey" PRIMARY KEY ("shotId","referenceSetId","engineVersion")
);

-- CreateIndex
CREATE INDEX "round_drafts_userId_savedAt_idx" ON "round_drafts"("userId", "savedAt");

-- CreateIndex
CREATE UNIQUE INDEX "round_drafts_userId_clientRequestId_key" ON "round_drafts"("userId", "clientRequestId");

-- CreateIndex
CREATE INDEX "course_tees_baneId_idx" ON "course_tees"("baneId");

-- CreateIndex
CREATE UNIQUE INDEX "course_tees_baneId_code_key" ON "course_tees"("baneId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "course_tees_id_baneId_key" ON "course_tees"("id", "baneId");

-- CreateIndex
CREATE INDEX "course_hole_tees_holeId_idx" ON "course_hole_tees"("holeId");

-- CreateIndex
CREATE INDEX "course_hole_tees_holeId_baneId_idx" ON "course_hole_tees"("holeId", "baneId");

-- CreateIndex
CREATE INDEX "sg_reference_sets_levelCode_publishedAt_idx" ON "sg_reference_sets"("levelCode", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "sg_reference_sets_levelCode_sourceVersion_key" ON "sg_reference_sets"("levelCode", "sourceVersion");

-- CreateIndex
CREATE UNIQUE INDEX "strokes_gained_baselines_referenceSetId_phase_lie_teePar_di_key" ON "strokes_gained_baselines"("referenceSetId", "phase", "lie", "teePar", "distanceM");

-- CreateIndex
CREATE INDEX "shot_sg_results_referenceSetId_phase_idx" ON "shot_sg_results"("referenceSetId", "phase");

-- CreateIndex
CREATE INDEX "rounds_teeId_idx" ON "rounds"("teeId");

-- CreateIndex
CREATE INDEX "rounds_sgReferenceSetId_idx" ON "rounds"("sgReferenceSetId");

-- CreateIndex
CREATE INDEX "shots_courseHoleId_idx" ON "shots"("courseHoleId");

-- CreateIndex
CREATE INDEX "putt_details_returnOfShotId_idx" ON "putt_details"("returnOfShotId");

-- CreateIndex
CREATE INDEX "hole_scores_courseHoleId_idx" ON "hole_scores"("courseHoleId");

-- CreateIndex
CREATE UNIQUE INDEX "course_holes_id_baneId_key" ON "course_holes"("id", "baneId");

-- AddForeignKey
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_teeId_fkey" FOREIGN KEY ("teeId") REFERENCES "course_tees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_sgReferenceSetId_fkey" FOREIGN KEY ("sgReferenceSetId") REFERENCES "sg_reference_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_drafts" ADD CONSTRAINT "round_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shots" ADD CONSTRAINT "shots_courseHoleId_fkey" FOREIGN KEY ("courseHoleId") REFERENCES "course_holes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "putt_details" ADD CONSTRAINT "putt_details_returnOfShotId_fkey" FOREIGN KEY ("returnOfShotId") REFERENCES "shots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hole_scores" ADD CONSTRAINT "hole_scores_courseHoleId_fkey" FOREIGN KEY ("courseHoleId") REFERENCES "course_holes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_tees" ADD CONSTRAINT "course_tees_baneId_fkey" FOREIGN KEY ("baneId") REFERENCES "baner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_hole_tees" ADD CONSTRAINT "course_hole_tees_teeId_baneId_fkey" FOREIGN KEY ("teeId", "baneId") REFERENCES "course_tees"("id", "baneId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_hole_tees" ADD CONSTRAINT "course_hole_tees_holeId_baneId_fkey" FOREIGN KEY ("holeId", "baneId") REFERENCES "course_holes"("id", "baneId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strokes_gained_baselines" ADD CONSTRAINT "strokes_gained_baselines_referenceSetId_fkey" FOREIGN KEY ("referenceSetId") REFERENCES "sg_reference_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shot_sg_results" ADD CONSTRAINT "shot_sg_results_shotId_fkey" FOREIGN KEY ("shotId") REFERENCES "shots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shot_sg_results" ADD CONSTRAINT "shot_sg_results_referenceSetId_fkey" FOREIGN KEY ("referenceSetId") REFERENCES "sg_reference_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- V1 integrity: new nullable shot fields leave historical data untouched.
ALTER TABLE "course_tees" ADD CONSTRAINT "course_tees_rating_check"
  CHECK ("course_rating" > 0 AND "slope_rating" > 0 AND ("validTo" IS NULL OR "validFrom" IS NULL OR "validTo" >= "validFrom"));
ALTER TABLE "course_hole_tees" ADD CONSTRAINT "course_hole_tees_length_check" CHECK ("lengthM" > 0);
ALTER TABLE "round_drafts" ADD CONSTRAINT "round_drafts_revision_check" CHECK ("revision" >= 1);
ALTER TABLE "shots" ADD CONSTRAINT "shots_v1_values_check" CHECK (
  "penaltyStrokes" BETWEEN 0 AND 2 AND
  ("endDistanceToPinM" IS NULL OR "endDistanceToPinM" >= 0) AND
  ("intendedAimDistanceM" IS NULL OR "intendedAimDistanceM" >= 0) AND
  ("positionAccuracyM" IS NULL OR "positionAccuracyM" >= 0) AND
  ("holed" IS DISTINCT FROM TRUE OR ("endDistanceToPinM" = 0 AND "endLie" IS NULL))
);
ALTER TABLE "strokes_gained_baselines" ADD CONSTRAINT "sg_baseline_values_check" CHECK (
  "distanceM" >= 0 AND "expectedStrokes" >= 0 AND
  ("distanceM" <> 0 OR "expectedStrokes" = 0) AND
  ("sampleSize" IS NULL OR "sampleSize" >= 0) AND
  (("lie" = 'TEE' AND "teePar" BETWEEN 3 AND 6) OR ("lie" <> 'TEE' AND "teePar" = 0))
);
ALTER TABLE "shot_sg_results" ADD CONSTRAINT "shot_sg_results_values_check" CHECK (
  "expectedStart" >= 0 AND "expectedEnd" >= 0 AND "penaltyStrokes" BETWEEN 0 AND 2
);

-- Server-side Prisma is the access path. No browser role receives direct table access.
ALTER TABLE "course_tees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "course_hole_tees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "round_drafts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sg_reference_sets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "strokes_gained_baselines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shot_sg_results" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "course_tees", "course_hole_tees", "round_drafts", "sg_reference_sets",
  "strokes_gained_baselines", "shot_sg_results" FROM anon, authenticated;

-- A published reference set is a historical calculation source, never an editable draft.
CREATE FUNCTION "prevent_published_sg_reference_change"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD."publishedAt" IS NOT NULL THEN
    RAISE EXCEPTION 'Published SG reference sets are immutable';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "sg_reference_sets_immutable"
  BEFORE UPDATE OR DELETE ON "sg_reference_sets"
  FOR EACH ROW EXECUTE FUNCTION "prevent_published_sg_reference_change"();

CREATE FUNCTION "prevent_published_sg_baseline_change"() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  set_id text;
BEGIN
  IF TG_OP = 'DELETE' THEN set_id := OLD."referenceSetId";
  ELSE set_id := NEW."referenceSetId"; END IF;
  IF EXISTS (SELECT 1 FROM "sg_reference_sets" WHERE "id" = set_id AND "publishedAt" IS NOT NULL) THEN
    RAISE EXCEPTION 'Published SG baseline points are immutable';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD."referenceSetId" <> NEW."referenceSetId" AND
     EXISTS (SELECT 1 FROM "sg_reference_sets" WHERE "id" = OLD."referenceSetId" AND "publishedAt" IS NOT NULL) THEN
    RAISE EXCEPTION 'Published SG baseline points are immutable';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "sg_baselines_immutable"
  BEFORE INSERT OR UPDATE OR DELETE ON "strokes_gained_baselines"
  FOR EACH ROW EXECUTE FUNCTION "prevent_published_sg_baseline_change"();
REVOKE ALL ON FUNCTION "prevent_published_sg_reference_change"(),
  "prevent_published_sg_baseline_change"() FROM PUBLIC, anon, authenticated;
