# DATA-INVENTORY.md — datagrunnlag for trenings- & gamification-motoren

> **Status:** Steg 1 av handover-prompten (`public/design-handover/START-HER-handover-prompt.md`).
> Kodeverifisert kartlegging av hva som faktisk finnes i `akgolf-hq` + DataGolf + TrackMan per 2026-06-21.
> **Ikke app-kode endret.** Der koden er fasit, vinner koden. Alle fil:linje-referanser er bekreftet i kode.
>
> **Hovedfunn på tvers:** Mye av motoren er bygd men **frakoblet** — flere ferdige moduler har null konsument
> (per-slag-SG, krise-diagnose, TrackMan bag-analyse). Det største mønsteret er at strukturerte data-tabeller
> finnes i schema, men aldri fylles ved inntak, så de rike analysene leser forenklede `rawJson`/`Signal`-fallbacks.

---

## 1 · Strokes Gained (SG)

### Det finnes TRE+ parallelle SG-system som ikke snakker sammen

| System | Fil | Rolle | Konsument |
|---|---|---|---|
| **`beregnSg()`** per-slag-motor | `src/lib/domain/sg.ts` | Regner SG per enkeltslag mot benchmark-tabeller | **Ingen** (kun `__tests__/domain/sg.test.ts`) |
| **`aggregateSg()`** runde-aggregator | `src/lib/sg.ts:35` | Snitter `Round.sg*`-felt over siste N runder | Driver UI (statistikk, dashboard, sg-hub) |
| **`sg-estimator.ts`** Broadie HCP↔score | `src/lib/stats/sg-estimator.ts` | HCP→forventet SG-fordeling, tour-ekvivalent | Kun marketing `/stats/*` |
| **`sg-benchmarks.ts`** krise-diagnose | `src/lib/sg-benchmarks.ts` | «svakeste SG → krise» per HCP-forventning | **Ingen** (0 importer) |
| **`SgBaseline`**-tabell (DB) | DataGolf-synket, `schema.prisma:2777` | `category × distanceBucket × lie`, tour-baseline | Kun TrackMan-innsiktsmotor |

- **`beregnSg()` (`domain/sg.ts:191`):** `SG = startForventet − sluttForventet − 1`. 4 kategorier `SgCategory = OTT|APP|ARG|PUTT` (`domain/sg.ts:22`), 6 outcomes (`:24`), 4 benchmark-tabeller i meter (`:75-131`). **Kalibrert (`:67-73`):** PUTT fra Team Norway IUP Ref-ark 2025, OTT/APP/ARG fra Broadie «Every Shot Counts» (yards→meter). Har **ingen produksjonskonsument** — SG fylles aldri fra slag-data.
- **SG lagres som manuell input:** `src/app/portal/mal/runder/ny-runde-modal.tsx:20-104` er tekstfelter der spiller/coach taster inn SG selv. `Round.sg*` fylles fra input, ikke beregnet.

### Hva lagres i hvilken modell
- **`Round` (`schema.prisma:1121`):** all faktisk SG. `sgTotal, sgOtt, sgApp, sgArg, sgPutt` (Float?) + **16 granulære felt** (`sgTee, sgApp200/150/100/50, sgChip, sgPitch, sgLob, sgBunker, sgPutt0_3…40plus`, `:1132-1148`) — manuell input.
- **`Shot` (`:1195`):** per-slag (`club, lie: ShotLie, distanceToPin, distanceHit, windDir, shotType, start/endX/Y, mentalScore`). **Har INGEN SG-felt og ingen `distanceAfter`** → `beregnSg()` kan ikke kjøres på lagret data uten schema-/mapping-arbeid.
- **`HoleScore` (`:1225`):** `par, strokes, putts, fairway, gir`. Ingen SG.
- **`TrainingLog` (`:1102`):** `sgArea: SgCategory` + `minutes` (kobler treningstid til SG-kategori).

### Aggregater som finnes ferdig
- **Snitt per område:** `aggregateSg()`. **Trend / vs forrige periode:** `getSgBreakdown()` (`analysere/actions.ts:510`, siste 10 runder); SG-deltaer lagres på `PlanEffectiveness` (`:1028`).
- **SG vs trening (regresjon):** `sg-scatter/compute.ts` — lineær regresjon timer/uke mot SG-endring 90 d, R² + verdict (konsument `components/sg-hub/SgTrainingScatter.tsx`).
- **Waterfall:** `portal-sghub/sg-waterfall-data.ts` (bygger score-mot-par per hull fra `Shot`-antall; SG-kort leses fra runde-aggregatet).
- **Persentil: finnes IKKE for SG** (kun for PGA-stats i marketing).

### Per avstandsbånd / kølle / miljø?
- **Avstandsbånd:** delvis (16 manuelle felt på `Round`, ikke utledet fra slag). **Per kølle:** nei for SG (kun TrackMan-launch-data). **Miljø (inne/ute):** nei for SG (`TrackManSession.environment` + `SessionEnvironment` finnes, men `Round`-SG har ingen miljø-akse).

### MANGLER / må bygges (SG)
1. **Ingen kobling slag → SG.** `Shot` mangler `distanceAfter` + kategori → SG er i praksis manuell input. Største SG-gapet.
2. **To ferdigskrevne moduler er helt frakoblet:** `sg-benchmarks.ts` (krise-diagnose) og `domain/sg.ts` (per-slag-motor). Lavthengende å koble på.
3. **Kun ett baseline-nivå** (`domain/sg.ts` = PGA Top 40). A1/A2/B1/B2-utvidelse er TODO i fil-kommentar (`:6`).
4. Ingen persentil, ingen miljø-splitt, ingen per-kølle-SG. `SgBaseline` (lie-oppløst DataGolf-fasit) brukes ikke av runde-SG.

---

## 2 · DataGolf API

Klient: `src/lib/datagolf/client.ts`. Base-URL `https://feeds.datagolf.com` (`:17`). Auth: `?key=${DATAGOLF_API_KEY}&file_format=json` (`:30-32`). **Eneste env-variabel: `DATAGOLF_API_KEY`** — **ikke** i `src/lib/env.ts`-valideringen → stille runtime-feil i cron hvis den mangler.

### Endepunkt-tabell

| Endepunkt | Kalt fra | Felt-eksempler | Caching / cron |
|---|---|---|---|
| `/get-schedule?tour=` | `client.ts:67` → `turneringer/sync.ts:56` | `event_id, event_name, start_date, course, course_key, location, country, lat/long, status, tour, winner` | DB: `Tournament` upsert. Cron daglig `0 4 * * *` |
| `/get-player-list` | `client.ts:85` → `sync.ts:120` | `dg_id, player_name, country, country_code(ISO3), amateur(0/1)` | DB: `PublicPlayer`. Cron ukentlig `0 5 * * 1` |
| `/preds/live-tournament-stats?stats=sg_total,sg_ott,sg_app,sg_arg,sg_putt,...` | `client.ts:119` → `sync.ts:211` | `event_name, live_stats[]{dg_id, position, total, thru, round}` | Hele svaret rått i `LeaderboardSnapshot.payload`. Cron **hver 10. min** |
| `/preds/pre-tournament` | `client.ts:143` (`getTournamentField`) | `field[]{dg_id, player_name, country}` | **Ubrukt** (ingen callere) |
| `/preds/skill-ratings?display=value` | `client.ts:186` → `benchmark-sync.ts:283`, `pga-sync.ts:37` | `sg_total/ott/app/arg/putt, driving_dist, driving_acc, gir, putts_per_round, scrambling, rounds, avg_score` | DB: `PgaPlayerSeason`. Cron `0 6 * * 1` |
| `/preds/approach-skill` | `datagolf-sync.ts:8` + `pga-sync.ts:302` | `data[]{dist(yard), lie, sg_gained, sample}` | DB: `SgBaseline`(APP) + `PgaApproachDistance`. Cron `0 5 * * 1` + `30 7 * * 1` |

- **Rate limits/retry: ingen.** Kommentar (`client.ts:13`) krever DB-cache-mønster; det følges (all UI leser fra DB, aldri direkte). Cron-register i `vercel.json`, dispatcher `src/app/api/cron/[agent]/route.ts` (CRON_SECRET Bearer).
- **Benchmark-godkjenning:** `runBenchmarkSync` (`benchmark-sync.ts:281`) regner ankere (PGA topp-40, PGA/KFT-snitt), auto-skriver ved drift ≤ 3 % (`MAX_AUTO_CHANGE_PCT`), holder ellers `benchmarks_pending` → godkjenning på `/admin/tester/benchmarks`. Telegram-rapport hver kjøring.

### Tour-SG-profiler & persentiler («konkurrer mot proffene»)
- **SG per pro: JA** som sesong-aggregat i `PgaPlayerSeason` (`sgTotal/ott/app/arg/putt` + drive/gir/putts/scrambling/avgScore per `dgPlayerId, tour, year`; tours pga/euro/kft). **Persentiler: NEI** som lagret felt — kun topp-N + tour-snitt; persentil må regnes ad-hoc.
- `PublicPlayer` har ingen SG-felt (kun identitet/ranking); kobles til `PgaPlayerSeason` via løs `dgPlayerId`-int (ingen Prisma-relasjon).
- **Vær:** ikke fra DataGolf og ikke fra noe eksternt API — manuelt brukerinntastet (`weather?: string[]` ved runde-opprettelse; `conditions-adjust.ts` tar manuell vind m/s).

### MANGLER / må bygges (DataGolf)
1. **Ingen persentil-modell** for pro-SG (kreves av «mot proffene»).
2. **Ingen spiller→SG-relasjon** (`PublicPlayer` ↔ `PgaPlayerSeason` bare via løs int).
3. **`DATAGOLF_API_KEY` ikke i env-validering** → stille feil i prod.
4. **Ingen rate-limit/retry/backoff** (429 ikke håndtert).
5. **Live per-spiller-SG kastes bort** — `live-tournament-stats` ber om SG, men `PublicPlayerEntry` lagrer kun posisjon/score (rådata finnes i `LeaderboardSnapshot.payload`).
6. Ingen course-history / fantasy / DG-rankings hentes.

---

## 3 · TrackMan

To parsere + rik analyse-motor + DB-modell. **Ingen TrackMan-API** — alt er manuell fil-opplasting.

### Modell
- **`TrackManSession` (`schema.prisma:1356`):** `source ("csv-import"|"html-import"|"api"), shotCount, rawJson (Json?), environment (TrackManEnvironment?)`. Relasjon `shots TrackManShot[]`.
- **`TrackManShot` (`:3597`):** full per-slag-modell (alle nullable) — ball: `ballSpeed, smashFactor, launchAngle, spinRate, spinAxis, carryDistance(m), totalDistance(m), apexHeight, landAngle, side(m)`; klubb: `clubSpeed, attackAngle, clubPath, faceAngle, faceToPath, dynamicLoft, strikePatternX/Y`; klassifisering: `club, shotNumber, matchSource, matchConfidence, hastighet, outlier`.
- **`TrackManEnvironment` (`:1639`):** `SIMULATOR_INDOOR, NET_INDOOR, RANGE_OUTDOOR_MAT, RANGE_OUTDOOR_GRASS, COURSE_PRACTICE, COURSE_COMPETITION`. Inne-nett vs ute via dette feltet (settes manuelt i import-modal, default `SIMULATOR_INDOOR`).

### Inntaks-flyt
1. **CSV-import** — `portal/mal/trackman/csv-import-modal.tsx` → `importTrackManCsv` (`actions.ts:41`). Server splitter CSV naivt på komma og lagrer **rådene rått i `rawJson`**. Coach kan importere på vegne av spiller.
2. **HTML-rapport** — `importTrackManHtml` (`actions.ts:79`) → `parseTrackManHtmlReport` (regex på «Multi Group Report»). Strukturert `rapport`-objekt i `rawJson`.
3. Etter begge: `triggerTrackManAgent` skriver `Signal{kind:"CLUB_AVG"}` (snitt-distanse per kølle) — den grove utledningen UI faktisk bruker.

### KRITISK ARKITEKTUR-GAP — `TrackManShot` skrives ALDRI
- **Null** `trackManShot.create/createMany/upsert` noensteds. Importen lagrer bare `rawJson`.
- Følge: `portal-trackman/session-analysis.ts` (`analyzeSession`, 404 l rik bag-analyse: dispersjon 95 %, gapping, stabilitet) leser `TrackManShot[]` men har **null callere**. Hele bag-view-motoren er frakoblet.
- `parse-csv.ts` (rikere parser med NO/EN-aliaser, m/s) er **ikke koblet** til import-actionen (som bruker sin egen naive parser).

### Screenshot-/vision-import
- **Finnes ikke.** Null treff på screenshot/vision/OCR i hele TrackMan-flyten. Eneste inntak = fil-opplasting.
- For å bygge (per MASTER §6): (a) bilde-lagring (ingen Storage-bøtte i dag), (b) parse-endepunkt mot vision-modell (`ANTHROPIC_API_KEY` finnes, ubrukt til dette), (c) validerings-UI før lagring (felt → `TrackManShot`-mapping + bekreftelse).

### MANGLER / må bygges (TrackMan)
1. **Fyll `TrackManShot` ved import** (parserne har feltene klare; ingen skriver radene) — låser opp `analyzeSession` + ekte gapping/dispersjon.
2. **Koble `analyzeSession` til en rute** (404 l dead code).
3. **Konsolider to CSV-parsere** (naiv vs rik).
4. **Ingen TrackMan-API**, **ingen screenshot/vision-import**, **AgencyOS-filtre er stubs** («kommer snart»).
5. **Enheter inkonsistente** (m vs yard) — må normaliseres ved inntak.

---

## 4 · Pyramide, nivå & «neste nivå»

### Taksonomi & invarianter
- **`PyramidArea` (`schema.prisma:69`):** `FYS, TEK, SLAG, SPILL, TURN`. Aggregat i `lib/pyramide.ts`. **Eneste hardkodede idealfordeling:** `get-workbench-insights.ts:30` → `FYS 0.30, TEK 0.30, SLAG 0.25, SPILL 0.10, TURN 0.05`. **Ingen periode-spesifikke min/maks pyramidefordelinger** — idealen er én global konstant.
- **Periode-invarianter (kodet med min/maks):** `taxonomy.ts:208` `PERIODE_TYPER: Record<LPhase, PeriodeConstraints>` — GRUNN/SPESIAL/TURNERING med csMax, maks min/uke, maks økter/uke, hviledager, tillatte L-faser, turneringslås. Håndheves av `validerPeriodBlock()` (`:325`).
- **Tre parallelle SG-vokabular uten mapping:** `SgCategory` (OTT/APP/ARG/PUTT, på Round+TrainingLog) · `SkillArea` (`:83` TEE_TOTAL/TILNAERMING/AROUND_GREEN/PUTTING/SPILL, på drills) · `SGKategori` (kun TS-type i `taxonomy.ts:95`, TEE/TILNAERMING/KORT_SPILL/PUTTING/SPILL). **Redesign-fallgruve** — bør forenes før nivå bygges på SG.
- **Dobbel periode-enum:** `LPhase` (`:77` GRUNN/SPESIAL/TURNERING) vs `PeriodeType` (`:262` GRUNN/SPESIALISERING/TURNERING/EVALUERING/FERIE).

### Nivå-klassifisering — finnes, men er NGF-kategori (ikke snittscore-bånd)
- **`NgfKategori` (`:164`):** `A…L` (12 nivåer; A = OWGR Top 150, K–L = HCP 15+/junior).
- Utledes to veier: fra HCP (`ai-plan/context.ts:134`, harde terskler) og fra WAGR-poeng (`talent/wagr-import/actions.ts:12`, lagres på `WagrSnapshot.ngfCategory`; WAGR foretrekkes, `context.ts:459`).
- Andre nivå-felt (overlapper ikke): `Group.level` (fritekst), `OktMal.kategoriAK` (fritekst), `SPILLERKATEGORIER` A–K i `taxonomy.ts:239`.
- **PARKERT A–K snittscore-bånd (11 grenser):** **0 kode** finnes — må bygges fra bunnen når Anders gir grensene (ingen plassholder å fylle). Jf. [KONFLIKTER.md K-04].

### «Neste nivå» i dag
- **Datadrevet terskel:** ingenting. NGF-kategorien klassifiserer nåværende nivå (brukes kun til drill-filtrering), ikke en nivå-stige.
- **Coach-satte mål:** `Goal` (`:1428`) — eneste reelle «neste nivå»-mekanisme, manuell.

### Signaler som kan drive «du bør trene X»
1. **Pyramide-avvik (live):** `vurderPyramide()` → `get-workbench-insights.ts` (deterministisk regelmotor, TODO om Caddie-agent).
2. **Svakeste SG (ferdig, frakoblet):** `diagnostiserSg()` i `sg-benchmarks.ts`.
3. **`Signal` (`:1375`):** generisk `kind` (SG_AREA/PYRAMID_AREA/HCP_TREND/CLUB_AVG/STREAK) → AI-plan-kontekst, men **ingen sentral generator** skriver SG/pyramide-signaler systematisk.
4. **Drift (TrackMan):** `drift-detection.ts`. **Test-gap:** blokkert av parkert FYS-formel.
- NGF-kategori driver i dag **drill-utvalg** via `hentTilgjengeligeDrills()` (`context.ts:228`) — filtrerer på `minKategori/maxKategori`. **Dette er filteret hvor drill-kategori-bug-en slår inn** (se §5).

### MANGLER / må bygges (Pyramide/nivå)
1. **Ingen snittscore-nivå-stige** (A–K-båndsystemet eksisterer ikke i kode).
2. **Ingen «neste nivå»-motor** (kun manuelle `Goal`).
3. **Tre usammenhengende SG-vokabular** uten mapping.
4. **Periode-pyramide-invarianter (min/maks per fase)** finnes for CS/volum, men ikke for pyramidefordeling.

---

## 5 · Tester & øvelser

### Modeller
- **`TestDefinition` (`schema.prisma:1244`):** `pyramidArea, scoringRule (String), protocol (Json?)` (slag-spec + benchmarks bor her), `isCustom, visibility: TestVisibility, isCoachApproved`.
- **`TestResult` (`:1278`):** `score (Float), details (Json?)`. **`TestSession` (`:1303`):** live scoring (`status: TestSessionStatus`, `scoringData`). **`TestAssignment` (`:1334`):** coach→spiller (`status: TestAssignmentStatus`).

### Scoring
- Kanonisk motor: `src/lib/portal-tester/test-scoring.ts` — `scoreTest(protocol, forsok)`. **`ScoringKind` (`:31-46`)** dekker alle nevnte typer + flere (`pei_average, pei_total, spread_stddev, time_seconds, points_total, count_ok, hit_rate, distance_average, carry_average, value_single, value_max, sum, average, min, fallback`). Retning per kind i `RETNING` (`:95-111`). PEI = nærhet ÷ lengde (`:229-241`).
- **Benchmarks:** i `TestDefinition.protocol.benchmarks` (JSON, zod-validert i `test-benchmarks.ts`). 7 anker-nivåer (`SHORT_LABEL :41-49`): `pga_top40, pga_avg, dpw_kft, challenge, nordic, elite_junior, scratch`. `achievedLevel()` (`:92`). Autosync (`benchmark-sync.ts`): kun 2 tester har DataGolf-ankere; PEI/putt har statiske referanser.
- **FYS scores som rå beste verdi** (`value_max`/`time_seconds`) — **ingen referanse** (FYS-formel parkert, `:20-21`). Jf. [KONFLIKTER.md K-12].

### Drill-bibliotek
- **`ExerciseDefinition` (`:878`)** — hovedbank: `pyramidArea, skillArea?, lPhase?+lPhases[], csMin/Max, csTargetByKategori, environment[], fasilitetKrav[], utstyr[], intensitet, minKategori/maxKategori: NgfKategori?, minHcp/maxHcp, treningstype, source, visibility, videoUrl`.
- **`SessionDrill` (`:945`)** kobler bank→`TrainingPlanSession` (Spor A). **`TrainingDrillV2` (`:2539`)** = Spor B (Workbench/live-V2), **egen drill-tabell uten FK til `ExerciseDefinition`**, egen taksonomi (`pyramide, lFase, csNivaa, miljo, prPress` + 17 `fys*`-felt). **To adskilte drill-banker.**
- **BEKREFTET DATA-BUG:** QA `scripts/drill-qa.ts` (`npm run qa:drills`) regel `kategori-range-omvendt` (`:147-164`). Filteret `hentTilgjengeligeDrills()` (`ai-plan/context.ts:228-308`) krever `idx(minKategori) ≤ idx(maxKategori)`; driller med omvendt range matcher **ingen** spiller → usynlige i AI-plan. Auto-memory: ~809/930 rammet (tallet bør re-verifiseres mot live DB). Også: 0 video-dekning, blokk-skjevhet. Jf. [KONFLIKTER.md K-13].

### Test-score → SG/nivå?
- **Til nivå-bånd: JA** for tester med benchmarks (via `achievedLevel()`), men få tester har faktisk `levels[]`. **Til SG: NEI** (ingen kode kobler `TestResult.score` til SG).

### MANGLER / må bygges (Tester)
1. **Test→SG-mapping finnes ikke.** 2. **FYS-formel parkert.** 3. **Tynn benchmark-dekning** (kun 2 auto + få statiske). 4. **To adskilte drill-banker** (`ExerciseDefinition` vs `TrainingDrillV2`) — V2 ikke i AI-filteret. 5. **Drill-kategori-bug ikke fikset** (kun QA-script finnes).

---

## 6 · Spiller, runder & resultat + bane-normalisering

### Resultat-modeller
- **`Round` (`:1121`):** `score (Int, brutto), courseId, playedAt` + full SG-fordeling. **Ingen vær/forhold-felt på Round.**
- **`Shot` (`:1195`):** per-slag, `windDir: WindDir?` (`:1176` STILLE/MEDVIND/MOTVIND/VENSTRE/HOYRE — eneste vær-signal, per slag), `mentalScore (1–5)`. Ingen taktisk-felt.
- **`TournamentResult` (`:2087`):** `position, score, notes`. **`Tournament` (`:1867`):** `format, tour, tier(Int), purseUsd, country, courseId`.

### Spillermodell (`User`, `:298`)
- **HCP: `hcp (Float?)` — kun nåværende verdi, INGEN HCP-historikk-modell.** Alder: `dateOfBirth`, `playingYears`, `prevSeasonAvgScore`. Klubb: `homeClub`. Mål: `Goal` (`:1428`). Coach-kobling: via `PlayerEnrollment` (m2m) + `CoachingSession`/`TestAssignment`/`Booking`; program `PlayerProgram` på enrollment.

### Bane-normalisering (CR/Slope)
- **`CourseDefinition` (`:1086`):** `par, rating (Float?), slope (Int?)` — banen `Round` peker på.
- **`Bane` (`:1938`):** rikere banedatabase (`courseRating, slope, lengdeMeter, region, lat/long`) — brukt for /turneringer + /stats, **IKKE koblet til `Round`**.
- **`Round` lagrer ikke CR/slope på rund-nivå** (kun via `courseId` = én verdi per bane, ikke per tee/forhold).
- Eksisterende normaliserings-kode: `sg-estimator.ts:101` `tourEquivalentScore()` (WHS-basert, men på snittscore, marketing-verktøy) + `whs-kalkulator/client.tsx` (`(score−CR)×113/slope`, client-only) + `conditions-adjust.ts` (justerer **kølle-distanser**, ikke score).

### MANGLER / må bygges (Spiller/bane-norm)
1. **CR/Slope per runde finnes ikke** (`Round` mangler CR/slope/tee — må snapshotte ved registrering eller via tee-relasjon).
2. **`Bane` (m/CR-slope) ikke koblet til `Round`** — to overlappende banemodeller bør forenes.
3. **Score Differential-formelen** finnes kun i client-marketing — må flyttes til delt server-lib for å normalisere historiske runder.
4. **Ingen forhold på runde-nivå** (kun per-slag `Shot.windDir` enum, ikke m/s).
5. **Ingen HCP-historikk** (kun gjeldende `User.hcp`).

---

## 6b · Anonym kohort-benchmarking

- **Eksisterende kohort-kode** (`admin/talent/kohort/page.tsx`) grupperer `TalentTracking`-rader per **aldersnivå** (U10…Senior), ikke snittscore/HCP-bånd. Per kohort: antall + snitt av 5 radar-akser + 90-d progresjon. **Ingen k-anonymitet** (viser ned til 1 spiller).
- **`TalentTracking` (`:538`):** `niva (String), klubb, region`, radar-akser (1–10). Eneste sted alders-/radar-kohorter finnes.
- **Anonymisering er per-bruker opt-out** (`portal/talent/sammenligning` `AnonymiserToggle` → `User.preferences`), **ikke** minimums-kohortstørrelse.
- **Treningsvolum:** `TrainingLog (:1102)` har `sgArea: SgCategory` (kun 4 SG-områder, **ikke** 5-trinns pyramide). Aggregering `training/volum.ts` (per uke × SgCategory, per-bruker). **Pyramide-volum (FYS/TEK/SLAG/SPILL/TURN) lagres ikke aggregert på tvers av spillere.**

### MANGLER / må bygges (Kohort)
1. **Snittscore/SG/HCP-bånd-kohorter finnes ikke** (kun aldersnivå). 2. **K-anonymitet ikke implementert** noe sted (trenger `COUNT(DISTINCT userId) ≥ k`-gate). 3. **Treningsvolum kan ikke aggregeres per pyramidetrinn** (`TrainingLog` har kun 4 SG-områder). Råfeltene finnes (`Round.score/sg*`, `User.hcp`, `TrainingLog.minutes`); aggregerings-/gate-laget mangler.

---

## 7 · Gamification

| Modell | Linje | Nøkkelfelt |
|---|---|---|
| `Signal` | 1375 | `kind (String), value, payload` |
| `PlanAction` | 1390 | `actionType, suggestion, status (PENDING), agentName` |
| `AgentRun` | 1412 | `agentName, status (OK/ERROR), duration, output` |
| `Goal` | 1428 | `type, category: GoalCategory, targetValue/Date, status` |
| `Achievement` | 1452 | `kind (String), earnedAt`, `@@unique([userId,kind])` |
| `DrillChallenge` | 1685 | `ownerId, drillId?, startAt/endAt, status` |
| `ChallengeParticipant` | 1706 | `score, rank`, `@@unique([challengeId,userId])` |

- **Streak:** beregnes on-read (`streak.ts:9` `computeStreak()` over `TrainingPlanSessionLog`-datoer) — **ingen `streak`-kolonne**. Viz: `athletic/calendars/streak-calendar.tsx`.
- **Achievements:** hendelsesdrevet (`agents/achievement-agent.ts` — FIRST_ROUND/FIRST_TEST/SG_POSITIVE_30D/STREAK_7/14), trigges synkront fra `triggers.ts`. Katalog **hardkodet (5 kinds)**.
- **XP/nivå: finnes IKKE** (ingen xp/level/points-felt). Gamifisering = badges + streak + leaderboard.
- **Utfordringer:** fullt wiret spiller-mot-spiller CRUD (`portal/utfordringer/actions.ts` — opprett/bliMed/registrerScore/reberegnRanger/avslutt). **Ingen kobling mot pro-/PGA-data.**
- **Leaderboard** (`portal/mal/leaderboard`): `User`×`Round`(30d), snitt SG-total. Badges/volum/delta-rang er **plassholdere/TODO** (`:6-7`).
- `MasteryRing`/`StreakTracker` (de navnene): finnes ikke som komponenter.

### MANGLER / må bygges (Gamification)
1. **XP/nivå-system finnes ikke** (må bygges fra null hvis ønsket). 2. **Streak materialiseres ikke** (re-scan hver gang). 3. **Pro-benchmark-konkurranse ikke modellert** — PGA/DataGolf-tall finnes, men `DrillChallenge` har ingen «benchmark-motstander». 4. **Leaderboard delvis plassholder.** 5. **Achievement-katalog hardkodet** (ingen admin/tabell).

---

## 8 · Sanntid, jobber & ytelse

- **INGEN ekte sanntid (ingen Supabase Realtime).** Null `.channel(`/`postgres_changes`/`.subscribe(` i `src/`. «Live» = polling (`turneringer/live-refresher.tsx` `router.refresh()` hvert 120 s) eller lokale `setInterval`-klokker. AgencyOS `agencyos/live/mission-control.tsx` har en **fake** sync-animasjon (`useSyncTicker`, ingen ekte henting).
- **Cron:** ~23 jobber → én dispatcher `api/cron/[agent]/route.ts` (CRON_SECRET, `maxDuration=300`), `AGENTS`-map (`:29-58`). Bl.a. datagolf-sync (man 05:00), benchmark-sync (man 06:00), turneringer-live (**hvert 10. min**), notion-sync (hvert 5. min), sg-insights (04:00), meg-briefs. «Live»-turnering = 10-min batch.
- **Agent-trigging:** synkron, in-process, fire-and-forget (`agents/triggers.ts`, kommentar: kandidat for Inngest/Trigger.dev). **Ingen kø.** Agenter skriver `PlanAction (PENDING)` → coach godkjenner.
- **Webhook-retry** (`webhook-retry.ts`): feilede webhooks i `webhook_failures`, **ingen cron reprosesserer** (manuell). **Push:** ekte Web Push via VAPID (`push/send.ts`). SMS = placeholder.
- **Ytelse:** `unstable_cache` **0 bruk**; `revalidate` (ISR) på **43 sider**; `<Suspense>` **1 treff**; `take:` 257 (ofte hardt tak, ikke ekte paginering). **Tunge lister uten cursor:** `admin/stall/page.tsx:84` (`take: 400` + nestede relasjoner), `admin/agencyos/spillere/page.tsx:41` (`take: 200`). Ingen virtualisering.

### MANGLER / må bygges (Sanntid/ytelse)
1. **Ekte sanntid finnes ikke** (AgencyOS «kontrolltårn» er polling + fake animasjon — Supabase Realtime må bygges). 2. **Ingen jobb-kø** (treg agent = treg respons). 3. **Webhook-retry mangler scheduler.** 4. **Paginering mangler på coach-lister** (`stall` 400, `spillere` 200). 5. **Nær null streaming/request-cache** av tunge dashboards. 6. **Ingen virtualisering.**

---

## MANGLER / må bygges — samlet topp-liste (for designteamet)

1. **Slag → SG-kobling** (`Shot` mangler felt) — SG er manuell input i dag. *Blokkerer ekte diagnose-sløyfe.*
2. **`TrackManShot` fylles aldri** — rik bag-/dispersjon-/gapping-analyse er ferdig bygd men frakoblet. *Lavthengende, stor effekt.*
3. **Screenshot/vision-TrackMan-import** (MASTER §6) — finnes ikke (bilde-lagring + parse-endepunkt + validerings-UI mangler).
4. **A–K snittscore-nivå-stige + «neste nivå»-motor** — 0 kode (venter på 11 grenser fra Anders).
5. **Pro-persentil + «konkurrer mot proffene»-konkurranse** — pro-tall finnes i `PgaPlayerSeason`, men ingen persentil-modell/challenge-kobling.
6. **Anonym kohort med k-anonymitet** — kun aldersnivå-kohort finnes; ingen score/SG/HCP-bånd, ingen min-størrelse-gate.
7. **Bane-normalisering per runde** — CR/Slope ikke lagret per runde; formelen finnes kun i marketing-client.
8. **Tre SG-vokabular forenes** (`SgCategory`/`SkillArea`/`SGKategori`) + to drill-banker (`ExerciseDefinition`/`TrainingDrillV2`) før nytt nivå-system legges på.
9. **Frakoblede ferdige moduler kobles på:** `diagnostiserSg()` (krise), `analyzeSession()` (TrackMan-bag).
10. **Ytelse/sanntid:** paginering på coach-lister, ekte Realtime for kontrolltårn, jobb-kø, webhook-retry-scheduler.

---
*Kilder: 7 parallelle kodebase-kartlegginger 2026-06-21, alle fil:linje-bekreftet. Drill-bug-tall og benchmark-dekning bør re-verifiseres mot live DB med `npm run qa:drills`.*
