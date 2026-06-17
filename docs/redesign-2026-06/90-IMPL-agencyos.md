# Implementeringskart — AgencyOS

> **Kilde:** `60-HANDOFF-SKJERMKART.md` (hva er designet) + `61-DEKNINGSMATRISE.md` (status per rute) + `50-SKJERM-KOMPONENT-KART.md` (kit-komponenter) + `design-koe/agencyos.md` (TRENGER-DESIGN-batcher).
> **Tema:** AgencyOS er alltid `.dark`. Ingen tema-toggle.
> **Dato:** 2026-06-17

---

## Del 1 — Per skjerm: Handoff → page.tsx → knapper → data → komponenter

Kun NY-HYBRID-skjermer (klar til porting fra `.dc.html`). RE-SKIN- og TRENGER-DESIGN-skjermer er ikke med her.

---

### 2a — Cockpit og Handlingssenter

---

#### Skjerm 1: AgencyOS Cockpit

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `AgencyOS Cockpit (hybrid).dc.html` |
| **Rute(r)** | `/admin/agencyos` |
| **MÅL page.tsx** | `src/app/admin/agencyos/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | KpiStrip (5-kol), EventTimeline, PrioritetsListe, SideNav rail (228px), PulseDot, InboxList |
| **Tilstander i design** | Innhold (14 aktive, 3 forespørsler, 6 økter, 1 LIVE). Cockpit-grid bakgrunn (32px dot-grid) |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| KPI-strip «Aktive spillere» | `/admin/spillere` | OK |
| KPI-strip «Forespørsler» | `/admin/foresporsler` | OK |
| KPI-strip «Économi» | `/admin/okonomi` | OK |
| EventTimeline-rad «Se alle» | `/admin/innboks` | MÅ KOBLES |
| EventTimeline-rad → spiller-navn | `/admin/spillere/[id]` | MÅ KOBLES |
| PulseDot «LIVE» | `/admin/live/[sessionId]/active` | MÅ KOBLES — sessionId er ukjent fra cockpit |
| Prioritetsliste-rad «Godkjenn» | `/admin/godkjenninger/[id]` | MÅ KOBLES |
| Prioritetsliste-rad → spiller | `/admin/spillere/[id]` | MÅ KOBLES |
| SideNav-lenker | Respektive `/admin/*`-ruter | OK (sjekk `/admin/agencyos/okonomi` — fjernes, se nedenfor) |

**Datakilde (Prisma):**
- `Player`, `BookingSession`, `PlanAction` (PENDING), `TrainingSessionV2` (LIVE)
- `loadDailyBrief()` server-action (eksisterer i `/admin/agencyos/page.tsx`)
- Moden data — alle modeller aktive

---

#### Skjerm 2: AgencyOS Cockpit — Uka (DELVIS)

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `AgencyOS Cockpit (hybrid).dc.html` (fane/tilstand) |
| **Rute(r)** | `/admin/agencyos/uka` |
| **MÅL page.tsx** | `src/app/admin/agencyos/uka/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | KanbanBoard (7 dag-kolonner), WeekGrid, ViewSwitcher |
| **Tilstander i design** | 7-dagers kanban med bookinger gruppert per dag |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| Booking-kort → klikk | `/admin/live/[sessionId]/brief` | MÅ KOBLES |
| «+ Ny booking» | `/admin/bookinger/ny` | MÅ KOBLES |
| «Se kalender» | `/admin/kalender` | OK |
| Spiller-navn i kort | `/admin/spillere/[id]` | MÅ KOBLES |

**Datakilde:** `BookingSession` (neste 7 dager), `Player`

---

#### Skjerm 3: AgencyOS Handlingssenter

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `AgencyOS Handlingssenter (hybrid).dc.html` |
| **Rute(r)** | `/admin/innboks`, `/admin/kommunikasjon`, `/admin/queue`, `/admin/foresporsler`, `/admin/godkjenninger` |
| **MÅL page.tsx** | `src/app/admin/innboks/page.tsx` (EKSISTERER) · `src/app/admin/kommunikasjon/page.tsx` (EKSISTERER) · `src/app/admin/queue/page.tsx` (EKSISTERER) · `src/app/admin/foresporsler/page.tsx` (EKSISTERER) · `src/app/admin/godkjenninger/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | KanbanBoard (4 kol), DataTable Pro, ViewSwitcher, FilterChips, InboxList, MessageThread |
| **Tilstander i design** | Kanban default · tabellvisning · valgt rad (lime-border) · tom kolonne (min-height) · dragging (opacity .35) |
| **Merknad** | Designet konsoliderer 5 ruter til én «Handlingssenter»-flate med faner. Fane-navigasjon per rute er ikke klarlagt i fasit — porting-beslutning: beholde 5 separate page.tsx og la innboks-layout styre faner. |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| InboxList-rad → åpne melding | `/admin/innboks?thread=[id]` | OK (eksisterer) |
| Kanban-kort «Forespørsel» → klikk | `/admin/foresporsler/[id]` (MÅ OPPRETTES) | MÅ KOBLES |
| Godkjenningskort «Godkjenn» | server-action `approveAction()` | MÅ KOBLES |
| Godkjenningskort «Avvis» | server-action `rejectAction()` | MÅ KOBLES |
| Godkjenningskort → detalj | `/admin/godkjenninger/[id]` | MÅ KOBLES |
| Queue-rad → spiller | `/admin/spillere/[id]` | MÅ KOBLES |
| «Ny melding» | `/admin/innboks` (ny-tråd-modal) | MÅ KOBLES |
| ViewSwitcher tabell↔kanban | State/query-param `?view=` | MÅ KOBLES |

**Datakilde:** `Message`, `SessionRequest` (forespørsler), `PlanAction` (godkjenninger), `Player`

---

### 2b — Stall

---

#### Skjerm 4: AgencyOS Stall — Spillerliste

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `AgencyOS Stall (hybrid).dc.html` |
| **Rute(r)** | `/admin/spillere` |
| **MÅL page.tsx** | `src/app/admin/spillere/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | DataTable Pro, SearchInput, FilterChips, Avatar (tone-kodet), PyramidProgress, Icon rail (62px) |
| **Tilstander i design** | Liste 14 spillere · filter-tilstander · søk |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| Spiller-rad → klikk | `/admin/spillere/[id]` (360-panel slide-in) | OK |
| «+ Ny spiller» | `/admin/spillere/ny` | MÅ KOBLES |
| Filter-chip (kategori) | `?kategori=` query-param | MÅ KOBLES |
| Søk | `?q=` query-param | MÅ KOBLES |
| 360-panel «Workbench» | `/admin/spillere/[id]/workbench` | MÅ KOBLES |
| 360-panel «Send melding» | `/admin/innboks?til=[id]` | MÅ KOBLES |

**Datakilde:** `Player`, `Subscription`, `Category` (A–K-bånd)

---

#### Skjerm 5: AgencyOS Stall — Spiller 360-panel

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `AgencyOS Stall (hybrid).dc.html` (360-panel, slide-in) |
| **Rute(r)** | `/admin/spillere/[id]` |
| **MÅL page.tsx** | `src/app/admin/spillere/[id]/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | DataTable Pro, 360-panel (340px), Avatar, PyramidProgress, SgBreakdown, Badge |
| **Tilstander i design** | Øyvind Rohjan valgt · SG-fargekoding |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| «Åpne Workbench» | `/admin/spillere/[id]/workbench` | MÅ KOBLES |
| «Profil» | `/admin/spillere/[id]/profil` (TRENGER-DESIGN) | MÅ KOBLES |
| «Tester» | `/admin/spillere/[id]/tester` | MÅ KOBLES |
| «Fremgang» | `/admin/spillere/[id]/fremgang` | MÅ KOBLES |
| «Send melding» | `/admin/innboks?til=[id]` | MÅ KOBLES |
| «Start økt» | `/admin/live/[sessionId]/brief` (trenger booking-opprettelse) | MÅ KOBLES |

**Datakilde:** `Player`, `SgResult`, `BookingSession`, `PlanAction`

---

#### Skjerm 6: AgencyOS Stall — Spiller Workbench

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Workbench Dashboard.dc.html` + `Workbench Coach-Skill.dc.html` |
| **Rute(r)** | `/admin/spillere/[id]/workbench` |
| **MÅL page.tsx** | `src/app/admin/spillere/[id]/workbench/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | KpiStrip, PyramidProgress, FeaturedCard, DayCal, InsightCard Pro, Badge, Avatar, ActionList, MessageThread, TrendBand, SgBreakdown |
| **Tilstander i design** | Komplett dashboard: mål, turneringer, meldinger, tester, coach-notater + AI Caddie chat-felt + uke-nav |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| «Lag coach-skill» / «Ny mal» | `/admin/plan-templates/ny` | MÅ KOBLES |
| «Send plan til spiller» | server-action `sendPlanToPlayer()` | MÅ KOBLES |
| AI Caddie chat-felt «Send» | server-action (AI-endepunkt) | MÅ KOBLES |
| Uke-navigasjon piler | query-param `?uke=` | MÅ KOBLES |
| «Se alle meldinger» | `/admin/innboks?spiller=[id]` | MÅ KOBLES |
| «Se fremgang» | `/admin/spillere/[id]/fremgang` | MÅ KOBLES |

**Datakilde:** `Player`, `TrainingPlan`, `SgResult`, `Message`, `BookingSession`, `TestResult`

---

### 2c — Planlegging

---

#### Skjerm 7: AgencyOS Planlegging

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `AgencyOS Planlegging (hybrid).dc.html` |
| **Rute(r)** | `/admin/planlegge`, `/admin/plans`, `/admin/plans/[planId]` |
| **MÅL page.tsx** | `src/app/admin/planlegge/page.tsx` (EKSISTERER) · `src/app/admin/plans/page.tsx` (EKSISTERER) · `src/app/admin/plans/[planId]/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | YearPlanGantt, PeriodTimeline, KpiStrip (4), PlayerSelector, Button |
| **Tilstander i design** | Aktiv periode «Sesong» (mai–aug 2026, lime-ring) · periode-detalj under Gantt · ferdig/aktiv/kommende noder · 2-kol layout |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| PlayerSelector (bytt spiller) | Oppdaterer Gantt med ny spillers plan | MÅ KOBLES |
| «Ny plan» | `/admin/plans/new` | MÅ KOBLES |
| Gantt-node → klikk (periode) | `/admin/plans/[planId]` (periode-detalj) | MÅ KOBLES |
| «Rediger periode» | Modal/panel i samme side | MÅ KOBLES |
| «Coach Workbench» | `/admin/coach-workbench` | MÅ KOBLES |
| «Bruk mal» | `/admin/plan-templates` | MÅ KOBLES |

**Datakilde:** `TrainingPlan`, `PlanPeriod`, `Player`

---

#### Skjerm 8: Workbench Plan-maler (Coach-Skill wizard)

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Workbench Coach-Skill.dc.html` |
| **Rute(r)** | `/admin/plan-templates`, `/admin/plan-templates/ny` |
| **MÅL page.tsx** | `src/app/admin/plan-templates/page.tsx` (EKSISTERER) · `src/app/admin/plan-templates/ny/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | WizardShell (3 steg), PyramidProgress, Badge (spillernivå), ActionList, Avatar, GoalProgress, InsightCard Pro, KpiStrip, StatTile, SettingsList |
| **Tilstander i design** | Steg 1: kriterier · Steg 2: foreslått ukeplan fra regelmotor · Steg 3: send til mottakere · tom/innlastet mottakere |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| «Neste» (steg 1→2→3) | State-maskin i wizard | MÅ KOBLES |
| «Forrige» | State-maskin | MÅ KOBLES |
| «Send til godkjenning» | server-action `submitPlanTemplate()` | MÅ KOBLES |
| «Lagre utkast» | server-action `savePlanTemplateDraft()` | MÅ KOBLES |
| «Avbryt» | `/admin/plan-templates` | MÅ KOBLES |
| Mottaker-chip «Legg til» | Søk/velg spiller (modal) | MÅ KOBLES |

**Datakilde:** `PlanTemplate`, `Player`, `PyramidLevel`, regelmotor (eksisterer som `src/lib/domain/plan-rules.ts` eller tilsvarende — verifiser)

---

#### Skjerm 9: Coach Workbench

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Workbench Dashboard.dc.html` + `Workbench Coach-Skill.dc.html` |
| **Rute(r)** | `/admin/coach-workbench` |
| **MÅL page.tsx** | `src/app/admin/coach-workbench/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | WorkbenchShell, ViewSwitcher, KanbanBoard, DataTable Pro, InsightCard Pro, ActionList |
| **Merknad** | Fungerer som hub for coach-perspektiv på alle spillere samlet — se også Spiller-Workbench (Skjerm 6) |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| «Lag ny mal» | `/admin/plan-templates/ny` | MÅ KOBLES |
| Spiller-velger | Filtrer workbench-data per spiller | MÅ KOBLES |
| «Se plan» | `/admin/plans/[planId]` | MÅ KOBLES |
| AI Caddie chat-felt | server-action (AI-endepunkt) | MÅ KOBLES |

**Datakilde:** `Player`, `TrainingPlan`, `SgResult`

---

#### Skjerm 10: Workbench Trackman / TekniskPlan

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `Workbench Trackman.dc.html` |
| **Rute(r)** | `/admin/trackman`, `/admin/teknisk-plan/[spillerId]` |
| **MÅL page.tsx** | `src/app/admin/trackman/page.tsx` (EKSISTERER) · `src/app/admin/teknisk-plan/[spillerId]/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | DispersionMap, Sparkline/TrendBand, ClubMetricGrid, StatTile/KpiCard, Delta, DataTable Pro, StableMatrix, InsightCard Pro |
| **Tilstander i design** | Lag 1 (sammendrag) · Lag 2 (scatter + outliers + snitt carry) · Lag 3 (rådata skjult bak knapp) · AI Caddie V2 feature-flag |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| «Vis rådata» (Lag 3) | Ekspanderbar seksjon / query-param `?lag=3` | MÅ KOBLES |
| AI Caddie V2 (feature-flag) | Skjult ved lansering — feature-flag `NEXT_PUBLIC_AI_CADDIE_V2` | MÅ KOBLES |
| «Tilbake til spiller» | `/admin/spillere/[id]` | MÅ KOBLES |
| ClubMetricGrid-celle → klikk | Drill-down modal med detalj | MÅ KOBLES |

**Datakilde:** `TrackManSession`, `TrackManShot`, `Player`
**Merknad:** CSV-kolonnemapping ikke låst ennå — bygg med plassholdere til Anders bekrefter.

---

### 2d — Gjennomføre

---

#### Skjerm 11: AgencyOS Kalender

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `AgencyOS Kalender (hybrid).dc.html` |
| **Rute(r)** | `/admin/kalender`, `/admin/kalender/uke`, `/admin/kalender/maned` |
| **MÅL page.tsx** | `src/app/admin/kalender/page.tsx` (EKSISTERER) · `src/app/admin/kalender/uke/page.tsx` (EKSISTERER — redirect) · `src/app/admin/kalender/maned/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | WeekGrid, DayCal, Kommende-liste, ViewTabs, PulseDot, Button, MonthGrid |
| **Tilstander i design** | Ukevisning (default) · dag-detalj 320px venstre + detalj høyre · dag-typer: økt (forest), full/opptatt (lime), muted · LIVE-animasjon · turneringer som røde streker |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| ViewTabs Uke/Måned | `?view=uke` / `?view=maned` (eller separate ruter) | MÅ KOBLES |
| «+ Ny booking» | `/admin/bookinger/ny` | MÅ KOBLES |
| Dag-celle med økt → klikk | Dag-detalj-panel (høyrekolonne) | MÅ KOBLES |
| Økt i dag-detalj → «Start» | `/admin/live/[sessionId]/brief` | MÅ KOBLES |
| Økt i dag-detalj → spiller-navn | `/admin/spillere/[id]` | MÅ KOBLES |
| PulseDot LIVE | `/admin/live/[sessionId]/active` | MÅ KOBLES |
| Turneringsstreke → klikk | `/admin/tournaments/[id]` | MÅ KOBLES |

**Datakilde:** `BookingSession`, `TrainingSessionV2`, `Tournament`, `Player`

---

#### Skjerm 12: AgencyOS Live-økt Coach

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `AgencyOS Live-økt Coach (hybrid).dc.html` |
| **Rute(r)** | `/admin/live/[sessionId]/brief`, `/admin/live/[sessionId]/active`, `/admin/live/[sessionId]/summary` |
| **MÅL page.tsx** | `src/app/admin/live/[sessionId]/brief/page.tsx` (EKSISTERER) · `src/app/admin/live/[sessionId]/active/page.tsx` (EKSISTERER) · `src/app/admin/live/[sessionId]/summary/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | LiveRepPulse, KpiStrip (4), KpiRing, StatusPill, Avatar, PulseDot |
| **Tilstander i design** | Aktiv live-økt (42 min, LIVE) · Drill 12/20 reps · Pause + Avslutt · 3-kol layout: LiveRepPulse (span 2) + KpiRing/status |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| «Pause» | server-action `pauseSession()` | MÅ KOBLES |
| «Avslutt økt» | `/admin/live/[sessionId]/summary` | MÅ KOBLES |
| «Legg til notat» | server-action `addCoachNote()` | MÅ KOBLES |
| «Start økt» (fra brief) | `/admin/live/[sessionId]/active` | OK (sannsynligvis) |
| «Lagre og fullfør» (summary) | server-action + redirect `/admin/agencyos` | MÅ KOBLES |
| Spiller-navn | `/admin/spillere/[id]` | MÅ KOBLES |

**Datakilde:** `TrainingSessionV2`, `Player`, `DrillResult`

---

### 2e — Innsikt og analyse

---

#### Skjerm 13: AgencyOS Risiko / Analysere

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `AgencyOS Risiko (hybrid).dc.html` |
| **Rute(r)** | `/admin/analyse`, `/admin/analysere`, `/admin/analysere/compliance` |
| **MÅL page.tsx** | `src/app/admin/analyse/page.tsx` (EKSISTERER) · `src/app/admin/analysere/page.tsx` (EKSISTERER) · `src/app/admin/analysere/compliance/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | RiskHeatmap (8x3, 24 spillere, 5 risikonivåer), Risiko-liste, Badge, PulseDot, InsightCard Pro, SgBreakdown, DataTable Pro, TrendBand |
| **Tilstander i design** | 24 spillere · 1 kritisk (rød) · hover på heatmap-celle (scale 1.12) · topbar «1 kritisk» med pulserende rød dot |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| Heatmap-celle → klikk | `/admin/spillere/[id]` | MÅ KOBLES |
| «1 kritisk»-knapp / PulseDot | Filtrert spillerliste (kritiske) | MÅ KOBLES |
| Compliance-fane | `/admin/analysere/compliance` | MÅ KOBLES |
| Risiko-liste-rad → spiller | `/admin/spillere/[id]` | MÅ KOBLES |

**Datakilde:** `Player`, `SgResult`, `BookingSession`, `TrainingSessionV2` (aktivitetsstatus)

---

#### Skjerm 14: AgencyOS Tester

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `AgencyOS Tester (hybrid).dc.html` |
| **Rute(r)** | `/admin/tester`, `/admin/tester/[id]`, `/admin/tester/benchmarks` |
| **MÅL page.tsx** | `src/app/admin/tester/page.tsx` (EKSISTERER) · `src/app/admin/tester/[id]/page.tsx` (EKSISTERER) · `src/app/admin/tester/benchmarks/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | KpiStrip (4), DataTable Pro, TabBar, SearchInput, Button, StatusPill |
| **Tilstander i design** | Testresultater for stall · tab-filtrering (alle/FYS/teknikk) · delta-kolonne (grønn/rød) · hover-rad |
| **Merknad** | FYS-resultatformelen er IKKE låst — plassholdertall. Ingen separat benchmarks-skjerm i fasit (trolig fane) |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| TabBar Alle/FYS/Teknikk | `?type=` filter | MÅ KOBLES |
| «Tildel test» | `/admin/tester/tildel/[spillerId]` | MÅ KOBLES |
| Testrad → detalj | `/admin/tester/[id]` | MÅ KOBLES |
| «Benchmarks»-fane | `/admin/tester/benchmarks` | MÅ KOBLES |
| «Foreslåtte tester» | `/admin/tester/foreslatte` (TRENGER-DESIGN) | MÅ KOBLES |
| Spiller-navn i rad | `/admin/spillere/[id]` | MÅ KOBLES |

**Datakilde:** `TestSession`, `TestResult`, `Benchmark`, `Player`

---

#### Skjerm 15: AgencyOS Økonomi

| Felt | Verdi |
|---|---|
| **Handoff-fil** | `AgencyOS Økonomi (hybrid).dc.html` |
| **Rute(r)** | `/admin/okonomi` |
| **MÅL page.tsx** | `src/app/admin/okonomi/page.tsx` (EKSISTERER) |
| **Kit-komponenter** | KpiStrip (4, lime hot-KPI), DataTable Pro, PeriodTabs, Button, StatusPill |
| **Tilstander i design** | Fakturaoversikt juni · hot-KPI (lime-bg) · periode-filtrering · hover-rad |
| **Merknad** | `/admin/agencyos/okonomi` (i `src/app/admin/agencyos/okonomi/page.tsx`) er LEGACY-DUP — fjernes, all økonomi-trafikk til `/admin/okonomi`. |

**Knapper / handlinger og destinasjon:**

| Knapp / element | Destinasjon | Status |
|---|---|---|
| PeriodTabs (måned-filter) | `?periode=2026-06` query-param | MÅ KOBLES |
| «Ny faktura» | server-action (Stripe) | MÅ KOBLES |
| Faktura-rad → klikk | Faktura-detalj modal eller ny rute | MÅ KOBLES |
| «Send purring» | server-action `sendReminder()` | MÅ KOBLES |
| Hot-KPI (lime) | Forfalt-filter på tabellen | MÅ KOBLES |

**Datakilde:** `Invoice` / Stripe (via `src/lib/stripe.ts`), `Subscription`, `Player`

---

## Del 2 — Døde knapper som MÅ kobles ved porting

Samlet liste over knapper/handlinger flagget som «MÅ KOBLES» på tvers av alle 15 NY-HYBRID-skjermer, gruppert etter hva slags tilkobling som trengs.

### A — Rute-navigasjon (lenker som mangler)

| # | Knapp / element | Fra skjerm | Til rute | Prioritet |
|---|---|---|---|---|
| 1 | EventTimeline-rad «Se alle» | Cockpit | `/admin/innboks` | P1 |
| 2 | EventTimeline-rad → spiller-navn | Cockpit | `/admin/spillere/[id]` | P1 |
| 3 | PulseDot «LIVE» (cockpit) | Cockpit | `/admin/live/[sessionId]/active` | P1 |
| 4 | Prioritetsliste «Godkjenn» | Cockpit | `/admin/godkjenninger/[id]` | P1 |
| 5 | Uka-booking-kort → start | Uka | `/admin/live/[sessionId]/brief` | P1 |
| 6 | «+ Ny booking» (Uka) | Uka | `/admin/bookinger/ny` | P1 |
| 7 | Spiller-navn (Uka) | Uka | `/admin/spillere/[id]` | P1 |
| 8 | 360-panel «Åpne Workbench» | Spillerliste/360 | `/admin/spillere/[id]/workbench` | P1 |
| 9 | 360-panel «Profil» | Spillerliste/360 | `/admin/spillere/[id]/profil` | P1 |
| 10 | 360-panel «Tester» | Spillerliste/360 | `/admin/spillere/[id]/tester` | P1 |
| 11 | 360-panel «Fremgang» | Spillerliste/360 | `/admin/spillere/[id]/fremgang` | P1 |
| 12 | 360-panel «Send melding» | Spillerliste/360 | `/admin/innboks?til=[id]` | P1 |
| 13 | «+ Ny spiller» | Spillerliste | `/admin/spillere/ny` | P1 |
| 14 | Workbench «Se alle meldinger» | Spiller-WB | `/admin/innboks?spiller=[id]` | P1 |
| 15 | Workbench «Lag ny mal» | Spiller-WB / Coach-WB | `/admin/plan-templates/ny` | P1 |
| 16 | Workbench «Se plan» | Spiller-WB | `/admin/plans/[planId]` | P1 |
| 17 | Gantt-node (periode) → klikk | Planlegging | `/admin/plans/[planId]` | P1 |
| 18 | «Coach Workbench» | Planlegging | `/admin/coach-workbench` | P1 |
| 19 | «Bruk mal» | Planlegging | `/admin/plan-templates` | P1 |
| 20 | Mal-wizard «Avbryt» | Plan-maler/ny | `/admin/plan-templates` | P1 |
| 21 | ViewTabs Uke/Måned | Kalender | `?view=uke/maned` | P1 |
| 22 | «+ Ny booking» (Kalender) | Kalender | `/admin/bookinger/ny` | P1 |
| 23 | Dag-celle økt → dag-detalj | Kalender | Detalj-panel (same-page) | P1 |
| 24 | Økt i dag-detalj «Start» | Kalender | `/admin/live/[sessionId]/brief` | P1 |
| 25 | Økt-detalj → spiller-navn | Kalender | `/admin/spillere/[id]` | P1 |
| 26 | PulseDot LIVE (Kalender) | Kalender | `/admin/live/[sessionId]/active` | P1 |
| 27 | Turneringsstreke → klikk | Kalender | `/admin/tournaments/[id]` | P1 |
| 28 | «Avslutt økt» | Live aktiv | `/admin/live/[sessionId]/summary` | P1 |
| 29 | Live «Lagre og fullfør» | Live summary | redirect `/admin/agencyos` | P1 |
| 30 | Spiller-navn (Live) | Live alle | `/admin/spillere/[id]` | P1 |
| 31 | Heatmap-celle → klikk | Risiko | `/admin/spillere/[id]` | P1 |
| 32 | Compliance-fane | Analysere | `/admin/analysere/compliance` | P1 |
| 33 | Risiko-liste-rad → spiller | Risiko | `/admin/spillere/[id]` | P1 |
| 34 | «Tildel test» | Tester | `/admin/tester/tildel/[spillerId]` | P1 |
| 35 | Testrad → detalj | Tester | `/admin/tester/[id]` | P1 |
| 36 | «Foreslåtte tester» | Tester | `/admin/tester/foreslatte` | P1 |
| 37 | Spiller-navn i testrad | Tester | `/admin/spillere/[id]` | P1 |
| 38 | Faktura-rad → detalj | Økonomi | modal / ny rute | P1 |
| 39 | «Tilbake til spiller» | Trackman | `/admin/spillere/[id]` | P1 |
| 40 | Godkjenningskort → detalj | Handlingssenter | `/admin/godkjenninger/[id]` | P1 |
| 41 | Queue-rad → spiller | Handlingssenter | `/admin/spillere/[id]` | P1 |
| 42 | Kanban-kort «Forespørsel» → klikk | Handlingssenter | `/admin/foresporsler/[id]` | P1 |

### B — Server-actions (mangler implementasjon eller kobling)

| # | Server-action | Fra skjerm | Prioritet |
|---|---|---|---|
| 43 | `approveAction()` | Handlingssenter / Godkjenninger | P1 |
| 44 | `rejectAction()` | Handlingssenter / Godkjenninger | P1 |
| 45 | `pauseSession()` | Live aktiv | P1 |
| 46 | `addCoachNote()` | Live aktiv / summary | P1 |
| 47 | `sendPlanToPlayer()` | Spiller-WB / Plan-maler | P1 |
| 48 | `submitPlanTemplate()` | Plan-maler/ny | P1 |
| 49 | `savePlanTemplateDraft()` | Plan-maler/ny | P1 |
| 50 | `sendReminder()` (Stripe-purring) | Økonomi | P1 |
| 51 | AI Caddie chat server-action | Spiller-WB / Coach-WB | P2 (feature-flag V2) |

### C — State / query-params (mangler tilkobling)

| # | State | Fra skjerm | Prioritet |
|---|---|---|---|
| 52 | `?view=kanban/tabell` | Handlingssenter | P1 |
| 53 | `?kategori=` filter | Spillerliste | P1 |
| 54 | `?q=` søk | Spillerliste | P1 |
| 55 | `?uke=` navigasjon | Spiller-WB | P1 |
| 56 | `?type=` (FYS/Teknikk) | Tester | P1 |
| 57 | `?periode=YYYY-MM` | Økonomi | P1 |
| 58 | `?lag=3` rådata-ekspandering | Trackman | P1 |
| 59 | AI Caddie V2 feature-flag `NEXT_PUBLIC_AI_CADDIE_V2` | Trackman / WB | P2 |
| 60 | PlayerSelector (bytt spiller) | Planlegging | P1 |

### D — Ruter som MANGLER page.tsx (må opprettes ved porting)

| # | Rute | Årsak |
|---|---|---|
| 61 | `/admin/foresporsler/[id]` | Forespørsel-detalj ikke opprettet |
| 62 | `/admin/live/[sessionId]/summary` | Verifiser at filen eksisterer (EKSISTERER — sjekket OK) |

---

## Del 3 — Prisma-modenhet og datakilde-oppsummering

Data er stort sett moden (~124/126 modeller aktive per audit). Spesifikke forbehold:

| Skjerm | Modell | Status |
|---|---|---|
| Trackman | `TrackManSession` / CSV-mapping | Ikke låst — bygg med plassholdere |
| FYS-resultater (Tester) | `TestResult`-formel | IKKE låst — plassholdertall alltid |
| AI Caddie V2 | AI-integrasjon | Feature-flag, ikke bygges ved lansering |
| Kommunikasjon-union (InboxList) | `Message` + `SessionRequest` union | IA-beslutning utestår — bygg Innboks med kun `Message` |
| `/admin/agencyos/okonomi` | Duplikat av `/admin/okonomi` | Fjernes — redirect i `next.config.ts` |

---

## Del 4 — Porting-rekkefølge (anbefalt)

Basert på avhengigheter og P1-prioritet:

1. **Cockpit + Uka** — foundation for alt annet; krever: `loadDailyBrief()` utvidet med knapper
2. **Handlingssenter (Innboks/Kommunikasjon/Queue/Forespørsler/Godkjenninger)** — høy coach-verdi; krever: `approveAction()` / `rejectAction()`
3. **Spillerliste + 360-panel** — deles av nesten alle skjermer
4. **Kalender** — gjennomføre-loop; krever: live-kobling
5. **Live-økt Coach (brief/active/summary)** — kritisk flyt; krever: `pauseSession()` + `addCoachNote()`
6. **Planlegging + Plan-maler/ny (Coach-Skill wizard)** — kan gjøres parallelt med kalender
7. **Coach-WB + Spiller-WB** — avhenger av plan-maler
8. **Risiko/Analysere + Tester** — avhenger av spillerliste og data
9. **Økonomi + Trackman** — relativt selvstendige

---

*Sist oppdatert: 2026-06-17*
