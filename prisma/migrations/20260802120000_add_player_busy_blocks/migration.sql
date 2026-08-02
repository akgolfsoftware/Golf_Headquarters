-- PlayerBusyBlock: spillerens egen opptatte tid.
--
-- Bakgrunn: fire ting gjør en spiller utilgjengelig — gruppetimeplan
-- (group_schedules), skolerute (school_schedule_entries, per klassetrinn),
-- fravær/skade (leaves) og personlige avtaler. De tre første fantes allerede
-- i basen, men ble aldri lest inn i spillerkalenderen. Den fjerde manglet
-- helt: «mandag 16.30 tannlege» hadde ingen plass å være.
--
-- Uten denne kan ikke planleggeren vite hvilke timer som faktisk er ledige,
-- og en generert treningsplan havner oppå noe spilleren allerede har.
--
-- isPrivate: en tannlegetime kan røpe helseopplysninger, og flere av
-- spillerne er under 18. Coachen skal se at tiden er opptatt, ikke hva den
-- går til. Selve tidsrommet er aldri privat — det er det planleggeren trenger.

CREATE TABLE "player_busy_blocks" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "title"     TEXT NOT NULL,
  "startAt"   TIMESTAMP(3) NOT NULL,
  "endAt"     TIMESTAMP(3) NOT NULL,
  "kind"      TEXT NOT NULL DEFAULT 'AVTALE',
  "recurring" TEXT DEFAULT 'NONE',
  "isPrivate" BOOLEAN NOT NULL DEFAULT false,
  "note"      TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "player_busy_blocks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "player_busy_blocks_userId_startAt_idx"
  ON "player_busy_blocks"("userId", "startAt");

ALTER TABLE "player_busy_blocks"
  ADD CONSTRAINT "player_busy_blocks_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Deny-by-default mot PostgREST, samme som de fire tabellene i
-- 20260731000000_enable_rls_four_tables. All tilgang går via Prisma/server.
-- Persondata (avtaletitler, delvis om mindreårige) skal aldri være lesbart
-- med anon-nøkkelen fra klient-bundlet.
ALTER TABLE "player_busy_blocks" ENABLE ROW LEVEL SECURITY;
