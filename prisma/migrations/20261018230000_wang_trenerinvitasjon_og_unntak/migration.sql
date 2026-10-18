-- WANG Administrasjon (nattkjøring 18.–19.10.2026, pakke W4): invitasjonslenke for trener og unntak i timeplanen.
-- Additivt: to nye tabeller. Ingen eksisterende rader endres.
-- RLS på uten policyer: bare serveren (Prisma, privilegert rolle) leser og skriver. Ingenting via PostgREST.
-- Kjøres kirurgisk med scripts/add-wang-trenerinvitasjon-og-unntak-2026-10-18.ts (gotchas §Database).

CREATE TABLE IF NOT EXISTS "wang_trener_invitasjoner" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "mottakerEpost" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "opprettetAvId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "acceptedByUserId" TEXT,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "wang_trener_invitasjoner_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "wang_trener_invitasjoner_tokenHash_key" ON "wang_trener_invitasjoner"("tokenHash");
CREATE INDEX IF NOT EXISTS "wang_trener_invitasjoner_group_idx" ON "wang_trener_invitasjoner"("groupId", "createdAt");

CREATE TABLE IF NOT EXISTS "wang_timeplan_unntak" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "fraDato" DATE NOT NULL,
  "tilDato" DATE,
  "tekst" TEXT NOT NULL,
  "opprettetAvId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wang_timeplan_unntak_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "wang_timeplan_unntak_tekst_len" CHECK (char_length("tekst") BETWEEN 1 AND 200),
  CONSTRAINT "wang_timeplan_unntak_datoer" CHECK ("tilDato" IS NULL OR "tilDato" >= "fraDato")
);
CREATE INDEX IF NOT EXISTS "wang_timeplan_unntak_group_idx" ON "wang_timeplan_unntak"("groupId", "fraDato");

ALTER TABLE "wang_trener_invitasjoner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wang_timeplan_unntak" ENABLE ROW LEVEL SECURITY;
