-- Existing columns contain DataGolf SG-per-shot buckets. Keep them separate
-- from expected strokes to hole so neither number can be read as the other.
ALTER TABLE public.sg_baselines
  ALTER COLUMN "category" DROP NOT NULL,
  ALTER COLUMN "distanceBucket" DROP NOT NULL,
  ALTER COLUMN "expectedStrokes" DROP NOT NULL,
  ALTER COLUMN "sampleSize" DROP NOT NULL,
  ALTER COLUMN "source" DROP NOT NULL,
  ALTER COLUMN "fetchedAt" DROP NOT NULL,
  ADD COLUMN "baseline_kind" TEXT NOT NULL DEFAULT 'legacy_sg_bucket',
  ADD COLUMN "baseline_version" TEXT,
  ADD COLUMN "distance_meters" NUMERIC(7, 2),
  ADD COLUMN "lie_type" TEXT,
  ADD COLUMN "expected_strokes" NUMERIC(7, 4),
  ADD COLUMN "source_reference" TEXT,
  ADD COLUMN "quality" TEXT,
  ADD COLUMN "is_supported" BOOLEAN;

ALTER TABLE public.sg_baselines
  ADD CONSTRAINT "sg_baselines_kind_check" CHECK (
    ("baseline_kind" = 'legacy_sg_bucket'
      AND "category" IS NOT NULL
      AND "distanceBucket" IS NOT NULL
      AND "expectedStrokes" IS NOT NULL
      AND "sampleSize" IS NOT NULL
      AND "source" IS NOT NULL
      AND "fetchedAt" IS NOT NULL
      AND "baseline_version" IS NULL
      AND "distance_meters" IS NULL
      AND "lie_type" IS NULL
      AND "expected_strokes" IS NULL)
    OR
    ("baseline_kind" = 'expected_to_hole'
      AND "category" IS NULL
      AND "distanceBucket" IS NULL
      AND "lie" IS NULL
      AND "expectedStrokes" IS NULL
      AND "baseline_version" IS NOT NULL
      AND "distance_meters" BETWEEN 0 AND 500
      AND "lie_type" IN ('Tee', 'Fairway', 'Rough', 'Sand', 'Recovery', 'Green')
      AND (("is_supported" IS TRUE AND "expected_strokes" IS NOT NULL AND "expected_strokes" >= 0)
        OR ("is_supported" IS FALSE AND "expected_strokes" IS NULL))
      AND "source_reference" IS NOT NULL
      AND "quality" IS NOT NULL
      AND "is_supported" IS NOT NULL)
  );

CREATE UNIQUE INDEX "sg_baselines_version_lie_distance_key"
  ON public.sg_baselines ("baseline_version", "lie_type", "distance_meters");

-- public.sg_baselines already has RLS enabled. No client policies are added:
-- only the server-side database connection may read/write these baselines.
