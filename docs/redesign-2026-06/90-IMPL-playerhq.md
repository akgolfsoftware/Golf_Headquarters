# Implementeringskart — PlayerHQ

> Laget: 17. juni 2026. Kilde: 60-HANDOFF-SKJERMKART + 61-DEKNINGSMATRISE + handoff-HTML-analyse + eksisterende page.tsx-tre.
> Scope: KUN NY-HYBRID-skjermer. RE-SKIN og TRENGER-DESIGN er ikke med her.
> Tema: PlayerHQ = alltid lyst (ingen `.dark`). BottomNav alltid med. Fullscreen-skjermer har ingen PortalShell.

---

## Per skjerm — Handoff → page.tsx → knapper → data → komponenter

---

### 1. PlayerHQ Hjem

**Handoff-fil:** `PlayerHQ Hjem (hybrid).dc.html`

**Målfil(er):**
- `src/app/portal/page.tsx`

**Knapper / handlinger:**

| Handling | Destinasjon | Status |
|---|---|---|
| «Start økt» (CTA på dagens økt-card) | `/portal/(fullscreen)/live/[sessionId]/brief` | MÅ kobles — trenger sessionId fra neste planlagte økt |
| BottomNav → Planlegge | `/portal/planlegge` | Eksisterer |
| BottomNav → Gjennomføre | `/portal/gjennomfore` | Eksisterer |
| BottomNav → Analyse | `/portal/analysere` | Eksisterer |
| BottomNav → Meg | `/portal/meg` | Eksisterer |
| Bjelle-ikon / varsel-tap i topbar | `/portal/varsler` | MÅ kobles |
| Coach-notat-kort (tap/klikk) | `/portal/coach` | MÅ kobles |

**Datakilde:**
- `TrainingSessionV2` — neste planlagte økt (for «Start økt»-CTA og dagens økt-kort)
- `PlayerProfile` — HCP, profilbilde, navn (Øyvind Rohjan)
- `SgResult` — KPI-strip (snittscore, SG total, handicap, Økter uke)
- `TrainingPlanSession` + `TrainingPlan` — planlagte økter i uka
- `CoachNote` — coach-notat-kortet
- Server actions: `getPortalDashboard(userId)` — finnes i `portal/actions.ts`

**Kit-komponenter:**
- `PhotoHero` / `Greeting` — velkomst-topp
- `KpiStrip` — 4 KPI-er (hot-celle: lime-bg)
- `InsightCard` Pro — coach-notat-utdrag
- `AthleticCard` / `FeaturedCard` — økt-cards
- `ActionList` — øvrige planlagte aktiviteter
- `BottomNav` (Hjem aktiv)
- `PulseDot` — varsel-ikon

---

### 2. PlayerHQ Varsler

**Handoff-fil:** `PlayerHQ Varsler (hybrid).dc.html`

**Målfil(er):**
- `src/app/portal/varsler/page.tsx`

**Knapper / handlinger:**

| Handling | Destinasjon | Status |
|---|---|---|
| BottomNav → Hjem/Planlegge/Gjennomføre/Analyse/Meg | Respektive ruter | Eksisterer |
| Tap på ulest varsel | Avhenger av type (booking → `/portal/booking/[id]`, drill → `/portal/drills/[id]`, melding → `/portal/coach/melding/[id]`) | MÅ kobles — type-routing mangler |
| «Ingen eldre varsler» — ingen handling | EmptyState | OK |

**Datakilde:**
- `Notification` — tabellen bør finnes; sjekk om den eksisterer eller om det er en mock-modell
- Server action: `getNotifications(userId)` — verifiser eksistens i `portal/actions.ts`
- Mark-as-read: server action trengs

**Kit-komponenter:**
- `InboxList` — listevisning ulest/lest (lime-bg for uleste) — **NY komponent, må bygges**
- `Badge` — «3 nye»-pill
- `EmptyState` — «Ingen eldre varsler»
- `BottomNav` (Varsler/bjelle aktiv som 5. fane)

---

### 3. PlayerHQ Gjennomføre

**Handoff-fil:** `PlayerHQ Gjennomføre (hybrid).dc.html`

**Målfil(er):**
- `src/app/portal/gjennomfore/page.tsx`
- `src/app/portal/gjennomfore/[id]/page.tsx` (DELVIS — liste + detalj i én flate)

**Knapper / handlinger:**

| Handling | Destinasjon | Status |
|---|---|---|
| «Start økt» (featured økt) | `/portal/(fullscreen)/live/[sessionId]/brief` | MÅ kobles |
| «Start» (planlagte ikke-featured) | `/portal/(fullscreen)/live/[sessionId]/brief` | MÅ kobles |
| «Logg ✎» (blyant-ikon, ulogget fullført økt) | Server action `logSession(sessionId)` ELLER `/portal/gjennomfore/[id]` | MÅ kobles |
| Tap på fullført økt-rad (logget) | `/portal/gjennomfore/[id]` | MÅ kobles |
| BottomNav → alle | Respektive ruter | Eksisterer |

**Datakilde:**
- `TrainingSessionV2` — dagens + denne ukens planlagte og fullførte økter
- `TrainingPlan` — plankontekst per økt
- Server actions: `getGjennomforeOversikt(userId)`, `logSession(sessionId)` — verifiser eksistens
- Left-border-farge per aktivitetstype: drilling/gym/bane/mental (CSS-klassifisering fra `sessionType`)

**Kit-komponenter:**
- `FeaturedCard` — dagens featured økt
- `ActionList` / `ProgramList` — planlagte rader
- `DoneList` — fullførte (logg-CTA kun på uloggede)
- `Eyebrow` — «Fullført i dag» / «Resten av dagen»
- `BottomNav` (Gjennomføre aktiv)

---

### 4. PlayerHQ Live-økt (3 faser)

**Handoff-fil:** `PlayerHQ Live-økt (hybrid).dc.html`

**Målfil(er):**
- `src/app/portal/(fullscreen)/live/[sessionId]/brief/page.tsx`
- `src/app/portal/(fullscreen)/live/[sessionId]/active/page.tsx`
- `src/app/portal/(fullscreen)/live/[sessionId]/summary/page.tsx`

**Knapper / handlinger:**

| Handling | Destinasjon | Status |
|---|---|---|
| «START ØKT» (brief-fase) | `/portal/(fullscreen)/live/[sessionId]/active` | MÅ kobles |
| «Fullfør drill →» / «Fullfør økt →» (aktiv-fase) | Neste drill i lista, eller summary | MÅ kobles — state machine |
| «LAGRE ØKT» (summary-fase) | Server action `saveSession(sessionId, log)` → redirect til `/portal/gjennomfore` | MÅ kobles |
| «VIDEO» / «FOTO» / «NOTAT» (aktiv-fase) | Modal/sheet for registrering | MÅ kobles |
| RPE-bar (aktiv-fase) | Setter RPE-verdi i state | MÅ kobles som state-update |

**Datakilde:**
- `TrainingSessionV2` + `TrainingPlan` — økt-program, drill-liste, belastning
- `Drill` + `DrillMal` — drilldata (tittel, reps, tid)
- Server action: `saveSession(sessionId, log, rpe)` — verifiser
- **Alltid mørk** (hardkodet `.dark` — unntak fra PlayerHQ lyst-regel)
- Ingen PortalShell — fullscreen layout

**Kit-komponenter:**
- `WizardShell` — 3-fase fullskjerm-skall
- `PhaseDots` — fase-indikator (brief → aktiv → oppsummering)
- `DrillList` + `DrillCard` — drill-program i brief
- `LiveTimer` — klokke i aktiv-fase
- `RPEBar` — farges dynamisk (6 nivåer)
- `SummaryList` — oppsummering av fullførte drills

---

### 5. PlayerHQ Drills

**Handoff-fil:** `PlayerHQ Drills (hybrid).dc.html`

**Målfil(er):**
- `src/app/portal/drills/page.tsx`

**Knapper / handlinger:**

| Handling | Destinasjon | Status |
|---|---|---|
| Filter-chip (alle/OTT/INP/APP/ARG/PUT) | Filtrerer drilllista in-page | MÅ kobles — klientside filterstate |
| Tap på drill-card (i galleri) | `/portal/drills/[id]` | MÅ kobles |
| «Velg» (drill-card-CTA) | Legger drill til plan (server action?) eller `/portal/drills/[id]` | MÅ kobles — avklar handling |

**Datakilde:**
- `Drill` / `DrillMal` — drill-bibliotek (tittel, kategori, varighet, vanskelighetsgrad)
- Server action: `getDrills(userId)` — verifiser
- 2-kolonne galleri, 6 drills vist i design

**Kit-komponenter:**
- `FilterChips` — kategori-filter
- `DrillCard` — 2-kol galleri-kort (tittel, tid, diff-badge)
- `Badge` (variants: `ok`, `warn`, `lime`)
- `GalleryView` — grid-wrapper

---

### 6. PlayerHQ Analyse (4 faner)

**Handoff-fil:** `PlayerHQ Analyse (hybrid).dc.html`

**Målfil(er):**
- `src/app/portal/analysere/page.tsx` (SG + Runder-fanene)
- `src/app/portal/statistikk/page.tsx` (SG-fane)
- `src/app/portal/trackman/[sessionId]/page.tsx` (TrackMan-fane)
- `src/app/portal/tren/tester/page.tsx` (Tester-fane)

**Knapper / handlinger:**

| Handling | Destinasjon | Status |
|---|---|---|
| Fane-switch: SG / Runder / TrackMan / Tester | URL-endring (searchParam `?tab=`) ELLER separatruter | MÅ kobles — avklar rute-strategi |
| Scrollbare tabs (swipe) | In-page tab-bytte | MÅ kobles |
| Tap på runde i Runder-fane | `/portal/mal/runder/[id]` | MÅ kobles |
| Tap på TrackMan-session | `/portal/trackman/[sessionId]` | MÅ kobles |
| Tap på test i Tester-fane | `/portal/tren/tester/[testId]` | MÅ kobles |
| «Tilbake»-knapp | Browserhistorikk / PortalShell-nav | Eksisterer |
| Skeleton-animasjon (lastestatus) | In-page loading state | MÅ kobles |

**Datakilde:**
- `SgResult` — SG-breakdown per kategori (4 SG-kategorier)
- `Round` / `RoundHole` — runde-liste (siste 3 runder i design)
- `TrackManSession` — TrackMan metrics + scatter data
- `TestResult` — tester + delta-kolonner
- **FYS-resultater = plassholdertall** (formelen er ikke låst — se BUSINESS-RULES.md)
- Server actions: `getSgData(userId)`, `getRunder(userId)`, `getTrackmanSessions(userId)`, `getTestResults(userId)`

**Kit-komponenter:**
- `Tabs` — scrollbare fane-rader
- `FeaturedCard` — SG-kort
- `SgBreakdown` — SG per kategori
- `TrendBand` — trend-chart
- `InsightCard` — AI-innsikt
- `RoundScorecard` — runde-detalj i Runder-fane
- `DispersionMap` — scatter i TrackMan-fane
- `DataTable Pro` — tester-liste med delta

---

### 7. PlayerHQ Booking

**Handoff-fil:** `PlayerHQ Booking (hybrid).dc.html`

**Målfil(er):**
- `src/app/portal/booking/page.tsx`
- `src/app/portal/booking/ny/page.tsx`

**Knapper / handlinger:**

| Handling | Destinasjon | Status |
|---|---|---|
| Dag-velger (3 dager frem) | Oppdaterer slot-liste in-page | MÅ kobles |
| «Book» på ledig slot | `/portal/booking/ny` → videre til bekreft | MÅ kobles |
| «Avlys» på eksisterende booking | Server action `cancelBooking(bookingId)` | MÅ kobles |
| Tap på «Mine bookinger»-rad | `/portal/booking/[bookingId]` | MÅ kobles |
| BottomNav | Alle | Eksisterer |

**Datakilde:**
- `Booking` — mine bookinger (status: bekreftet/planlagt/full)
- `CoachAvailability` / GCal-integrasjon — tilgjengelige slots (NB: fail-closed ved GCal-feil)
- `Facility` — fasilitet per slot (Performance Studio, Svingstudio, Range)
- Server actions: `getAvailableSlots(date, coachId)`, `createBooking(...)`, `cancelBooking(bookingId)`

**Kit-komponenter:**
- `MonthGrid` / dag-velger-strip — 3-dagers datovelger
- `TimeSlots` — tids-blokk-liste (booked/mine/fri/full)
- `BookingCard` — mine bookinger-rad
- `Badge` — slot-statuser (rød chip for «Full»)
- `BottomNav`

---

### 8. PlayerHQ Coach

**Handoff-fil:** `PlayerHQ Coach (hybrid).dc.html`

**Målfil(er):**
- `src/app/portal/coach/page.tsx`
- `src/app/portal/coach/melding/page.tsx`
- `src/app/portal/coach/melding/[id]/page.tsx`

**Knapper / handlinger:**

| Handling | Destinasjon | Status |
|---|---|---|
| «Send melding» (coach-card) | `/portal/coach/melding/ny` ELLER åpner melding-input in-page | MÅ kobles |
| «Booking» (coach-card-knapp) | `/portal/booking/ny?coach=[coachId]` | MÅ kobles |
| Send-knapp i melding-input | Server action `sendMessage(coachId, content)` | MÅ kobles |
| Tap på meldings-boble | `/portal/coach/melding/[id]` | MÅ kobles |
| Tap på events i timeline | Ingen eksplisitt destinasjon vist — se detalj-side | Avklar |
| BottomNav | Alle | Eksisterer |

**Datakilde:**
- `Coach` / `User` (role=COACH) — coach-profil (Anders Kristiansen)
- `Message` / `Thread` — meldingshistorikk (2 bobler i design)
- `TrainingSessionV2` / `Booking` — kommende coach-events (3 events i design)
- Server actions: `getCoachProfile(coachId)`, `getMessages(userId, coachId)`, `sendMessage(...)` — verifiser

**Kit-komponenter:**
- `InsightCard` — coach-profil-kort
- `Avatar` — coach-bilde
- `EventTimeline` — kommende med coach (3 events)
- `MessageThread` — meldingsbobler + send-input — **NY komponent, må bygges**
- `BottomNav`

---

### 9. PlayerHQ Meg (profil + innstillinger + abonnement)

**Handoff-fil:** `PlayerHQ Meg (hybrid).dc.html`

**Målfil(er):**
- `src/app/portal/meg/page.tsx`
- `src/app/portal/meg/profil/page.tsx` (DELVIS)
- `src/app/portal/meg/innstillinger/page.tsx` (DELVIS)
- `src/app/portal/meg/abonnement/page.tsx` (DELVIS — stub til abonnement-flyt)

**Knapper / handlinger:**

| Handling | Destinasjon | Status |
|---|---|---|
| «Rediger profil» | `/portal/meg/profil` (eller `/portal/meg/profil/rediger`) | MÅ kobles |
| «Passord» | `/portal/meg/innstillinger/sikkerhet` | MÅ kobles |
| Toggle «E-postvarsler» | Server action `updateNotificationPref(type, value)` | MÅ kobles |
| Toggle «Push-varsler» | Server action `updateNotificationPref(type, value)` | MÅ kobles |
| Toggle «Nye meldinger fra coach» | Server action `updateNotificationPref(type, value)` | MÅ kobles |
| Toggle «Ukessammendrag» | Server action `updateNotificationPref(type, value)` | MÅ kobles |
| «Oppgrader til PRO» | `/portal/meg/abonnement/oppgrader` | MÅ kobles |
| «Logg ut» (under Abonnement — merkelig plassering) | Server action `signOut()` → `/auth/login` | MÅ kobles |
| BottomNav → Meg aktiv | In-page | Eksisterer |

**Datakilde:**
- `User` / `PlayerProfile` — navn, e-post, avatar (Øyvind Rohjan)
- `Subscription` — tier (gratis i design), abonnementsstatus
- `NotificationPreference` — toggle-tilstander
- Server actions: `getUserProfile(userId)`, `updateNotificationPref(...)`, `signOut()`, `getSubscription(userId)`

**Kit-komponenter:**
- `ProfileHero` — avatar + navn + tier-info
- `StatTiles` — 3 quick-stats
- `SettingsList` — innstillingsrader (toggle + pil) — **NY komponent, må bygges**
- `Avatar`
- `BottomNav` (Meg aktiv)
- NB: Toggle er custom CSS i design — bruk shadcn `Switch` ved porting

---

### 10. PlayerHQ Planlegge + Workbench (Dashboard + Interaktiv)

**Handoff-fil(er):**
- `Workbench Dashboard.dc.html`
- `Workbench Interaktiv.dc.html`

**Målfil(er):**
- `src/app/portal/planlegge/page.tsx`
- `src/app/portal/planlegge/workbench/page.tsx`
- `src/app/portal/tren/aarsplan/page.tsx` (DELVIS)
- `src/app/portal/tren/aarsplan/periode/[id]/rediger/page.tsx` (DELVIS — PeriodeEditor-panel)

**Knapper / handlinger:**

| Handling | Destinasjon | Status |
|---|---|---|
| ViewSwitcher År/Mnd/Uke/Dag | In-page view-bytte (searchParam `?view=`) | MÅ kobles |
| «LIVE ØKT» (CTA i Workbench) | `/portal/(fullscreen)/live/[sessionId]/brief` | MÅ kobles |
| Tap på dag-celle i kalender | Åpner dag-detalj / DayCal-panel | MÅ kobles |
| PeriodeEditor-panel (rediger) | `/portal/tren/aarsplan/periode/[id]/rediger` | MÅ kobles |
| «Generer øktskall i uka» | Server action `generateWeekTemplate(periodeId)` | MÅ kobles |
| «Gjenta ukentlig» (gjentakelse-dialog) | Server action `setRecurringSession(...)` | MÅ kobles |
| «Lagre» | Server action `savePlan(...)` | MÅ kobles |
| «Avbryt» | Lukker modal/panel | MÅ kobles |
| AI Caddie-input | Server action `askCaddie(question)` | MÅ kobles |
| Individuel/Gruppe-toggle | In-page state (Dashboard-skjerm) | MÅ kobles |
| Coach-notater-tap | Åpner melding til spiller (AgencyOS-funksjon) | MÅ kobles |
| BottomNav → Planlegge aktiv | In-page | Eksisterer |

**Datakilde:**
- `TrainingPlan` + `TrainingPlanSession` — årsplan, perioder, ukestruktur
- `Tournament` — turneringer som låste perioder i Gantt
- `Drill` — øvelsesbank-popup
- `CoachNote` — coach-notater
- `SgResult` + `TestResult` — Dashboard KPI-strip
- AI Caddie: egen endpoint / Edge Function
- Server actions: `getPlan(planId)`, `savePlanSession(...)`, `generateWeekTemplate(...)`, `setRecurringSession(...)`

**Kit-komponenter:**
- `WorkbenchShell` — delt plan-kjerne (layout) — **NY komponent, må bygges**
- `ViewSwitcher` — År/Mnd/Uke/Dag
- `YearPlanGantt` — årsplan Gantt
- `MonthGrid` + `WeekGrid` — kalender-views
- `KanbanBoard` — uke-dag kolonne-board
- `PeriodTimeline` — periode-strip
- `KpiStrip` — dashboard-summary
- `PyramidProgress` — treningspyramide
- `InsightCard` — coach-notater + AI-innsikt
- `TournamentCard` — turneringer i plan
- `ActionList` — huskeliste + oppgaver
- `MessageThread` — AI Caddie chat
- `DayCal` — dag-detalj

---

### 11. PlayerHQ Trackman (via Workbench)

**Handoff-fil:** `Workbench Trackman.dc.html`

**Målfil(er):**
- `src/app/portal/trackman/[sessionId]/page.tsx`

**Knapper / handlinger:**

| Handling | Destinasjon | Status |
|---|---|---|
| «Last opp CSV» | Server action `uploadTrackmanCsv(file)` | MÅ kobles |
| «Før / etter teknisk endring»-switch | In-page filter-state | MÅ kobles |
| AI Caddie-input | Server action `askCaddie(question)` | MÅ kobles (V2 feature-flag skjult ved lansering) |
| Tilbake (ut av Trackman) | Browserhistorikk | OK |
| Rådata-tab (skjult bak knapp, Lag 3) | In-page panel-toggle | MÅ kobles |

**Datakilde:**
- `TrackManSession` + `TrackManShot` — per-session data
- `TechnicalPlanSession` — «knyttet til teknisk plan»-lenke
- CSV-kolonne-mapping: ikke låst ennå (NB fra design-spec)
- Server actions: `getTrackmanSession(sessionId)`, `uploadTrackmanCsv(file)` — verifiser

**Kit-komponenter:**
- `DispersionMap` — spredningskart (scatter)
- `GappingChart` — snitt carry per kølle
- `ClubMetricGrid` — ball speed / launch / spin / smash per kølle
- `DataTable Pro` — rådata (Lag 3)
- `TrendBand` / `Sparkline` — spredning over tid
- `InsightCard` — AI Caddie (V2, feature-flag)

---

### 12. PlayerHQ Talent (UTSATT — Elite Fase 2)

**Handoff-fil:** `PlayerHQ Talent (hybrid).dc.html`

**Status:** UTSATT per MASTER-SKJERMPLAN. Ikke port i Bølge 1 uten Anders' godkjenning.

**Målfil(er) (klare når aktivert):**
- `src/app/portal/talent/page.tsx`
- `src/app/portal/talent/min-plan/page.tsx`
- `src/app/portal/talent/mitt-niva/page.tsx`
- `src/app/portal/talent/roadmap/page.tsx`

**Datakilde (når aktivert):**
- `PlayerProfile.tier` + `PlayerAK` (A–E nivå) — nivå D i design (junior, nasjonal-fase)
- `Goal` + `GoalProgress` — mål-fremdrift
- Streak-data fra `TrainingSessionV2`
- PercentileGauge krever sammenlignings-datasett (ikke definert ennå)

**Kit-komponenter (når aktivert):**
- `JourneyMap` — reisekart
- `MasteryRings` — mestringsringer
- `GoalProgress` — mål-fremdrift
- `StreakTracker` — streak-kalender
- `PercentileGauge` — percentil (klikkbar)
- `LevelLadder` — nivåstige
- `Badge` (nivå-badge)
- NB: Nivå A–E (ikke HCP-bånd ennå — A–K-koden avventer Anders' 11 grenser)
- NB: Alle viz er custom SVG/DOM — betydelig portingarbeid

---

## Døde knapper som MÅ kobles ved porting

> Basert på handoff-analyse og 30-PORTERINGSPLAN flyt-inventar-krav. Skjerm for skjerm.

### Hjem (`/portal`)
1. «Start økt» → trenger sessionId fra neste planlagte økt (dynamisk lookup)
2. Bjelle/varsler-ikon i topbar → `/portal/varsler`
3. Coach-notat-kort → `/portal/coach`

### Varsler (`/portal/varsler`)
4. Tap på ulest varsel → type-basert routing (booking/drill/melding/plan)
5. Mark-as-read ved tap → server action

### Gjennomføre (`/portal/gjennomfore`)
6. «Start økt» (featured) → `/portal/(fullscreen)/live/[sessionId]/brief`
7. «Start» (sekundær) → samme
8. «Logg ✎» (blyant) → `logSession(sessionId)` server action
9. Tap på fullført økt → `/portal/gjennomfore/[id]`

### Live-økt (`/portal/(fullscreen)/live/[sessionId]/*`)
10. «START ØKT» (brief) → `/active`-ruten
11. «Fullfør drill →» → neste drill i state machine
12. «Fullfør økt →» (siste drill) → `/summary`-ruten
13. «LAGRE ØKT» (summary) → `saveSession(...)` → redirect til `/portal/gjennomfore`
14. «VIDEO» → modal/sheet for video-opptak
15. «FOTO» → modal/sheet for bilde
16. «NOTAT» → modal/sheet for tekst-notat
17. RPE-bar → state-update (ingen destinasjon)

### Drills (`/portal/drills`)
18. Filter-chips → klientside filterstate (kategori-param)
19. Tap på drill-card → `/portal/drills/[id]`
20. «Velg»-knapp → avklar: legg-til-plan eller gå til detalj

### Analyse (`/portal/analysere`, `/portal/statistikk`, osv.)
21. Fane-switch (SG/Runder/TrackMan/Tester) → URL-param `?tab=`
22. Tap på runde → `/portal/mal/runder/[id]`
23. Tap på TrackMan-session → `/portal/trackman/[sessionId]`
24. Tap på test → `/portal/tren/tester/[testId]`

### Booking (`/portal/booking`, `/portal/booking/ny`)
25. Dag-velger → oppdaterer slot-liste (klientside eller server re-fetch)
26. «Book» på ledig slot → `/portal/booking/ny` (med slot-info som query-params)
27. «Avlys» → `cancelBooking(bookingId)` server action
28. Tap på mine-booking-rad → `/portal/booking/[bookingId]`

### Coach (`/portal/coach`, `/portal/coach/melding/*`)
29. «Send melding» (coach-card) → `/portal/coach/melding/ny` eller in-page input
30. «Booking» (coach-card) → `/portal/booking/ny?coach=[coachId]`
31. Send-knapp i melding-felt → `sendMessage(coachId, content)` server action
32. Tap på meldings-boble → `/portal/coach/melding/[id]`

### Meg (`/portal/meg`)
33. «Rediger profil» → `/portal/meg/profil/rediger`
34. «Passord» → `/portal/meg/innstillinger/sikkerhet`
35. Toggle e-postvarsler → `updateNotificationPref('email', bool)` server action
36. Toggle push-varsler → `updateNotificationPref('push', bool)` server action
37. Toggle meldinger fra coach → `updateNotificationPref('coach_msg', bool)` server action
38. Toggle ukessammendrag → `updateNotificationPref('weekly', bool)` server action
39. «Oppgrader til PRO» → `/portal/meg/abonnement/oppgrader`
40. «Logg ut» → `signOut()` → `/auth/login`

### Planlegge/Workbench (`/portal/planlegge`, `/portal/tren/aarsplan`)
41. ViewSwitcher År/Mnd/Uke/Dag → `?view=ar|maned|uke|dag` URL-param
42. «LIVE ØKT» → `/portal/(fullscreen)/live/[sessionId]/brief`
43. Dag-celle-tap (kalender) → DayCal-panel eller dag-detalj-rute
44. PeriodeEditor → `/portal/tren/aarsplan/periode/[id]/rediger`
45. «Generer øktskall i uka» → `generateWeekTemplate(periodeId)` server action
46. «Gjenta ukentlig» → `setRecurringSession(...)` server action
47. «Lagre» → `savePlan(...)` server action
48. AI Caddie-input → AI-endpoint
49. Individuel/Gruppe-toggle → in-page state

### Trackman (`/portal/trackman/[sessionId]`)
50. «Last opp CSV» → `uploadTrackmanCsv(file)` server action
51. Før/etter teknisk endring → in-page filter-state
52. Rådata-panel → panel-toggle
53. AI Caddie (V2, feature-flag) → AI-endpoint

---

## Oppsummering

**PlayerHQ NY-HYBRID-skjermer:** 12 (inkl. Talent UTSATT)
**Aktive NY-HYBRID-skjermer å porte nå:** 11 (ekskl. Talent)
**Unike handoff-filer:** 9 PlayerHQ + 3 Workbench = 12 filer
**Døde knapper å koble:** 53 (handlinger som er visuelt til stede men mangler destinasjon/server action)

**Nytt som MÅ bygges FØR porting:**
1. `InboxList` — trengs til Varsler + Coach-melding
2. `MessageThread` — trengs til Coach-melding
3. `SettingsList` — trengs til Meg
4. `WorkbenchShell` — trengs til Planlegge/Workbench
5. `WizardShell` — trengs til Live-økt (3-fase skall)

**Rekkefølge (anbefalt):**
1. Hjem + Varsler (enklest, Bølge 1)
2. Gjennomføre + Live-økt (kjerneflyt, krev LiveTimer + RPEBar)
3. Drills + Analyse (innhold-skjermer)
4. Booking + Coach (krever nye komponenter InboxList/MessageThread)
5. Meg (krever SettingsList)
6. Planlegge/Workbench + Trackman (størst — WorkbenchShell)
7. Talent (UTSATT — vent på Anders' godkjenning)
