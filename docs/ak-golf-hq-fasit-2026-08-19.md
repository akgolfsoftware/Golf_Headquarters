# AK Golf HQ — fasit

**Sist fylt ut:** 19.08.2026. Dette er ordforrådet AK Golf HQ og Masterbrain bruker. Ingenting under er en regel eller et krav — spilleren og coachen planlegger fritt (bestemt 18.08.2026). Dette dokumentet er kun for å si «hva betyr X» og «hvor brukes X», likt på tvers av appen, Masterbrain og ak-second-brain.

**Slik du bruker det:** Rediger og slett fritt. Alt som står i **kursiv med [...]** er ting jeg ikke fant en sikker kilde for, eller steder hvor kilder er uenige — se selv og bestem, eller slett hvis det ikke er relevant.

---

## Spillerkategorier

A–L, 12 nivåer. **A er best (elite), L er nybegynner.** Målt på snittscore (gjennomsnittlig brutto score, ikke netto).

| Kategori | Snittscore |
|---|---|
| A | under 68 |
| B | 68–72 |
| C | 72–74 |
| D | 74–76 |
| E | 76–78 |
| F | 78–80 |
| G | 80–85 |
| H | 85–90 |
| I | 90–95 |
| J | 95–100 |
| K | 100+ |
| L | *[MANGLER — ingen kilde har et eget tallområde for L. Alt materiale jeg har funnet stopper på K=100+. Kan være at L er en ren NGF-import-verdi uten egen AK-terskel, eller at K og L bør slås sammen — avklar.]* |

*[MERK — kildene er ikke samstemte om A–L (12) er riktig skala i praksis: produksjonskoden i `src/lib/domain/spiller-kategori.ts` bruker i dag A–K (11 nivåer) og behandler L som en død NGF-verdi som alltid mappes til K. Enten må koden oppdateres til å faktisk bruke L som eget nivå, eller så er 12-tallet her for optimistisk og A–K (11) er riktig fasit. Du bestemmer — koden gjør foreløpig det andre.]*

Kategorien beskriver kun hvor spilleren er. Den bestemmer ingenting om hva spilleren får lov til å trene.

---

## Pyramiden

De fem treningsområdene, nedenfra og opp — rekkefølgen er visningsrekkefølge, ikke et viktighets-hierarki:

| Kode | Navn | Hva det dekker |
|---|---|---|
| FYS | Fysisk | Styrke, mobilitet, hurtighet |
| TEK | Teknisk | Svingarbeid, posisjoner, bevegelse |
| SLAG | Slag | Slagkvalitet med kølle og ball |
| SPILL | Spill | Banespill, strategi, scoring |
| TURN | Turnering | Konkurranse og turneringsforberedelse |

---

## Treningsområder

Hvor på banen/anlegget:

TEE · INNSPILL_50 · INNSPILL_100 · INNSPILL_150 · INNSPILL_200 · CHIP · PITCH · LOB · BUNKER · PUTT_0_3 · PUTT_3_5 · PUTT_5_10 · PUTT_10_40 · PUTT_40_PLUSS · STYRKE · MOBILITET · BANE

Putteavstander alltid i fot, resten i meter.

*[MERK — produksjonskoden (`src/lib/taxonomy.ts`) har fortsatt den gamle, mer finkornede listen med 17 områder (bl.a. egen `INNSPILL_0_50`, og putt delt i syv bånd `PUTT_0_3` … `PUTT_40` i stedet for denne listens fem bånd). Denne fasiten er den forenklede, nyere versjonen — koden er ikke oppdatert til å matche ennå. Avgjør om koden skal endres til å matche denne lista.]*

---

## AK-formelen

Merkelappen på en økt — beskriver hva økten er, ikke et krav til hva den må være:

```
PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS
```

Eksempel: `TEK_CHIP_LAV_HAST_TRENINGSOMRÅDE_ALENE`

### Motorikk (læringssteg)
- UTEN_BALL
- LAV_HAST
- AUTO

### Belastning (miljø)
- INNENDØRS
- TRENINGSOMRÅDE
- BANE
- KONKURRANSE

### Press (hvem som ser på)
- ALENE
- OBSERVERT
- KONKURRANSE
- TURNERING

**Utgått, skal ikke brukes:** L-fasene (KROPP/ARM/KØLLE/BALL/AUTO — det gamle femtrinns systemet), CS-nivåer (klubbhastighet CS20–CS100), M0–M5 (gammel miljø-skala, ikke det samme som BELASTNING over selv om den ligner), PR1–PR5 (gammel presskala, ikke det samme som PRESS over selv om den ligner).

---

## Periodisering

Merkelapper på kalenderen — de begrenser ikke hva som kan planlegges i dem:

| Kode | Typisk innhold (veiledende, ikke krav) |
|---|---|
| GRUNN | Fundament, fysisk og teknisk byggearbeid |
| SPESIALISERING | Slag og spissing mot sesong |
| TURNERING | Konkurranse og vedlikehold |
| EVALUERING | Testing, analyse, planlegging av neste år |
| TESTUKE | Samlet testgjennomføring |
| FERIE | Fri |
| TRENINGSSAMLING | Samling (dagsformat) |
| HELDAGSSAMLING | Samling (heldagsformat) |

4-ukers rytme (valgfritt mønster, ikke regel): BYGG → BYGG → TOPP → DELOAD.

---

## Turneringer

**Status på påmelding:**
- Planlagt
- Påmeldt
- Bekreftet
- Trukket
- Gjennomført
- Ikke fullført

**Forberedelsesvariant:** konservativ · standard · aggressiv

**Kilder til turneringsdata:** NGF · GolfBox-scraper (Olyo, Østlandstour, GJGT). Data hentes alltid fra disse kildene — estimeres aldri.

---

## Blokk-typer i kalenderen

| Type | Merknad |
|---|---|
| Økt | Treningsøkt |
| Skole | Vises dimmet og låst |
| Booking | Coachtime/fasilitet, hentes fra booking-systemet |
| Turnering | Turneringsdeltakelse |
| Reise | Reisetid |
| Test | Testgjennomføring |
| Sjekkpunkt | Avtale/merkedag |
| Helse | Helse/restitusjon |
| Gruppeøkt | Fellesøkt, coach eier |

---

## Grupper og programmer

**Programmer:** WANG Toppidrett · WANG Ung · GFGK Mini · GFGK Bredde · GFGK Jenter · GFGK Elite · AK Academy · AK Academy Junior · Platform only

**AK-stigen (junior), 4 trinn etter alder:**

| Trinn | Alder |
|---|---|
| Mini | under 10 |
| Basis | 10–12 |
| Utvikling | 13–15 |
| Elite | 16–19 |

**Voksen-modellen (Veien til lavere score), 5 nivåer etter slagsnitt:**

| Nivå | Slagsnitt |
|---|---|
| Nybegynner | korthullsbane / ikke etablert score |
| D | 120–110 |
| C | 100–90 |
| B | 90–80 |
| A | 80–70 |

*[MERK — dette er en egen 5-delt inndeling for voksne basert på slagsnitt, atskilt fra spillerkategori-skalaen A–L øverst i dokumentet (som er snittscore-basert, ikke slagsnitt-basert, og har 11–12 nivåer). Samme bokstaver (A, B, C, D) brukes i begge skalaer med ulikt innhold — verdt å vurdere om det skaper forvirring.]*

---

## Tester

31 testprotokoller i databasen. Spilleren ser 21 CANON-rader + egne tester. Tester planlegges som blokker i Workbench — frivillige verktøy for å måle utvikling, aldri et krav for å trene noe.

*[MANGLER — ikke funnet en liste over nøyaktig hvilke 21 av de 31 spilleren ser, eller hvilke 10 som er skjult og hvorfor. De to historiske testsystemene som trolig ligger til grunn: IUP sine 20 testprotokoller (7 dimensjoner: Speed, Distance, Accuracy, Physical, Putting, Scoring, Mental) og NGFs Team Norway-tester (Driver/Wedge/Putt/Nærspill Gate-tester, VISA Express, 8-balls). Ikke dokumentert hvordan disse ble til 31.]*

---

## P-posisjoner

MORAD-systemet — beskrivende teknisk språk brukt i teknisk plan og videoanalyse, ikke krav til spilleren:

P1.0 Address → P2.0 Skaft parallelt tilbake → P3.0 Venstre arm parallell tilbake → P4.0 Topp → P5.0 Venstre arm parallell ned → P6.0 Skaft parallelt ned → P7.0 Impact → P8.0 Skaft parallelt gjennom → P9.0 Høyre arm parallell gjennom → P10.0 Finish

**Noen faste kjennetegn ved posisjonene (fagkunnskap, ikke krav):** Venstre albue holder rett gjennom hele svingen frem til P8. Håndleddsrelease skjer via sentrifugalkraft, ikke bevisst innsats. Hoftene leder nedsvingen fra P6 til P8. Venstre hæl i bakken gjennom alle posisjoner.

---

## LIFE-koder

Den menneskelige/mentale siden av treningen:

| Kode | Betyr | Eksempel |
|---|---|---|
| LIFE-SELV | Selvfølelse, identitet | Tør å spille uten å sammenligne med andre |
| LIFE-SOS | Sosial samhandling | Hjelpe yngre, gi gode tilbakemeldinger |
| LIFE-EMO | Emosjonell mestring | Holde fokus etter dårlig slag |
| LIFE-KAR | Karakterutvikling | Respekt for regler, etikette, motstandere |
| LIFE-RES | Resiliens | Komme tilbake etter dårlig runde |

---

## Hvordan PlayerHQ og AgencyHQ faktisk bygger opp en plan

Dette er ikke vokabular, men strukturen i databasen — hvordan en treningsplan, en økt, en drill og en test faktisk henger sammen i appen. Tatt med fordi du ba om det som er "basert på hvordan PlayerHQ og AgencyHQ planlegger og strukturerer".

### Plan → økt → drill (spillerens treningsplan)

```
TrainingPlan (én spillers plan, DRAFT → PENDING_PLAYER → ACCEPTED → ACTIVE → ARCHIVED)
  └─ TrainingPlanSession (én økt: dato, varighet, pyramideområde, sted, mål)
       └─ SessionDrill (én drill i økta: reps/sett, CS-mål, P-posisjoner, notater)
            └─ ExerciseDefinition (selve drill-oppskriften i katalogen)
```

En plan kan være **AI-generert** (`aiGenerated=true`, med prompt/modell/kilde lagret) eller laget av coach. Spilleren må godkjenne (ACCEPTED) før den blir aktiv — avviser spilleren, lagres kommentaren (`playerComment`) og planen går til REJECTED.

### PlanTemplate → PlanTemplateSession (AgencyHQ: coachens gjenbrukbare maler)

Dette er malverktøyet coach bruker i AgencyHQ til å bygge en flerukers plan én gang og rulle den ut til en gruppe: en `PlanTemplate` («A1 Konkurranse-fase Standard») har en disiplin-fordeling (FYS/TEK/SLAG/SPILL/TURN i prosent) og består av `PlanTemplateSession`-rader — én per uke/dag i malen, hver med anbefalte driller. Maler kan godkjennes av en coach (`approved`) og har en effektivitetsscore (`effectivenessAvg`) fra faktisk bruk.

### ExerciseDefinition (drill-katalogen)

Hver drill har: pyramideområde, ferdighetsområde, nivå-spenn (kategori og/eller HCP), miljø (kan gjøres flere steder), utstyr, intensitet (1-10), forkunnskaper (`prerequisites`), tags, og en **øvingsmetode** (`treningstype`): BLOKK (isolert repetisjon) · VARIABEL (varierende betingelser) · KONKURRANSE (press mot et krav) · SPILL_TEST (spill-simulering/benchmark). Volum kan telles fire ulike måter (`RepType`): svinger uten ball, baller slått, tid, eller sett×reps.

### Tester (PlayerHQ)

```
TestDefinition (selve testen — protokoll, scoringsregel, CANON eller egendefinert)
  ├─ TestSession (spillerens gjennomføring, steg for steg, live scoring)
  ├─ TestResult (ferdig resultat)
  └─ TestAssignment (coach tildeler test til spiller, med frist)
```

Spillere kan også lage egne tester (`isCustom=true`) og dele dem privat, med coach, gruppe eller hele akademiet (`TestVisibility`). CANON-testene (`erCanon=true`) er de 20-21 offisielle protokollene — kun disse + spillerens egne vises til spilleren; coach ser alle.

### Banespill

`CourseDefinition` (bane, par, rating/slope) kobles til `Round` (spilte runder) og `Tournament`. Kan også kobles til `Bane`-modellen med faktisk hullkart (baneguide) for mer presis stedfesting av slag.

### Signal → PlanAction (agent-pipelinen bak «AI foreslår»)

```
Signal (målt fakta: SG_TOTAL, SG_AREA, HCP_TREND, CLUB_AVG, PYRAMID_AREA, STREAK …)
  → en navngitt agent (agentName) leser signalene
  → PlanAction (forslag: PYRAMID_ADJUST · SESSION_ADD/REMOVE · INTENSITY_ADJUST ·
    TAPER_ENGAGE · WITHDRAW · DRILL_SUGGEST · TEST_SCHEDULE · PEER_COMPARE · RECOVERY_ADD)
  → coach/spiller godkjenner eller avviser (status PENDING → ACCEPTED/REJECTED)
```

Hvert forslag har sporbarhet (`provenance` — hvilke rader/regler/terskler som utløste det) og logges uansett utfall (`AgentRun`). Siden 18.08 er dette **kun forslag**, ikke håndhevede regler — coach/spiller kan avvise fritt uten å måtte "overstyre med begrunnelse" (den mekanismen er fjernet, se lista over).

### *[MERK — databasen har ikke fulgt med på 18.08-oppryddingen]*

Selve databasen (`prisma/schema.prisma`) har fortsatt levende felt for de gamle, avskaffede systemene, side om side med de nye:
- `TrainingPlanSession` og `SessionDrill` har fortsatt egne kolonner for `lFase` (L_KROPP…L_AUTO), `miljo` (M0-M5) og `csNivaa`/`csTarget` (CS50-CS100) — de gamle skalaene som ifølge vokabularet ikke lenger skal brukes.
- Forvirrende navnelikhet: enumet som faktisk styrer **periodene** i kalenderen (GRUNN/SPESIAL/TURNERING/TESTUKE/FERIE/TRENINGSSAMLING/HELDAGSSAMLING) heter i koden `LPhase` — nesten identisk navn som det avskaffede `LFase`-enumet (L_KROPP…L_AUTO), som er noe helt annet. Lett å forveksle.
- `SessionDrill` har også egne felt for den ENDA eldre "L-trapp"-modellen (`planRepsUtenBall`, `planRepsLavFart`, `planRepsAuto`) som deler navn med den NYE motorikk-dimensjonen (UTEN_BALL/LAV_HAST/AUTO) i AK-formelen — sannsynligvis samme idé, ikke bekreftet om det er samme felt eller to parallelle.

Ingen av disse feltene er nødvendigvis brukt lenger — men de er ikke fjernet fra databasen, så gammel data eller gammel kode kan fortsatt skrive til dem. Verdt en opprydding hvis du vil at databasen skal matche vokabularet fullt ut.

### ak-golf-intelligence — ikke funnet som egen kilde

Du ba om at ak-golf-intelligence også ble tatt med. Den finnes ikke lenger som egen mappe på maskinen — ifølge en gammel statusfil ble prosjektet omdøpt og MasterBrain-kunnskapsbasen flyttet inn i `masterbrain/`-repoet i juni 2026. Det jeg finner om "ak-golf-intelligence" er kun gamle sesjonsreferanser i `~/.claude/projects/`, ikke kildekode jeg kan lese. Hvis det fortsatt finnes et sted (annen disk, GitHub uten lokal klone), si fra om hvor, så henter jeg derfra.

---

*Referansekunnskap som ikke er en del av dette vokabularet — gammel CANON-metodikk, komplett ordbok med fagbegreper, MORAD-feilkatalog og drill-oversikt — ligger samlet i `~/Developer/masterbrain/KLADD-metodikk-samlet-til-gjennomgang.md`. Si fra om noe derfra skal flettes inn her også.*
