# Periodiseringsagent — Spesifikasjon

> Sist oppdatert: 2026-05-10

## Formal

Periodiseringsagenten analyserer spillerdata og genererer en komplett aarsplan med periodiseringsblokker, treningsfordeling og konkrete ukeplaner. Agenten erstatter manuell periodisering og sikrer at alle spillere far en forskningsbasert, individuelt tilpasset treningsplan.

## Ansvarsomrade

1. **Analysere spillerdata** — HCP-historikk, treningsvolum, SG-data, testresultater, turneringskalender
2. **Generere periodiseringsplan** — aarsplan med periodeblokker (off-season, forberedelse, sesong, avslutning, taper)
3. **Tilpasse treningsfordeling** — FYS/TEK/SLAG/SPILL/TURN-fordeling per periode
4. **Foreslaa ukeplaner** — konkrete okter basert pa periodiseringsblokken
5. **Justere basert pa resultater** — endre plan nar data viser fremgang eller tilbakegang

## Norsk golfsesong — perioder

| Periode | Maaneder | Fokus |
|---------|----------|-------|
| Off-season | Nov–Mar | FYS (styrke, mobilitet), TEK (bevegelsesmonster), simulator |
| Forberedelse | Apr–Mai | TEK + SLAG (gradvis mer ball), overgang til utendors |
| Sesong | Jun–Sep | SLAG + SPILL + TURN (konkurransefokus, scoring) |
| Avslutning | Okt | Mental evaluering, nedjustering, planlegging neste sesong |
| Taper | 2–4 uker for turnering | SPILL + TURN + Mental (redusert FYS/TEK) |

---

## Input-data (Prisma-modeller)

### Primaerdata

| Kilde | Prisma-modell | Felter |
|-------|---------------|--------|
| Spillerprofil | `User` | `id`, `handicap`, `averageScore`, `ageYears`, `weeklyTrainingHours`, `playerType` |
| Spillerkategori | Beregnet via `getSkillLevelByScore()` | A–K kategori fra `skill-levels.ts` |
| HCP-historikk | `HandicapEntry` | `handicap`, `date` — trend over tid |
| Runder | `Round` + `RoundStats` | Score, FIR, GIR, putts per runde |
| SG-data | `StrokesGainedEntry` | `sgTotal`, `sgTee`, `sgApproach`, `sgAroundGreen`, `sgPutting` |
| Testresultater | `TestResult` | Fysiske tester, teknikktester, CS-data |
| Turneringskalender | `Tournament` + `PlayerTournamentPlan` | Turneringsdatoer, prioritet, registrering |
| Treningslogg | `TrainingLog` + `TrainingLogExercise` | Gjennomforte okter, varighet, omrade |
| Kølleprofil | `ClubSpeedProfile` + `ClubInBag` | Klubbhastigheter, carry-avstander |
| Hjemmebane | `HomeCourse` | Hullinformasjon for distance-bucket-beregning |

### Sekundaerdata (valgfritt, forbedrer kvalitet)

| Kilde | Prisma-modell | Felter |
|-------|---------------|--------|
| Maal | `Goal` | Spillerens egne maal for sesongen |
| Coaching-feedback | `CoachAgentSession` | Coaches tidligere kommentarer og planjusteringer |
| Eksisterende periodisering | `PeriodizationPeriod` | Tidligere periodiseringsblokker |
| Eksisterende plan | `TrainingPlan` + `TrainingPlanWeek` + `TrainingPlanSession` | Aktiv plan med pyramidfordeling |
| Allokering | `PlayerAllocation` | Tidligere allokeringsberegninger |

---

## Output-format

### Periodiseringsplan (JSON)

```json
{
  "playerId": "clx1234...",
  "season": 2026,
  "playerCategory": "E",
  "handicap": 12.4,
  "averageScore": 77,
  "weeklyHours": 12,
  "periods": [
    {
      "id": "per_001",
      "type": "off_season",
      "label": "Off-season",
      "startDate": "2025-11-01",
      "endDate": "2026-03-31",
      "weeks": 22,
      "distribution": {
        "FYS": 30,
        "TEK": 25,
        "SLAG": 15,
        "SPILL": 20,
        "TURN": 10
      },
      "focus": [
        "Styrkeprogram 3x/uke — fokus underkropp og rotasjonsstabilitet",
        "Teknikk i simulator (TrackMan) — L-KROPP til L-BALL",
        "Putting-teknikk pa innendors green"
      ],
      "weeklySessionCount": 5,
      "environment": ["M0", "M1", "M3"],
      "csTarget": "CS50-CS70",
      "pressLevel": "PR1-PR2"
    },
    {
      "id": "per_002",
      "type": "forberedelse",
      "label": "Forberedelse",
      "startDate": "2026-04-01",
      "endDate": "2026-05-31",
      "weeks": 9,
      "distribution": {
        "FYS": 15,
        "TEK": 30,
        "SLAG": 25,
        "SPILL": 20,
        "TURN": 10
      },
      "focus": [
        "Overgang fra simulator til utendors range",
        "Full-swing automatisering (L-AUTO) med gradvis CS-okning",
        "Innspill 100-200m — distansekontroll"
      ],
      "weeklySessionCount": 5,
      "environment": ["M1", "M2", "M3"],
      "csTarget": "CS60-CS80",
      "pressLevel": "PR2-PR3"
    },
    {
      "id": "per_003",
      "type": "sesong",
      "label": "Sesong",
      "startDate": "2026-06-01",
      "endDate": "2026-09-30",
      "weeks": 17,
      "distribution": {
        "FYS": 10,
        "TEK": 10,
        "SLAG": 30,
        "SPILL": 30,
        "TURN": 20
      },
      "focus": [
        "Scoring-fokus — treningsrunder og turnering",
        "Naerspill og putting under press (PR3-PR5)",
        "Banestrategi og mental forberedelse for turneringer"
      ],
      "weeklySessionCount": 6,
      "environment": ["M2", "M3", "M4", "M5"],
      "csTarget": "CS80-CS100",
      "pressLevel": "PR3-PR5"
    },
    {
      "id": "per_004",
      "type": "avslutning",
      "label": "Avslutning",
      "startDate": "2026-10-01",
      "endDate": "2026-10-31",
      "weeks": 4,
      "distribution": {
        "FYS": 15,
        "TEK": 15,
        "SLAG": 20,
        "SPILL": 25,
        "TURN": 25
      },
      "focus": [
        "Sesongevaluering — hva fungerte, hva ma endres",
        "Mentalt vedlikehold — avslutte med positivt fokus",
        "Planlegging av off-season maal"
      ],
      "weeklySessionCount": 4,
      "environment": ["M2", "M3", "M4"],
      "csTarget": "CS70-CS90",
      "pressLevel": "PR2-PR3"
    }
  ],
  "taperBlocks": [
    {
      "tournamentId": "tourn_001",
      "tournamentName": "Srixon Tour Runde 3",
      "startDate": "2026-07-14",
      "endDate": "2026-07-27",
      "weeks": 2,
      "distribution": {
        "FYS": 5,
        "TEK": 5,
        "SLAG": 25,
        "SPILL": 35,
        "TURN": 30
      },
      "focus": [
        "Redusert treningsvolum — kvalitet over kvantitet",
        "Banegjennomgang og strategiplan",
        "Mental forberedelse — rutiner og visualisering"
      ]
    }
  ],
  "weeklyDistribution": {
    "off_season": { "FYS": 30, "TEK": 25, "SLAG": 15, "SPILL": 20, "TURN": 10 },
    "forberedelse": { "FYS": 15, "TEK": 30, "SLAG": 25, "SPILL": 20, "TURN": 10 },
    "sesong": { "FYS": 10, "TEK": 10, "SLAG": 30, "SPILL": 30, "TURN": 20 },
    "avslutning": { "FYS": 15, "TEK": 15, "SLAG": 20, "SPILL": 25, "TURN": 25 },
    "taper": { "FYS": 5, "TEK": 5, "SLAG": 25, "SPILL": 35, "TURN": 30 }
  },
  "rationale": "Spilleren er kategori E (Regional U18) med HCP 12.4 og snitt 77. SG-data viser svakhet pa approach (SG -1.2). Forberedelsesfasen vektlegger teknikk og innspill 100-200m. Tre prioriterte turneringer i juni-august gir taper-blokker. Off-season har hoyt FYS-fokus for a bygge fysisk fundament for neste sesong.",
  "adjustmentTriggers": [
    "Hvis HCP synker >2 slag i forberedelsesperioden: flytt sesongstart 2 uker frem",
    "Hvis SG approach forbedres til >0 i sesong: redistribuer 5pp fra SLAG til SPILL",
    "Hvis spilleren ikke gjennomforer >70% av planlagte okter i 3 uker: reduser ukentlige okter med 1"
  ]
}
```

---

## Beslutningslogikk

### 1. Periodevalg

Perioder folger norsk golfsesong (SEASON_BY_MONTH fra `formulas.ts`):
- **Jan–Mar:** off_season
- **Apr–Mai:** forberedelse
- **Jun–Sep:** sesong
- **Okt:** avslutning
- **Nov–Des:** off_season

Perioder justeres basert pa:
- Spillerkategori (A–K): Elite-spillere (A–C) har lengre sesong (mai–okt) og kortere off-season
- Turneringskalender: Taper-blokker (2–4 uker) legges inn automatisk for prioriterte turneringer
- Geografisk: Spillere med tilgang til innendors fasiliteter far justert off-season-innhold

### 2. Fordelingsberegning (FYS/TEK/SLAG/SPILL/TURN)

Basert pa eksisterende allokeringsmotor (`lib/portal/allocation/engine.ts`):

1. **Baseline** fra HCP-bucket (`HCP_BASELINE_ALLOCATION`)
2. **Svakhets-skew** (+15pp til svakeste omrade fra SG-data)
3. **Fase-multiplikator** (`PHASE_MULTIPLIERS`) per periode
4. **Normalisering** til sum = 100%

AK-pyramide-mapping:
| Pyramide (ak-taxonomy) | Allokeringsomrade |
|------------------------|-------------------|
| FYS | fysisk |
| TEK | teknikk |
| SLAG | slag (fordelt pa TEE, INN200, INN150, INN100, INN50) |
| SPILL | spill (fordelt pa putting, chipping, bunker, banetrening) |
| TURN | mental |

### 3. Ukeplan-generering

For hver uke i en periode:
1. Beregn antall okter basert pa `weeklyTrainingHours` og kategori (`trainingVolumeSummer`/`trainingVolumeWinter`)
2. Fordel okter pa dager (roterende malnster: man/ons/fre/lor som default)
3. Tildel fokusomrade per okt basert pa %-fordeling
4. Match ovelser fra `ExerciseDefinition`-tabellen
5. Sett L-fase, CS-niva, M-miljo og PR-press basert pa periode og spillerniva

### 4. Justeringstriggers

Agenten foreslaar justeringer nar:
- HCP endres >2 slag (opp eller ned) over 4 uker
- SG i et omrade endres >0.5 over 8 runder
- Gjennomforingsgrad faller under 70% i 3 sammenhengende uker
- Ny turnering legges til kalenderen
- Testresultater viser signifikant endring i fysiske parametere
- Coach gir feedback som krever planendring

---

## Integrasjon med eksisterende plan-generator

Periodiseringsagenten erstatter IKKE `plan-generator.ts` — den **orkestrerer** den:

```
Periodiseringsagent
  |
  +--> Genererer PeriodizationPeriod-rader (aarsplan)
  |
  +--> For HVER periode:
  |      +--> Kaller computeAllocation() med periode-spesifikke parametere
  |      +--> Kaller generatePlan() for a opprette TrainingPlan + uker + okter
  |
  +--> Lagrer taper-blokker som egne PeriodizationPeriod-rader
  |
  +--> Returnerer komplett periodiseringsplan med rationale
```

### Dataflyt

1. Agent mottar `PeriodizationInput` (spiller-ID + sesong)
2. Agent henter all spillerdata fra Supabase via SQL
3. Agent analyserer data og bygger periodiseringsplan
4. Agent returnerer `PeriodizationOutput` som JSON
5. Backend-kode oppretter DB-rader via Prisma:
   - `PeriodizationPeriod` — en rad per periode
   - `TrainingPlan` — en plan per periode, koblet til `periodizationPeriodId`
   - `TrainingPlanWeek` + `TrainingPlanSession` — konkrete uker og okter
   - `PlayerAllocation` — allokeringsdata for sporbarhet

---

## Eksempel: Input og Output

### Input

```json
{
  "playerId": "clx1234abcdef",
  "season": 2026,
  "playerData": {
    "handicap": 12.4,
    "averageScore": 77,
    "category": "E",
    "age": 17,
    "weeklyTrainingHours": 12,
    "playerType": "COMPETITIVE"
  },
  "sgData": {
    "tee": 0.3,
    "approach": -1.2,
    "aroundGreen": 0.1,
    "putting": -0.4,
    "samples": 18
  },
  "tournaments": [
    { "name": "Srixon Tour R3", "date": "2026-07-28", "importance": 3 },
    { "name": "Jr NM", "date": "2026-08-15", "importance": 5 },
    { "name": "Ostlandstour finale", "date": "2026-09-12", "importance": 4 }
  ],
  "trainingLog": {
    "last12WeeksAvgHours": 10.5,
    "completionRate": 0.78,
    "mostTrainedArea": "TEK",
    "leastTrainedArea": "FYS"
  },
  "testResults": {
    "latestClubSpeed": { "driver": 98, "iron7": 78 },
    "latestPhysical": { "rotationSpeed": "above_avg", "mobilityScore": 72 }
  }
}
```

### Output (forkortet)

Se fullstendig JSON-struktur under "Output-format" over. Nøkkelbeslutninger i dette eksempelet:

- **Approach er svakeste SG-omrade** (-1.2): Forberedelsesperioden far +15pp pa SLAG med fokus pa innspill 100-200m
- **3 prioriterte turneringer**: Automatiske taper-blokker 2 uker for hver
- **FYS undertrent** (minst trent omrade): Off-season far ekstra FYS-vekt (30%)
- **Kategori E, 17 ar**: 12-15 timer/uke anbefalt (sommer), justert fra spillerens 12 timer
- **Gjennomforingsgrad 78%**: Ingen justering nodvendig (over 70%-grensen)
