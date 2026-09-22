# Workbench År – kontroll 21.09.2026

## Grunnlag

- Valgt referanse: `docs/design/workbench-handover/Workbench WB-05-11.dc.html`
  og WB-06 År-variantene i samme pakke.
- Implementert rute: `/admin/workbench/[playerId]?vis=aar&aar=2026`.
- Datakilde: eksisterende `SeasonPlan`, `PeriodBlock`, `WorkbenchSession`,
  `TournamentEntry` og `TestResult`. Ingen databaseskjema eller hostet database
  er endret.
- Testdata: bare syntetisk spiller, økter, periode og turneringer i lokal
  Supabase på loopback.

## Funksjonskontroll

- År kan åpnes direkte, byttes forrige/neste og gå tilbake til inneværende år.
- Plan og gjennomført hittil beregnes fra faktiske økter. Fremtidige økter
  påvirker ikke «Gjennomført mot plan».
- Periodebåndet følger perioden over kalenderåret og velger detaljpanelet uten
  å navigere. Bare «Åpne periode» bytter til Periode og beholder periode-ID-en.
- Periodetabellen viser uker, gjennomført mot plan hittil, fokus og antall
  turneringer. Pyramidefordelingen viser faktisk plan og gjennomført per lag.
- 2027 uten årsplan viser en egen tomtilstand.
- Desktop og mobil 390 × 844 er kontrollert innlogget. Mobilen viser åtte
  piller, horisontale periodekort, legendelinje og fast «Valgt periode»-panel.

## Sikkerhet og personvern

`loadYear` validerer året og kjører `kreverTilgangTilSpiller` før plan-, økt-,
turnerings- eller testoppslag. En målrettet test bekrefter avvist coach og null
databaseoppslag. Ingen nye personfelter, logger, åpne sider eller hemmeligheter
er innført.

## Kontroller

- 54 målrettede tester: bestått.
- Målrettet ESLint: bestått uten advarsler.
- `tsc --noEmit`: bestått.
- `git diff --check`: bestått.
- Innlogget desktop og 390 × 844: kontrollert i lokal app.
- Full `npm run verify`: bestått med 3329 tester, fire komponenttester,
  statiske kontroller, TypeScript og produksjonsbygg/Serwist.

Full PNG-sammenstilling mot fasiten er ikke lagret av nettleserverktøyet.
Dette er derfor et fungerende teknisk kontrollpunkt, ikke en visuell
sluttgodkjenning eller produksjonskontroll.
