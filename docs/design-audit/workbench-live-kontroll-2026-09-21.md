# Workbench Live – kontroll 21.09.2026

## Grunnlag

- Valgt referanse: `docs/design/workbench-handover/Workbench WB-05-11.dc.html`,
  Live-varianten i WB-09, med `WB-live-coach-normal-1440.png` og
  `WB-live-coach-normal-390.png`.
- Implementert rute:
  `/admin/workbench/[playerId]?vis=live&uke=YYYY-MM-DD`.
- Datakilde: eksisterende `WorkbenchSession`, `WorkbenchDrill` og feltet
  `WorkbenchSession.liveSnapshot`. Ingen databaseskjema, tilgangsregel eller
  hostet database er endret.
- Testdata: bare syntetisk spiller og syntetiske økter i lokal Supabase på
  loopback.

## Funksjonskontroll

- Live laster én faktisk `IN_PROGRESS`-økt og nærmeste startbare
  `PUBLISHED`-økt i valgt toukersvindu. Uten pågående økt vises en ærlig tom
  tilstand og neste publiserte økt kan startes.
- `START ØKT` bruker den eksisterende livssyklusregelen. Når en økt allerede
  pågår, fullføres den og neste økt startes i samme databasetransaksjon, slik
  at skjermen ikke lager to samtidige pågående økter.
- Starttid, løpende klokke, aktiv øvelse, slagtelling, antall serier og
  øvelsesstatus hentes fra og lagres tilbake til `liveSnapshot`. Absolutte
  verdier og optimistisk lås hindrer at gamle kall overskriver nyere status.
- Pluss/minus for slag, legg til/fjern serie og bytte/fullføring av aktiv
  øvelse ble prøvd i den innloggede appen. To slag og fire serier var fortsatt
  lagret etter full omlasting.
- Når alle øvelser er markert gjennomført, vises den grafittfargede handlingen
  `Fullfør økt`. Den eksisterende fullføringshandlingen avslutter økten og
  nuller live-snapshotet. En publisert økt uten øvelser viser en egen tom
  tilstand i stedet for oppdiktet øvelsesinnhold.
- Neste økt viser de åtte formelfeltene. Manglende verdier vises som `—`.

## Skjermkontroll

- Innlogget Live ble kontrollert ved 1440 × 880 mot
  `WB-live-coach-normal-1440.png`.
- Mobil ble kontrollert ved 390 × 844 mot
  `WB-live-coach-normal-390.png`.
- Hele Live-flaten, toppmenyen, kortene og detaljpanelet bruker den avtalte
  mørke flaten og negativ logo. Ingen kildekolonne vises. Desktop har
  hovedflate og 340 px detaljpanel; mobil har fast mørkt bunnpanel.
- Rust brukes bare på `START ØKT`. Kortkanter, serieknapper, aktiv øvelse og
  fullføringshandling bruker grafitt/sand etter loven.
- Den faktiske testøkten hadde én øvelse, mens referansen har fem. Struktur,
  tetthet, responsiv rekkefølge og tilstander ble sammenholdt; referansens
  demoøvelser og demotall ble ikke kopiert inn som data.

## Sikkerhet og personvern

Live-lesingen validerer dato og kjører spillerens tilgangsvakt før første
databaseoppslag. Skriving krever tilgang til økten, `IN_PROGRESS`, synlig og
godkjent økt, og et øvelsessett som er identisk med økten i databasen.
Overgang til neste økt krever samme spiller på begge økter. Egne tester dekker
avvist tilgang og avviser bytte mellom ulike spillere. Ingen persondata,
hemmeligheter eller produksjonsdata er brukt.

## Kontroller

- Målrettet ESLint: bestått uten feil eller advarsler i berørte kodefiler.
- Målrettet TypeScript-kontroll: bestått.
- 21 målrettede tester for tilgang, livssyklus, snapshot og URL: bestått.
- Innlogget start, overgang, slagtelling, serier, øvelsesstatus, omlasting,
  desktop og 390 × 844: kontrollert i lokal app.
- Full `npm run verify`: bestått med 3338 tester, fire komponenttester,
  statiske kontroller, TypeScript og produksjonsbygg/Serwist.
- Fullkontrollen rapporterte tre kjente lintadvarsler i eksisterende, uberørte
  filer. Ingen feil ble rapportert.

Dette er et fungerende teknisk kontrollpunkt og en gjennomført visuell
sammenligning. Det er ikke registrert som Anders' visuelle sluttgodkjenning
eller som produksjonskontroll.
