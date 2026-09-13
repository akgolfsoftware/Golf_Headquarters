# P0-TEST — innlogget HQ-Supabase-reise 12.09.2026

Gren: `grok/p0-test-supabase-innlogging-2026-09-12`. Ingen visuell portering. Ingen produksjonsdata, migrasjon, betaling eller utrulling.

## Hva som er prøvd

Egen HQ-Supabase-stack på `127.0.0.1:54421` (API) og `127.0.0.1:54422` (Postgres). WANG-stacken på 54321–54324 er urørt. HQ-skjema (196 tabeller) er lagt inn mot den tomme basen. Syntetiske roller: spiller, tildelt coach, uvedkommende spiller og uvedkommende coach.

Kjøring `node scripts/p0-test-innlogget-reise.mjs` med `VEDLIKEHOLD=0`:

| Prøve | Resultat |
|---|---|
| Workbench I dag → brief → tapper → oppsummering → gjenåpning | Bestått. 5 Driver-slag lagret og vist |
| Eldre planøkt brief → tapper → oppsummering | Bestått. 4 slag på 7-jern lagret og vist |
| Tillatt coach ser økta; uvedkommende avvises uten innhold | Bestått. Fremmed spiller/coach lander uten øktinnhold |
| V2-live brief → aktiv → oppsummering → gjenåpning | Bestått. 7 repetisjoner og 3 treff ga samme total på 10 etter gjenåpning |

Hele nettleserpakken bestod 4/4 på 2,9 minutter 13.09.2026. V2-reisen alene bestod også på 30 sekunder. URL-vakten avviser hostet base og WANG-portene. Prøvene hopper ikke over manglende oppsett. Orkestratoren velger nyeste tilgjengelige lokale Supabase CLI fordi en eldre Homebrew-versjon ikke kan lese dagens konfigurasjon.

## Begrensninger

- `.env.local` leses ikke. Nøkler ligger i `/tmp/ak-hq-p0.status.env` og syntetiske passord i `/tmp/ak-hq-p0-creds.env` (ikke Git).
- Vedlikeholdsmodus er på som standard. Innlogget Portal krever `VEDLIKEHOLD=0` i prosessmiljøet til Next, ellers skrives alt til `/vedlikehold`.
- Dette beviser P0-TEST i main via PR #865 for alle tre øktmodeller i samme isolerte innlogging. Notion kan merkes ferdig.
- Ingen reell betaling, e-post eller produksjonsrestore.

## Ikke påstått

- Visuell godkjenning eller valgt Claude Design-fasit.
- Lanseringsklar app.
- At Vercel/CI har kjørt denne innloggede reisen.
