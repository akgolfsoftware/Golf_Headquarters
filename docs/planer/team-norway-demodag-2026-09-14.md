# Arbeidsplan — Team Norway-demo 14. september 2026

## Ny aktiv bestilling etter dagsavslutning — full funksjonsdekning

Anders har bestilt videre koding av Team Norway opp mot PlayerHQ og en komplett prompt til Claude Design/Claw. Den tidligere kl.18-stoppen gjelder den gamle dagsautomatikken; denne nye aktive kodebestillingen fortsetter. Automatikken forblir pauset. Hovedøkt 2b71bf9d-3272-4a70-aa62-26162a3e42aa eier spilleroversikt/tester/analyse og felles TN-meny; planøkt 7828037f-8e44-4938-a911-8c70d3cd91bf eier Workbench/kalender/teknisk plan/evaluering. Filansvar og resultater: `/private/tmp/ak-hq-tn-utvidelse-20260914/`. Codex eier designprompt og samlet kontroll.

Bruk valgt Claw13.09. Ingen ny pris, betaler eller tilgangsmodell skal vedtas; trenerflater er tilnærmet gratis og spillerlisenser betalte iht. produktreglene. Bevar app3012 inntil samlet kontroll. Ingen publisering eller hosted schemaendring er bestilt gjennom dette. Designprompt: [komplett Claw-prompt](claude-design-claw-team-norway-komplett-prompt-2026-09-14.md). Tidligere ferdigstatus nedenfor gjelder demoreisen, ikke den nye utvidelsen.

## Dagsarbeid avsluttet 14.09 kl. 18.00

Automatisk dagsoppfølging er satt på pause. Den kontrollerte appen på 3012 står oppe for Anders sin gjennomgang. Begge Claude Code-øktene er ferdige. Ingen videre automatisk kodeendring, ny seeding eller publisering skal starte. Den siste mobilkøen er komprimert og kontrollert; direkte innlogging til demotestdagen og tomfeltvalidering er bekreftet. Privat gjennomgang med skjermbilder ligger i `~/Documents/Claude/akgolf-hq/team-norway-gjennomgang-2026-09-14.html`.

## Lokal leveranse kontrollert 14.09 kl. 17.54

**Testdag og trenerføring er teknisk klare lokalt.** `run5.log` bekrefter 12 av 12 faktiske nettleserprøver på 1,8 minutter. Samlet kvalitetskontroll bestod med 2 768 enhetstester, fire komponenttester og produksjonsbygg; siste visuelle tekst-/navigasjonsjusteringer fikk egen lint- og typekontroll.

Codex har deretter kontrollert alle 20 faktiske menyinnganger samt demokø og føringsskjerm ved 390 og 1440 px: **44 av 44 visninger**, ingen sidefeil, feilaktige 404-sider eller horisontal overflyt. En ny «Demotestdag – Team Norway» med to syntetiske spillere er opprettet gjennom appen, klar for manuell gjennomgang uten førte resultater. Tidligere resultater bevares.

Begge Claude Code-øktene er ferdige og filansvar er frigitt. Hovedøktens midlertidige rapport er `/private/tmp/ak-hq-tn-fullfor-20260914/kontrollrapport.md`; den uavhengige, gjeldende rapporten er [Team Norway-kontroll](../design-audit/team-norway-uavhengig-kontroll-2026-09-14.md). Eldre formuleringer om «overflødig testkopi» eller at ingen tidligere lokal schema-provisjonering ble forsøkt, skal ikke brukes som fasit.

Den seedfrie appen er startet av Codex på **3012** fra `tn-fullfor-lokal-prove-2026-09-14`; terminal 4247, start-PID 56163. Den kopien er i bruk og skal bevares. Privat launcher er `/private/tmp/tn-fullfor-standby-root.mjs`. Ikke start en ekstra server, reseed eller endre 3011-reserven. Ingen hosted endring eller ny Vercel-lenke er levert. Storage/e-post er ikke ekte ende-til-ende-prøvd. Anders sin endelige visuelle vurdering av den nye testdagsflaten gjenstår.


## Aktiv fullføring 14.09 kl. 17.24

Hovedøkten har rettet feilkvittering etter lagring, HTML-håndtering i invitasjoner, skrivebeskyttede testdager og DataGolf-nulltypen. Typekontrollen bestod. Første full `npm run verify` stoppet på fire eksisterende tester der den nye testdagkoblingen manglet i simulerte data. Begge berørte testfiler er rettet; ni målrettede tester består ifølge hovedøktens kjøring. Full samlet kontroll og faktisk nettleserreise gjenstår.

Den andre Claude Code-økten `7828037f-8e44-4938-a911-8c70d3cd91bf` er gjenopptatt for en avgrenset visuell runde på **bare** `tn-testdag-scorecard.tsx` og eventuell tilhørende CSS. Hovedøkten skal ikke endre denne filen før den frigis. Arbeidsdeling: `/private/tmp/ak-hq-tn-scorecard-ui-lease.md`. Sekundær kjører i terminal 34202; privat stream er `/private/tmp/ak-hq-tn-dokument-cc-d8olbtsw/scorecard-stream.jsonl`. Resultat kommer i `/private/tmp/ak-hq-tn-scorecard-ui-result.md`. Ikke start en duplikat.

Codex har opprettet og kontrollert en ny separat appkopi: `.worktrees/codex/tn-fullfor-lokal-prove-2026-09-14`, uten miljøfiler, Git eller gamle Next-byggfiler, med egne klonede avhengigheter. Kopikvittering: `/private/tmp/ak-hq-tn-fullfor-20260914/copy-ready.txt`. Første oppstart traff reservekatalogens lås; prøven må bruke den nye katalogen og eksplisitt prosjektsti på 3012. Ikke stopp 3011 eller slett dens lås. Ingen ny nettleserreise har bestått ennå.

Faktisk databasekontroll bekrefter de åtte forventede relasjonene mellom testdag, gruppe, trener, deltaker, testøkt og resultat i den nye appdatabasen. Før første vellykkede appreise var antallet testdager, deltakere og resultater null. Ingen hosted endring, reset, utsending eller publisering er utført.


## Kontrolloppdatering 14.09 kl. 17.08

Dokumenter og invitasjoner er ferdig rettet i den andre Claude Code-økten. Codex har kjørt de berørte testene uavhengig: **75 av 75 bestått**. Dette omfatter tilgang, vedlegg, opplastingsrute og invitasjonsstatus/retry. Faktisk e-postlevering og Storage-opplasting er fortsatt ikke prøvd. Hovedøkten har overtatt filene for samlet kvalitetskontroll.

Den nye, isolerte appdatabasen `tn_fullfor_app_20260914` på `127.0.0.1:54522` er nå provisjonert, og egne syntetiske brukere er opprettet. Auth kjører på 54521; ny testapp bruker 3012. Den første delvis provisjonerte databasen er bevart. Prisma avviste nullstilling uten særskilt samtykke; ingen nullstilling eller omgåelse er utført. Private tilkoblinger ligger under `/private/tmp/ak-hq-tn-fullfor-20260914/`, med appdatabasen i `app-status.env`.

Claude Code prøver nå den faktiske testdagsreisen. Bestått testdag, samtidighet, spillerhistorikk og full `npm run verify` er ennå ikke bekreftet. Etter grønn prøve skal en app uten ny seeding stå oppe på 3012 for visuell gjennomgang. Reserveappen på 3011 og resultatet på 49 brutto slag bevares.

Denne oppdateringen går foran eldre status nedenfor. Ingen ny Vercel-lenke, publisering eller hosted databaseendring er utført.


Oppdatert 14.09 kl. 16.58, Europe/Oslo. Anders har bestilt «Gjør ferdig disse nå» og «Fortsett». Dette overstyrer det tidligere avgrensede skriptoppdraget og standby. Møtets gjennomføring er ikke bekreftet.

## Aktiv fullføring av Team Norway

**Gjeldende testdatabase kl. 16.58:** `tn_fullfor_app_20260914` på 127.0.0.1:54522, i den nye TN-testcontaineren. Codex opprettet denne som en separat tom database og aktiverte pgvector før provisjonering; 0 apptabeller ble kontrollert. Privat tilkoblingsfil er `/private/tmp/ak-hq-tn-fullfor-20260914/app-status.env`, ikke den gamle status.env. Auth bruker fortsatt 54521. Den første `postgres`-appdatabasen fikk et delvis skjema; Prisma avviste reset uten brukerens særskilte samtykke. Reset, DROP og samtykke-overstyring er ikke godkjent og skal ikke prøves. Den delvise basen bevares; ny database er en tryggere vei uten sletting. Hovedøkten har fått konkrete nye database-/filgrenser.

Ny isolert teststack er oppe og uavhengig kontrollert frisk kl. 16.43: `akgolf-hq-tn-fullfor-20260914`, API 54521 og Postgres 54522. `public` hadde 0 tabeller før overlevering. Hovedøkten kan provisjonere akkurat denne nye databasen og egne syntetiske fixtures, med miljøfri testapp på 3012 og separate private filnavn. Overlevering: `/private/tmp/ak-hq-tn-stack-klar-1643.md`. Privat status ligger under `/private/tmp/ak-hq-tn-fullfor-20260914/status.env`; aldri skriv verdier. CLI 2.109.1 fra .nvm brukes; første forsøk med CLI 2.75 ventet på eldre bilder og ble avsluttet uten endring i eksisterende containere. Kun Auth/gateway/database kjører i den nye stacken; ingen Data API eller Storage. De nye filrutene prøves derfor med kontrollerte testkilder, ikke faktisk filopplasting i denne stacken.

Skjema, testdag-/trenerhandlinger og opprett/kø/føringskomponenter er skrevet og under kontroll. Konkrete rettelser om datatilgang, versjon, samtidighet, køvalg og synlige feil er overlevert; de er ikke ferdigtestet som helhet. Begge Claude-øktene er aktive.

Hovedøkten i Claude Code implementerer testdag og trenerføring i denne arbeidskopien. En separat avgrenset Claude Code-økt er startet for dokumenter/vedlegg/invitasjon, med fileierskap i `/private/tmp/ak-hq-tn-deling-1630.md` (lest av hovedøkten). Sekundærøkt `7828037f-8e44-4938-a911-8c70d3cd91bf`, terminal 14197, privat stream `/private/tmp/ak-hq-tn-dokument-cc-d8olbtsw/stream.jsonl`. Vanlig automatisk tillatelseskontroll. Ikke start duplikater. Sekundær eier målrettede tester; hovedøkten eier fullverify og ekte nettleserreise. Kildegrunnlaget er valgt Claw Team Norway fra 13.09; nye N4/Clawv7-prototyper er ikke valgt. Oppdraget er konkretisert i `/private/tmp/ak-hq-tn-fortsett-1609.md`.

1. Bygg faktisk testdag med lagrede deltakere/kø, gjenåpning og trenerføring på riktig spiller. Modellen i `docs/design-audit/team-norway-testdag-modellforslag-2026-09-14.md` er avstemt for lokal kildekode og review, ikke anvendelse mot hosted eller eksisterende demo. Kodeforslaget skal ha reelle relasjoner til testøkter/resultater og hindre dobbeltføring.
2. Fullfør delvis skrevne dokument-/vedleggsruter, invitasjonsstatus, gruppetilgang, manuelle turneringer og presise spillerlenker. To underoppgaver stoppet på bruksgrense; Claude Code overtar deres filer og bevarer endringene.
3. Privat filskriving er rettet og 10 dummytester består, inkludert lenker, feil filtype og rettigheter før skriving. Ingen eksisterende opplysningsfiler ble lest eller endret.
4. Kjør målrettede tester, full kvalitetskontroll, ekte testdag/trenerreise i ny isolert lokal database og visuell kontroll på 390 px og desktop. Registrer faktisk bevis og avvik før ferdigmelding.

Uavhengig delkontroll kl. 16.20: 40 tester består (11 DataGolf, 19 dokument/vedlegg/tilgang, 10 private testfiler), samt prosjekt:sjekk. Dette erstatter ikke kommende fullverify, routetester og nettleserprøve av nye funksjoner. Foresattes nedlasting og nye dokument-/invitasjonskomponenter trenger fortsatt integrasjon.

DataGolf-kode er levert av underagenten: skiller manglende datasett, tom historikk og faktisk lesefeil; bevarer egne resultater. 11 tester uavhengig kontrollert grønne. Metadata viser at alle fem profftabeller mangler i lokal database; datainnholdet er derfor ikke levert. Ingen import eller hosted dataendring er gjort.

Claude Code stod fra 15.27 på en konkret lokal Edit-godkjenning. Codex løste den kl. 16.10 og bekreftet schema-kildediff; ingen databasekommando ble godkjent. Kontroller fremdrift via siste transcript og faktiske filer, ikke bare spinner. Eksisterende økt: `2b71bf9d-3272-4a70-aa62-26162a3e42aa`, terminal 90585, Remote Control https://claude.ai/code/session_01GSm9HmCGoDCVgncovfeCvS.

Bevar lokal reserve på 3011, eksisterende 49 brutto slag, HQ54421/54422 og WANG54321/54322. Nye endringer er foreløpig kildekode og ikke del av reserveappen. Testdatabaseoppsett må være separat og syntetisk. Ingen hosted schema-/tilgangsendring, utsending, main-merge/push eller deploy. Publisering er fortsatt blokkert av tidligere automatisk avvisning og ubesvart konkret spørsmål om offentlig preview med delt produksjonsdatabase. Ingen ny lenke er laget.

Dagsautomasjonen er oppdatert til fullføringsoppdraget hvert 15. minutt, med pause ved første kjøring kl. 18 eller senere. Anders styrer Claude Design manuelt. Eldre status nedenfor beskriver den tidligere lokale demoen, ikke bevis for de nye funksjonene.

## Gjeldende status kl. 13.02

- Ekte lokal nettleserreise bestod 5/5 prøver (50,7 sekunder), kontrollert mot kjøreutskrift og konkrete resultatkontroller. Coach logger inn, tildeler testen gjennom appen, spilleren gjennomfører, 49 brutto slag lagres og samme resultat vises hos coach. Testtallet går fra 0 til 1. En utenforstående bruker avvises på TN-oversikt og spillerliste.
- Dette er faktiske lokale Auth-/databaserader med syntetiske demospillere. Hosted demokonto, ekstern innlogging og ny Vercel-lenke er fortsatt ikke klare. Publisering venter Anders' svar på den konkrete godkjenningen etter automatisk avvisning; ingen nye forsøk uten svar.
- Demospilleren trenger TALENT-profil eller annen gyldig PlayerHQ-tilgang; STANDARD/GRATIS er ikke tilstrekkelig etter lanseringsvinduet. Ingen tilgangsregler er endret.
- Gjenåpne lagret test fra «Dine registreringer» (session-lenke). En ny åpning av test-lenken starter en ny test. Egen opprettelse av testdag er ikke påvist; testtildeling skal ikke presenteres som testdag.
- Skjermbilder fra faktisk lokal app ved 390 og 1440 px finnes som reserve i privat midlertidig mappe. De er ikke en ny visuell godkjenning fra Anders.
- Lokal reserve er startet på `http://127.0.0.1:3011/auth/login` på Anders sin Mac. Codex bekreftet HTTP 200 utenfor nettverkssandkassen kl. 11.59. Adressen kan brukes via fjernstyring av Mac-en; den er ikke tilgjengelig direkte fra iPhone/MacBook Air over internett. Private innloggingsopplysninger ligger kun i `/tmp/ak-hq-tn-demo-creds.env` på Mac-en. Serverstart nullstiller ikke de eksisterende resultatene.
- Claude Code rapporterer grønn ESLint på fem nye skript-/testfiler, helprosjektets TypeScript-kontroll og prosjekt:sjekk. Full verify/bygg er ikke kjørt i denne runden, ingen commit/push. Rapportens siste sammendrag er ryddet. Appkode, main og produksjon er uendret i dette arbeidet.
- 13 utvalgte TN-menypunkter er nå innlogget lesekontrollert ved 390, 834 og 1440 px: 39/39 HTTP 200, riktige sideoverskrifter, ingen registrerte konsoll-/sidefeil eller horisontal overflyt. Codex har kontrollert målefilen og et faktisk skjermbilde. Spillerposten er kontrollert separat for riktig syntetisk demospiller. Dette er sidevisningsbevis, ikke attest for alle handlinger. OS-mørk emulering endret ikke TN-bakgrunnen; denne TN-retningen bruker mørke seksjoner, ikke en påvist global mørk bryter.
- De sju øvrige menypunktene er rapportert lesekontrollert ved 1440 px: gruppeposter, dokumenter, samtykke, analyse, trenere/tilgang, invitasjonsskjema og DataGolf. Ingen invitasjon, opplasting eller samtykkeendring utført. Alle 20 menyinngangene er dermed besøkt, men alle handlingene er ikke prøvd.
- DataGolf er en intern apprute og svarte HTTP 200 med tittelen DataGolf. Siden viser «DataGolf-data kunne ikke hentes» og manglende kobling til turneringsresultater i den lokale prøven. HTTP 200 betyr her ikke vellykket datalasting. Rotårsak er ikke undersøkt fullt, og status for hosted data er ikke prøvd. DataGolf holdes utenfor møtereisen; ingen schema/import eller dataretting utført.
- Lokal innlogging svarte HTTP 200 ved ny uavhengig kontroll kl. 12.44 og ble deretter bekreftet oppe av Claude Code ved sluttkontrollen. Claude Code er nå i standby. Den anbefalte 15-minutters reisen nedenfor beholdes som møtegrunnlag, og endringsstopp fra 13.15 til 15.00 består.

## Anbefalt demonstrasjon med lokal reserve

Bruk den fjernstyrte Anders-Mac-en, vanlig desktopbredde og lys TN-visning. Velg den navngitte **TN Demo Spiller**, siden lokal testdatabase også inneholder eldre syntetiske medlemmer som tilhører andre kontroller. Ikke slett disse for å rydde demonstrasjonen.

| Tid | Vis | Presenter presist |
|---|---|---|
| 0–2 min | Innlogging og `/team-norway` | Faktisk Team Norway-coach og tilhørende oversikt. Lokal demo med syntetiske data. |
| 2–4 min | Spillerutvikling → TN Demo Spiller | Spillerlisten og spillerposten. En tom tidslinje er en tomtilstand. |
| 4–6 min | Fellestesting → Testprotokoller → Putt 1–3 m | Spillerkø og testprotokoll. Egen opprettelse av testdag er ikke tilgjengelig i den verifiserte flyten. |
| 6–10 min | Eksisterende coach-tildeling → spillerens testføring → Dine registreringer | Faktisk tildeling og lagring er testet. Vis gjerne det bevarte resultatet på 49 brutto slag; en ny test starter en ny registrering. |
| 10–12 min | Coachens testhistorikk og Månedsplan | Vis samme resultat hos treneren og sammenhengen til planlegging. Øvrige knapper er ikke ferdigtestet. |
| 12–15 min | Samlinger, Uttak, Rangliste og helhetsoversikt | Vis sidene og ærlige tomtilstander. PlayerHQ inngår i testreisen; AgencyOS inngår i trenerhistorikken. WANG og ferske Workbench-tegninger er ikke attestert av denne TN-kontrollen. |

Reservebilder er samlet privat i `~/Documents/Claude/akgolf-hq/team-norway-demo-reserve-2026-09-14`. Opplysningene for lokal innlogging finnes bare i den private lokale filen nevnt over. Ingen nye konto-/resultatendringer kjøres automatisk rett før møtet.

Oppstarts- og oppfølgingsnotater lenger ned er historikk; denne statusen gjelder foran eldre beskrivelser av gjenstående nettleserprøve.

## Dagens bestilling

Anders skal demonstrere helheten i AK Golf HQ for sjefen for Team Norway. Første prioritet er faktisk innlogging med en Team Norway-konto og faktiske Team Norway-sider: oversikt, demospillere, testføring, testdag og resultater. Hele appen trenger ikke være operativ. Ingen vellykket lagring skal simuleres som ekte.

Anders gjør samtidig små endringer manuelt i Claude Design, særlig Workbench-kalenderen. Arbeidet her bruker det allerede valgte Claw-grunnlaget. Nye Workbench-eksporter tas inn etter en konkret overlevering; agentene styrer ikke Anders' designfane.

Anders ba om en AKGolfHQ «verse-link», tolket som en egen Vercel-demolenke. Dette autoriserer å klargjøre og publisere en separat demo/preview. Produksjonsalias, tilgangsregler og databaseskjema skal ikke endres som følge av denne tolkningen.

## Ansvar og enheter

| Ansvar | Eier | Arbeidssted |
|---|---|---|
| Designjusteringer og visuell vurdering | Anders | Claude Design via iPhone/fjernstyring eller MacBook Air |
| Plan, kontroll, prioritering og demolenke | Denne Codex-oppgaven | Anders’s Mac, local |
| Team Norway-app, målrettede rettinger og testbevis | Separat Claude Code-økt | Egen arbeidskopi på Anders’s Mac |
| Uavhengig kartlegging | Kortvarig Codex-underagent | Kun lesing; ingen konkurrerende kodeendring |

Arbeidskopi: `.worktrees/codex/team-norway-demo-2026-09-14`, gren `codex/team-norway-demo-2026-09-14`, start `e565264b6`. Hovedkopien bevares. MacBook Air og iPhone brukes til fjernstyring av samme økt; ingen ny kopi eller ekstra byggemaskin startes uten behov. Remote Control-tilkobling skal bekreftes før den omtales som tilgjengelig. Maskinen må være våken og tilkoblet for lokal oppfølging.

## Før kl. 14

| Tidsrom | Leveranse | Kontrollpunkt |
|---|---|---|
| 10.35–11.00 | Fastslå dagens faktiske TN-reiser, konto-/gruppekrav, demodata og Vercel-miljø | Eksakte ruter og mangler; riktig trenerrolle og gruppemedlemskap |
| 11.00–12.00 | Rette de viktigste demohindringene i TN; klargjøre demokonto og demospillere | Innlogging → oversikt → spiller → test → resultat; ingen svekket tilgang |
| 12.00–12.30 | Klargjøre separat Vercel-demoversjon med eksisterende integrasjoner | Bygg bestått; riktig appadresse, innloggingsretur og dataområde; ingen hemmeligheter i output |
| 12.30–13.00 | Fullføre prøve av testdag og testføring; kontrollere demolenken | Riktig spiller, brutto score, lagring/gjenåpning der funksjonen er operativ; avvist fremmed rolle |
| 13.00–13.15 | Anders ser den faktiske demoen; bare kritiske rettinger | Kort demonstrasjon på møteutstyret; bekreftet hovedreise og ærlige begrensninger |
| 13.15–13.45 | Endringsstopp og generalprøve | Stabil lenke og versjon; konto virker; reservevisning og manus klart |
| 13.45–14.00 | Møteberedskap | Ingen nye bygg eller dataendringer; åpne hovedsiden og nødvendig reserve |
| 14.00–15.00 | Demo og møtestøtte | Bevar demoversjonen; noter tilbakemeldinger når Anders deler dem |

## Minstekrav for en brukbar demo

- En ekte innloggingsøkt med korrekt Team Norway-gruppetilhørighet; ikke en offentlig HTML-prototype eller en adminrolle som skjuler manglende treneradgang.
- Oversikt og spillerliste viser bare data demonstrasjonskontoen har tilgang til. Syntetiske demospillere er tydelig merket og skal ikke blandes inn i ekte spillerhistorikk, rangering eller varsling.
- Minst én testreise kan demonstreres med riktig subjekt og ærlig lagringsstatus. Spillerføring og trenerføring på vegne av spiller er forskjellige funksjoner.
- Testdag: kontroller eksisterende datamodell og handling før bygging. Hvis vedvarende testdag krever en ny modell, registreres den konkrete beslutningen; ikke skriv til tilfeldige felt eller vis falsk bekreftelse. En synlig planleggingsvisning kan brukes som ærlig reserve, tydelig merket som forhåndsvisning.
- Resultatet kan gjenåpnes hvis det omtales som lagret. Demoen har en vei tilbake til oversikten.
- Meny og sentrale skjermer fungerer på møteutstyret; kontroll ved 390 og 1440 px, og 834 px når nettbrett inngår.
- Demolenken er prøvd fra ekstern nettleser med faktisk innlogging. Vercel-beskyttelse håndteres med støttet tilgang; beskyttelse slås ikke av som snarvei.

## Foreslått møtereise, 12–15 minutter

1. Logg inn og vis Team Norway-oversikten: spiller, trener og organisasjon i samme app.
2. Åpne en merket demospiller og vis historikk, utvikling og relevant testgrunnlag.
3. Åpne fellestesting og protokollbibliotek; forklar testdagens planlegging.
4. Før én test i en bekreftet operativ flyt. Gjenåpne resultatet og vis historikk/sammenligning.
5. Vis plan-/oppfølgingssammenhengen og øvrige TN-områder med tydelig skille mellom fungerende handling og videre utvikling.
6. Avslutt med en kort oversikt over PlayerHQ, AgencyOS og WANG. Anders' ferske Workbench-design kan vises separat med eksplisitt prototypebeskrivelse hvis det ikke er bygget.

Eksakte ruter føres i Claude Codes kontrollrapport etter kodelesing. Ingen utestet URL er et ferdig demopunkt.

## Etter demoen

| Tidsrom | Arbeid |
|---|---|
| 15.00–15.30 | Registrer møtetilbakemeldinger når tilgjengelige. Bevar demonstrert versjon og skill feil fra nye ønsker. |
| 15.30–17.00 | Kontroller Anders' nye Claude Design-eksport. Knytt endringer til Workbench-reiser; bygg bare det valgte omfanget i separat versjon. Hvis eksport mangler, fortsett avklart TN-kontroll/restarbeid. |
| 17.00–18.00 | Samle tester, avvik og neste arbeidsliste. Oppdater masterplan/kilder etter faktiske leveranser. Ikke erklær hele appen ferdig på grunnlag av demoen. |
| 18.00 | Dagsrapport og pause automatisk oppfølging. Videre nattkjøring krever ny bestilling. |

## Arbeidsregler og stoppunkter

- Bruk eksisterende Claw-beslutning, kildekode og prosjektets sikkerhets-/personvernregler. Ingen generell designomlegging før møtet.
- Produksjonsendringer, skjema-/tilgangsendringer, ekte betaling, utsending og kjøp inngår ikke. Be om bare konkrete manglende beslutninger etter at underlaget er klargjort.
- Reelle kontoer og demodata klargjøres gjennom eksisterende støttede mekanismer. Ingen brede seed-skript mot hosted database. Hemmelige verdier leveres aldri i planen, Git eller agentprompts.
- Claude Code eier TN-kode og sin kontrollrapport. Codex eier denne planen og koordineringen. Andres endringer skal bevares.
- Bare ett tungt bygg/testløp om gangen på vertsmaskinen. Målrettede tester først; full kvalitetskontroll før kodeleveranse/publisering.
- Kl. 12.30: hvis nødvendig funksjon ikke er trygg og prøvd, velg eksisterende fungerende flyt og noter begrensningen. Ikke bruk de siste minuttene på ny arkitektur.
- Fra 13.15 til 15.00 endres ikke demonstrert versjon. En kritisk retting må få egen bekreftet kontroll før lenken byttes.
- Automatisk oppfølging skal sjekke faktiske resultater, fortsette avklart arbeid og rapportere blokkeringer kort. Ingen gjentatt publisering, dupliserte økter eller ubegrenset nattarbeid.

## Oppstartsstatus

- Bekreftet vert: Anders’s Mac. Claude Code 2.1.220 og Vercel CLI finnes.
- Egen arbeidskopi opprettet fra siste kontrollerte main.
- Uavhengig TN-kartlegging startet. Første funn: fellestesting er spillerkø/protokollinngang; opprett testdag er ikke påvist, og eksisterende TN-testføring lagrer på innlogget bruker.
- Claude Code «Team Norway demo 14.00» er startet med eksisterende standardmodell og automatisk tillatelsesvurdering. Remote Control er bekreftet aktiv: https://claude.ai/code/session_01GSm9HmCGoDCVgncovfeCvS . Innlogging fra Anders' iPhone/MacBook Air er ikke prøvd av Codex.
- Automatisk oppfølging `team-norway-demo-og-dagsarbeid-14-september` er ACTIVE hvert 15. minutt. Sluttkontroll/pause ved første kjøring kl. 18 eller senere.
- En separat avgrenset oppgave klargjør første Vercel-preview fra ren `e565264b6`. Lenken skal ikke omtales som full demogodkjenning; demokonto, data og funksjonsreise må prøves separat.
- Publisering er foreløpig blokkert av automatisk godkjenningskontroll: første forsøk omfattet over 5500 filer, og ekstra Vercel-beskyttelse var ikke bekreftet. Etterfølgende lesekontroll fant ingen konfigurert Vercel-SSO/passord/IP-beskyttelse. Vanlig appinnlogging er et separat lag. Preview deler databasevariabler med Production. Ingen ny demo er publisert; ikke gjenta forsøket uten nytt godkjent grunnlag.
- Claude Code fikk en presisering etter at en kommando som kunne skrevet ut en databaseadresse ble avvist. Ingen slik verdi er levert fra den kommandoen. Egen arbeidskopi og syntetiske tester brukes videre; koordinator håndterer konto-/miljøbehov separat.
- Tidsbegrenset vern mot automatisk hvile er startet på Anders’s Mac til kl. 18. Det beskytter ikke mot avslåing, lukking eller nettbrudd.
- Opplastingsgrunnlaget er nå avgrenset i separat preview-arbeidskopi: 4031 filer / 87,53 MB. Dokumentarkiver, miljøfiler, agentkontekst og designoriginaler er utelatt; nødvendige appfiler er bevart. Prøvekjøring og statisk importkontroll bestod. Full innholdsrevisjon/nytt fullbygg er ikke utført.
- En ny automatisk publiseringsvurdering med dette grunnlaget ble også avvist. Ingen ny Vercel-lenke er opprettet. Nødvendig konkret godkjenning: offentlig tilgjengelig preview med vanlig appinnlogging, uten ekstra Vercel-passord, koblet til eksisterende produksjonsdatabase. Ingen flere forsøk før svar.
- Claude Code har levert en kodelest tildelingsreise: `/admin/tester/tildel/[spillerId]` → spillerens egen TN-test → `/admin/spillere/[id]/tester`. Demo-coach må ha både platform-rolle COACH og gruppemedlemskap COACH. 62/62 målrettede tester med simulerte auth-/datakilder bestod. Konto-/databaseoppsett og faktisk innlogget nettleserprøve gjenstår. Tildeling av tester er ikke en egen testdagfunksjon; ikke bruk den betegnelsen som om funksjonene er identiske.

### Eksakte ruter fra den uavhengige kartleggingen

### Oppfølging omkring kl. 11.00

Den eksisterende Claude Code-økten var ferdig med første rapport; konkret videreoppdrag er nå levert og synlig startet. Docker-lesekontroll bekreftet at isolert HQ-P0 Auth/Postgres allerede kjører på 54421/54422. WANG-stacken på 54321/54322 skal ikke røres. Claude Code skal prøve ekte lokal coach-/spillerinnlogging, testtildeling, gjennomføring og resultatgjenåpning med egne syntetiske fixture-rader, uten hosted data eller nye schema-/tilgangsregler. Rapportens kodeleste påstander skal tones ned til faktisk bevisnivå; testtildeling er ikke en egen testdagfunksjon. Neste rapport senest 11.30. Produksjonskonto og Vercel-demo er fortsatt uverifisert; publiseringsgodkjenning venter.

### Ruteliste

Oppfølging ca. 11.20: fire filer for lokal TN-prøve er opprettet, men ingen bestått nettleserreise er dokumentert. Koordinator fant svakheter i testbeviset (forhåndstildeling via seed, upresis resultatkontroll og avvisning som kunne hoppes over). Rettelser er overlevert. Claude-prosessen stod fast på en ventende flytting av `.env.local` og svarte ikke på vanlig avbrudd; prosessen ble avsluttet og samme lagrede økt gjenopptatt. Ny terminal er 90585, lokal økt-ID `2b71bf9d-3272-4a70-aa62-26162a3e42aa`; Remote Control-adressen er uendret og bekreftet aktiv. Testkjøring skal gjøres i separat arbeidskopi uten miljøfiler, uten å flytte eller lese eksisterende miljøfiler. Den avbrutte kommandoen er ikke godkjent.

| Formål | Rute | Begrensning |
|---|---|---|
| Innlogging / oversikt | `/auth/login` → `/team-norway` | Krever aktivt TN-gruppemedlemskap |
| Spillere | `/team-norway/spillere` | Bruk merkede syntetiske medlemmer |
| Spillerpost | `/team-norway/spiller/[spillerId]` | Tidslinje/post, ikke full testprofil |
| Fellestesting | `/team-norway/fellestesting` | Opprett testdag ikke påvist i dagens kode |
| Protokoll | `/team-norway/protokoller/putt-1-3m` | Eksisterende putteprotokoll |
| Egen testføring | `/portal/tren/tester/team-norway?test=putt-1-3m` | Lagrer på den innloggede spilleren |
| Eksisterende testhistorikk | `/admin/spillere/[id]/tester` | Krever aktuell coach-/spillertilgang |
| Helhetsvisning | `/team-norway/manedsplan`, `/team-norway/samlinger`, `/team-norway/college`, `/team-norway/uttak`, `/team-norway/rangliste`, `/team-norway/turneringer` | Innhold/handlinger må prøves per rute |
