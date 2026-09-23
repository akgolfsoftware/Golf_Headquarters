# Team Norway — uavhengig kontroll 14. september 2026

Status: Testdag og trenerføring er teknisk bekreftet lokalt. Alle 20 menyinnganger samt demokø og føringsskjerm er kontrollert på mobil og desktop: 44 av 44 visninger bestod.

## Levert i arbeidskopien

- Opprett testdag med protokoll, tidspunkt og valgte spillere. Lagret deltakerkø, hopp over/ikke møtt, gjenåpning og avslutning.
- Trener fører på riktig spiller. Utkast, gjenåpning, avbrutt forsøk og «Før og neste» med blanke felt for neste spiller.
- Resultater kobles til testdag, spiller og trener. Samtidige forsøk gir ett resultat og en tydelig melding til den andre føreren.
- Spillerens historikk viser trenerført resultat. Pågående trenerutkast kan ikke overtas i spillerens egenføring.
- Dokument-/vedleggsruter med tilgangskontroll og invitasjonsstatus som skiller opprettet medlem fra sendt invitasjon, inkludert nytt sendeforsøk.
- DataGolf skiller manglende referansedata, tom historikk og faktisk lesefeil. Egne resultater beholdes.
- Føringsskjermen følger valgt Claw-profil med felles felter, tydelig spiller, fremdrift, hovedhandling og lesetilstander.

Koden ligger på `codex/team-norway-demo-2026-09-14`. Den lokale appen kjører fra den separate, miljøfrie kopien `tn-fullfor-lokal-prove-2026-09-14`. Denne kopien brukes til gjennomgang og skal bevares.

## Faktisk kontroll

| Kontroll | Resultat | Bevisgrense |
|---|---|---|
| Samlet `npm run verify` | 2 768 enhetstester, 4 komponenttester og produksjonsbygg bestod | Utført før de siste visuelle justeringene; disse fikk egen lint- og typekontroll |
| Ekte lokal nettleserreise | 12 av 12 bestod, 1,8 minutter | Auth, apphandlinger og Postgres; syntetiske brukere. Siste to tekst-/navigasjonsjusteringer ble gjort etter denne kjøringen |
| Dokumenter, invitasjon og gruppetilgang | 75 av 75 uavhengig bestått før siste HTML-retting | E-post og Storage er simulert i testene; HTML-rettingen er med i samlet testpakke |
| Trenerføringens handlingstester | 11 av 11 uavhengig bestått | Simulerte avhengigheter, supplert av den ekte nettleserreisen |
| Siste visuelle menykontroll | 44 av 44 visninger ved 390 og 1440 px | Alle 20 faktiske menyinnganger, demokø og føringsskjerm; ingen sidefeil, 404-sider eller horisontal overflyt |
| Første nye skjermkontroll | 8 av 8 visninger ved 390 og 1440 px | Oversikt, fellestesting, spillere og invitasjon; ingen sidefeil eller horisontal overflyt |
| Databasekontroll | Riktig spiller, riktig trener og riktig kobling mellom testøkt og resultat | Kontrollerte 50/75 brutto slag og samtidig føring; ingen løse resultatrader |

Testantallene overlapper og skal ikke summeres til et nytt totalantall. HTTP 200 alene er ikke bevis på fungerende handlinger.

Den ekte prøven kontrollerte opprettelse, utkast, gjenåpning, avbryt/start tomt, begge fullføringer, spillerhistorikk, skrivebeskyttet hjelpetrener og avvist utenforstående på testdag og føringsskjerm. To nettlesere forsøkte å fullføre samme deltaker; bare én fikk lagret, og databasen fikk nøyaktig én ny testøkt og ett nytt resultat.

## Designgrunnlag

[Claw-valget 13. september](../design-system/team-norway-claw-valgt-2026-09-13.md) gjelder. Referansen for føring er `designsystem/team-norway/templates/tn-fellestesting/TnFellestesting.dc.html`. Nye samlede designkandidater for PlayerHQ/AgencyOS er ikke innført gjennom denne jobben. Den nye testdagsflaten trenger Anders sin endelige visuelle vurdering; automatisk kontroll er ikke en slik godkjenning.

## Drift og grenser

Den nye lokale appen bruker port 3012, Auth 54521 og appdatabasen `tn_fullfor_app_20260914` på port 54522. Private opplysninger ligger bare i den lokale, beskyttede mappen `/private/tmp/ak-hq-tn-fullfor-20260914/`. Ingen verdier skal kopieres til rapporter eller Git.

Første lokale databaseforsøk fikk et delvis skjema. Prisma avviste nullstilling uten særskilt samtykke. Ingen nullstilling eller omgåelse ble gjort; en ny navngitt appdatabase ble opprettet, og den første ble bevart. Reserveappen 3011, resultatet på 49 brutto slag, HQ 54421/54422 og WANG 54321/54322 er bevart.

Ingen hosted skjemaendring, produksjonskonto, ekte e-post, faktisk Storage-opplasting, commit, push, merge eller ny publisering er levert. DataGolf-proffdata finnes ikke i den lokale basen. Dokument-/invitasjonsgrensesnitt og testbevis er ikke en attest for ekte utsending eller fillagring.

Ny Vercel-demo er fortsatt blokkert: automatisk godkjenningskontroll avviste en preview uten ekstra Vercel-beskyttelse som deler produksjonsdatabase. Det konkrete spørsmålet til Anders er ubesvart. Det additive SQL-forslaget er et kontrollgrunnlag, ikke en godkjent eller utført hosted migrasjon.

## Kontrollfiler

Private kjørelogger, skjermbilder og målinger ligger under `/private/tmp/ak-hq-tn-fullfor-20260914/`: `verify.log`, `run5.log`, `root-visual-results.json` og siste visuelle rapport. Disse inneholder lokale testbevis og skal ikke legges i `public/`.

## Klargjort lokal demo

En egen «Demotestdag – Team Norway» er opprettet gjennom appen med to tydelig syntetiske spillere. Ingen resultater er ført på denne dagen. Den er klar for manuell gjennomgang, og tidligere prøver/resultater er bevart. Appen står på `http://127.0.0.1:3012`; åpnes fra Anders sin Mac eller fjernstyring til den. Dette er ingen offentlig Vercel-lenke.

Siste mobilretting komprimerer testdagens tre statuskort til én oversiktslinje med fremdrift. Bare denne siden ble endret. Den fikk egen lint/typekontroll og nye bilder på mobil og desktop. Direkte innlogging via `?next=` til demotestdagen og validering ved tomme målefelt er også prøvd, uten resultatføring.
