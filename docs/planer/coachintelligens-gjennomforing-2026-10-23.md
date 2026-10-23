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
| C1 | Eksisterende kanoniske slugs kontrollert; målgrupper definert | Verifisere faktiske identiteter for Aspirant/College og Mini-endringen; uttrykkelig AK-deling i alle eksisterende lesere; beholde Basis/Junior Academy-historikk |
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
