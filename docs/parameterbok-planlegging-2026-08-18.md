# Parameterbok — all planlegging i AK Golf HQ

> **HISTORISK (samme dag, 18.08.2026 kveld):** Anders besluttet at ALLE treningsregler låses
> opp og slettes — ingen invarianter, ingen periode-constraints, ingen «canon». Regeltallene i
> dette dokumentet (§4.1, §6 m.fl.) beskriver tilstanden FØR opplåsingen og er ikke lenger i
> kraft. Gjeldende ordforråd: `docs/vokabular-planlegging-2026-08-18.md`.

**Laget:** 18.08.2026. **Kilde:** direkte uttrekk fra koden i `~/Developer/akgolf-hq` samme dag —
alle verdier er ordrett fra `prisma/schema.prisma`, `src/lib/canon/invarianter.ts`,
`src/lib/portal/training/periode-constraints.ts`, `src/lib/plan-engine/standard-fordeling.ts`,
`src/lib/ak-formel-visning.ts`, `src/lib/pyramide.ts` m.fl. Ingenting fra hukommelse.

**Formål:** Dette er den komplette lista over alt som styrer planlegging i plattformen —
hver dimensjon, hver gyldig verdi, hver regel, hvert tall. For spillere, grupper, WANG, GFGK,
turneringer, tester og booking. Les gjennom i Typora, marker det som er feil eller skal endres,
så tar vi oppryddingen punkt for punkt etterpå.

**Revisjonsmerker brukt i dokumentet:**
- ⚠ **REVIDER** — kjent sprik eller uavklart, trenger din beslutning
- Alt uten merke er slik koden faktisk kjører i dag

---

## 1. Pyramiden — de fem treningsområdene

Rekkefølge nedenfra (fra `src/lib/pyramide.ts`, `PYR_REKKEFOLGE`):

| Kode | Fullt navn | Plass |
|---|---|---|
| FYS | Fysisk | 1 (nederst) |
| TEK | Teknisk | 2 |
| SLAG | Slag | 3 |
| SPILL | Spill | 4 |
| TURN | Turnering | 5 (øverst) |

Databasen: `enum PyramidArea { FYS, TEK, SLAG, SPILL, TURN }` (`schema.prisma:70`).
Farger ligger som CSS-klasser (`bg-pyr-fys` osv.) i globals.css, ikke i TypeScript.

---

## 2. Områder (hvor på banen/anlegget)

⚠ **REVIDER — to lister finnes, ulikt detaljnivå:**

**Databasen (`SkillArea`, `schema.prisma:96`) — 5 grove verdier:**

| Verdi | Betydning |
|---|---|
| TEE_TOTAL | Utslag/driver |
| TILNAERMING | Innspill |
| AROUND_GREEN | Nærspill |
| PUTTING | Putting |
| SPILL | Banespill |

**AK-formelens OMRÅDE-liste (kunnskapsfilene + Paper-fasitene) — 16 finkornede verdier:**
TEE · INN50 · INN100 · INN150 · INN200 · CHIP · PITCH · LOB · BUNKER · PUTT0-3 · PUTT3-5 ·
PUTT5-10 · PUTT10-40 · PUTT40+ · STYRKE · MOBILITET · BANE

Paper-HTML-ene bruker mellomvarianter som `INNSPILL_50`, `PUTT_3_5`, `TEE_TOTAL`, `CHIP`.
**Beslutning trengs:** skal databasen utvides til 16-listen, eller er 5-listen nok med
formel-strengen som finkornet tillegg?

---

## 3. AK-formelen (v2)

Format per `beslutninger.md` (Anders 2026-08-05):

```
PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS
```

Eksempel: `TEK_CHIP_LAV_HAST_TRENINGSOMRADE_ALENE`

### 3.1 Motorikk (læringssteg) — 3 verdier

Fra `src/lib/ak-formel-visning.ts` (`FaseSteg`). UI viser 3 steg, databasen lagrer 5 gamle
L-faser — denne fila er broen:

| UI-steg | Norsk | Dekker DB-verdier | Skrives til DB som |
|---|---|---|---|
| UTEN_BALL | Uten ball | L_KROPP, L_ARM | L_ARM |
| LAV_HASTIGHET | Lav hastighet | L_KOLLE, L_BALL | L_BALL |
| AUTO | Automatikk | L_AUTO | L_AUTO |

⚠ **REVIDER — stavemåte:** koden skriver `LAV_HASTIGHET`, Paper-HTML-ene skriver `LAV_HAST`.
Samme steg, to skrivemåter. Én bør velges.

⚠ **REVIDER — gamle L-faser i DB:** `enum LFase { L_KROPP, L_ARM, L_KOLLE, L_BALL, L_AUTO }`
(`schema.prisma:235`) ligger fortsatt som lagringsformat. Broen fungerer, men v1-serien lever
altså videre i databasen. Skal den migreres bort, eller bli liggende som finkornet lagring?

### 3.2 Belastning (miljø) — 4 verdier

Fra Paper-fasitene (`workbench-desktop.html:894`):

| Verdi | Norsk |
|---|---|
| INNENDORS | Innendørs |
| TRENINGSOMRADE | Treningsområde |
| BANE | Bane |
| KONKURRANSE | Konkurranse |

⚠ **REVIDER:** databasen har fortsatt det gamle `MMiljo`-enumet (M0–M5, `schema.prisma:252`).
Ingen bro-fil finnes for belastning slik det gjør for motorikk/press. M0–M5 er merket utgått
i kunnskapsfilene men lever i DB.

### 3.3 Press — 4 nivåer

⚠ **REVIDER — koden og beslutningen spriker:**

| Vedtatt (beslutninger.md 2026-08-05, Paper) | Koden i dag (ak-formel-visning.ts) | Dekker DB (PR-serien) |
|---|---|---|
| ALENE | FRI | PR1 |
| OBSERVERT | KRAV | PR2 |
| KONKURRANSE | UTFORDRING | PR3 |
| TURNERING | KONKURRANSE | PR4, PR5 (skrives PR4) |

Vedtaket fra 05.08 (ALENE/OBSERVERT/KONKURRANSE/TURNERING — «hvem som ser på») er IKKE
implementert i `ak-formel-visning.ts` ennå. Ren omdøping, fire nivåer begge steder.

### 3.4 CS-nivåer — ⚠ UAVKLART (bekreftet 18.08.2026: fjernes fra ny kode)

Databasen har `enum CSNivaa { CS50, CS60, CS70, CS80, CS90, CS100 }` (`schema.prisma:243`) —
merk: **kun CS50–CS100, ikke CS20–40** slik kunnskapsfilene beskriver skalaen. Hele skalaen er
uavklart; besluttet i økt 18.08 at CS ikke brukes i noe nytt inntil videre.

### 3.5 Andre økt-dimensjoner i databasen

`TrainingPlanSession` (`schema.prisma:1132`) bærer per økt: `pyramidArea`, `skillArea?`,
`environment?`, `lPhase?` (periodisering!), `pressureLevel?`, pluss AK-formel-feltene
`lFase (LFase)`, `miljo (MMiljo)`, `csNivaa (CSNivaa)`, `pPosisjoner (String[])`, og
`sourceGroupId` (satt når økten er rullet ut fra en gruppe).

| Enum | Verdier | Merknad |
|---|---|---|
| SessionEnvironment | RANGE, BANE, STUDIO, HJEM, SIMULATOR, GYM | |
| PracticeType | BLOKK, RANDOM, KONKURRANSE, SPILL_TEST | |
| DrillPracticeType | BLOKK, VARIABEL, KONKURRANSE, SPILL_TEST | ⚠ RANDOM vs VARIABEL — to navn for samme? |
| RepType | SVINGER_UTEN_BALL, BALLER_SLATT, TID, SETT_REPS | Låst av Anders |
| RepHastighet | DRY, LAV (CS50–70), FULL (CS80–100) | ⚠ definert via CS-skalaen |
| SessionStatus | PLANNED, ACTIVE, PAUSED, COMPLETED, ABANDONED, SKIPPED, CANCELLED | |
| SessionStatusV2 | PLANNED, IN_PROGRESS, COMPLETED, CANCELLED, SKIPPED | ⚠ to statusenums i drift |
| DrillFasilitet | RADAR, MAT_NET, BUNKER, KAMERA, PUTTING_GREEN_KORT, PUTTING_GREEN_LANG, SHORT_GAME_AREA, DRIVING_RANGE, BANE, SIMULATOR, VEKTSTANG, TRAPBAR, LOPEBANE, MED_BALL | 14 fasiliteter |

---

## 4. Periodisering

⚠ **REVIDER — TO parallelle periodesystemer i samme database:**

**`LPhase`** (`schema.prisma:85`, «8c.1 Anders 2026-07-12») — brukes av plan/økt-modellene:

> GRUNN · SPESIAL · TURNERING · TESTUKE · FERIE · TRENINGSSAMLING · HELDAGSSAMLING

**`PeriodeType`** (`schema.prisma:294`) — brukes av periode-constraints:

> GRUNN · SPESIALISERING · TURNERING · EVALUERING · FERIE

EVALUERING finnes kun i PeriodeType; TESTUKE/TRENINGSSAMLING/HELDAGSSAMLING kun i LPhase.
SPESIAL vs SPESIALISERING er samme periode med to navn. Disse to bør trolig konsolideres —
eller broen mellom dem gjøres eksplisitt (en `PeriodeNavnMapping`-modell finnes allerede).

### 4.1 Periode-regler (PERIODE_CONSTRAINTS)

Fra `src/lib/portal/training/periode-constraints.ts`. Coach kan overstyre via
`PeriodeFordeling`-modellen; ved overlappende perioder vinner den smaleste.

**Pyramide-minimum per periode (% av ukevolum):**

| Periode | FYS | TEK | SLAG | SPILL | TURN |
|---|---|---|---|---|---|
| GRUNN | 25 | 25 | 5 | 5 | 0 |
| SPESIALISERING | 15 | 15 | 20 | 15 | 0 |
| TURNERING | 5 | 5 | 15 | 20 | 20 |
| EVALUERING | 0 | 0 | 5 | 20 | 30 |
| FERIE | 40 | 0 | 0 | 0 | 0 |

**Pyramide-maksimum per periode (%):**

| Periode | FYS | TEK | SLAG | SPILL | TURN |
|---|---|---|---|---|---|
| GRUNN | 40 | 40 | 20 | 20 | 5 |
| SPESIALISERING | 30 | 30 | 40 | 35 | 15 |
| TURNERING | 20 | 20 | 30 | 40 | 45 |
| EVALUERING | 15 | 15 | 25 | 45 | 65 |
| FERIE | 100 | 20 | 10 | 10 | 0 |

**L-fase-fordeling per periode (% — hvilke læringsfaser som er tillatt/forventet):**

| Periode | Fordeling |
|---|---|
| GRUNN | KROPP 45 · ARM 40 · KOLLE 15 |
| SPESIALISERING | KOLLE 30 · BALL 45 · AUTO 25 |
| TURNERING | BALL 30 · AUTO 70 |
| EVALUERING | AUTO 100 |
| FERIE | KROPP 70 · ARM 30 |

⚠ Merk: dette bruker de gamle 5 L-fasene (v1-serien), ikke de 3 motorikk-stegene.

**Praksistype-fordeling per periode (% Blokk/Random/Konkurranse/Spill-test):**

| Periode | BLOKK | RANDOM | KONKURRANSE | SPILL_TEST |
|---|---|---|---|---|
| GRUNN | 70 | 20 | 5 | 5 |
| SPESIALISERING | 40 | 35 | 15 | 10 |
| TURNERING | 15 | 30 | 30 | 25 |
| EVALUERING | 10 | 20 | 35 | 35 |
| FERIE | 80 | 15 | 0 | 5 |

**Ukevolum per periode (minutter, min–maks):**

| Periode | Min | Maks |
|---|---|---|
| GRUNN | 420 | 720 |
| SPESIALISERING | 480 | 840 |
| TURNERING | 240 | 480 |
| EVALUERING | 180 | 360 |
| FERIE | 60 | 240 |

### 4.2 Mikrosyklus (4-ukers blokk)

Fra `src/lib/plan-engine/standard-fordeling.ts:85`:

```
UKE_TYPER = ["BYGG", "BYGG", "TOPP", "DELOAD"]
```

Dag-mønster per antall økter i uken: 1 økt → [onsdag], … 6 økter → [man–lør].

### 4.3 Andre periodiseringsmodeller i kunnskapsfilene (IKKE i kode)

⚠ **REVIDER** — disse tre lever i kunnskapsfilene, men ingen av dem er databasens modell:

- CANON: 3 perioder, okt–jan / feb–apr / mai–sep
- IUP: 4 perioder inkl. Evaluering, uke 43–46 / 47–12 / 13–25 / 26–42
- GFGK: 3 perioder × 5 underfaser (BUILD → STAB → TEST → TRANSFER → PERFORM), nov–mar / apr–jun / jun–okt

Beslutning trengs: skal de tre leve videre som pedagogiske begreper med bro til
`LPhase`/`PeriodeType`, eller ryddes bort til fordel for databasens modell?

---

## 5. Kategori-system (spillernivå)

**Databasen (`NgfKategori`, `schema.prisma:178`) — merk: A–L, 12 verdier, ikke 11:**

A = OWGR Top 150 (elite) → K–L = HCP 15+ / junior klubb.

Retning bekreftet i `src/lib/domain/ak-kategori.ts`: **A = elite, K/L = nybegynner**,
snittscore-basert (A < 68, nederst 100+). Kodekommentar «avklart i kode, bekreftes av Anders»
(2026-06-22).

⚠ **REVIDER:**
1. Kunnskapsfilene sier A–K (11 kategorier); databasen har A–L (12). Hvilket antall gjelder?
2. Masterbrains `canon-methodology.json` har fortsatt motsatt retning (A=nybegynner) og
   handicap-basert skala — skal rettes til kodens retning.
3. Tre målestokker i omløp: snittscore (kode + iup-kategorisystem.md), handicap (Masterbrain),
   GFGK-slagsnitt (veien-til-lavere-score.md). Koden bruker kun snittscore.

### 5.1 Standard pyramidefordeling per kategori

Fra `standard-fordeling.ts` (`STANDARD_PYRAMIDE`, FYS/TEK/SLAG/SPILL/TURN i %):

| Kategori | Fordeling |
|---|---|
| A | 10 / 15 / 25 / 30 / 20 |
| … | (glidende skala per kategori) |
| L | 15 / 35 / 38 / 7 / 5 |

Full tabell A–L ligger i filen — hentes derfra ved revisjon, for lang til å gjengi
mellomtrinnene her uten avskriftsrisiko.

### 5.2 Standard øktantall og øktvarighet per kategori

Fra samme fil:

- `STANDARD_OKT_ANTALL` per kategori × LPhase: A i GRUNN = 6 økter/uke … L i FERIE = 0.
- `STANDARD_VARIGHET_MIN` per kategori: A–C 90 min · D–G 75 min · H–J 60 min · K 60 min · L 45 min.

---

## 6. Invarianter — de 9 planreglene

Fra `src/lib/canon/invarianter.ts` (414 linjer, 8 harde + 1 myk). **Alle er anbefalinger i UI —
CLAUDE.md invariant 1: ingenting i appen blokkerer trening. «Hard/myk» styrer alvorsgrad i
varselet, ikke om noe sperres.**

| # | ID | Hard/myk | Nivå | Regel |
|---|---|---|---|---|
| 1 | tek-min | hard | periode | TEK-% ≥ periodens minimum (GRUNN 25 %, SPESIALISERING 15 % — se §4.1) |
| 2 | cs50-ballkontakt | hard | økt | SLAG-økt eller L_BALL uten CS-nivå = brudd; grense CS50 |
| 3 | alder-timer | hard | uke | Timer per uke ≤ alder i år; ukjent alder → regelen hoppes over |
| 4 | maks-2-svingendringer-turnering | hard | periode | Maks 2 økter med L_KROPP/L_ARM/L_KOLLE i TURNERING-periode |
| 5 | cs-tak | hard | økt | CS-tak per periode: GRUNN 70 · SPESIALISERING 90 · TURNERING 100 |
| 6 | l-fase-tillatt | hard | økt | Øktens L-fase må finnes i periodens lFaseFordeling (§4.1) |
| 7 | pyramide-maks | hard | periode | Ingen område over periodens maksimum (§4.1) |
| 8 | volum-uke-maks | hard | uke | Minutter/uke ≤ periodens maks (§4.1) |
| 9 | hviledager-min | myk | uke | Min. hviledager: GRUNN 2 · SPESIALISERING 1 · TURNERING 2 |

⚠ **REVIDER:**
- Kunnskapsfilene opererer med 13 invarianter (v1) og 7 (sg-principles) — koden har 9.
  Er 9-listen den ferdige v2-fasiten?
- TEK-minimum er periodeavhengig (15–25 %), IKKE flatt 15 % slik global CLAUDE.md sier.
- Invariant 2 og 5 refererer CS-skalaen som er uavklart.
- Invariant 4 og 6 refererer de gamle 5 L-fasene (v1-serien).

---

## 7. Planmodeller — spiller

Fra `prisma/schema.prisma`:

| Modell | Nøkkelfelter | Rolle |
|---|---|---|
| TrainingPlan (l.1040) | status (PlanStatus), publishedSnapshot (Json), targetAllocation (Json — pyramide-% satt ved godkjent PYRAMID_ADJUST), aiGenerated, aiGenerationId | Spillerens plan |
| TrainingPlanSession (l.1132) | Se §3.5 | Én økt i planen |
| SeasonPlan → PeriodBlock | lPhase, weeklyVolMin/Max, weeklySessionBudget (Json per pyramideområde), sourceGroupId | Årsplan/perioder |
| PlanAdjustment | uke-basert, focusAreas (PyramidArea[]) | Ukejustering |
| PlanChangeRequest | MOVE / DELETE / EDIT / CREATE | Spiller ber coach om endring |
| TechnicalPlan / PlanSession / PositionTask* | P-posisjoner P1.0–P10.0 | Teknisk plan (MORAD) |
| PeriodeFordeling | — | Coach-overstyring av periode-constraints |
| PeriodeNavnMapping | — | Bro mellom periodenavn-systemene |
| PlayerBusyBlock | kind: fritekst «SKOLE / JOBB / AVTALE / REISE / ANNET» | Opptatt-blokker |

**PlanStatus:** DRAFT · PENDING_PLAYER · ACCEPTED · REJECTED · ACTIVE · PAUSED · ARCHIVED

⚠ **REVIDER — blokk-typer:** Workbench-fasitene opererer med 9 blokk-typer (økt / skole /
booking / turnering / reise / test / sjekkpunkt / helse / gruppeøkt). I databasen er
`PlayerBusyBlock.kind` fritekst med 5 verdier (SKOLE/JOBB/AVTALE/REISE/ANNET) — «sjekkpunkt»
og «helse» har ingen datamodell, og «jobb»/«avtale» finnes ikke i fasit-listen. Enum eller
fritekst, og hvilken liste gjelder?

### 7.1 Teknisk plan-enums (TrackMan-mål)

| Enum | Verdier |
|---|---|
| TmGoalType | PRIMARY, SECONDARY, CAUSAL, HIT_RATE |
| TmGoalProtocol | ROLLING_WINDOW, BEST_OF_N, STREAK, SESSION_GATE |
| SuggestionType | NEW_TASK, ARCHIVE_TASK, RE_PRIORITIZE, CHANGE_CUE, ADJUST_GOAL, ADD_CLUB_TARGET |
| TrackStatus | PAA_VEI, STAGNERER, FERDIG, INAKTIV, AVSLAATT |
| PeriodGoalStatus | IKKE_STARTET, PAA_VEI, NAADD |
| TaskKategori | TEKNISK, TAKTISK, MENTALT, SOSIALT |

---

## 8. Planmodeller — gruppe

| Modell | Nøkkelfelter | Rolle |
|---|---|---|
| Group | level (A1–A5), kind (kontrakt / program / adhoc), program (PlayerProgram) | Gruppen |
| GroupMember | role (PLAYER / ASSISTANT / COACH), endedAt (soft-end) | Medlemskap |
| GroupSchedule | kind: «SAMLING / HELDAGSSAMLING / null» | Gruppens faste økter |
| GroupPeriodBlock | Gruppens egen årsplan | Perioder for gruppen |
| GroupPeriodGoal | akse (PyramidArea), egentidMinUke, egenvurdering/trenervurdering 1–5 | Periodemål |

**PlayerProgram (9 verdier):** WANG_TOPPIDRETT · WANG_UNG · GFGK_MINI · GFGK_BREDDE ·
GFGK_JENTER · GFGK_ELITE · AK_ACADEMY · AK_ACADEMY_JUNIOR · PLATFORM_ONLY

**Gruppe-workbench-funksjoner i kode:** `src/lib/workbench/gruppe-periode-actions.ts`,
`apply-template-actions.ts` (coachApplyTemplateToGroup), utrulling av gruppeårsplan til
spillernes planer (coachRullUtGruppeAarsplan — økter merkes `sourceGroupId`).

⚠ **REVIDER — Group.level A1–A5:** eget nivåsystem ved siden av NgfKategori A–L og AK-stigen
(Mini/Basis/Utvikling/Elite). Tre nivåsystemer i omløp for gruppering.

⚠ **REVIDER — GFGK-programnavnene:** databasen sier GFGK_MINI/BREDDE/JENTER/ELITE — AK-stigen
og gfgk-junior-treningsplanleggeren opererer med Mini/Knøtt(utgått)/Basis/Utvikling/Elite.
Stemmer ikke overens (BREDDE/JENTER finnes ikke i AK-stigen; Basis/Utvikling finnes ikke i DB).

---

## 9. WANG-planlegging

| Modell | Nøkkelfelter |
|---|---|
| TrainingPeriod | schoolYear, name («TURN-rest / Testuke / GRUNN / SPES / TURN»), competenceGoalIds |
| CompetenceGoal | VG1–VG3, Udir-kode IDR05-02 |
| SchoolScheduleEntry | category: TIME / PROVE / HELDAGSPROVE / EKSAMEN / FERIE / SKOLETUR / ANNET |

Kode: `src/app/team-wang/`. Faste treningstider M/O/F 08:00–10:00 (wang-treningsokt-skillen).

---

## 10. GFGK-junior-planlegging

Kode: `src/app/gfgk-junior/` finnes. Bindende pyramidefordeling per aldersgruppe i
GFGK-årsplaner (fra kunnskapsfilene — maks ±5 % avvik per periode uten flagging):

| Område | Mini (<10) | Basis (10–12) | Utvikling (13–15) | Elite (16–19) |
|---|---|---|---|---|
| Fysisk | 40 % | 25 % | 20 % | 15 % |
| Teknikk | 35 % | 45 % | 35 % | 25 % |
| Golfslag | 15 % | 20 % | 25 % | 20 % |
| Spill | 10 % | 10 % | 15 % | 20 % |
| Turnering | 0 % | 0 % | 5 % | 20 % |

⚠ **REVIDER:** denne aldersbaserte tabellen og den kategoribaserte (`STANDARD_PYRAMIDE` per
NgfKategori, §5.1) er to ulike inndelinger brukt til samme formål. Se også §8 om
programnavn-mismatch.

---

## 11. Turneringsplanlegging

| Modell | Nøkkelfelter |
|---|---|
| Tournament | (turneringen selv) |
| TournamentEntry | status: PLANNED / CLAIMED_REGISTERED / CONFIRMED / WITHDRAWN / COMPLETED / DNF |
| TournamentResult | (resultater) |
| TournamentPreparation (l.4193) | variant: «konservativ / standard / aggressiv», targetFinish, totalDays, sessionsPlanned/Done, status: ACTIVE / COMPLETED / ABANDONED |

⚠ **REVIDER:** beslutning 04.08.2026 sier turneringsplanlegging skal INN i Workbench
(`workbench-turnering.html` som del av WorkbenchV2). Koden har fortsatt
`TurneringPlanleggerV2.tsx` som frittstående komponent — ikke integrert ennå.

---

## 12. Tester

| Modell | Rolle |
|---|---|
| TestDefinition | Protokollen — **31 rader i databasen i dag** |
| TestResult | Ett resultat |
| TestSession | status: IN_PROGRESS / COMPLETED / ABORTED |
| TestAssignment | status: OPEN / COMPLETED / CANCELLED |

**TestVisibility:** PRIVATE · COACH · GROUP · ACADEMY

31-tallet stammer fra seedstrategien i `prisma/scripts/seed-ngf-test-protocols.ts` (godkjent
2026-05-23): behold eksisterende 31, oppdater protokoll-JSON på 15 som matcher NGF-20-listen,
legg til 5 nye.

⚠ **REVIDER:** kunnskapsfilene opererer med 20 (IUP) / 21 (Anders muntlig) / 36 (CANON) —
databasen har 31. Og: skal IUP-testene og Team Norway-testene være koblet (samme formål) eller
bevisst atskilt (intern kategorisering vs. landslagsuttak)?

Tester planlegges i Workbench (beslutning 04.08), resultat skal synce til TalentHQ —
sync-koblingen TestResult → TalentHQ finnes ikke i kode ennå.

---

## 13. Driller og øvelser

**Datamodell:** `ExerciseDefinition` (ikke «Drill») med feltene: `pyramidArea`,
`lPhase`/`lPhases`, `skillArea`, `csMin`/`csMax`, `minKategori`/`maxKategori` (NgfKategori).

⚠ **REVIDER — mulig feltfeil:** `lPhase`-feltet på ExerciseDefinition bruker
periodiserings-enumet (GRUNN/SPESIAL/…), ikke læringsfasen. Enten bevisst (øvelsen hører til
en periode) eller en navnekollisjon — må avklares før øvelser kobles til noe.

**Drill-bankens status:** Masterbrains godkjente bank er TOM (tømt 31.07.2026, 14 navn fjernet
pga. selvmotsigende data). 895 kandidater ligger ugjennomgått i `ovelsesbank/kandidater/`.

**Never-invent-loven (07.08.2026, i kode):** `src/lib/agents/drill-forslag-agent.ts` sjekker
`erMasterbrainDrillBankTom()` og nekter å foreslå drillnavn så lenge banken er tom — agenten
finner stallens svakeste SG-område (60-dagers snitt) og rapporterer `DRILL_BANK_EMPTY` i
stedet for å dikte.

⚠ **REVIDER:** tre ak-second-brain-filer (`morad-common-faults.md`,
`morad-diagnostiske-regler.md`, `morad-drill-bibliotek.md`) refererer fortsatt de 9 fjernede
drill-navnene som fungerende — i strid med det koden håndhever.

---

## 14. Agent- og AI-planlegging

### 14.1 PlanAction — alt agentskrevet går gjennom denne

`PlanAction` (`schema.prisma:1814`):

- **actionType (10):** PYRAMID_ADJUST · SESSION_ADD · SESSION_REMOVE · INTENSITY_ADJUST ·
  TAPER_ENGAGE · WITHDRAW · DRILL_SUGGEST · TEST_SCHEDULE · PEER_COMPARE · RECOVERY_ADD
- **status:** PENDING · ACCEPTED · REJECTED
- **provenance (Json):** hvem/hva/hvorfor bak forslaget (agent · data · regel)
- `originalSuggestion` + `editedBeforeApproval` — sporer om coach redigerte før godkjenning

Flyt: agent skriver PlanAction med status PENDING → vises som diff på berørt økt →
Godkjenn/Avvis med «Hvorfor?» — aldri auto-apply.

### 14.2 Plan-skills (domeneregler for automatisk planbygging)

`src/lib/training/skills/` — 7 filer, alle zod-validert inn/ut:

| Skill | Håndhever |
|---|---|
| weakness.ts | Finner svakeste SG-område fra input |
| periodization.ts | Perioderegler (bruker tekAnbefalingsVarsel fra invariantene) |
| progression.ts | L-fase-progresjon |
| pyramid.ts | Måler faktisk fordeling mot mål (prosentPerArea) |
| drill-selection.ts | Drill-valg per skillArea (respekterer tom bank) |
| junior-guard.ts | Junior-vern |
| morad-fault.ts | SG-bånd → MORAD-feilkandidater via Masterbrain |

### 14.3 Diagnose-grunnregel (fra faults.json, besluttet 31.07.2026)

Et SG-tall alene identifiserer ALDRI en svingfeil. Agent sier «SG peker mot X — må bekreftes»
(video, sikte, køllevalg), aldri «feilen er X». 10 MORAD-feil er definert med
P-posisjons-deteksjon; drill-koblingen er fjernet til banken er gjenoppbygget.

---

## 15. Booking

- Booking krever Lokasjon (`locationId` påkrevd), fasilitet valgfri (`facilityId`).
- Dobbelbooking-sperre: unik `(coachId, startAt, serviceTypeId)`.
- Credits trekkes fra `Subscription.creditsRemaining`.
- Spiller booker i `/portal/booking`, coach i `/admin/bookinger/ny`.
- `BookingStatus`-enum styrer livssyklusen.

**Kurs:** `CourseDefinition` (`schema.prisma:1411`) er **golfbane-definisjon** (course = bane),
IKKE undervisningskurs. ⚠ **Ingen kurs/undervisningskurs-modell finnes i databasen** — hvis
kurs skal planlegges i plattformen, må modellen bygges.

---

## 16. Workbench — raster og interaksjonsregler

Fra fasitene (fase1), verifisert i forrige revisjon:

- Tidsraster **05:00–23:00**, SLOT = 30 min, ⇧-hopp = 5 min, nå-linje vises.
- Skole- og booking-blokker er **låste lag** — konflikt gir varsel, aldri blokkering.
- Ghost-blokker: forslag bekreftes/forkastes eksplisitt. Caddie skriver utkast — aldri auto-send.
- Gruppeøkt i spillermodus: låst, merket «coach eier».
- Coach-endringer merkes «coach» i spillerens logg.
- Maks én oransje handling per skjerm («Én ting nå» + focus — clay `#D97757`).
- Regel-/låse-laget (CANON-score, tak, «Overstyr med begrunnelse») er **bevisst fjernet
  01.08.2026** («Fjern alle regler og låser nå») — settes tilbake når reglene i §6 er
  gjennomarbeidet og bekreftet.

---

## 17. Samlet revisjonsliste — alle ⚠-punktene

1. **Områder:** 5-verdis SkillArea (DB) vs. 16-verdis OMRÅDE-liste — utvide eller beholde? (§2)
2. **Motorikk-stavemåte:** LAV_HASTIGHET (kode) vs. LAV_HAST (Paper). (§3.1)
3. **Gamle L-faser i DB:** migrere bort eller beholde som lagringsformat bak broen? (§3.1)
4. **Belastning:** M0–M5 lever i DB uten bro til de 4 nye belastningsverdiene. (§3.2)
5. **Press-navn:** vedtatt ALENE/OBSERVERT/KONKURRANSE/TURNERING ikke implementert i kode. (§3.3)
6. **CS-skalaen:** DB har CS50–100, kunnskap sier CS20–100, alt uavklart. (§3.4)
7. **RANDOM vs VARIABEL** i de to PracticeType-enumene. (§3.5)
8. **To session-status-enums** (SessionStatus + SessionStatusV2). (§3.5)
9. **To periodesystemer:** LPhase vs PeriodeType — konsolidere? (§4)
10. **CANON/IUP/GFGK-periodemodellene** vs. databasens — hvem er fasit? (§4.3)
11. **Kategori A–K vs A–L:** 11 eller 12 kategorier? (§5)
12. **Masterbrains kategoriretning** fortsatt invertert — rettes. (§5)
13. **Tre kategorimålestokker** (snittscore/handicap/GFGK-slagsnitt). (§5)
14. **Invariant-antall:** 9 (kode) vs 13/7 (kunnskap) — er 9 v2-fasiten? (§6)
15. **TEK-minimum:** periodeavhengig 15–25 % i kode, flatt 15 % i CLAUDE.md. (§6)
16. **Blokk-typer:** 9 i fasit vs 5 fritekst-verdier i DB. (§7)
17. **Group.level A1–A5** — tredje nivåsystem. (§8)
18. **GFGK-programnavn:** DB (MINI/BREDDE/JENTER/ELITE) vs AK-stigen (Mini/Basis/Utvikling/Elite). (§8, §10)
19. **To pyramidefordelings-tabeller:** alders- (GFGK) vs kategori-basert. (§10, §5.1)
20. **Turnering ikke integrert i Workbench** ennå. (§11)
21. **Testantall:** 31 (DB) vs 20/21/36 (kunnskap); IUP vs Team Norway kobling. (§12)
22. **TestResult → TalentHQ-sync** mangler i kode. (§12)
23. **ExerciseDefinition.lPhase** — periode eller læringsfase? (§13)
24. **Drill-navnene i ak-second-brain** i strid med never-invent-loven. (§13)
25. **895 drill-kandidater** ugjennomgått. (§13)
26. **Kurs-modell finnes ikke** — bygges hvis kurs skal planlegges. (§15)

---

*Alle verdier verifisert mot koden 18.08.2026. Ved revisjon: marker direkte i dette dokumentet,
så tas endringene punkt for punkt — kunnskapsfiler rettes der koden er fasit, kode rettes der
du bestemmer noe annet.*
