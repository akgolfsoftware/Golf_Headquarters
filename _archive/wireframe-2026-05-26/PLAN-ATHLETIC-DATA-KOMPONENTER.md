# Plan — Athletic data-komponenter

**Dato:** 2026-05-18
**Status:** PLAN — venter på Anders' OK
**Mål:** Bygge data-visualiserings-komponenter på toppen av Athletic kit-en, slik at vi har gjenbrukbare blokker for treningsfordeling, treningsanalyse, pyramide og treningsområder før vi starter å migrere ekte ruter.

---

## Hva som allerede er bygd

**Layout/UI (14 stk):** AthleticHero, Greeting, Eyebrow, PulseDot, Badge, Button, Avatar, KpiCard+Strip, FeaturedCard, AthleticCard, PyramidProgress, ActionList, QueueList, DayCal

**Kalendere (10 stk):** YearPlanGantt, MonthGrid, WeekGrid, DayPlanner, PeriodTimeline, SessionScheduler, HeatmapCalendar, StreakCalendar, LoadCalendar, CompareCalendar

---

## Datagrunnlag i appen (Prisma + enums)

### Taksonomi (allerede definert i `src/lib/labels/taxonomy.ts`)

| Enum | Verdier | Bruk |
|---|---|---|
| `PyramidArea` | FYS · TEK · SLAG · SPILL · TURN | 5-laget AK-pyramide |
| `SkillArea` | TEE_TOTAL · TILNAERMING · AROUND_GREEN · PUTTING · SPILL | SG-områder |
| `SgCategory` | OTT · APP · ARG · PUTT | Strokes Gained-kategorier |
| `LPhase` | GRUNN · SPESIAL · TURNERING | Periodiserings-faser |
| `LFase` | L_KROPP · L_ARM · L_KOLLE · L_BALL · L_AUTO | Mac O'Grady læringsfaser |
| `PracticeType` | BLOKK · RANDOM · KONKURRANSE · SPILL_TEST | Treningsmodus |
| `PressureLevel` | PR1 · PR2 · PR3 · PR4 · PR5 | Press-grad |
| `SessionEnvironment` | RANGE · BANE · STUDIO · HJEM · SIMULATOR | Treningssted |
| `InsightCategory` | DISTANCE_GAPPING · CONSISTENCY_LEAK · TRAINING_GAP · D_PLANE_DRIFT · STRIKE_QUALITY · FATIGUE_PATTERN · EQUIPMENT_FIT · TEMPO_VARIANCE · PROGRESSION_TREND · SAME_DISTANCE_OPPORTUNITY | AI-insikter |

### Hovedmodeller med data å visualisere

- **TrainingPlanSession + SessionDrill** — øktstruktur per uke/dag
- **Round + Shot** — slag-for-slag, hull-statistikk, scorecards
- **TrainingSessionV2 + DrillLogV2** — TrackMan-økter med drill-logger
- **SgBaseline + SgInsight** — baselines og AI-varsler per skillarea/klubb
- **ClubMetricTrend** — carry/smash/sidespin per kølle over tid
- **BestSessionReference** — beste-økt-anker per skillarea
- **ShotAnnotation** — manuelle notater per slag
- **WagrSnapshot + TournamentResult** — turneringsresultater
- **HealthEntry** — søvn, hvilepuls, vekt, RPE
- **TalentTracking** — talent-pipeline-data per spiller
- **Test + TestResult** — fysiske og tekniske tester

---

## 3 batcher, 24 komponenter

### Tier 1 — Mest brukt (10 komponenter, ~10 timer)

Disse trengs på PlayerHQ Hjem, Mål, Coach 360-profil og CoachHQ Hub.

| # | Komponent | Datakilde | Bruk |
|---|---|---|---|
| 1 | `PyramidDistribution` | TrainingPlanSession.area + duration | Donut: tid fordelt på FYS/TEK/SLAG/SPILL/TURN |
| 2 | `PyramidRadar` | TalentTracking + score per område | Radar/spider chart 5-akser, current vs goal |
| 3 | `SkillAreaBands` | Round.shotsByDistance, SgBaseline | Tabell: bånd (Tee, 200+, 175-200, ..., Putt) med SG og volum |
| 4 | `SgTrendLine` | Round.sg over tid | 4 linjer (OTT/APP/ARG/PUTT) med moving average |
| 5 | `HcpTrend` | TournamentResult.hcpAfter | Trend-graf med milepæler og prognose |
| 6 | `ClubMetricGrid` | ClubMetricTrend (siste) | Tabell: alle køller × carry/smash/sidespin/dispersion |
| 7 | `SgInsightCard` | SgInsight (alle 10 kategorier) | Athletic-card med ikon, severity og foreslått handling |
| 8 | `SessionVolumeChart` | TrainingPlanSession-aggregat | Stacked bar per uke: type × intensitet |
| 9 | `LPhaseDistribution` | TrainingPlanSession.lphase | 3-kolonne fordeling: GRUNN/SPESIAL/TURNERING |
| 10 | `PracticeTypeDistribution` | DrillLogV2.practiceType | 4-kolonne: BLOKK/RANDOM/KONKURRANSE/SPILL_TEST |

**Estimat:** 1 t per komponent + 1 t demo-side = **11 t**

### Tier 2 — Spesialisert (8 komponenter, ~8 timer)

Disse er for SG-Hub, talent-radar, periodiseringsagent og dyp analyse.

| # | Komponent | Datakilde | Bruk |
|---|---|---|---|
| 11 | `PyramidComparison` | 2 spillere/perioder | Side-om-side pyramide-bars med delta |
| 12 | `PyramidGoals` | TalentTracking.current + goal | Current vs goal per nivå med gap-indikator |
| 13 | `SameDistanceHeatmap` | Shot grouping per distansebånd | Heatmap distance × club med SG-fargekode |
| 14 | `ClubMetricTrendChart` | ClubMetricTrend per kølle | Multi-line graf for valgt kølle, alle metrics |
| 15 | `SgBaselineBand` | SgBaseline vs nyeste data | Horisontal bar: baseline (gray) vs nå (lime) per bånd |
| 16 | `BestSessionBenchmark` | BestSessionReference + nyeste | Bar-grupper: beste vs gjennomsnitt vs nå |
| 17 | `ShotMap` | Shot.lie + lateral + carry | Visuell course-view med shot-dispersion |
| 18 | `RoundScorecard` | Round.holes + Shot[] | Hull-for-hull: par/score/SG per hull |

**Estimat:** **8 t**

### Tier 3 — Avansert (6 komponenter, ~7 timer)

For coach-deep-dive, ekstern data og prestasjons-prognose.

| # | Komponent | Datakilde | Bruk |
|---|---|---|---|
| 19 | `CapacityRadar` | TestResult (fysiske + mentale) | Multi-aks radar: akselerasjon/balanse/rotasjon/etc |
| 20 | `TempoVariance` | DrillLogV2.tempo | Box-plot av tempo per økt med trend |
| 21 | `PressureProfile` | DrillLogV2.pressureLevel | Distribusjon PR1-PR5 + score per nivå |
| 22 | `WagrTrend` | WagrSnapshot | Rank-trend med peer-band |
| 23 | `HealthTrendStrip` | HealthEntry (søvn/hvilepuls/vekt/RPE) | Kompakt strip med 4 sparklines |
| 24 | `TournamentSchedule` | Tournament + TournamentEntry | Kommende turneringer med spillere |

**Estimat:** **7 t** (radar og box-plot er tyngst)

---

## Visualisering-strategi

| Type | Bibliotek | Hvorfor |
|---|---|---|
| Bars, stacks, donuts | Egen SVG/Tailwind | Vi har allerede mønster fra eksisterende komponenter |
| Linjer (trend) | `recharts` (allerede installert) | Brukes i analytics-v2 |
| Radar | `recharts` Radar | Allerede tilgjengelig |
| Heatmap | Egen SVG-grid | Vi har HeatmapCalendar som mal |
| Shot-map | Egen SVG | Custom geometri kreves |

Ingen nye dependencies trengs.

---

## Demo-strategi

Tre demo-sider, én per tier:

- `/design/athletic-kit/distribusjon` — fordelings-komponenter (Tier 1, 4 + 6 komponenter)
- `/design/athletic-kit/analyse` — analyse-komponenter (Tier 2 + 3)
- `/design/athletic-kit/områder` — skill-areas, SG-bånd, club-metrics

Hver demo bruker mocked data med samme struktur som ekte Prisma-models, så datakontrakten er låst før vi kobler på.

---

## Avhengigheter og rekkefølge

```
Tier 1 (10 komponenter)
   ↓
   Pilot: koble én komponent (f.eks. PyramidDistribution) til /portal/mal
   ↓
   Bekreft data-kontrakt og prop-API før vi bygger Tier 2
   ↓
Tier 2 (8 komponenter) — SG-Hub-fokus
   ↓
Tier 3 (6 komponenter) — coach-deep-dive
```

**Total estimat:** ~26 timer fokusert arbeid.

Med parallellisering og dummy-data kan Tier 1 leveres på én økt (4-5 t) og være klar for review samme dag.

---

## Spørsmål til Anders før start

1. **Pilot-data:** Skal jeg bruke mocked data, eller hente fra Prisma direkte i demoen? (Mocked er raskere, koblet er mer ærlig)
2. **Visuell prioritet:** Hvilke 3 komponenter ville du brukt mest selv? Vi bygger dem først.
3. **SG-bånd:** Bekreft at distansebåndene er: Tee · 200+ · 175-200 · 150-175 · 125-150 · 100-125 · 75-100 · 50-75 · 25-50 · 0-25 · Putt
4. **Tier 3:** Skal vi droppe noen? Tournament-schedule og Health-strip kan eventuelt bygges senere.

---

## Hva planen IKKE inkluderer

- Forms, modaler, drawers — det dekkes av eksisterende shadcn/ui
- 3D-visualiseringer (ball-flight, D-plane) — krever Three.js og 5x tiden
- Live-streaming-graf (TrackMan real-time) — krever websockets
- Eksport til PDF/Excel — egen feature
