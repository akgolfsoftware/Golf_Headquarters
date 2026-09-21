# Workbench Uke – lokal kontroll 21.09.2026

**Oppdatert 21.09:** De historiske kontroll-/innloggingshindrene nedenfor er
løst. Autorisert lokal Supabase med ekte innlogging og syntetiske data er
brukt til lagrings-, serie-, kilde-, publiserings- og tilgangsprøver. Nye
innloggede sammenstillinger finnes på 1440 og 390. Se siste avsnitt i
[kontrollrapporten](workbench-kontrollretting-2026-09-21.md) for faktisk status.
Dette dokumentets tidligere målinger er historikk.

**Senere oppfølging:** [kontrollrettingen](workbench-kontrollretting-2026-09-21.md)
løste de to tekniske stoppene etter konkret godkjent kildebytte. Full verify
består nå med 3312 tester, 4 komponenttester og bygg. Test-/baseline-feilene
lenger ned beskriver tidligere status. Innlogget Uke-kontroll gjenstår fortsatt.

Status: lokal Uke-portering og kontroll utført. Ikke produksjonsverifisert eller visuelt
godkjent av Anders. Periode og de øvrige pillene er ikke ferdige.

## Valgt kilde

[Importkontroll](workbench-handover-import-2026-09-20.md) og
[overlevering](../workbench-handover.md). Claude-masteren og de 16 PNG-ene er
bevart uendret i `docs/design/workbench-handover/`. Grafittregelen er avklart;
`selectedForBuilding` er ikke endret.

## Faktisk kode

Den beskyttede `/admin/workbench/[playerId]` bruker nå `WorkbenchShell` og
`WorkbenchUke`. Nytt skall er avgrenset til Workbench. Tilgangsvakt, spillerutvalg
og serverhandlinger er beholdt. Uke har 05:00–22:00-merkelapper, 32 px timerader,
44 px kort, egne kolonner for overlapp og skole-/heldagsbånd. Mobil viser én dag,
dagbytte og et fast ukesammendrag. Øktdetaljer åpnes i bunnark. Et skjult mobilark
stjeler ikke lenger fokus eller låser rulling på desktop.

Kjørbar komponentprøve: `tests/visual/workbench/server.mjs`. Den bruker faktisk
appkode med syntetiske data og avviser alle serverhandlinger. Den omgår ikke
innlogging og beviser ikke lagring i produksjon.

## Målinger og bilder

| Mål | Fasit | Målt app | Avvik |
|---|---:|---:|---:|
| Desktop topp | 56 px | 56 px | 0 |
| Desktop kildepanel | 236 px | 236 px | 0 |
| Desktop detaljpanel | 340 px | 340 px | 0 |
| Desktop kalender venstre | ca. 256 px | 256 px | ca. 0 |
| Desktop kalender topp | ca. 212 px | 211,94 px | ca. 0 |
| Mobil sidebredde | 390 px | 390 px | 0 |
| Mobil bunnark topp | ca. 553 px | 552 px | ca. −1 |
| Mobil bunnark høyde | ca. 291 px | 292 px | ca. +1 |

Alle åtte piller ligger på samme rad. Dagvelgeren har 44 px trefflate på mobil;
kalenderoverskriften er derfor 16 px høyere enn tegningens 28 px rad. Timeaksens
start ligger likevel omtrent på samme sted. Bevarte ukehandlinger ligger etter
kalenderen og kan rulles frem.

Private bilder/rapporter: `/private/tmp/ak-hq-workbench-natt-20260920/app-kontroll/`.
Sammenligningen bevarer originalhashene. Nettleserverktøyet leverte JPEG ved 1×,
mens fasiten er PNG ved 2×. Eksplisitt `--reference-scale 2 --scale 1` normaliserer
referansen ned til samme CSS-størrelse; ingen maskering eller beskjæring brukes.
Dette er diagnostikk med komprimering, ikke tapsfri pikselgodkjenning.

Siste sammenligning: desktop 58 700 av 1 267 200 piksler (4,632 %), mobil
25 955 av 329 160 (7,885 %). Ulik tekst, data og JPEG-komprimering inngår i
forskjellen. Tallene er ikke en beståttgrense. Bildene heter
`uke-desktop-side-ved-side.png` og `uke-mobil-side-ved-side.png` i mappen over.

Dataavvik er synlige og skal ikke skjules: fasitens uke 37, datoer 15.–21. september
og år 2026 stemmer ikke overens. Prøven bruker gyldig uke 38, 14.–20. september.
Øktvolum beregnes fra de syntetiske øktene. Kilder, periodefokus og formelfelt uten
lagrede verdier fylles ikke med fasitens demonstrasjonstall.

## Funksjonskontroll

- Desktop: overlappende «Gjennomgang» kan velges; riktig tid/varighet vises.
  Ingen skjult dialog og ingen body-rullelås ved desktopvalg.
- Mobil: dagvelger bytter mandag til tirsdag; begge overlappende økter beholdes.
- Publiseringsdialog viser alle sju syntetiske utkast og overlappvarsel. Seks er
  forhåndsvalgt. Prøvens avviste lagring gir synlig feil; utkastene beholdes.
- Tre nye tester for kolonnefordeling består: visuell minimumshøyde, kjedeoverlapp
  med gjenbruk av kolonner og stabil sortering uten mutasjon.
- Tom uke viser «— planlagt» og deaktivert publisering. Ved simulert venting
  vises «Publiserer…»; påfølgende avvist lagring vises som feil. Bilder av tom,
  lastende og feiltilstand er bevart privat.
- «Åpne uke» på mobil viser spillerutvalg og alle åtte formelfeltene. Arket
  lukker og returnerer fokus. Prøven har én spiller; reelt spillerbytte og
  datalagring er ikke bevist av dette.
- Innboks og Godkjenninger peker til eksisterende app-ruter. Endret spiller/uke
  gir en ny Workbench-instans, slik at gammelt ukeutvalg ikke blir liggende igjen.

## Siste kvalitetskontroll

- `npm run build`: bestått, inkludert typesjekk og service-worker-bygg.
- Målrettet ESLint og `git diff --check`: bestått.
- Fire eksisterende komponenttester og tre nye kalenderfordelingstester: bestått.
- `npm run prosjekt:sjekk`: bestått, 158 vedlikeholdte dokumenter.
- `npm run verify`: fortsatt stopp på historisk siteringsgrense 144/219 mot
  153/219. Tidligere steg, inkludert typesjekk, lint, tilgangskontroller og
  tokenkontroll, passerte. Eldre kontrastkontroll skriver også kjente avvik.
- Full testkjøring var 3303/3305 bestått; de to eksisterende feilene er beskrevet
  nedenfor. Ingen samlet grønn kvalitetskontroll påstås.

## Eksisterende kontrollfeil – sperrene er beholdt

Den innhentede main-grenen hadde 137 brutte dokumentlenker. Historiske mål er
lenket til kontrollerte, uforanderlige Git-versjoner; registre er regenerert.
Dokumentkontrollen bestod etter rettingen.

Første fulle testkjøring: 3303/3305 bestod. To abonnementstester forventer
`scripts/arkiv/add-abonnement-v2-2026-08-16.ts`, slettet av commit `25067d76e`.
Den historiske siteringsgrensen er 153/219, mens innhentet main gir 144/219.
Sammenligning med baseline-commit `4a65d7fe3` viser ni bortfalte Workbench-
referanser: A-01c, A-02b, A-02c, A-04, A-09, A-11, A-18, WB-00 og WB-01.

Automatisk godkjenningskontroll avviste å gjenopprette det gamle DDL-skriptet og
å senke siteringsgrensen. Begrunnelsen var persistent svekkelse av sikkerhets-
og regresjonskontroll uten uttrykkelig autorisasjon. Begge foreslåtte endringer
er tilbakeført. Skriptet er ikke kjørt, ingen database er endret, og baseline
og de eksisterende testene er uendret. Disse feilene stopper fortsatt full kontroll.
Ingen commit, push eller deploy med rød gate.

## Live-hindring og neste steg

`/admin` sender fortsatt nettleserens spillerøkt tilbake til `/portal`, bekreftet
på nytt 21.09.2026. Ingen roller eller vakter er endret. En eksisterende
coach/admin-innlogging trengs for den bestilte live-kontrollen. De lokale endringene
må også få en autorisert forhåndsvisning/publisering før de kan sees på Vercel.

Bestillingens rekkefølge er én pille ferdig og verifisert før neste. Uke kan derfor
ikke merkes ferdig eller hoppes over til Periode på grunnlag av komponentprøven.
