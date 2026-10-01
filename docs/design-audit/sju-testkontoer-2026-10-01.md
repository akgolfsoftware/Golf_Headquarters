# Sju testkontoer og tidligere utelatte prøver

Dato: 01.10.2026. Utgangspunkt: main `c86b0408d`. Arbeidsgren: `codex/sju-testkontoer-2026-10-01`.

## Hva tallet betyr

Produksjonskontrollen på `407f948008` hadde 234 bestått og 72 utelatt. Av de utelatte var 64 kjøringer betinget av innlogging: 32 prøvevarianter i Chromium og WebKit. Tallet kom fra testresultatet, ikke et ønske om 64 brukere.

Den lokale databasen og lokal Auth inneholder begge de samme sju syntetiske kontoene: fire spillere, to trenere og én foresatt. Ingen nye kontoer trengs per prøve. P01 og COACH_A gjenbrukes på tvers av PlayerHQ, WANG og Team Norway gjennom egne gruppemedlemskap. P02, P03, P04, COACH_B og PARENT dekker manglende tilgang, annen eier, mindreårig og foresatt.

## Endringer og funn

- Egen lokal E2E-konfigurasjon knytter prøvene til de sju kontoene. Den feiler ved manglende oppsett eller utelatte prøver. Nettlesertrafikk tillates bare mot den lokale appen og lokal Auth.
- Testdata omfatter dagens publiserte økt, tre syntetiske TrackMan-slag, en coachingpakke med fire timer, tjeneste, sted og ledige tider. Seed tilbakestiller den syntetiske saldoen og dagens faste økt.
- Den nye AgencyOS-menylinjen publiserte ikke høyden som rullefunksjonene bruker. Den bruker nå prosjektets eksisterende høydemåling. Ingen tilgangsregler er endret.
- Analysevisningen filtrerte bort lenken til Tester på desktop, selv om mobil viste den. Lenken er gjenopprettet med den eksisterende komponenten. Dette er funksjonsretting, ikke ny visuell godkjenning.
- Workbench brukte ulike dra-og-slipp-ID-er ved servergjengivelse og i nettleseren. En stabil React-ID kobler nå tilgjengelighetsbeskrivelsene riktig og fjerner den påviste avviksfeilen ved sidelasting.
- Kalenderens nå-linje kunne få ulik posisjon når minuttet skiftet mellom server- og nettlesergjengivelse. Klokken aktiveres nå etter den første, like gjengivelsen. En komponentprøve flytter klokken over minuttgrensen og kontrollerer stabil HTML.
- Øktinspektøren hentet detaljer fra den gamle økttabellen, selv om kalenderen leser WorkbenchSession. Panelet leser nå den samme modellen som kalenderen, gjennom eksisterende `loadSession`-tilgangsvakt. Egne øvelser uten bankkobling beholdes. Nettverksfeil håndteres, og feil ved lasting får en melding i stedet for uendelig «Henter…».
- Flere prøver var foreldet: tjenestelenker var erstattet av knapper; analysefaner av lenker; I dag og spillerprofilen hadde nye overskrifter og kontroller. Prøvene venter nå på faktisk innhold og krever at handlingene finnes.
- Workbench-prøven hadde bare en ubrukt token-variabel og logget aldri inn. Den logger nå inn som spiller og kontrollerer Workbench direkte.
- Tester av skjult spillerdata håndterer Next sin dokumenterte HTTP 200 ved strømmet feilside, men krever fortsatt faktisk «Denne siden finnes ikke» og fravær av spillerdata.
- Innlogging venter på endelig appside, ikke mellomstasjonen etter innlogging. Cookie-bannerets forsinkede visning håndteres før klikk.
- Klikkprøvene venter på målsiden før neste navigasjon. Tidligere kunne WebKit avbryte en pågående navigasjon og rapportere feil fra selve testrekkefølgen.
- Den tidligere tomme credit-prøven booker og avbestiller gjennom appen. Faktisk lagret booking, eier, status og saldo kontrolleres i databasen: 4 → 3 → 4. Begge nettlesermotorene har bestått den målrettede prøven.
- Lokal kjøring avviser vanlige app-miljøfiler og eksterne leverandørnøkler. 25 automatiske kontroller prøver blant annet feil database, annen lokal stack, åpne porter, leverandørnøkler og skjuling av hemmeligheter i output.

## Målinger

| Kontroll | Resultat |
|---|---|
| Kontoer i app og lokal Auth | 7 i begge |
| Roller, WANG/TN-medlemskap, trenerpublisering, Live og lagret oppsummering på 390/1440 px | 32 bestått, 0 feilet, 0 utelatt |
| Full credit-booking og avbestilling i Chromium og WebKit | 2 bestått, 0 feilet, 0 utelatt |
| Vern for lokalt miljø og output | 25 bestått |
| Øktinspektør: datakilde, dose, innlogging, avvist tilgang og manglende økt | 4 bestått |
| Bevisst nettverksbrudd ved henting av øktinnhold, 390/1440 px | 2 bestått, ingen ubehandlede nettleserfeil |
| Samlet matrise med tidligere utelatte prøver | 70 bestått, 0 feilet, 0 utelatt, 0 omkjøringer (5,5 min) |
| Full prosjektkontroll (`npm run verify`) | Bestått: statiske kontroller, 3 908 funksjonstester, 18 komponenttester og produksjonsbygg |

Den samlede matrisen består av de opprinnelige 32 kontobetingede variantene, rettet portalprøve, rettet tjenestevalg og implementert credit-prøve: 35 varianter × 2 nettlesermotorer = 70 kjøringer. Manifestet ligger i `tests/local-users/e2e-cases.json`.

## Avgrensning og videre lanseringsarbeid

De siste to av de opprinnelige 72 kjøringene er full Stripe-kortbetaling i to nettlesere. Denne integrasjonen er fortsatt uprøvd her; miljøet har bevisst ingen betalingsnøkler. Booking med forhåndsbetalte timer beviser ikke Stripe Checkout, webhook, kortrefusjon eller betalings-e-post.

Oppfølging etter bestilling om siste retting og merge: den gamle utelatte Stripe-prøven er erstattet med en konkret gjestereise og en separat testmodus-kjører. Den krever ekte Stripe Checkout, mottatt signert betalingsmelding og lagret bekreftet booking/betaling. 28 miljø- og outputkontroller består, inkludert avvisning av produksjonsnøkler, eksterne appmål og andre kontoers betalingshendelser. Den eksisterende CLI-testtilgangen ble kontrollert direkte mot Stripe og avvist med `api_key_expired`. Ny innlogging er åpnet; ingen kortbetaling er utført og ingen Stripe-prøve er rapportert som bestått. Merge venter på avklart betalingskontroll. Se [oppsettet](../utvikling/lokal-brukertest.md#separat-stripe-testmodus).

Den gamle Før-kort-prøven er oppdatert til faktisk spillerprofil med Plan og Workbench. Den er ikke et nytt bevis for hele Før/Etter-funksjonen. Gjennomføring og oppsummering kontrolleres i den separate, faktisk lagrende treningsreisen.

Dette er lokal funksjonskontroll med syntetiske data. Det er ikke produksjonskontroll, visuell godkjenning, gjennomført eksport/sletting, eller bevis for Google, SMS, ekte e-post og andre eksterne integrasjoner. Foreldres godkjenning og tilbaketrekking er fortsatt egne brukerreiser; testen her bekrefter sperren uten samtykke.

Sikkerhetsvurdering av endringen: appens eierskaps- og samtykkevakter beholdes; negative brukerprøver er kjørt. Den nye inspektørleseren bruker eksisterende økttilgang før detaljspørringen og binder den til samme spiller. Mindreårig uten samtykke blir avvist; ingen samtykke- eller sletteregler er endret. Endringene som skal lagres er kontrollert mot lokale passord og nøkler, uten treff. Miljøfilene er fortsatt ignorerte. Se [rigg og kjørekommandoer](../utvikling/lokal-brukertest.md).

Alle resultatene er lokale. Det er ikke opprettet en ny CI-kjøring eller publisert en ny produksjonsversjon i denne oppgaven.
