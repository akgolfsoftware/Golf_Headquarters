# Workbench Min kalender – kontroll 21.09.2026

## Grunnlag

- Valgte referanser:
  `docs/design/workbench-handover/WB-minkalender-coach-normal-1440.png` og
  `WB-minkalender-coach-normal-390.png`.
- Implementert rute:
  `/admin/workbench/[playerId]?vis=min&uke=YYYY-MM-DD`.
- Datakilder: coachens egne `WorkbenchSession`-økter, lagrede maler og faktiske
  bookinger. Ingen databaseskjema, tilgangsregel eller hostet database er
  endret.
- Testdata: syntetisk coach, spiller, økter, mal og booking i separat lokal
  Supabase på loopback.

## Funksjonskontroll

- Ukevisningen bruker Oslo-tid ved plassering og tekst for bookinger, både
  sommer og vinter. Kalenderen viser 05–22 med 32 px timerader.
- Kildepanelet viser egne maler og bookinger. Lokal prøve viste malen
  «Teknisk base · 90 min» og bookingen «Testspiller · 2026-09-16 · 10:00».
- Et trykk på mobilens synlige dag går til neste dag. Et trykk på bookingen
  åpner detaljpanelet og «Åpne økt» peker til riktig bookingside.
- Mobil starter uten detaljpanelet, som i valgt referanse. Panelet åpnes først
  når brukeren velger en økt og skjules ved dagbytte.
- Skjermen har ingen Publiser-handling. «Åpne økt» er grafitt.
- Lokal nettleserprøve bekreftet synlig booking, riktig lenke, null
  publiseringshandlinger, null konsollfeil og null databaseskriving.

## Tilgang og personvern

- Spillerens tilgangsvakt kjøres før første databasespørring.
- Deretter kreves ADMIN- eller COACH-rolle. Egne økter og bookinger avgrenses
  med innlogget coach-ID.
- Spillernavn filtreres på nytt gjennom coachens spilleromfang før de sendes
  til klienten. En regresjonstest bekrefter at avvist spillertilgang gir null
  databaseoppslag.
- Ingen hemmeligheter eller produksjonsdata er lagret, logget eller lagt i Git.
  Skjermbilder og innloggingsdata ligger bare i privat midlertidig mappe.

## Skjermkontroll

- Desktop er kontrollert ved 1440 × 880 mot valgt 1440-referanse.
- Mobil er kontrollert ved 390 × 844 mot valgt 390-referanse.
- Struktur, 236 px kildepanel, 340 px detaljpanel, pillerekke, ukeoverskrift,
  kalendergeometri, grafittkanter og tom mobilstart følger valgt retning.
- Automatisk PNG-sammenligning målte 5,892 % avvik på desktop og 6,708 % på
  mobil. Målingen inkluderer forventede forskjeller i syntetiske datoer,
  øktinnhold og skriftrastering; den er diagnose, ikke automatisk visuell
  godkjenning.

## Kontroller

- `tsc --noEmit`, målrettet ESLint og `git diff --check`: bestått.
- Sytten målrettede tilgangs-, tidssone- og URL-tester: bestått.
- Hele `npm test` ble kjørt etter Stall og før denne avgrensede UI-rettingen:
  3341 domenetester og fire komponenttester bestod. Den etterfølgende endringen
  er kontrollert med typesjekk, lint, målrettede tester og nettleserprøve.
- Token-, signalfarge- og Workbench-kildekontroll: bestått.
- Full `npm run verify` er ikke kjørt på nytt fordi en annen samtidig oppgave
  har lagt `outputs/` i prosjektroten, som prosjektkontrollen avviser. Ingen
  filer der er flyttet eller slettet.

Alle åtte Workbench-visninger er nå lokalt implementert og kontrollert. Dette
er et teknisk og visuelt kontrollpunkt, ikke Anders' visuelle sluttgodkjenning
eller en produksjonskontroll. Ingen deploy er utført.
