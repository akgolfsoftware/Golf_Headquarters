# Grillingen runde 9 — WANG Toppidrett og Team Norway (28.09.2026)

Mål: hvordan WANG, Team Norway og PlayerHQ henger sammen på testbatteri og IUP, og hvordan
spilleren deler tilgang slik at WANG og Team Norway ser spilleren komplett, som AgencyOS gjør.
Ingen kode i denne runden. Metode som [runde 8](https://github.com/akgolfsoftware/Golf_Headquarters/pull/988).

Kilder fra Anders 28.09 (lokalt, ikke i repoet — inneholder kontaktinfo):
`~/ak-brain/claude-code/prompter/vedlegg/team-norway-iup-2025.xlsx` (IUP-malen WANG og Team
Norway har avtalt å bruke) og `wang-golf-6-ars-lop.xlsx` (WANGs 6-årsløp: 8. klasse–VG3,
treningsmengde, turneringsrunder, leiruker, kompetansemål, testbatteri).

## Status

| # | Område | Grillet | Bekreftet av Anders | Bestilling sendt |
|---|---|---|---|---|
| 1 | IUP — felles modell fra PlayerHQ | ja | ja, 28.09 | 28.09 |
| 2 | Testbatteri | ja | ja, 28.09 | 28.09 |
| 3 | Deling og tilgang | ja | ja, 28.09 | 28.09 |
| 4 | WANG: trener og sportssjef | ja | ja, 28.09 | 28.09 |
| 5 | Team Norway: coach | ja | ja, 28.09 | 28.09 |
| 6 | Spillerens side i PlayerHQ | ja | ja, 28.09 | 28.09 |

## Kartlegging (målt 28.09)

**Kode**
- Ett felles testlager for AK, WANG og Team Norway (`TestDefinition`/`TestResult`/`TestSession`,
  `prisma/schema.prisma`), seedet med 20 tester (`prisma/seed-data/ngf-test-battery.json`).
  TN v3-katalogen i `src/lib/portal-tester/tn-catalog.ts` lagrer i samme tabeller.
- IUP finnes bare i WANG (`/team-wang/coach/iup/[elevId]`), lagret som `GroupPeriodGoal`
  (mål per periode med egen- og trenervurdering). Ingen IUP i PlayerHQ. Mangler resultat- mot
  prosessmål, årsplan per spiller, evaluering og utviklingssjekk.
- Samtykke til deling finnes (`DelingsSamtykke`: TEST_RESULTATER, STATS, KOMPLETT_PROFIL; forelder
  under 16). **WANG- og TN-trenernes tilgang sjekker ikke samtykke** — gruppemedlemskap holder
  (`src/app/team-wang/_data/wang-tilgang.ts`, `tn-arbeidsflate.ts` `hentTnSpillerTilgang`).
- KOMPLETT_PROFIL åpner ingen skjerm i dag.

**Claude Design**
- WANG `6cfa623c`: 45 skjermer, roller Sportssjef og Trener. IUP per elev (WG-02) med tre
  måltyper, målbane, treningsvolum og samtalelogg. Samtykke per organisasjon som lesevisning
  (WANG-34). 11 NGF-tester merket uavklart. Noen skjermer nevner fortsatt roller fjernet 27.09.
- Team Norway `bc3e41fc` («Team Norway App delivery»): 19 skjermer. Ingen IUP. Driver Basic,
  Inspill Basic, Wedge Variation og 8-ball mangler; bare fysiske protokoller og to utkast.
  Deling med PlayerHQ er ikke tegnet.

## 1. IUP

### Anders forteller
WANG og Team Norway har avtale om å bruke samme IUP (Team Norways ark). PlayerHQ skal dekke alle
parameterne. Kategoriene er AK Golf A–K etter snittscore, ikke WANGs E–A+. Pyramidenavnene er
AK sine. Testbatteriene er de samme.

### Spørsmål og svar
- 9.1/9.7/9.8 Egen IUP-side i PlayerHQ? Anders: «Hvorfor trenger vi en egen IUP-fane? Treffer vi
  ikke alle punktene allerede i PlayerHQ?» → Ingen fane for spilleren; samlevisning bare for
  trenerne (9.8 a).
- 9.2 Eier: spilleren. «AK Golf står fritt til å fortsette å analysere og bruke data» uten navn.
- 9.3 IUP-året starter uke 43 (ny grunnperiode). Evaluering hver fjerde uke.
- 9.4 Utviklingssjekkens spørsmål brukes også i AK Golf.
- 9.5 Kompetansemål bare på WANG-skjermene, ikke AK Golf og ikke Team Norway.
- 9.6 a Kort sjekk hver fjerde uke (prosessmål og så videre), full sesongevaluering årlig.

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
- **Én IUP** for AK Golf, WANG og Team Norway, med Team Norways IUP-ark som mal.
- **Spilleren eier IUP-en.** AK Golf kan analysere og bruke dataene anonymisert; det står i
  vilkårene.
- **Ingen egen IUP-fane i PlayerHQ.** Delene finnes i Plan, Stats, Målsetninger og Meg.
- **Nytt i PlayerHQ:** kort sjekk hver fjerde uke i I dag og innboksen (prosessmål,
  målsetninger, utviklingssjekk). Sesongevaluering uka før uke 43.
- **Utviklingssjekken** bruker arkets spørsmål (Ung, Junior, Amatør, Profesjonell) for alle
  spillere i AK Golf.
- **Samlet IUP for trenerne:** fanen «IUP» i Spiller 360, WANG og Team Norway, i samme rekkefølge
  som arket. Alt hentes fra PlayerHQ, ingenting føres to ganger.
- **Kategorier** AK Golf A–K etter snittscore. **Pyramiden** FYS, TEK, SLAG, SPILL, TURN.
  **Testbatteriet** er det samme for alle tre.
- **Kompetansemål fra Udir** bare på WANG-skjermene, brutt ned på pyramiden.

## 2. Testbatteri

### Dette fantes 28.09
Ett lager i koden med 20 tester. WANG-tegningen: to låste protokoller, testdag, testkø
(«Kontrollert»), 11 NGF-tester uavklart. Team Norway-tegningen: bare fysiske protokoller
(3000 m, knebøy, CMJ, medisinball, hastighet) og referansenivåer per klasse.

### Spørsmål og svar
- 9.9 a Både spiller og trener kan føre.
- 9.10 a De uavklarte NGF-testene ligger i batteriet, som i 6-årsløpet.
- 9.11 a AK-kategori som standard, TN-klasse i tillegg for TN-spillere.
- 9.12 Fysiske tester etter 6-årsløpet.
- 9.13 «I grunnperioden testes det hver sjette uke på fysisk, og litt variabelt på de andre testene.»

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
- **Ett testbatteri** for AK Golf, WANG og Team Norway, lagret på spilleren.
- **Spiller og trener kan føre.** Trenerført merkes «Kontrollert», spillerført «Egenført».
- **Alle NGF-testene fra 6-årsløpet** er med, også de 11 som var uavklart (gate-testene, VISA
  Express, Putt Speed, 9 hull lengde, Teknikktest A, B og C).
- **Nivå:** AK-kategori A–K som standard; TN-spillere ser i tillegg landslagsnivået for klassen
  (Gutter U18, Jenter U18, Damer, Herrer).
- **Fysiske tester etter 6-årsløpet:** benkpress, markløft trapbar, lengdehopp, rotasjonskast,
  clubspeed. TN-tegningens 3000 m, knebøy, CMJ og medisinball utgår.
- **Rytme:** fysisk hver sjette uke i grunnperioden; andre tester legger treneren i årsplanen
  etter behov; andre perioder setter treneren selv.

## 3. Deling og tilgang

### Dette fantes 28.09
`DelingsSamtykke` i PlayerHQ (tester, stats, hele profilen; forelder under 16; kan trekkes).
WANG- og TN-trenerne slipper inn på gruppemedlemskap uten samtykkesjekk. «Hele profilen» åpner
ingen skjerm. WANG-34 viser at TN bare ser tester og runder.

### Spørsmål og svar
- 9.14 b Absolutt alt, også helse og meldinger. Claude anbefalte at samtykkesiden sier det rett
  ut; ikke motsagt, bekreftet i sammendraget.
- 9.15 Ja, men: «Wang og Team Norway kan gi forslag til endring i IUP-en, treningsplaner,
  vurderinger og samtaler. Men spiller bestemmer til syvende og sist.»
- 9.16 WANG og TN kan sende forespørsel om å opprette PlayerHQ. Har spilleren PlayerHQ, sendes
  lenke til e-post på wang.no eller golfforbundet.no.
- 9.17 «Når spiller trekker tilgangen, så forsvinner coach med en gang.»
- 9.18 b, avklart med 9.19 (tolket som a, bekreftet i sammendraget): WANG/TN foreslår, AK-coach
  endrer direkte.
- 9.20 «Spiller står ansvarlig for å gjøre sin individuelle IUP og dele deretter med Wang og
  Team Norway coach.»
- 9.21 «Spilleren må betale for PlayerHQ.»

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
- **Spilleren har ansvaret for IUP-en** og deler den selv med WANG- og TN-coachen.
- **Deling:** uten PlayerHQ kan WANG/TN invitere til å opprette konto. Med PlayerHQ sender
  spilleren delingslenke til trenerens e-post; lenken virker bare for @wang.no og
  @golfforbundet.no. Under 16 år godkjenner forelderen.
- **Spilleren betaler PlayerHQ selv**, vanlig pris.
- **Innsyn:** absolutt alt, også helse og meldinger. Samtykkesiden sier det rett ut.
- **Endringer:** WANG og TN fører tester og sender forslag til plan, IUP, vurderinger og
  samtaler; spilleren godtar eller avviser. AK-coachen endrer direkte; spilleren kan angre.
- **Trekkes tilgangen, forsvinner coachen med en gang.** Det som er ført blir hos spilleren.
- **Kodeoppgave (egen, ikke i denne runden):** WANG- og TN-tilgang må kreve samtykke
  (`wang-tilgang.ts`, `tn-arbeidsflate.ts` `hentTnSpillerTilgang`); i dag holder
  gruppemedlemskap.

## 4. WANG: trener og sportssjef

### Dette fantes 28.09
45 skjermer i `6cfa623c`: meny I dag · Trening · Tester · Konkurranse · Meldinger · Elever +
Administrasjon. IUP med halvårsevaluering, kategori E–A+, egne fysiske protokoller.

### Anders forteller
«Hovedsakelig ha kontroll på spilleren, kunne følge opp spilleren på trening, samtaler og
turneringer.»

### Spørsmål og svar
9.22–9.26: Anders svarte «De navnet var længere på alle», tolket som «den anbefalte på alle»
(a på alle fem), bekreftet i sammendraget.

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
- **Hovedoppgave:** kontroll på spilleren — trening, samtaler og turneringer.
- **Øverst:** elever som trenger deg (under 70 % to uker på rad, fireukerssjekk ikke levert,
  forslag som venter svar, turneringer denne uka).
- **Elevprofil** med samme innhold som Spiller 360, i WANG-drakt: Plan · Stats · Tester · IUP ·
  Samtaler · Turneringer. Kompetansemål fra Udir bare her.
- **Samtaler:** spilleren leverer fireukerssjekken; treneren ser svarene og tar samtale ved behov,
  logget med «Avtalt», kan bli forslag til planen.
- **Turneringer:** kommende og siste med brutto, plassering og SG fra AK Golf pipelines. WANG
  melder ikke på og bekrefter ingenting.
- **Administrasjon** for sportssjef som 27.09; samtykkeoversikten følger den nye delingen.
- **Rettes i tegningen:** IUP fra PlayerHQ med forslag i stedet for endring · fireukerssjekk i
  stedet for halvårsevaluering · kategori A–K i stedet for E–A+ · fysiske tester etter
  6-årsløpet · roller fjernet 27.09 ut av WANG-24 og WANG-34.

## 5. Team Norway: coach

### Dette fantes 28.09
19 skjermer i `bc3e41fc` («Team Norway App delivery»): oversikt, spillerprofil, fellestesting,
samlinger, uttak, college, turneringer, live-watch, fagapparat, lisens og økonomi, månedsplan,
spillerutvikling, gruppeposter, dokumenter, protokoller, rangliste, skoler, referansenivåer,
tilgang. Rolle Spiller med ti skjermer. Ingen IUP, ingen golftester, ingen deling med PlayerHQ.

### Spørsmål og svar
- 9.27 ikke besvart direkte; anbefaling (a) lagt inn og bekreftet i sammendraget.
- 9.28 «Spillere skal alltid se det samme som PlayerHQ.» «I designet kun trenerskjermer for WANG
  Toppidrett og Team Norway.»
- 9.29 «Felles testing er fra hele batteriet.»
- 9.30/9.31 b «De skal fortsette å være faktiske skjermer for Team Norway. Vi skal gjøre det så
  komplett som mulig. Team Norway trenger skjermer for å se all testinformasjon til WANG-skolene,
  og elever som har levert tester. De skal kunne se all data fra tester for kartlegging.»
- 9.32 b «Går du på WANG Toppidrett så er det automatisk deling av testresultater med Team Norway.»

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
- **Bare trenerskjermer** i WANG- og TN-designet. Spilleren ser alltid det samme som PlayerHQ;
  TN-tegningens spillervisning utgår.
- **Alle TN-skjermene blir og gjøres så komplette som mulig:** samlinger, uttak, fagapparat,
  college, lisens og økonomi, live-watch, månedsplan, rangliste, skoler, gruppeposter, dokumenter.
- **Øverst:** spillere som trenger deg, deretter neste samling.
- **Spillerprofil** med samme innhold som PlayerHQ og Spiller 360, i TN-drakt: Plan · Stats ·
  Tester · IUP · Samtaler · Turneringer.
- **Fellestesting** fra hele batteriet; landslagsnivå per klasse ved siden av AK-kategori.
- **Ny kartleggingsskjerm:** testdata fra alle WANG-skolene — hvem som har levert og alle
  resultatene — for kartlegging.
- **WANG-elevers testresultater deles automatisk med Team Norway, med navn.** Står i WANGs
  opptaksavtale, forelder signerer under 16. Alt annet deler spilleren selv (område 3).

## 6. Spillerens side i PlayerHQ

### Spørsmål og svar
9.33 a · 9.34 a · 9.35 a (Anders 28.09). Svarene er selve sammendraget.

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
- **Delingssiden under Meg** viser hvem som har tilgang (AK-coach, WANG, Team Norway) og hva de
  ser. Spilleren sender delingslenke, godtar forespørsler og trekker tilgangen med ett trykk.
  WANG-elever ser at testresultatene deles automatisk med Team Norway, og at det ikke kan slås av.
- **Forslag fra WANG og Team Norway** kommer i innboksen bak bjella, merket med avsender
  («WANG · trenerens navn»), med «Godta» og «Avvis».
- **WANG-eleven:** morgenøktene kommer inn i Plan som arvet gruppeplan (runde 8). Eleven
  registrerer oppmøte og gjennomføring i PlayerHQ. Ingen egen WANG-fane.

## Neste
Fase 3 ferdig: [mulighetskart-wang-tn-2026-09-28.md](mulighetskart-wang-tn-2026-09-28.md), godkjent av Anders 28.09. Fase 4: beslutningen står i `.claude/rules/beslutninger.md` §ÉN IUP OG ETT TESTBATTERI; bestillinger sendt 28.09 til WANG runde 20
(`6cfa623c`), Team Norway (`bc3e41fc`) og Precision runde 31 (`7d7c2994`, sendes etter runde 22). Kodeoppgave allerede funnet: WANG- og TN-tilgang krever
ikke samtykke i dag (område 3).

## Fase 4 — leveranser (rapportert av designet, ikke målt av Claude Code)

| Prosjekt | Runde | Resultat |
|---|---|---|
| WANG `6cfa623c` | 20 | Ny `WANG Golf Elevprofil.dc.html`: WANG-43 Elever som trenger deg, WANG-44 Elevprofil, WANG-45 Fireukerssjekk, WANG-46 Forslag, WANG-34 på ny. 56 tilfeller 390/1280, 0 avvik. |
| WANG `6cfa623c` | 20b | A–K fra `src/lib/domain/ak-kategori.ts`, WG-02 og WANG-06 utgår, plan uke 40–43, oppdiktede testpoeng fjernet («—»). |
| Team Norway `bc3e41fc` | 1 | Spillerrollen borte, spillerprofil med IUP, fellestesting, ny Kartlegging, tilgang og samtykke. Ikke målt av designet; måling, A–K og TN-arkets utviklingssjekk bestilt. |
| Precision `7d7c2994` | 31 | PH-27 Deling, FO-05, AG-08-IUP, fireukerssjekk. 420 tilfeller, 0 avvik. Utviklingssjekken rettet til TN-arkets ordlyd i runde 23. |

Venter på Anders: delingslenkens varighet (designet antok 7 dager) · hvilken ranking i IUP ·
poengskala for de ni NGF-testene og 8-ball · om 41 spørsmål hver fjerde uke er for mye.

