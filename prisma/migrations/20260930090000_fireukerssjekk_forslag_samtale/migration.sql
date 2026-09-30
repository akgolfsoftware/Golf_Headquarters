-- Bare en record. Tabellene opprettes kirurgisk via
-- scripts/add-fireukerssjekk-forslag-samtale-2026-09-30.ts (se .claude/rules/gotchas.md §Database).
CREATE TABLE IF NOT EXISTS "fireukerssjekker" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "flate" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "periodeStart" TIMESTAMP(3) NOT NULL,
  "periodeSlutt" TIMESTAMP(3) NOT NULL,
  "frist" TIMESTAMP(3) NOT NULL,
  "levertAt" TIMESTAMP(3),
  "prosessmaal" TEXT,
  "utviklingssjekk" JSONB,
  "paaminnelseSendtAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "fireukerssjekker_flate_groupId_frist_idx" ON "fireukerssjekker"("flate", "groupId", "frist");
CREATE INDEX IF NOT EXISTS "fireukerssjekker_userId_periodeStart_idx" ON "fireukerssjekker"("userId", "periodeStart");

CREATE TABLE IF NOT EXISTS "trener_forslag" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "flate" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "trenerId" TEXT NOT NULL,
  "elevId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "tekst" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'VENTER',
  "svar" TEXT,
  "svartAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "trener_forslag_flate_groupId_status_idx" ON "trener_forslag"("flate", "groupId", "status");
CREATE INDEX IF NOT EXISTS "trener_forslag_elevId_status_idx" ON "trener_forslag"("elevId", "status");

CREATE TABLE IF NOT EXISTS "elev_samtaler" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "flate" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "elevId" TEXT NOT NULL,
  "trenerId" TEXT NOT NULL,
  "dato" TIMESTAMP(3) NOT NULL,
  "type" TEXT NOT NULL,
  "avtalt" TEXT NOT NULL,
  "fireukerssjekkId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "elev_samtaler_flate_groupId_dato_idx" ON "elev_samtaler"("flate", "groupId", "dato");
CREATE INDEX IF NOT EXISTS "elev_samtaler_elevId_dato_idx" ON "elev_samtaler"("elevId", "dato");
