-- C2: additiv record, ingen backfill eller aktivering. Kjøres separat etter prosjektreglene.
CREATE TABLE IF NOT EXISTS "konto_avtale_aksepter" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "pakkeVersjon" TEXT NOT NULL,
  "dokumentHash" TEXT NOT NULL CHECK ("dokumentHash" ~ '^[a-f0-9]{64}$'),
  "dokumenter" JSONB NOT NULL CHECK (jsonb_typeof("dokumenter") = 'object'),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT "konto_avtale_aksepter_bruker_versjon_key" UNIQUE ("userId", "pakkeVersjon")
);

ALTER TABLE "konto_avtale_aksepter" ENABLE ROW LEVEL SECURITY;
-- Ingen klientpolicy: registrering og egen eksport går gjennom kontrollerte serverfunksjoner.
REVOKE ALL ON "konto_avtale_aksepter" FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON "konto_avtale_aksepter" FROM anon;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON "konto_avtale_aksepter" FROM authenticated;
  END IF;
END $$;

-- Revisjonssporet kan ikke omskrives. DELETE er beholdt for dokumentert kontosletting.
CREATE OR REPLACE FUNCTION avvis_kontoavtale_omskriving() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  RAISE EXCEPTION 'Kontoaksept kan ikke omskrives' USING ERRCODE = '23000';
END;
$$;
DROP TRIGGER IF EXISTS kontoavtale_ingen_update ON "konto_avtale_aksepter";
CREATE TRIGGER kontoavtale_ingen_update BEFORE UPDATE ON "konto_avtale_aksepter"
FOR EACH ROW EXECUTE FUNCTION avvis_kontoavtale_omskriving();
