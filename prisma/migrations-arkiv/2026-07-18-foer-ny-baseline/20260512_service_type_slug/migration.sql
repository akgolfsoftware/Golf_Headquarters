-- Add slug column to ServiceType for public booking URLs.
ALTER TABLE "service_types" ADD COLUMN "slug" TEXT;

-- Backfill: generate slugs from existing names (lowercase, hyphenated)
UPDATE "service_types" SET "slug" = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'));

-- Now make NOT NULL and unique
ALTER TABLE "service_types" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "service_types_slug_key" ON "service_types"("slug");
