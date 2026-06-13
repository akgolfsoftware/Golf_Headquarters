# Verdensledende golf-treningsapp — plan & analyse (13. juni 2026)

> **Oppdrag (Anders):** Komplett plan + analyse av hvilke data/funksjoner vi har, og hvordan vi bruker
> og videreutvikler appen til å bli en **verdensledende treningsapp for golf**. Inkluderer en NY
> analysefunksjon for trening til spilleren, «på lik linje med Workbench».
>
> Kodeverifisert av parallelle agenter 13. juni (fil+linje) + konkurrent-benchmark (web). Designsystem
> LÅST. Ingen kodeendringer her. Søster-dokumenter: `agencyos-kontrolltarn-plan-2026-06-13.md`,
> `forenklingsplan-2026-06-13.md`.

---

## 0. Kjernekonklusjon

**Vi eier allerede de to tingene ingen konkurrent har.** Benchmark mot Arccos, Shot Scope, DECADE,
TrackMan, CoachNow, Skillest, Sportsbox, GolfForever viser at hver app eier ÉN søyle (data / strategi /
teknikk / fys / coach-relasjon) — **ingen forener dem, og ingen lukker loopen mellom trening og
resultat.** AK har:
1. **Strokes Gained kalibrert mot Team Norway IUP + Broadie** (`lib/domain/sg.ts:14`) — ikke generisk.
2. **AK-pyramide + L-faser + CS + Mac O'Grady-fundament** — en periodiserings-metodikk **ingen app har bygget inn**.
3. **Ekte coach→spiller-loop** (Workbench delt kjerne + `PlanEffectiveness`).

**Den raskeste veien til verdensledende er IKKE ny kjernelogikk — det er å koble sammen det som
allerede er bygd, men frakoblet, og gjøre loopen «trening → resultat → ny trening» synlig.** Den dypeste
infrastrukturen finnes (se §3), men ligger ubrukt.

---

## 1. Vårt unike fortrinn (moaten) — verifisert i kode

| Fortrinn | Hvor | Hvorfor det er sjeldent |
|---|---|---|
| SG kalibrert mot Team Norway + Broadie | `lib/domain/sg.ts`, 168/168 tester | Konkurrenter bruker generisk SG |
| AK-pyramide (FYS/TEK/SLAG/SPILL/TURN) gjennomgående | `lib/domain/pyramid-weighting.ts`, `pyramide.ts` | Ingen app periodiserer på pyramide |
| L-faser + CS-nivå + P-system (MORAD) på hver drill/posisjon | `ExerciseDefinition`, `PositionTask` | Mac O'Grady operasjonalisert i data |
| Closed-loop «virket planen?» | `lib/domain/plan-effectiveness.ts` (`PlanEffectiveness`) | Selvhjelps-apper har ikke coach-loop |
| SG↔trening-korrelasjon (årsak-virkning) | `lib/sg-scatter/compute.ts` (OLS, R², konfidensbånd) | **Ingen konkurrent har dette** |
| DECADE/Tiger Five strategimotor | `lib/tiger-five.ts` | DECADE selger dette alene for 325 $/år |
| Multi-source turnering + NGF-kategori A-L | DataGolf+GolfBox+GJGT+WAGR | Norsk junior→elite-pipeline |

---

## 2. Markedsbildet — hvor vi kan LEDE vs hva som er bordstandard

**Bordstandard (må ha, ellers virker appen umoden):** SG per kategori ✅ (vi har, kalibrert) · video-
analyse m/ annotering+side-ved-side+voiceover ⚠️ (delvis — `ShotAnnotation` finnes, ikke som flate) ·
auto/halvauto on-course shot-capture ⚠️ (svak — manuell/TrackMan) · GPS/banekart · kølle-gapping ⚠️ ·
engasjement/etterlevelse-varsling for coach ⚠️.

**Lede-hull (ingen gjør godt — midt i AK sin DNA):**
- **A. SG↔trening-attribusjon** («hva flyttet nålen») — ingen lukker loopen tilbake til hvilken trening som flyttet SG. **Vi har motoren.**
- **B. Strukturert periodisering/pyramide** — ingen app har en golf-periodiseringsmodell. **Vi har den.**
- **C. Coach→spiller-plan som propagerer** — Workbench («én delt kjerne») er arkitektonisk foran CoachNow/Skillest.
- **D. Live remote økt-logging med rep-kategorier** — gapet mellom TrackMan (fasilitet) og CoachNow (asynkron). **= AgencyOS-kontrolltårn-planen.**
- **E. Én flate som forener data+teknikk+fys+strategi+coach** — pyramiden ER foreningen.

---

## 3. Data & funksjoner — det underutnyttede gullet (raskest hevarm)

Den dypeste infrastrukturen er **bygget men frakoblet**. Å koble den = raskeste vei fra «rik datamodell» til «verdensledende», uten ny kjernelogikk:

| Gull (bygget, frakoblet) | Status i kode | Potensial |
|---|---|---|
| **`Treningsanalyse`-komponent + loader** | Ferdig, **ikke montert** (`components/portal/analyse/treningsanalyse.tsx`, `lib/portal-analyse/treningsanalyse-data.ts`) | **= den nye funksjonen du vil ha (§4)** |
| **5 nye AI-agenter** (daily-brief, sg-interpretation, performance-peaking, plan-revision, vinn-tilbake) | Kode+tester finnes, **ikke i cron-dispatcher** (`api/cron/[agent]`) | Daglig SG-tolkning, plan-revisjon, vinn-tilbake genereres aldri |
| **`TrackManShot`-tabell** (strukturert per-slag TM: strikePattern, attackAngle, faceToPath, spinAxis) | **Aldri opprettet/spurt** — all TM leser `rawJson` ad hoc | Gjør de 15 sg-hub-modulene query-bare + trendbare + koblet til teknisk plan |
| **`PositionTaskTmGoal` HIT_RATE-motor** (8/10 slag innenfor ±2° — rolling/streak/best-of-N) | 1 fil | Presis closed-loop teknisk-verifisering ingen app har |
| **`PlanSuggestion` + `TechnicalPlanClubTarget`** | **0 query-filer** | AI-plan-forslag m/ evidence — modellert, aldri vist |
| **`PlanEffectiveness`** (pre/post SG-delta per plan) | Beregnet, **ikke vist spilleren** | «Virket forrige plan?» |
| **`SgTrainingScatter`/compute.ts** | Kun i SG-hub | «Hva flyttet nålen» — burde være kjerne i hver rapport |
| **Helse-data i to siloer** | `HealthEntry` (tynn) + `me_health` (isolert i Meg-Supabase) | Bind søvn/HRV → CS-progresjon/`MULIG_SKADE`-flagg + readiness-dosering |
| **Rep-kvalitet** (`DrillLogV2.successRate`, `TrainingLog.quality`, `TrainingPlanSessionLog.rating/csAchieved`) | Logges, **ikke analysert for spiller** | «Ble øktene gode?»-trend |
| **Sosialt** (`Friendship` 1 fil, `DrillChallenge`, `Achievement`) | Modellert, tynt | Retention/engasjement |

---

## 4. NY FUNKSJON: «Treningsspeilet» — spillerens trenings-analyse på lik linje med Workbench

**Mønsteret å speile (fra Workbench):** Workbench er sentral fordi den er **én komponent + én loader,
rolle-parametrisert, som projiserer ÉN datakjerne (planlagte økter) i flere vinkler med sidebar-
kontekst** (`workbench.tsx:104`, `load-workbench.ts:144`). Treningsspeilet bygges likt: **én loader →
én flat økt-logg → flere vinkler + rolle-paritet (spiller/coach).**

**Hva Workbench er for PLANLEGGING, er Treningsspeilet for ANALYSE av gjennomført trening.**

**Startpunkt (drop-off):** monter den ferdige, ubrukte `Treningsanalyse`-komponenten som ny fane
«Trening» i `/portal/analysere` — den dekomponerer allerede treningen på 4 akser (Pyramide / Område /
SG-kategori / Økt-type) live fra en flat økt-logg. Lavest henging, høyest verdi.

**Vinklene (alle på data vi HAR):**
1. **Hvor går tiden vs hvor tapes slagene** — pyramide/område/SG-kategori/økt-type (orphan har dette). Den visuelle broen mellom «hva jeg trener» og «hvor jeg taper slag».
2. **Plan-etterlevelse over tid** — faktisk vs planlagt (`TrainingPlanSession.status` + `TrainingPlanSessionLog.completedAt`); utvid `get-week-progress` fra 7 d til trend.
3. **Rep-kvalitet-trend** — `DrillLogV2.successRate` + `TrainingLog.quality` + `csAchieved` per akse/uke.
4. **«Hva flyttet nålen»** — løft `SgTrainingScatter` hit (trening→SG 90 d, R²+konfidensbånd). Vår signatur.
5. **«Virket forrige plan?»** — `PlanEffectiveness` (pre/post SG-delta + completion).
6. **CS-progresjon (ekte)** — `cs-progression.ts` mot `csAchieved`/TrackMan; erstatt hardkodet demo.
7. **Mot mål / forrige periode** — `Goal` + periode-sammenligning.

**Rolle-paritet:** samme loader tar `userId` → **coach ser spillerens Treningsspeilet** (kobler rett inn
i AgencyOS-kontrolltårnet + gruppe-roster). Akkurat som `loadWorkbenchData`.

**Datagrunnlag:** ingen schema-endring nødvendig (unntak: union de to log-kildene `TrainingPlanSession`
+ `TrainingLog` + `TrainingSessionV2` til én flat logg så volum-tall ikke spriker). FYS-referanseverdier
forblir plassholder (låst beslutning).

**Omfang:** M (monter orphan + 2 nye vinkler) → L (full 7-vinkel rolle-paritet).

---

## 5. Andre funksjoner du trenger — rangert veikart

### Fase 1 — Lukk loopen (lede-funksjonene, raskest hevarm: koble det bygde)
1. **Treningsspeilet** (§4) — monter orphan + SG↔trening + plan-etterlevelse. **[M]**
2. **Koble de 5 AI-agentene til cron-dispatcheren** → daglig SG-tolkning + plan-revisjon + vinn-tilbake genereres automatisk. **[S–M]**
3. **Vis `PlanEffectiveness`** («virket planen?») på spiller + coach. **[S]**
4. **AgencyOS live-kontrolltårn** (egen plan): se hvem er live + in-session-comms. **[L]**

### Fase 2 — Tette bordstandard (så appen ikke virker umoden)
5. **Video-analyse-flate** m/ annotering + side-ved-side + voiceover (`ShotAnnotation` finnes som datalag — mangler flate). **[M–L]**
6. **Halvauto on-course shot-capture** (kølle-tagging eller telefon) så SG fylles uten manuell jobb. **[L]**
7. **GPS/banekart + kølle-gapping** («my bag»-distanser fra TrackMan/Shot). **[M]**
8. **Etterlevelse-varsling for coach** (plan-drevet, ikke bare «så video») — bygger på `training-gap`-cron. **[S]**

### Fase 3 — Dybde-differensiering (gjør «bygget» til «ledende»)
9. **Fyll `TrackManShot`-tabellen** fra rawJson → gjør de 15 sg-hub-modulene query-bare/trendbare. **[M]**
10. **`PositionTaskTmGoal` HIT_RATE-motor i UI** — «8/10 innenfor ±2°»-teknisk verifisering. **[M]**
11. **AI-caddie forankret i spillerens egen SG + coachens plan** (ikke generisk). **[M]**
12. **Helse-kobling:** union `HealthEntry` + `me_health` → readiness-dosering + skadeflagg. **[M]**

### Fase 4 — Retention/engasjement
13. Achievements + utfordringer + venn-graf (modellert, tynt) + streaks. **[M]**
14. 3D-biomekanikk fra telefon (Sportsbox-paritet) koblet til pyramidens teknikk-søyle. **[L, vurder integrasjon]**

---

## 6. Claude Design-prompter

Lagres i `My Drive/AK Golf Group/prompt/playerhq/playerhq-prompts.md` (Treningsspeilet) + agencyos-doc
(kontrolltårn, allerede seksjon 8). Treningsspeilet-prompten: lyst tema, ny «Trening»-fane i Analysere,
7 vinkler over, mønster speilet fra Workbench, lime kun på primær-innsikt, eksisterende tokens.

---

## 7. Åpne spørsmål
1. **Treningsspeilet vinkel-rekkefølge:** OK at v1 = monter orphan (4-akse-dekomponering) + «Hva flyttet nålen» + plan-etterlevelse, resten i v2?
2. **On-course capture (Fase 2-6):** vil du investere i maskinvare-vei (kølle-tagging à la Arccos/Shot Scope) eller telefon-basert? Stor strategisk/kostnads-beslutning.
3. **Video-analyse:** bygge eget (på `ShotAnnotation`) eller integrere (CoachNow/V1-stil)?
4. **3D-biomekanikk:** eget eller Sportsbox-integrasjon? (Fase 4.)

*Kilder: kodeverifisert 13. juni (fil+linje over) + konkurrent-benchmark (Arccos, Shot Scope, DECADE, TrackMan, CoachNow, Skillest, Sportsbox, GolfForever — web).*
