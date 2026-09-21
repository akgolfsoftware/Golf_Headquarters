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
  kildepanelet på 236 px. Forrige og neste vindu beholder spiller og visning.
- «Alle», «Utkast», «Delt» og «Gjennomført» filtrerer faktiske økter. Lokal
  kontroll viste ni økter totalt og tre utkast; utkastfilteret viste tre rader.
- Valg av rad oppdaterer detaljpanelet og lagrer valgt økt i URL-en. Ny lasting
  kan derfor åpne samme økt igjen.
- Detaljpanelet viser alle åtte formelfelt. Manglende verdier vises som `—`;
  skjermen finner ikke på data.
- «Godkjenn økt» vises bare når økten peker på en faktisk ventende
  `PlanAction`. Handlingen bruker eksisterende `acceptPlanAction`, som
  kontrollerer rolle, coachens spillertilgang, eier og ventende status før
  lagring. En økt som venter på spillerens svar merkes i stedet med
  «Venter på svar fra spilleren»; coachen kan ikke svare på spillerens vegne.
- Lokal testdata hadde ingen ventende `PlanAction`, så Stall-knappen ble ikke
  brukt til en databaseendring i skjermkontrollen. Den eksisterende handlingen
  og tilgangsreglene inngår i den grønne fullsuiten.

## Skjermkontroll

- Innlogget Stall ble kontrollert mot
  `WB-stall-coach-normal-1440.png` ved 1440 × 880.
- Mobil ble kontrollert mot `WB-stall-coach-normal-390.png` ved 390 × 844.
- Hovedstruktur, to kolonner, 340 px detaljpanel, filtre, grafittkanter,
  øktrader og fast mobilpanel er på plass. Rust brukes bare på den betingede
  godkjenningshandlingen.
- Appen viser faktiske datoer, statuser og formelverdier. Referansens demotall
  er derfor ikke kopiert. Et rikt faktisk øktgrunnlag velges som standard slik
  at detaljpanelet ikke starter med unødvendige tomme felt.
- Aktiv visningsfane rulles inn i synlig område på smale skjermer.

## Sikkerhet og personvern

Den nye lesingen validerer datoformat og kjører spillerens tilgangsvakt før
første databasespørring. En egen regresjonstest bekrefter at avvist tilgang gir
null databaseoppslag. Bare økter for den valgte spilleren og det valgte
tidsvinduet returneres. Ingen hemmeligheter, produksjonsdata eller nye logger er
innført.

## Kontroller

- Målrettet ESLint: bestått uten feil eller advarsler i berørte kodefiler.
- `tsc --noEmit`: bestått.
- Tolv målrettede tilgangs- og URL-tester: bestått.
- Innlogget filter, radvalg, URL-bevaring, desktop og 390 × 844: kontrollert i
  lokal app.
- Full `npm run verify`: bestått med 3332 tester, fire komponenttester,
  statiske kontroller, TypeScript og produksjonsbygg/Serwist.
- Fullkontrollen rapporterte tre kjente lintadvarsler i eksisterende, uberørte
  filer. Ingen feil ble rapportert.

Dette er et fungerende teknisk kontrollpunkt og en gjennomført
side-ved-side-vurdering. Det er ikke registrert som Anders' visuelle
sluttgodkjenning eller som produksjonskontroll.
