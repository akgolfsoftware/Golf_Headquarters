# Workbench Stall – kontroll 21.09.2026

## Grunnlag

- Valgt referanse: `docs/design/workbench-handover/Workbench WB-05-11.dc.html`,
  Stall-varianten i WB-08, med tilhørende PNG-er for 1440 og 390 px.
- Implementert rute:
  `/admin/workbench/[playerId]?vis=stall&uke=YYYY-MM-DD&okt=[sessionId]`.
- Datakilde: eksisterende `WorkbenchSession`, `WorkbenchDrill` og ventende
  `PlanAction`. Ingen databaseskjema, tilgangsregel eller hostet database er
  endret.
- Testdata: bare syntetisk spiller og syntetiske økter i lokal Supabase på
  loopback.

## Funksjonskontroll

- Stall viser et 14-dagers oppfølgingsvindu for den valgte spilleren, uten
  kildepanelet på 236 px. Den synlige datonavigasjonen og tabelloverskriften
  som ikke finnes i valgt design, er fjernet.
- «Alle», «Utkast», «Delt» og «Gjennomført» filtrerer faktiske økter. Lokal
  kontroll viste ni økter totalt og tre utkast; utkastfilteret viste tre rader.
- Valg av rad oppdaterer detaljpanelet og lagrer valgt økt i URL-en. Ny lasting
  kan derfor åpne samme økt igjen.
- Detaljpanelet viser alle åtte formelfelt. Manglende verdier vises som `—`;
  skjermen finner ikke på data. Hvert felt har det ordrette hjelpetipset fra
  prosjektloven. Mobilarket viser den valgte firefeltsoppsummeringen fra
  390-referansen.
- «Godkjenn økt» vises bare når økten peker på en faktisk ventende
  `PlanAction`. Handlingen bruker eksisterende `acceptPlanAction`, som
  kontrollerer rolle, coachens spillertilgang, eier og ventende status før
  lagring. En økt som venter på spillerens svar merkes i stedet med
  «Venter på svar fra spilleren»; coachen kan ikke svare på spillerens vegne.
- Lokal testdata hadde ingen ventende `PlanAction`, så Stall-knappen ble ikke
  brukt til en databaseendring i skjermkontrollen. Den eksisterende handlingen
  og tilgangsreglene inngår i den grønne fullsuiten.
- «Publiser stall» åpner den eksisterende publiseringsdialogen med alle utkast
  i vinduet. Den gjenbruker `publishSessions`, som validerer hele utvalget før
  en samlet transaksjon. Lokal funksjonsprøve åpnet og lukket dialogen med tre
  utkast uten å publisere eller skrive data.

## Skjermkontroll

- Innlogget Stall ble kontrollert mot
  `WB-stall-coach-normal-1440.png` ved 1440 × 880.
- Mobil ble kontrollert mot `WB-stall-coach-normal-390.png` ved 390 × 844.
- Hovedstruktur, to kolonner, 340 px detaljpanel, filtre, grafittkanter,
  øktrader og fast mobilpanel er på plass. Rust brukes bare på den betingede
  godkjenningshandlingen og «Publiser stall».
- Appen viser faktiske datoer, statuser og formelverdier. Referansens demotall
  er derfor ikke kopiert. Et rikt faktisk øktgrunnlag velges som standard slik
  at detaljpanelet ikke starter med unødvendige tomme felt.
- Mobilkontrollen viser År–Stall i samme utsnitt som fasiten, fire øktrader bak
  et 292 px bunnark og handlingsfordelingen fra valgt 390-referanse.
- Automatisk PNG-sammenligning målte 6,555 % avvik på 1440 og 7,842 % på 390.
  Målingen inkluderer forventede avvik fra syntetiske datoer, øktinnhold og at
  lokaldata ikke har en ventende `PlanAction`; den er diagnose, ikke automatisk
  visuell godkjenning.

## Sikkerhet og personvern

Den nye lesingen validerer datoformat og kjører spillerens tilgangsvakt før
første databasespørring. En egen regresjonstest bekrefter at avvist tilgang gir
null databaseoppslag. Bare økter for den valgte spilleren og det valgte
tidsvinduet returneres. Ingen hemmeligheter, produksjonsdata eller nye logger er
innført.

## Kontroller

- Målrettet ESLint, `tsc --noEmit` og `git diff --check`: bestått.
- Femten målrettede tilgangs- og URL-tester: bestått.
- Hele `npm test`: bestått med 3341 domenetester og fire komponenttester.
- Innlogget filter, radvalg, URL-bevaring, publiseringsdialog, desktop og
  390 × 844: kontrollert i lokal app. Konsollen hadde ingen feil.
- Token-, signalfarge- og Workbench-kildekontroll: bestått. Full
  `npm run verify` er ikke kjørt på nytt etter denne finpussen fordi en annen
  samtidig oppgave har lagt `outputs/` i prosjektroten, som prosjektkontrollen
  med rette avviser. Ingen filer der er flyttet eller slettet.

Dette er et fungerende teknisk kontrollpunkt og en gjennomført
side-ved-side-vurdering. Det er ikke registrert som Anders' visuelle
sluttgodkjenning eller som produksjonskontroll.
