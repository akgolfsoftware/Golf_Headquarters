# Workbench-utviklingsplan — Player + Coach (individuelt + gruppe)

**Opprettet:** 2026-05-25 kveld
**Mål:** Detaljert plan for å bygge ut Workbench-en til verdens beste treningsplanlegger for golf.

---

## Premiss

Plattformen har 3 workbench-kontekster, hver med distinkt design:

| Kontekst | Rute | Bruker | Fokus |
|---|---|---|---|
| **Player Workbench** | `/portal` | Spilleren | Sin egen dag — utfør, ikke planlegg |
| **Coach Workbench (individuelt)** | `/admin/agencyos?spiller=X` | Coach | Én spiller, dypde |
| **Coach Workbench (gruppe)** | `/admin/agencyos?gruppe=Y` | Coach | Mange spillere, oversikt |

**Bytte mellom modus:** Coach kan toggle mellom individuelt og gruppe-modus, eller velge spiller/gruppe i top-bar.

---

# DEL 1 — Player Workbench (`/portal`)

## 1.1 Informasjons-arkitektur

```
┌─────────────────────────────────────────────────────────┐
│ HERO                                                     │
│ Avatar + Navn + nivå (A1) + HCP + neste turnering       │
│ Energi/HRV/søvn (når wearable koblet)                   │
├─────────────────────────────────────────────────────────┤
│ I DAG — horisontal kalender (06-24)                      │
│ Fargekodede økt-blokker (FYS/TEK/SLAG/SPILL/TURN)       │
│ "NÅ"-marker + hover-popover                              │
├─────────────────────────────────────────────────────────┤
│ AI-INNSIKT (3 kort)                                      │
│ Caddie foreslår: en handling + en observasjon + ett mål │
├─────────────────────────────────────────────────────────┤
│ UKAS FREMGANG                                            │
│ Pyramide-vekting (faktisk vs ideal)                      │
│ + Sammendrag av uka (sett, drillsr, runder, tester)     │
├─────────────────────────────────────────────────────────┤
│ SNARVEIER (4-6 store knapper)                            │
│ Logg runde · Start økt · Ny booking · Last opp video    │
├─────────────────────────────────────────────────────────┤
│ TRENINGSKOMPISER (om noen)                               │
│ Hvem trener jeg sammen med denne uka                    │
├─────────────────────────────────────────────────────────┤
│ NESTE TURNERING                                          │
│ Countdown + forberedelse-status                          │
└─────────────────────────────────────────────────────────┘
```

## 1.2 Komponenter å bygge/oppgradere

### Eksisterende — beholdes
- `PlayerHero` (avatar + navn + KPI) — ✅ allerede bra
- `WorkbenchShell` — ✅ rammen er klar

### Eksisterende — oppgraderes
- **"Dagens fokus"** → erstattes med **Kalender-widget** (per hand-off bundle)
- Snarvei-knapper → utvides til 6 store touch-vennlige knapper

### Nye komponenter
1. **`CalendarWidget`** — horisontal dag-kalender (05-24) med øktblokker
2. **`AiInsightsRow`** — 3 kort med Caddie-anbefalinger
3. **`WeekProgressCard`** — pyramide-vekting + ukens snitt
4. **`TrainingPartnersRow`** — kompiser jeg trener med
5. **`NextTournamentCountdown`** — turnering-countdown + status
6. **`WellnessIndicators`** — HRV/søvn/energi (når wearable koblet)

## 1.3 Data-kilder

| Komponent | Data fra |
|---|---|
| Hero KPI | `prisma.user`, `prisma.round.findMany` (HCP-trend), `Wearable` (HRV) |
| Kalender | `prisma.trainingSession.findMany` (denne dagen) |
| AI-Innsikt | `src/lib/ai/agents/caddie.ts` (Caddie-prompt) |
| Pyramide-vekting | `prisma.trainingSession` (uka) + `lib/domain/pyramid-weighting.ts` |
| Snarveier | Statiske ruter |
| Treningskompiser | `prisma.sessionParticipant` (etter trene-sammen-feature) |
| Neste turnering | `prisma.tournamentParticipation` |

## 1.4 Mobile vs Desktop

**iPhone (393×852) — KRITISK for utførelse:**
- Stack alt vertikalt
- Kalender-widget full bredde, dag-fokus
- Snarveier som 2×3 grid
- Store knapper (min 56px touch)
- Sticky "Start økt"-knapp i bunn

**iPad (810-1180):**
- 2-kolonne layout: kalender + AI-Innsikt venstre, Snarveier + Fremgang høyre
- Mer plass til mini-grafer

**Desktop (1440+):**
- 3-kolonne layout
- Mer detaljer i hver seksjon
- Sidebar med hurtignavigering

## 1.5 Implementerings-rekkefølge

**Fase 1 (2-3 timer):** Kalender-widget + AI-Innsikt
**Fase 2 (1-2 timer):** WeekProgressCard + snarveier-utvidelse
**Fase 3 (1-2 timer):** Treningskompiser + NextTournamentCountdown (krever trene-sammen-feature)
**Fase 4 (1 time):** WellnessIndicators (skjelett — krever wearable-integrasjon)

**Total: 5-8 timer** for komplett Player Workbench v2.

---

# DEL 2 — Coach Workbench, INDIVIDUELT (`/admin/agencyos?spiller=X`)

## 2.1 Informasjons-arkitektur

```
┌──────────────────────────────────────────────────────────┐
│ TOP-BAR                                                   │
│ [← Tilbake til oversikt]  Spiller: [Markus R.P. ▼]      │
│ [Individuelt | Gruppe]-toggle                            │
├──────────────────────────────────────────────────────────┤
│ SPILLER-HERO                                              │
│ Avatar + Navn + HCP-trend (+0.3 ↗) + neste turnering    │
│ "Send melding" + "Ny økt" + "Generer plan"-CTAs          │
├──────────────────────────────────────────────────────────┤
│ KEY METRICS (4 kort)                                      │
│ SG-Total · Plan-adherence · Tester (overdue) · Mål       │
├──────────────────────────────────────────────────────────┤
│ AI-CADDIE-CHAT (med kontekst om spilleren)                │
│ "Hvilke drills bør Markus jobbe med?"                    │
│ [chat-input som auto-vet hvem som er valgt]              │
├──────────────────────────────────────────────────────────┤
│ TABS (5 stk)                                              │
│ [I dag] [Plan] [Analyse] [Coach-notater] [Kommunikasjon]│
├──────────────────────────────────────────────────────────┤
│ TAB-INNHOLD                                               │
│ (varierer)                                                │
└──────────────────────────────────────────────────────────┘
```

## 2.2 Tab-innhold detaljert

### Tab: I dag
- Dagens økter for spilleren (kalender-strip)
- Status: Booket / Ikke gjennomført / Fullført
- Quick-action: "Forslag drill" / "Avlys"

### Tab: Plan
- Aktiv treningsplan (uker, økter, drills)
- Plan-adherence-graf (siste 4 uker)
- "Generer ny plan"-CTA (AI-plan-agent)
- Plan-vs-actual-grunnlag

### Tab: Analyse
- HCP-utvikling-graf (12 mnd)
- SG-radar (4 kategorier)
- Pyramide-fordeling (siste 30 dager)
- Test-resultater + benchmark
- TrackMan-snitt + trender

### Tab: Coach-notater
- Notater coach har skrevet om spilleren (privat)
- Quick-add note
- Søk i notater

### Tab: Kommunikasjon
- Meldings-historikk med spilleren
- Spørsmål spilleren har stilt
- Pågående samtaler

## 2.3 Komponenter

### Nye komponenter
1. **`CoachWorkbenchTopBar`** — spillervelger + modus-toggle
2. **`CoachSpillerHero`** — avatar + HCP-trend + actions
3. **`CoachKeyMetrics`** — 4-kort KPI-rad
4. **`CoachCaddieChat`** — kontekstuell chat (vet om valgt spiller)
5. **`CoachTabs`** — 5-tabs router-state
6. **`CoachIdagPanel`** — dag-økter for spilleren
7. **`CoachPlanPanel`** — plan-detalj + adherence
8. **`CoachAnalysePanel`** — HCP + SG + pyramide
9. **`CoachNotaterPanel`** — privat notat-system
10. **`CoachKommunikasjonPanel`** — melding-historikk

## 2.4 Data-kilder

| Komponent | Data fra |
|---|---|
| Spillervelger | `prisma.user.findMany({ where: { coach: { id: coachId } } })` |
| Key Metrics | `lib/domain/sg.ts` + plan-adherence-beregning + tester |
| Caddie-chat | `src/lib/ai/agents/caddie.ts` med spiller-context |
| Plan | `prisma.trainingPlan.findFirst({ active: true })` |
| Analyse | `prisma.round`, `lib/domain/*` |
| Coach-notater | `prisma.coachingSession` (eksisterende) |
| Kommunikasjon | `prisma.message` (sjekk om finnes) |

## 2.5 Implementerings-rekkefølge

**Fase A (3-4 timer):** Top-bar + Hero + Key Metrics
**Fase B (2-3 timer):** Caddie-chat med spiller-kontekst (utvider eksisterende AI foundation)
**Fase C (3-4 timer):** 5 tabs implementert
**Fase D (1-2 timer):** Mobile-tilpasning (selv om Coach-side er desktop-først)

**Total: 9-13 timer** for komplett Coach Workbench individuelt.

---

# DEL 3 — Coach Workbench, GRUPPE (`/admin/agencyos?gruppe=Y`)

## 3.1 Informasjons-arkitektur

```
┌──────────────────────────────────────────────────────────┐
│ TOP-BAR                                                   │
│ [← Tilbake]  Gruppe: [WANG U16 ▼]                       │
│ [Individuelt | Gruppe]-toggle                            │
├──────────────────────────────────────────────────────────┤
│ GRUPPE-HERO                                               │
│ Gruppenavn + antall spillere + neste samling             │
│ "Ny samling" + "Send melding til alle"-CTAs              │
├──────────────────────────────────────────────────────────┤
│ DAGENS BRIEF (AI-generert)                                │
│ "3 spillere har økter i dag. 1 mangler bekreftelse.     │
│  Markus fullførte TEK-økt med SG-OTT -0.4. Sofie..."    │
├──────────────────────────────────────────────────────────┤
│ STALL-PYRAMIDE (snitt for gruppen)                        │
│ Visualisering av FYS/TEK/SLAG/SPILL/TURN-fordeling       │
│ Trend siste 30d                                          │
├──────────────────────────────────────────────────────────┤
│ AKTIVE FLAGG (3-5)                                        │
│ • Markus R.P.: SG-PUTT -1.6 (akutt)                     │
│ • Tobias: Sleep 5.8t/natt (↓)                            │
│ • Sofie: HRV-fall 14% denne uka                          │
├──────────────────────────────────────────────────────────┤
│ SPILLERENS UKA (radliste, 1 rad per spiller)             │
│ Avatar | Navn | Status | Plan-progresjon | Siste runde  │
├──────────────────────────────────────────────────────────┤
│ KOMMENDE GRUPPE-ØKTER                                     │
│ Kalender med samlinger + felles trening                  │
├──────────────────────────────────────────────────────────┤
│ LAG-RESULTATER                                            │
│ Snitt HCP-utvikling, SG-trend, deltakelse                │
└──────────────────────────────────────────────────────────┘
```

## 3.2 Komponenter

### Nye komponenter
1. **`CoachGruppeHero`** — gruppenavn + actions
2. **`DagligBrief`** — AI-generert brief (allerede planlagt fra AI-trenings-plan)
3. **`StallPyramide`** — 5-akse snittvisualisering
4. **`AktiveFlagg`** — 3-5 viktigste insights
5. **`SpillerensUkaListe`** — radliste med status per spiller
6. **`GruppeOkterKalender`** — kommende samlinger + felles trening
7. **`LagResultater`** — snitt-utvikling

### Eksisterende — gjenbruk
- `PyramidMini` fra hubs-bundle
- `StatusBadge` for flagg
- `AthleticBadge`

## 3.3 Data-kilder

| Komponent | Data fra |
|---|---|
| Gruppevelger | `prisma.group.findMany({ where: { coach: { id: coachId } } })` |
| Daglig brief | AI-agent "daily-brief" (krever utvidelse av AI foundation) |
| Stall-pyramide | `lib/domain/pyramid-weighting.ts` med aggregert data |
| Aktive flagg | Tverr-spiller-analyse (SG-trend, HRV-fall, plan-adherence) |
| Spillerens uka | `prisma.user.findMany({ where: { group: ... } }, include: { sessions: ... })` |
| Gruppe-økter | `prisma.trainingCamp` (etter Trene sammen-feature) + `prisma.trainingSession` (gruppe) |
| Lag-resultater | Aggregerte queries |

## 3.4 Implementerings-rekkefølge

**Fase A (2-3 timer):** Gruppe-hero + Daglig brief (krever ny AI-agent)
**Fase B (2-3 timer):** Stall-pyramide + Aktive flagg
**Fase C (3-4 timer):** Spillerens uka-liste (forventet mest komplekst)
**Fase D (2-3 timer):** Gruppe-økter + Lag-resultater

**Total: 9-13 timer** for komplett Coach Workbench gruppe.

---

# DEL 4 — Modus-toggle (individuelt ⇄ gruppe)

## 4.1 URL-struktur

```
/admin/agencyos                       → default: I dag-tab oversikt (alle spillere)
/admin/agencyos?modus=individuelt     → spillervelger uten valgt
/admin/agencyos?spiller=<spillerId>   → individuelt med valgt
/admin/agencyos?modus=gruppe          → gruppevelger uten valgt
/admin/agencyos?gruppe=<gruppeId>     → gruppe med valgt
```

## 4.2 Komponent-arkitektur

```
src/app/admin/agencyos/page.tsx (Server Component)
├── Henter coach + alle spillere/grupper
├── Bestemmer modus fra searchParams
└── Renderer enten <IndividuelltView> eller <GruppeView>

src/components/coachhq/workbench/
├── IndividueltView.tsx (Server + Client mix)
├── GruppeView.tsx (Server + Client mix)
├── ModusToggle.tsx (Client)
├── SpillerVelger.tsx (Client)
└── GruppeVelger.tsx (Client)
```

## 4.3 State-handling

- Modus + valgt entitet (spiller eller gruppe) lever i URL (delbar lenke)
- Topbar-velgere oppdaterer URL via `router.push()`
- Hver visning er Server Component → optimal data-loading
- Kun chat + dynamiske input er Client Components

---

# DEL 5 — Felles infrastruktur

## 5.1 Nye Prisma-modeller

Disse trengs for å støtte hele workbench-arkitekturen:

```prisma
model CoachNote {
  id        String   @id @default(cuid())
  coachId   String
  playerId  String
  content   String
  tags      String[]
  createdAt DateTime @default(now())
  coach     User     @relation("CoachNoteCoach", fields: [coachId], references: [id])
  player    User     @relation("CoachNotePlayer", fields: [playerId], references: [id])
  @@index([coachId, playerId])
}

model Wearable {
  id           String   @id @default(cuid())
  userId       String
  provider     WearableProvider  // GARMIN / APPLE_HEALTH / WHOOP / TRACKMAN
  externalId   String
  lastSyncAt   DateTime?
  user         User     @relation(fields: [userId], references: [id])
}

model WearableMetric {
  id          String   @id @default(cuid())
  wearableId  String
  type        MetricType  // HRV / SLEEP / STEPS / HEART_RATE
  value       Float
  measuredAt  DateTime
  wearable    Wearable @relation(fields: [wearableId], references: [id])
  @@index([wearableId, measuredAt])
}

// + SessionParticipant (allerede planlagt)
// + TrainingCamp (allerede planlagt)
// + DailyBrief (lagrer AI-genererte briefer)
```

## 5.2 Nye AI-agenter

For å støtte Workbench v2 må disse 4 AI-agentene trenes:

1. **Daily Brief** — Genererer kort daglig brief til coach kl 06:00
2. **Aktive Flagg** — Identifiserer topp 5 insights på tvers av spillere
3. **Spiller-context-Caddie** — Caddie som vet om valgt spiller
4. **Plan-revision** — Foreslår plan-justering basert på siste runde/test

## 5.3 Performance

- Server Components for all data-loading
- React 19 `cache()` for å unngå dobbel-queries
- Streaming UI for lange queries (eks. lag-resultater)
- Edge-caching for stall-pyramide (cache 5 min)

---

# DEL 6 — Total estimat + rekkefølge

## Implementerings-rekkefølge (anbefalt)

### Sprint 1 (1-2 dager) — Player Workbench v2
- Kalender-widget
- AI-Innsikt-rad
- WeekProgressCard
- Mobile-tilpasning

**Hvorfor først:** Spillerne ser dette først hver dag. Største impact per time arbeid.

### Sprint 2 (1-2 dager) — Coach Workbench individuelt
- Top-bar + Hero + Key Metrics
- Caddie-chat med spiller-kontekst
- 5 tabs implementert

**Hvorfor:** Coach bruker individuelt-modus 70 % av tiden.

### Sprint 3 (1-2 dager) — Coach Workbench gruppe
- Gruppe-hero + Daglig brief
- Stall-pyramide + Aktive flagg
- Spillerens uka-liste

**Hvorfor:** Gruppe-modus er for klubb/akademi-administrasjon.

### Sprint 4 (1 dag) — Modus-toggle + URL-state
- Sømløs bytting mellom alle 3 visninger
- URL-state for delbar lenke
- Test på iPhone/iPad/Desktop

## Total estimat

| Sprint | Tid |
|---|---|
| 1. Player Workbench v2 | 5-8 t |
| 2. Coach Workbench individuelt | 9-13 t |
| 3. Coach Workbench gruppe | 9-13 t |
| 4. Modus-toggle | 4-6 t |
| **TOTAL** | **27-40 t (3-5 dager)** |

---

# DEL 7 — Avhengigheter + risiko

## Kritiske avhengigheter
- AI foundation (✅ klart fra Spor 4)
- FYS-plan-modul (✅ klart fra Sprint A)
- Domain-logikk (HCP/SG/CS/pyramide) (✅ klart)
- Designsystem-foundation (✅ klart)

## Avhengigheter som er IKKE klare
- Trene sammen-feature (for treningskompiser i Player Workbench)
- Wearable-integrasjon (for HRV/søvn i Player Hero)
- Coach-notater Prisma-modell (for Coach Notater-tab)

## Risiko
- **Coach-modus kompleksitet:** Bytte mellom individuelt og gruppe kan bli forvirrende UX. Mitigasjon: tydelig visuell toggle + persistent valg per session.
- **Performance med mange spillere:** Hvis gruppe har 30+ spillere blir liste tung. Mitigasjon: virtuell scroll + pagination.
- **AI-kostnader:** Daglig brief × 10 coacher × 30 dager = 300 generations/mnd. Mitigasjon: cache + bare regenerer ved relevant data-endring.

---

# DEL 8 — Konkrete neste steg

## Kveld 25. mai (i kveld eller i morgen morgen)
1. Beta-onboarding + Tier 0 (Storage + VAPID + 20 spillere)
2. Smoke-test alt fungerer
3. Hvile

## Mandag 26. mai
- Beta-feedback-monitorering aktiv
- Sprint 1 (Player Workbench v2) — 5-8 timer

## Tirsdag 27. mai
- Avslutt Sprint 1
- Begynne Sprint 2 (Coach individuelt)

## Onsdag 28. mai
- Avslutt Sprint 2
- Begynne Sprint 3 (Coach gruppe)

## Torsdag 29. mai
- Avslutt Sprint 3
- Sprint 4 (Modus-toggle)

## Fredag 30. mai
- Full verifisering på alle 3 viewports
- Bug-fixes
- Beta-spillerne har Workbench v2 klar

**Etter denne uken:** Plattformen har verdens beste workbench-arkitektur for golf.
