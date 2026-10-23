# Coachintelligens — gjennomføring 23.10.2026

Bestilling: Anders har godkjent automatisk gjennomføring av C0–C7 fra JARVIS-planen. Målet er bedre individuell coaching og oppfølging i PlayerHQ/AgencyOS. Arbeidsgren: `codex/coachintelligens-grunnlag`, utgangspunkt `e589c26f8`.

## Faktisk leveranse i denne endringen

- Intern dekningskontroll med `scripts/coach-datadekning.ts`. Verifiserer databasemål, bruker skrivebeskyttet transaksjon og lagrer bare tellinger i intervaller og kjente organisatoriske slugs. Ingen navn, frie gruppenavn, kontaktdata eller rå profilrader. Rapporten lagres utenfor Git. Intervallene er ikke et anonymiseringsbevis; rapporten er intern.
- Nytt kvalitetsgrunnlag i `src/lib/ai-plan/analyse-grunnlag.ts`: hele 18-hullsrunder, eksplisitt beregnet SG, kjent referanse, motorversjon og rundetype. Før/etter sammenlignes innen samme grunnlag, med minst fem målinger per SG-felt. Fem er en minstegrense for denne beskrivende funksjonen, ikke statistisk signifikans.
- Planevaluering bruker Workbench og eksisterende `summerTreningsvolum`. Manglende faktisk tid, start-HCP og startkategori forblir ukjent. Planperioder uten sluttdato eller med framtidig sluttdato gis ikke et etterresultat. Avsluttet datoperiode er ikke bevis på at alle økter er gjennomført. Nye evalueringer har metodeversjon. Eldre evalueringer bevares og brukes ikke automatisk som om de var beregnet etter de nye reglene. Lås på planraden hindrer dobbeltoppretting fra denne skriveren.
- Gruppeanalysens grunnlag og AI-plankontekst får den samme separate oppsummeringen av faktisk Workbench-tid og datadekning. Eksisterende etterlevelsesmål er fortsatt minuttvektet ferdigmelding av planen, ikke faktisk registrert tid. Ny datadekning er foreløpig et datafelt; det er ikke levert en ny ferdig skjerm.
- Observasjoner fra test- og planevaluering går som `COACH_REVIEW` i eksisterende kø. Godkjenning kvitterer for faglig vurdering og endrer ingen treningsøkter; forhåndsvisningen sier dette eksplisitt.
- Testagenten sammenligner protokoll, retning og metodebevis. Team Norway-resultater gjenberegnes gjennom eksisterende protokollmotor. Vanlige testresultater må passe nåværende protokoll og lagret score. Ukjent protokoll og færre enn tre tidligere sammenlignbare målinger gir ingen automatisk tolkning. Nedgang gir ikke automatisk mer TEK-trening.
- Rundeagenten fyller ikke manglende SG med null. Ukjent treningsfordeling blir ikke «undertrent». Korrelasjon bruker faktisk SG-endring fra uke N til N+1, korrekt ISO-årsskifte og tydelig begrensning til SG-merkede logger.
- Felles malstatistikk oppdateres ikke automatisk fra individuell planevaluering. Hver spiller vekter likt i den rene aggregeringsfunksjonen; ingen vilkårlig terskel kalles signifikans. Databaseoppslag på tvers med bare template-ID er stengt. Gammel `effectivenessAvg` brukes ikke til malrangering.
- Bare godkjente planmaler velges. AI-instruksjonene bruker de elleve bestilte målgruppene, dagens pyramidebegreper og eksisterende Masterbrain-oppslag. Gamle, faste prosenter/ukesykluser i prompten er fjernet. Dette er ikke en faglig godkjenning av hele Masterbrain eller alle skills.
- Google-registrering sjekker samme vilkårskryss som e-postregistrering. Kommentarene om 16-årsgrensen beskriver nå produktregelen, ikke en generell norsk lovgrense. Dette er klientkontroll, ikke et fullført serverbasert akseptregister eller en juridisk godkjenning.

## Kontrollgrunnlag og begrensninger

Den første driftsrapporten ble kjørt 23.10 mot bekreftet HQ-prosjekt i en `READ ONLY`-transaksjon. Den viser at Workbench har mer treningshistorikk enn den gamle TrainingLog-kilden. Rapporten skiller ikke sikkert ekte brukere fra demo/test. Den beviser ikke at registreringene kan brukes til felles læring, eller at det finnes gode før/etter-forløp. Den henter ikke separate WANG-data.

Korrelasjonen er fortsatt en beskrivende analyse av SG-merkede TrainingLog-rader; den skal ikke presenteres som analyse av all fysisk/teknisk trening. Workbench-grunnlaget løser faktisk volum separat. Nye SG-regler kan gi færre resultater; det er forventet når gammel kilde mangler metodebevis. Regler må ikke svekkes for å fylle en graf.

## Status per pakke

| Pakke | Nåstatus | Resterende ferdigkrav |
|---|---|---|
| C0 | Intern telling kjørt; Workbench/test/SG-kilder avstemt i kode | Dekning per faktisk tillatt kontekst; koblede plan/test/turneringsforløp; skille demo fra ekte uten å eksportere profiler |
| C1 | Målgrupper definert; eksplisitt AK-deling bygget for gruppeanalyse, gruppeliste og gruppedetalj | Verifisere faktiske identiteter for Aspirant/College og Mini-endringen; uttrykkelig AK-deling i alle eksisterende lesere; beholde Basis/Junior Academy-historikk |
| C2 | Google-krysset rettet; felles læring stengt i berørte malfunksjoner; serverregister for egen kontoaksept bygget, ikke aktivert | Godkjent dokumentpakke og tilkoblet brukerreise; separat frivillig læringsvalg; foresatt/skoleflyt; tilbakekalling gjennom kø/minne/uttrekk; korrekte avtaler og juridisk sluttkontroll |
| C3 | Beregninger og agenttolkning rettet i denne diffen | Visning av datadekning i alle berørte flater; samme tilgangsgrense for alle lesere; ekte ende-til-ende-prøve uten utvidet databehandling |
| C4 | Versjonert kontekstregister og promptrettinger, syntetiske prøver | Anders sine begrunnede coachingeksempler; faglig kontroll av Masterbrain/skills; låst prøvebibliotek og målt modellkvalitet |
| C5 | Ikke aktivert | Selvbetjent voksen og én samtykkende AK-gruppe gjennom hele brukerreisen etter C1/C2 |
| C6 | Organisasjonsgrensene er krav i kontekstregisteret | Prøvd mottaker-/feltavgrensning per skole/TN-gruppe; turneringskilder utenfor WAGR og for College |
| C7 | Ikke aktivert | Tillatt utvalg, dokumentert anonymisering og personvernvurdering; tidsriktig evaluering; merverdi mot enkel historisk sammenligning |

## Neste tekniske leveranse

Bygg C1/C2 som én sammenhengende tilgangs- og registreringsreise: utvid eksisterende delingsmodell, ikke en parallell AI-tilgang. Lesere i AgencyOS skal kreve aktivt medlemskap, riktig mottaker, aktuell rolle og gyldig deling også for ADMIN. Kontoaksept, AK-/skole-/TN-deling, helse/lyd og frivillig felles læring har forskjellige formål. Gamle samtykker kan ikke oppgraderes automatisk.

Før en juridisk tekst kan erklæres endelig, må faktisk leverandør-/databehandleroppsett, lagringstider, skolens ansvar, alders-/foresattflyt og tilbakekalling være kontrollert. Den nye læringen kan ikke aktiveres fordi et dokumentutkast eller enhetstest finnes. Dette hindrer ikke videre lokal utvikling og syntetiske prøver.

## Sikkerhetsgjennomgang

1. Nye lesinger er avgrenset til eksisterende spiller-ID i de allerede beskyttede analyseflytene; de nye modulene åpner ingen offentlig API eller ny organisasjonstilgang. Det kjente brede AgencyOS-filteret er ikke rettet her og er derfor et eksplisitt C1-gjenstående punkt.
2. Dekningsskriptet skriver ikke rå persondata eller hemmeligheter. Nye promptopplysninger om faktisk volum er summer uten nye identifikatorer. Eksisterende sky-promptflyter må fortsatt gjennom egen kontroll av anonymisering; pseudonymer er ikke nok.
3. Ingen samtykker er gitt på spilleres vegne. Ingen ny tverrspillerlæring, skoleimport eller modelltrening er startet. Klientkrysset ved Google er ikke serverbevis. Aldersgrense og eksisterende foresattmekanikk er bevart.

## Verifikasjon

Målrettede tester: 27 tester av analysegrunnlag, protokollretning, nullverdier, ISO-årsskifte, spillervekting, skriveflyt og kontekstregister bestod i første samlede kjøring. Egen Google-registreringstest bestod med prosjektets Node 24. Første komplette kildetestkjøring: 5 593 av 5 594 bestod. Registertesten avdekket at en ren hjelpefunksjon lå i agentmappen; funksjonen ble flyttet til testbiblioteket, og alle seks målrettede trend-/registertester bestod etterpå. Full `npm run verify` kjøres på nytt før commit. Endelig kontroll- og CI-status registreres i pull request og sesjonslogg etter faktisk kjøring.


## Neste leveranse: C1 — delingsstyrt gruppeanalyse

- `medAkGruppeanalyse` finner tillatte spillere på serveren. Gruppe-ID kan gis av ruten, spillerliste kan ikke gis av klienten. Aktiv AK-gruppe, trenerrolle, medlemskap, ikke-slettet konto og eget gyldig samtykke kreves også ved ADMIN-lesing.
- Eksisterende delingshistorikk får et smalt formål: `AK_GOLF_GRUPPEANALYSE`. Ingen gamle ja oppgraderes. Spilleren og godkjent foresatt velger i sine eksisterende delingssider. Avslag/feil vises uten å endre lokal status som om lagring lyktes. Tilbaketrekking virker etter utmelding.
- Samtykke og lesing serialiseres med en transaksjonslås per gruppe. Tidspunkt kommer fra databaseklokken etter låsen, ikke fra ventestart eller appserverens klokke. Ingen cache av tillatelsen. Andre medlemskaps-/rolleendringer bruker foreløpig ikke samme lås.
- Bare tillatte spilleres Workbench-økter leses, og utkast/skjulte/mal-/uavklarte økter filtreres. Beregningens periode og eksisterende etterlevelsesdefinisjon bevares. Gruppevisningen forklarer at datagrunnlaget gjelder delende medlemmer.
- Gjeldende delingstekst avgrenser mot helse, meldinger, notater, opptak og felles modellæring. Valget gjelder egne registrerte økter også utenfor gruppetreningen, uttrykkelig beskrevet for spilleren.

### Kontroll og sikkerhetsbevis for C1-delen

1. Server-handlingene henter aktør fra innloggingen. Skrivemodulen sjekker eget eierskap eller godkjent forelderrelasjon, alder og aktivt medlemskap. ADMIN kan ikke gi ja for andre. Gruppeanalysens serverleser har ingen ADMIN-samtykkebypass. Negative tester dekker feil gruppe, tilbakekalling, utenforstående, avsluttet medlemskap og barn.
2. Ingen navn, kontaktdata eller fritekst leses til analyseresultatet. Ingen sky-modell kalles. Testdata er syntetiske. Det er ikke påstått at de beskyttede små gruppesummene er anonyme. Revisjonsspor ligger i eksisterende database; ikke i applikasjonsloggen/Git.
3. Foresattgrensen beholdes som produktregel; barn kan trekke selv. Gjeldende versjon kreves ved nytt ja. Ny historikk følger eksisterende egeneksport. Slette-/oppbevaringsavklaring for samtykkehistorikk er dokumentert i datakartet og gjenstår; det gis ingen ny juridisk sluttestatus.

Første målrettede kjøring: 21 kildetester og 4 komponenttester bestod etter at testmodulene var avgrenset fra Next-klientimporter. SQL-låsen er syntakskontrollert i `BEGIN READ ONLY` mot separat lokal test-Postgres, med rollback og uten lesing av spillerdata. Fullkontroll, nettleserprøve og CI dokumenteres med faktisk resultat i PR/sesjonslogg. Skjermen er ikke visuelt sluttgodkjent av Anders.

### Videre arbeid etter denne delen

Samme tilgangskrav må omfatte resterende profiler og lesere i AgencyOS (`coachedPlayerWhere` med kallere), med tester for privat voksen, AK-gruppe, annen WANG-skole og Team Norway. Bevar eksisterende særskilte skoledelinger; unngå at et analyse-ja feilaktig gir komplett profil. Deretter serverregistrert kontoaksept og frivillig læringsvalg med separat foresatt-/skoleflyt, tilbakekalling gjennom kø/minne og rettighetsprøving. C0–C7 er fortsatt uferdig. Ingen utrulling av felles læring før tillatt datagrunnlag og anonymisering er kontrollert.


Oppfølgende grensekontroll: et gammelt foresattflagg etter 16-årsdagen gir ikke forelder rett til å endre det nye valget, slik at et trekk aldri bekreftes uten effekt. 21 nye målrettede kildetester og 4 komponenttester består. Lokal nettleserprøve av det faktiske kortet med syntetiske server-svar består: gi/trekk, ventetilstand, avslag, unntak og foresatt-ruting. Skjermbilder på 390/1280 px i lyst/mørkt viser ingen horisontal overflyt. Dette er isolert komponentprøving med appens farge-/stilfiler og lokal reservefont, ikke full innlogget brukerreise eller designgodkjenning. Lokal rigg og skjermbilder er ignorert under `_archive/coach-c1-qa-20261023/`.

### Oppfølging av GitHub-kontrollen

Commit `554d4e2d9` bestod lokal fullkontroll (5 615 kildetester og 245 komponenttester) og Vercel-forhåndsvisning, men [GitHub-kjøring 39894052416](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/39894052416) feilet på formatet i samtykkekortets `Avvik`-kommentar. Den lokale kontrollen hadde oversett den nye filen fordi den ennå ikke var lagt til i Git. Dette var en reell forskjell mellom lokal kontroll og CI, ikke en bestått CI-kjøring.

Kommentaren følger nå kontrollens eksisterende format. Fasit-kontrollen inkluderer også nye, ikke-ignorerte filer under `src/` før `git add`, med NUL-separator for filnavn. Kontrollreglene og designautoriteten er uendret. En regresjonstest i et isolert Git-repo gjenskaper feilen og kontrollerer samtidig endrede, staged, ignorerte og uvedkommende filer. Alle 13 målrettede tester og fasit-kontrollen består. Fullkontroll og ny CI registreres først etter faktisk fullføring i PR og sesjonslogg. Denne rettingen endrer verken samtykke, spillerdata eller skjermens oppførsel.


## C2-oppfølging: stans gjenbruk av gammel maleffekt

Kontroll av flere lesere avdekket at den første avgrensningen var ufullstendig: AI-konteksten var rettet, men den vanlige malbyggeren rangerte fortsatt etter gammel `effectivenessAvg` og kunne anbefale utkast. Dette er nå rettet i malbyggeren. Begge anbefalingsoppslag krever godkjent mal, og bruker kategori/fase og deretter brukstall med stabil sortering. Brukstall er popularitet, ikke dokumentert effekt.

Workbench, planhub og maldetalj leser eller sender ikke lenger det gamle effektgjennomsnittet til klienten. Planhub henter heller ikke antall andre spilleres planevalueringer. PlayerHQ-malbyggeren og begge hubvisningene viser ikke gammel effekt, og maldetaljen konverterer ikke lenger SG-endring til en oppdiktet 1–5-karakter. Det eksisterende nøkkeltallet forklarer at effektgrunnlaget ikke er godkjent. En historikklenke som bare videresendte til mallisten er fjernet. Lagrede historiske verdier og individuelle evalueringer bevares.

Fem målrettede kildetester og to komponenttester består, inkludert injiserte gamle verdier som ikke må leses eller vises, tomt utvalg og godkjenningskravet. Isolert nettleserprøve av faktiske komponenter med syntetiske data består på 390/1280 px uten horisontal overflyt; tom liste og avvist arkivering er prøvd. Riggen bruker appens stilfiler og reservefont, ikke full innlogget brukerreise eller visuell sluttgodkjenning. Fullkontroll og ny CI dokumenteres etter faktisk fullføring.

Sikkerhetskontroll: (1) Ingen ny rute eller tilgang gis; eksisterende innloggingsgrenser beholdes og feltene som leses begrenses. (2) Ingen spillerdata eller skymodell inngår i prøvene. (3) Ingen databaseendring, historikksletting eller samtykkeoppgradering; felles læring aktiveres ikke. Dette er en avgrenset C2-retting. Versjonert serveraksept, frivillig læringsvalg og resten av C1/C2 gjenstår som beskrevet over.


## C1-oppfølging: samtidige tilgangsendringer

Den tidligere gruppelåsen samordnet lesing med samtykke, men ikke med eksisterende utmeldings-, rolle- og arkiveringsskrivere. Analyse og nytt ja tar nå i tillegg delte radlåser på gruppen, de aktive medlemskapene og aktuelle kontoer. Foresattvalget låser også de aktuelle forelderrelasjonene. Vanlige UPDATE/DELETE-operasjoner må dermed vente til den beskyttede behandlingen er avsluttet, uten at alle eldre skrivere må få en ny låseprotokoll. En tidlig port avviser utenforstående før medlemsrader hentes/låses; tilgang kontrolleres alltid på nytt etter lås. Bare medlemskap/relasjoner som faktisk ble låst brukes videre. Innmeldinger som kommer senere tas først med i neste oppslag.

Databaseklokken leses etter alle ventende låser. Aktørens aktuelle kontorolle og slettestatus kontrolleres igjen etter låsen. Gruppe, mottaker, medlemsrolle, alder og uttrykkelig deling kontrolleres fortsatt; ADMIN har ikke samtykkebypass. Uttrekking virker etter utmelding og arkivering. Ingen historikk, samtykker eller treningsdata oppgraderes eller slettes.

Fast låserekkefølge i disse funksjonene: analyse → gruppe → medlemskap etter id → kontoer etter id → eventuell foresattrelasjon. Andre eldre skrivere kan ha annen rekkefølge; en eventuell deadlock/tidsavbrudd må feile lukket og gi nytt forsøk, aldri lese uten lås. Eksisterende transaksjonstimeout beholdes. Resultater som allerede er sendt til en nettleser trekkes ikke tilbake automatisk. Kapabilitetsadministrasjon, andre profillesere og øvrige C1/C2-krav er fortsatt egne gjenstående oppgaver.

Prøving: målrettede tester kontrollerer rekkefølge, nye medlemmer utenfor det låste utvalget, endret kontorolle, foreldermyndighet og stopp ved låsefeil. `tests/integration/ak-analyse-laas.test.ts` bruker de faktiske SQL-hjelperne mot separat lokal Postgres på 127.0.0.1:55922/coach_lock_tests. Den krever `COACH_LOCK_TEST_DATABASE_URL` eksplisitt og avviser alle andre mål. Eget tilfeldig testskjema ryddes etterpå; ingen ekte appdata brukes. To forbindelser prøver arkivering, trenerbytte, utmelding, medlemsrolle, kontosletting, alder og foreldrerett. Dette er database-/funksjonstester, ikke en full innlogget brukerreise. Endelig fullkontroll og CI registreres i PR og sesjonsminne etter kjøring.

Sikkerhetsgjennomgang: 1) Ingen ny tillatelse eller lesevei; eksisterende tilgang får beskyttelse mot samtidige endringer. 2) Kun nødvendige interne ID-er låses, ikke navn eller fritekst; prøvene er syntetiske. 3) Foresattmyndighet og alder kontrolleres etter lås, gamle valg endres ikke. Ingen juridisk sluttgodkjenning eller felles læring.

Publiseringsføring 23.10 kl. 07.10: Anders har stoppet nye Vercel-bygg/publiseringer. Kode, lokale tester og GitHub CI fortsetter. Ingen ny Vercel-preview skal startes eller kreves for denne leveransen; eldre grønne previews er ikke bevis for ny HEAD.


## C2: versjonert serverregister for egen kontoaksept — ikke aktivert

Ny `KontoAvtaleAksept` bevarer aktørens egen konto-ID, dokumentpakkens versjon, kontrollsum, full dokumenttekst og bekreftelsesordlyd samt databasetidspunkt. Vilkårsgodkjenning og bekreftelse på lest personvernerklæring er eksplisitte, separate sannhetsverdier. Registeret gir ingen deling, foresattgodkjenning eller tillatelse til felles læring. `User.preferences` og gamle avkrysninger brukes ikke som bevis og migreres ikke.

Server-handlingen henter egen identitet fra innloggingen. Lagringen kontrollerer fersk PLAYER-rolle, ikke-slettet konto, fødselsdato og eksisterende foresattkrav etter radlås. Ukjent alder, barn og kontoer med foresattkrav kan ikke bruke denne egenflyten. Dette viderefører produktets grense og er ikke en juridisk konklusjon om avtaleevne. Foresatt- og skoleflyten er fortsatt uferdig.

Dobbeltklikk og samtidige forsøk gir én rad per konto og pakkeversjon. Første tidspunkt bevares. Endret tekst med samme versjonsnummer avvises; ny versjon lager ny rad. Databasetrigger stanser UPDATE også utenom appkoden. RLS og tilbakekalte klientprivilegier stenger direkte klienttilgang; appens servervakt avgrenser egen eksport. Fysisk kontosletting kaskaderer kvitteringene. Oppbevaring ved myk sletting/anonymisering må fortsatt avklares, se datakartet.

**Aktiveringsstatus:** `hentGjeldendeKontoAvtale()` returnerer `null`. Offentlige vilkår og personvern er fortsatt utkast, med blant annet eldre abonnementstekst. De er ikke kopiert inn som godkjent pakke. Ingen skjerm er koblet til den nye handlingen, og ingen eksisterende konto sperres eller får nye samtykker. Endelig dokumentpakke, visning av nøyaktig samme tekst, eksplisitt bekreftelse, serverkrav ved fullføring og feil-/gjenopptakshåndtering må kobles samlet før aktivering. Samtykke til frivillig læring skal være et annet valg, av som standard, og aldri utledes fra kontoaksept.

Migrasjonen `20261023083000_konto_avtale_aksepter` er kun prøvd mot isolert lokal Postgres. Ingen hosted skjemaendring er gjort. Den additive tabellen må etableres og kontrolleres før en fremtidig apputrulling, fordi egeneksporten nå leser tabellen. Vercel-byggestoppet gjelder fortsatt.

Målrettet prøve: katalogen avviser ugodkjente pakker; klient-ID, egen tekst, gamle flagg, feil versjon og læringsfelt avvises. Aktørkontroll, idempotens, innsyn og feil uten innhold/lekkasje er prøvd med syntetiske data. Faktisk SQL-migrasjon og registerfunksjon er prøvd med ti samtidige forsøk, nye versjoner, omskrivingsforsøk, feil roller/aldre, RLS og fysisk sletting av egne testkontoer. Første SQL-prøve avdekket manglende `UserRole` i det minimale testskjemaet; prøveriggen er rettet, ikke produksjonsreglene. Fullkontroll og CI føres etter faktisk fullføring i PR og sesjonsminnet.

Sikkerhetsgjennomgang: (1) Bare serverens innloggede identitet kan registreres; ADMIN får ingen stedfortredende rett. (2) Ingen IP, nettleser, navn, e-post eller persondata til modell/logg; bare interne konto-ID-er og offentlig dokumentinnhold lagres. (3) Barn/foresatt behandles ikke som voksne; ingen gammel aksept oppgraderes. Egen eksport inkluderer kvitteringene, fysisk sletting er prøvd, annen oppbevaring er eksplisitt uavklart. Dette er teknisk grunnlag, ikke juridisk godkjenning eller ferdig C2.


## C1: aktiv gruppe og riktig mottaker i felles profilfilter

`coachedPlayerWhere`, `coachScopedPlayerWhere` og `coachSkrivbarPlayerWhere` krever nå aktivt PLAYER-medlemskap i en ikke-arkivert AK-administrert gruppe. Aktiv enrollment alene gir ikke lenger profiltilgang. Mottaker må være ansvarlig trener eller aktivt trener-medlem i den samme gruppen som spilleren. Assistent har lesing, ikke skriving. ADMIN er også bundet av gruppekravet. WANG (også Fredrikstad) og Team Norway forblir utenfor denne generelle medlemsveien; eksisterende navngitt deling er en separat lesesti. En annen aktiv gruppe eller gammel enrollment kan ikke kompensere for avsluttet medlemskap hos den aktuelle treneren.

Spillerens eget coachingtilbud klassifiseres fortsatt med den tidligere forretningsregelen, nå navngitt `coachingRelasjonWhere`. Dette er ikke autorisasjon til en annens profil. Booking har en egen formålsavgrenset regel i `booking-spiller-scope.ts`, brukt både for valgliste og opprettelse. Egne enrollment-kunder og eksisterende prøvetimeflyt beholdes; andre treneres kunder blir ikke åpne leads fordi profilregelen strammes inn. Assistentmedlemskap alene gir ikke bookingrett, og slettede kontoer avvises. Ingen ekte booking eller utsending kjøres i prøvene.

**Avgrensning:** Dette fullfører medlems-/mottakerdelen i de felles kandidatfiltrene, ikke C1. Uttrykkelig AK-profildeling for øvrige profilhandlinger, særskilte lesere og fersk kontroll ved hver agentoperasjon gjenstår. Gruppeanalyse-ja gir fortsatt ikke profilinnsyn. Denne endringen legger ikke en samtykkelås rundt alle eldre lesere og tilbakekaller ikke allerede leverte resultater. Batch-agenter som bruker basisfilteret får et snevrere utvalg, men komplett mottaker-/samtykkekontroll per jobb må fortsatt gjennomføres.

Prøving: 45 målrettede enhetstester bestod. `tests/integration/agency-gruppescope.test.ts` kjører faktiske Prisma-filtre mot et tilfeldig, isolert skjema i den lokale testdatabasen. Sju tester består, inkludert ADMIN, feil trener, arkivering, utmelding, medlemsroller, kryssgruppetilgang, selvbetjent spiller, WANG-skoler, Team Norway og lik bookingregel ved liste/opprettelse. Testen fjerner eget skjema; containeren er stoppet igjen. Fullkontroll og GitHub CI dokumenteres først etter faktisk resultat.

Sikkerhetsgjennomgang: (1) Profilutvalget snevres inn, uten ny ADMIN-bypass; bookingrett gir ikke profilrett. (2) Ingen nye personfelter, logger, modellkall eller ekte utsendinger; kun syntetiske tester. (3) Ingen samtykker oppgraderes eller foreldre-/skoleporter endres; felles læring forblir av. Juridisk grunnlag og full delingsdekning er fortsatt uavklart. Ingen hosted databaseendring eller Vercel-publisering i denne leveransen.

Første fullkontroll stoppet på fire eldre Caddie-tester som forutsatte enrollment-tilgang. Testdata er rettet til faktiske aktive AK-grupper; et nytt negativt tilfelle avviser enrollment-only i alle fire profilverktøy også for ADMIN. Kontroll av godkjente handlinger forventer nå gruppeporten. 16 målrettede Caddie-/organisasjonstester består etter dette. Ingen produksjonsregel er svekket for å gjøre testene grønne. Fullkontrollen kjøres på nytt.

Endelig lokal kontroll av denne delen: `npm run verify` bestod med Node 24 og 8 GB minnegrense: 5 645 kildetester + 247 komponenttester (5 892), statiske kontroller og Next.js/Serwist-bygg. Én eksisterende lint-advarsel i uendret `AG14MalFelles.tsx`. De sju SQL-testene kjøres separat. GitHub-kontroll knyttes til faktisk commit i PR og sesjonsminne etter push. Ingen Vercel-bygg eller produksjonsendring.
