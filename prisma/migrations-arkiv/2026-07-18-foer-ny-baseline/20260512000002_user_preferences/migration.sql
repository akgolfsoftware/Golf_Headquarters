-- Fase 1.10: User.preferences for notif-toggles og språkvalg
-- Applied: 2026-05-12 via psql

ALTER TABLE "users" ADD COLUMN "preferences" JSONB;
