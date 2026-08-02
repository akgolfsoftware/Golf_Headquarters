-- Slå på Row Level Security på fire tabeller som sto åpne mot PostgREST.
--
-- Bakgrunn: `public`-skjemaet er eksponert via Supabase PostgREST, og disse
-- fire tabellene manglet RLS — enhver med prosjektets anon-nøkkel (som ligger
-- i klient-bundlets NEXT_PUBLIC_SUPABASE_ANON_KEY) kunne lese dem direkte:
--   - google_calendar_events   (kalendersynk — persondata: tittel, sted, tid)
--   - pushed_calendar_events   (tilsvarende)
--   - player_facilities        (spiller-tilhørighet)
--   - radar_funn               (RSS-funn — lav sensitivitet, men samme hull)
-- Verifisert 2026-07-31: ingen klient-kode leser disse via PostgREST
-- (grep på .from('<tabell>') i src/ gir null treff) — all tilgang skjer via
-- Prisma/server (postgres-eier bypasser RLS). Ingen policies legges til:
-- deny-by-default for anon/authenticated er tiltenkt tilstand.
ALTER TABLE "google_calendar_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pushed_calendar_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "player_facilities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "radar_funn" ENABLE ROW LEVEL SECURITY;
