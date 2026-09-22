# Workbench Måned – kontroll 21.09.2026

## Grunnlag

- Valgt referanse: `docs/design/workbench-handover/Workbench WB-05-11.dc.html`
  og `WB-maaned-coach-normal-desktop.png` / mobilvarianten i samme pakke.
- Implementert rute: `/admin/workbench/[playerId]?vis=maned&maned=2026-09`.
- Datakilde: eksisterende `WorkbenchSession`. Ingen databaseskjema, tilgangsregel
  eller hostet database er endret.
- Testdata: bare syntetiske brukere og økter i lokal Supabase på loopback.

## Funksjonskontroll

- Måned kan åpnes direkte, byttes forrige/neste og gå tilbake til inneværende
  måned. URL-en beholder valgt spiller og måned.
- Kalenderen viser sju kolonner, inntil tre økter per dag og grafittmarkører på
  mobil. Dagene åpner den riktige mandagen i Uke-visningen.
- Måneds- og ukesummer teller bare økter i valgt måned. Økter i nabomåneden er
  synlige i rutenettet, men påvirker ikke valgt måneds summer.
- «Gjennomført mot plan» og pyramidefordelingen teller bare til og med dagens
  dato. Fremtidige økter øker ikke gjennomført-andelen.
- November uten økter viser egen tomtilstand med inngang til Uke.
- September viser 14 økter og 18,5 timer. Oktober viser 3 økter og 7,5 timer;
  randuken teller 1 oktoberøkt og utelater septemberøkten fra oktober-summen.
- Desktop og mobil 390 × 844 er kontrollert innlogget. Mobilen viser åtte piller,
  kompakt kalender med grafittmarkører og fast «Valgt måned»-panel.

## Sikkerhet og personvern

`loadMonth` validerer måneden og kjører `kreverTilgangTilSpiller` før øktoppslag.
En målrettet test bekrefter avvist coach og null databaseoppslag. Ingen nye
personfelter, logger, åpne sider eller hemmeligheter er innført.

## Kontroller

- 50 målrettede tester: bestått.
- Målrettet ESLint: bestått uten advarsler.
- `tsc --noEmit`: bestått.
- `git diff --check`: bestått.
- Innlogget desktop og 390 × 844: kontrollert i lokal app.
- Full `npm run verify`: bestått med 3327 tester, fire komponenttester,
  statiske kontroller, TypeScript og produksjonsbygg/Serwist.

Full PNG-sammenstilling mot fasiten er ikke lagret av nettleserverktøyet.
Dette er derfor et fungerende teknisk kontrollpunkt, ikke en visuell
sluttgodkjenning eller produksjonskontroll.
