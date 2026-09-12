# D2-AO — teknisk AgencyOS-reise 12.09.2026

Gren: `grok/d2-agencyos-innlogget-reise-2026-09-12`. Ingen visuell portering. D0 er ikke bestått. Masterplanen er ikke merket ferdig. Ingen `.env*`-fil eller lenke i arbeidskopien.

## Hva som er rettet

- Stall-lista bruker samme spillerporte som hjem og spillerkort (`stallenPlayerWhere` = `coachScopedPlayerWhere`), inkludert gruppetrenere.
- Spillerkortets oversiktsdata lastes ikke før eierskap/coach-tilgang er bekreftet. Uvedkommende får `null`, ikke tilleggsoppslag.
- Arbeidsvisningen (`?vis=360`) gjorde tilleggsoppslag (økter, runder, tester, video, notat) i parallell med tilgangssjekken. Den sjekker nå porten først og stopper uten videre lesing.
- 360-listen og dagens økter på hjem brukte en smalere enrollering-porte. De bruker nå samme stall-porte, inkludert gruppetrenere.
- Workbench uke og kilder lastes ikke uten `harCoachTilgangTilSpiller` (samme porte). Bevist med avvist coach og null øktoppslag.
- `src/lib/workbench/load-tilgang.test.ts`: `sources` er muterbar `SourceFilter[]` via `WorkbenchMode`, ikke `readonly`.

## Hva som allerede virket

J04-kjeden hjem → stall → spillerkort → Workbench → publisering er kartlagt i [J04-kontrollen](2026-09-11-agencyos-coach-reise-j04.md). Oppfølging (`/admin/queue`) hører i Stall, ikke Kø. URL-filter/søk/valgt spiller i stall overlever navigasjon.

## Prøvd her

Syntetiske roller og id-er (`coach-1`, `fremmed`, `spiller-1`, demo-navn Øyvind Rohjan). Målrettede tilgangstester: 13/13. Full `npm test`: 2592 + 4 komponenter, 0 feil.

Full `npm run verify` bestod 13.09.2026 med dummy `DATABASE_URL`/`DIRECT_URL` i prosessmiljøet og uten miljøfil. Dette omfattet Prisma, TypeScript, ESLint, prosjektvaktene og produksjonsbygg. Bygget forsøkte forventede, feiltolerante lesinger mot den lokale dummy-adressen; ingen hostet database ble kontaktet.

## Isolert testdatabase — blokkering

Samme som [P0-TEST](p0-test-blokkering-2026-09-12.md): innlogget Next mot lokal HQ-Supabase er ikke kjørt. Isolert Postgres med testidentitet er et annet spor. Denne leveransen påstår ikke innlogget nettleserreise.

## Ikke påstått

- Visuell godkjenning eller valgt Claude Design-fasit. Navigasjon og komponentuttrykk er uendret.
- At stall-radens «neste økt» eller kortets «I dag» viser en nettopp publisert Workbench-økt. Stall leser `TrainingPlanSession`, kortet leser `TrainingSessionV2`, Workbench eier `WorkbenchSession`. Modellene er holdt atskilt.
- Innlogget nettleserreise mot lokal HQ-Supabase.
- Produksjonsreise, betaling, e-post, push, PR eller merge til main.
