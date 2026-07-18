-- Geo-koordinater på Location (for Mapbox)
-- Applied: 2026-05-16

ALTER TABLE "locations"
  ADD COLUMN "latitude"  DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION;
