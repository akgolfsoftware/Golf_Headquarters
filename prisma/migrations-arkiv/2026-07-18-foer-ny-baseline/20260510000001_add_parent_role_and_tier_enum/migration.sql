-- Fase 1.1: Auth utvidelse — enum-additions
-- Applied: 2026-05-10 via Supabase MCP

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PARENT';
CREATE TYPE "Tier" AS ENUM ('GRATIS', 'PRO', 'ELITE');
