# Workbench Periode – kontroll 21.09.2026

## Grunnlag

- Valgt referanse: `docs/design/workbench-handover/Workbench WB-05-11.dc.html`
  og `WB-periode-coach-normal-desktop.png` / mobilvarianten i samme pakke.
- Implementert rute: `/admin/workbench/[playerId]?vis=periode&aar=2026`.
- Datakilde: eksisterende `SeasonPlan`, `PeriodBlock`, `WorkbenchSession` og
  `TournamentEntry`. Ingen databaseskjema eller hostet database er endret.
- Testdata: bare syntetiske brukere, økter, periode og turneringer i lokal
  Supabase på loopback.

## Funksjonskontroll

- Periode velges fra lagret årsplan; aktiv periode er standard når ingen
  `periode`-parameter er oppgitt.
- Periodevolum, plan hittil, gjennomført hittil, ukevolum og pyramidefordeling
  bygges fra faktiske økter. Avlyste og økter utenfor perioden telles ikke.
- Manglende uketype vises som `—`; den utledes ikke fra farge eller øktdata.
- Ukekort åpner riktig mandag i Uke-visningen.
- Publiseringsdialogen viste 13 utkast, forhåndsvalgte 12 og holdt én
  overlappende økt utenfor. «Publiser valgte» lagret 12 publiseringer, oppdaterte
  skjermen og ga synlig kvittering. Syntetiske testdata ble deretter tilbakestilt.
- Mobil 390 × 844 viser åtte piller, periodekort, horisontal tidslinje, fast
  «Valgt periode»-panel og publiseringsdialog.

## Sikkerhet og personvern

`loadPeriod` validerer år og kjører `kreverTilgangTilSpiller` før økt-, plan-
eller turneringsoppslag. En målrettet test bekrefter avvist coach og null
databaseoppslag. Ingen nye personfelter, logger, åpne sider eller hemmeligheter
er innført. Testen brukte bare de navngitte syntetiske kontoene.

## Kontroller

- 47 målrettede tester: bestått.
- Målrettet ESLint: bestått uten advarsler.
- `tsc --noEmit`: bestått.
- `git diff --check`: bestått.
- Innlogget desktop og 390 × 844: kontrollert i lokal app.
- Full `npm run verify`: bestått med 3324 tester, fire komponenttester,
  statiske kontroller, TypeScript og produksjonsbygg/Serwist.

Full PNG-sammenstilling mot fasiten gjenstår. Dette er derfor et fungerende
teknisk kontrollpunkt, ikke en visuell godkjenning eller produksjonskontroll.
