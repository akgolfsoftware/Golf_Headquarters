-- Additiv R06.2-lagring på eksisterende ukeplan. Ingen enum-, data- eller RLS-endring.
ALTER TABLE "public"."week_plans" ADD COLUMN "planningDetails" JSONB;
