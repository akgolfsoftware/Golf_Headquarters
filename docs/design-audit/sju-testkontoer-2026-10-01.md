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
| Vern for lokalt miljø, Stripe-testmodus og output | 30 bestått |
| Øktinspektør: datakilde, dose, innlogging, avvist tilgang og manglende økt | 4 bestått |
| Bevisst nettverksbrudd ved henting av øktinnhold, 390/1440 px | 2 bestått, ingen ubehandlede nettleserfeil |
| Samlet matrise med tidligere utelatte prøver | 70 bestått, 0 feilet, 0 utelatt, 0 omkjøringer (5,5 min) |
| Full Stripe-kortbetaling, signert betalingsmelding og lagret booking/betaling i Chromium og WebKit | 2 bestått, 0 feilet, 0 utelatt (36,6 sek) |
| Full prosjektkontroll (`npm run verify`) | Bestått: statiske kontroller, 3 912 funksjonstester, 18 komponenttester og produksjonsbygg |

Den samlede matrisen består av de opprinnelige 32 kontobetingede variantene, rettet portalprøve, rettet tjenestevalg og implementert credit-prøve: 35 varianter × 2 nettlesermotorer = 70 kjøringer. Manifestet ligger i `tests/local-users/e2e-cases.json`.

## Avgrensning og videre lanseringsarbeid

De siste to av de opprinnelige 72 kjøringene er nå bestått: full Stripe-kortbetaling med testkort 4242 i Chromium og WebKit. Sluttkjøringen ga 2 bestått, 0 feilet, 0 utelatt og 0 omkjøringer på 36,6 sekunder. Sammen med den tidligere 70-kjøringsmatrisen er alle 72 opprinnelig utelatte kjøringer dekket. Stripe kjøres separat fordi denne prøven trenger ekte Stripe-testmodus, mens standardmatrisen er nettverksisolert.

Betalingsprøven oppretter en syntetisk gjestebooking på 100 kroner gjennom appen. Før kortet fylles inn kontrolleres testmodus, beløp, valuta og ventende booking. Deretter kreves faktisk `paid` hos Stripe, signert Checkout-melding med HTTP 200, lokal `CONFIRMED` og nøyaktig én betalingsrad med `SUCCEEDED`, 10 000 øre og NOK. Kvitteringen må vise bekreftet bestilling. Ingen ekte kort, belastning eller spillerdata brukes.

Den utløpte CLI-testnøkkelen ble erstattet av fornyet Stripe CLI-innlogging. CLI 1.53 bruker kortvarig OAuth-tilgang fra macOS-nøkkelringen. Appen godtar denne bare i den dedikerte lokale utviklingsprosessen med riktige lokale mål, og tvinger API-kall til valgt konto i testmodus. Produksjonsbygg, hostede mål, annen API-vert og blandede nøkler avvises. Fire funksjonstester kontrollerer disse grensene; 30 separate miljø-/outputprøver består. Innlogging og kvitteringsreferanser skjules i kjøreloggen.

Testfeil underveis var foreldede felter/innlasting, blokkering av Stripe sine skjemafiler og kortvalg med en utvidet klikkflate. Prøven velger kort via den faktiske knappens tastaturhandling og fyller det virkelige skjemaet. Ingen betalingsrespons er simulert og ingen appvakt er slått av. Oppsettet er beskrevet i [lokal brukertest](../utvikling/lokal-brukertest.md#separat-stripe-testmodus).

Betalings-e-post og push er bevisst ikke koblet til ekte leverandører i dette miljøet. Appen logger manglende lokal e-postmal etter betalingen; dette er ikke bevis for e-postleveranse. Refusjon, e-post, abonnement, avbrudd/gjentatte hendelser og øvrige L05-reiser gjenstår i lanseringsplanen.

Den gamle Før-kort-prøven er oppdatert til faktisk spillerprofil med Plan og Workbench. Den er ikke et nytt bevis for hele Før/Etter-funksjonen. Gjennomføring og oppsummering kontrolleres i den separate, faktisk lagrende treningsreisen.

Dette er lokal funksjonskontroll med syntetiske data. Det er ikke produksjonskontroll, visuell godkjenning, gjennomført eksport/sletting, eller bevis for Google, SMS, ekte e-post og andre eksterne integrasjoner. Foreldres godkjenning og tilbaketrekking er fortsatt egne brukerreiser; testen her bekrefter sperren uten samtykke.

Sikkerhetsvurdering av endringen: appens eierskaps- og samtykkevakter beholdes; negative brukerprøver er kjørt. Den nye inspektørleseren bruker eksisterende økttilgang før detaljspørringen og binder den til samme spiller. Mindreårig uten samtykke blir avvist; ingen samtykke- eller sletteregler er endret. Endringene som skal lagres er kontrollert mot lokale passord og nøkler, uten treff. Miljøfilene er fortsatt ignorerte. Se [rigg og kjørekommandoer](../utvikling/lokal-brukertest.md).

Alle resultatene er lokale. Det er ikke opprettet en ny CI-kjøring eller publisert en ny produksjonsversjon i denne oppgaven.

## Samlet main etter samtidig Workbench-portering

PR #1069 ble merget som `f9c40e542` etter grønn lokal kontroll, 72/72 og PR-CI. PR #1070 (`29f064aa4`) kom inn samtidig. Ny prøve av samlet main ga 67/70: ukeforslag manglet i begge nettlesere, og én WebKit-innlasting feilet. Den siste bestod uendret ved målrettet omprøve.

Oppfølgingen kobler spillerens ukeforslag til eksisterende serverhandlinger, med Precision-komponenter, tydelig standardforslag uten AI og eksplisitt valg før lagring. Valgt uke beregnes fra norske kalenderdatoer. PlayerHQ-ruten laster nå også de felles Precision-stilene og `.pa-root`; uten dem manglet blant annet dialogplassering og knappestiler. Eksisterende servervakter, PRO-krav og datamodell er beholdt. Mobil 390 px og desktop 1440 px er visuelt inspisert med syntetiske data; dette er teknisk kontroll, ikke ny designgodkjenning fra Anders.

Produksjonsprøvens to breddefeil kom fra en feil testforventning: innloggingssiden har en navngitt h2, og skal naturlig nok bli på `/auth/login`. Testen kontrollerer nå riktig overskrift/URL og beholder breddemålingen og avvisningskontrollene for beskyttede ruter. Den målrettede lesende produksjonsprøven består i begge nettlesere.

Etter rettingene: 70/70 lokale brukerprøver bestått uten feil, skip eller omkjøringer (6,5 minutter). Full `npm run verify` har også bestått: 3 914 funksjonstester, 18 komponenttester og produksjonsbygg. Resultatene gjelder samlet main `f9c40e542` med oppfølgingsrettingene, ikke bare den opprinnelige PR-grenen.
