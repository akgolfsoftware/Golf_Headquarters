-- Additiv utvidelse. Eldre samtykker får ingen ny rettighet.
ALTER TABLE public.delings_samtykker ADD COLUMN IF NOT EXISTS "mottakerUserId" TEXT;
CREATE INDEX IF NOT EXISTS delings_samtykker_navngitt_idx
  ON public.delings_samtykker ("userId", scope, "mottakerGruppeId", "mottakerUserId", "createdAt");
CREATE TABLE IF NOT EXISTS public.trener_delings_invitasjoner (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "mottakerGruppeId" TEXT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  "mottakerEpost" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL UNIQUE CHECK ("tokenHash" ~ '^[0-9a-f]{64}$'),
  "tekstVersjon" TEXT NOT NULL,
  "gittAvUserId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "gittAvRolle" TEXT NOT NULL CHECK ("gittAvRolle" IN ('SELV', 'FORESATT')),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "acceptedByUserId" TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  "revokedAt" TIMESTAMP(3),
  CHECK ("expiresAt" > "createdAt"),
  CHECK (("acceptedAt" IS NULL) = ("acceptedByUserId" IS NULL))
);
CREATE INDEX IF NOT EXISTS trener_delings_invitasjoner_owner_idx ON public.trener_delings_invitasjoner ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS trener_delings_invitasjoner_email_idx ON public.trener_delings_invitasjoner ("mottakerEpost", "expiresAt");
CREATE INDEX IF NOT EXISTS trener_delings_invitasjoner_group_idx ON public.trener_delings_invitasjoner ("mottakerGruppeId");
CREATE INDEX IF NOT EXISTS trener_delings_invitasjoner_actor_idx ON public.trener_delings_invitasjoner ("gittAvUserId");
CREATE INDEX IF NOT EXISTS trener_delings_invitasjoner_coach_idx ON public.trener_delings_invitasjoner ("acceptedByUserId");
ALTER TABLE public.trener_delings_invitasjoner ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.trener_delings_invitasjoner FROM PUBLIC, anon, authenticated;
