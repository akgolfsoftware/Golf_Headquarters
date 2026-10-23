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
| C2 | Google-krysset rettet; felles læring stengt i de berørte malfunksjonene | Versjonert serverregister for avtaleaksept og frivillig læring; foresatt/skoleflyt; tilbakekalling gjennom kø/minne/uttrekk; korrekte avtaler og juridisk sluttkontroll |
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
