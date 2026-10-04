-- Additivt IUP-grunnlag. Kjør bare etter eksplisitt kontroll av målmiljø.
-- Hele filen skal kjøres i én transaksjon. Ingen eksisterende spillerdata endres.
CREATE TABLE IF NOT EXISTS public.iup_besvarelser (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('UTVIKLINGSSJEKK', 'SESONGEVALUERING')),
  versjon TEXT NOT NULL CHECK (versjon IN ('iup-2025', 'iup-2027')),
  "kildeSha256" TEXT NOT NULL CHECK ("kildeSha256" ~ '^[a-f0-9]{64}$'),
  niva TEXT NOT NULL,
  "periodeStart" DATE NOT NULL,
  "periodeSlutt" DATE NOT NULL,
  revisjon INTEGER NOT NULL DEFAULT 0 CHECK (revisjon >= 0),
  "levertRevisjon" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT iup_besvarelse_periode CHECK ("periodeSlutt" >= "periodeStart"),
  CONSTRAINT iup_besvarelse_levert CHECK ("levertRevisjon" IS NULL OR ("levertRevisjon" > 0 AND "levertRevisjon" <= revisjon)),
  CONSTRAINT iup_besvarelse_niva CHECK (
    (type = 'SESONGEVALUERING' AND niva = 'ALLE') OR
    (type = 'UTVIKLINGSSJEKK' AND niva IN ('UNG', 'JUNIOR', 'AMATOR', 'PROFESJONELL'))
  ),
  CONSTRAINT iup_besvarelse_eier_periode_key UNIQUE ("userId", type, versjon, niva, "periodeStart", "periodeSlutt")
);
CREATE INDEX IF NOT EXISTS "iup_besvarelser_userId_updatedAt_idx" ON public.iup_besvarelser ("userId", "updatedAt");

CREATE TABLE IF NOT EXISTS public.iup_revisjoner (
  id TEXT PRIMARY KEY,
  "besvarelseId" TEXT NOT NULL REFERENCES public.iup_besvarelser(id) ON DELETE CASCADE,
  revisjon INTEGER NOT NULL CHECK (revisjon > 0),
  "requestId" UUID NOT NULL,
  "requestHash" TEXT NOT NULL CHECK ("requestHash" ~ '^[a-f0-9]{64}$'),
  status TEXT NOT NULL CHECK (status IN ('UTKAST', 'LEVERT')),
  payload JSONB NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT iup_revisjon_nummer_key UNIQUE ("besvarelseId", revisjon),
  CONSTRAINT iup_revisjon_request_key UNIQUE ("besvarelseId", "requestId")
);

-- Appens server håndhever innlogging, eierskap og samtykke.
-- Ingen klientrolle eller offentlig Data API får lese eller skrive råsvar.
ALTER TABLE public.iup_besvarelser ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iup_revisjoner ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.iup_besvarelser, public.iup_revisjoner FROM PUBLIC, anon, authenticated;
