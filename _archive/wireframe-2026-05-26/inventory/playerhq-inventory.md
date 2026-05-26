# PlayerHQ Screen Inventory — AK Golf Platform

## Oppsummering

| Metrikk | Antall |
|---------|--------|
| **Hovedskjermer (5 tabs)** | 22 navngitte skjermer |
| **Modaler / Undertabs** | 18+ modale og undertabs |
| **Wizard-flyter** | 2 (Ny økt 6-step, Live Session 4-step) |
| **Live Session-skjermer** | 4 (Intro → Aktiv øvelse → Fullført → Oppsummering) |
| **Tier-gatet innhold** | 24 features delt på Gratis/Pro/Elite |
| **Identifiserte gap** | 10 (Passive player, Gamification, Closed-loop, Course guide, TrackMan silo, FYS, Mental, Onboarding, Social, Offline) |

### Tier-fordeling
- **Gratis**: 12 skjermer (basis read-only view)
- **Pro**: 8 skjermer (AI Coach, drills, TrackMan)
- **Elite**: 12 skjermer (coach chat, bookinger, alt)

---

# TAB 1: HJEM (Home Dashboard)

## 1.1 Hjem — Velkommen & Dagens økt

**URL/Route:** `/portal/hjem` (default on login)  
**Hovedtab:** Hjem  
**Beskrivelse:** Førsteinntrykk for spilleren med hoje-ordre: hva skal jeg gjøre i dag? Viser dagens økt, uken sin progresjon, neste turnering, og viktige statistikker.

**Hovedseksjoner:**
- Velkommen-heading ("Velkommen, [Navn]" i Instrument Serif stor)
- Hero "Dagens økt" (mørk kort, glassmorfisme, 7 col bento)
- Økt-detaljering (pyramide-kode, 3 drill-kort innefor glass)
- "Start økt"-knapp (lime, pill-shaped)
- Uke-ring (5 col, SG/FYS breakdown, dag-markør M–S)
- Neste turnering (5 col, countdown-tall, bane, prep-tip)
- Stats-rad (4 kort à 3 col: Streak 🔥, SG total, Handicap, Neste test)
- Pyramide-fordeling (7 col, horisontale bars FYS/TEK/SLAG/SPILL/TURN % labels)
- Varsler (5 col: coach-melding, agent-forslag, achievement)
- Siste aktivitet (12 col horisontalt scrollbar: siste økt, siste runde, siste TrackMan)

**Primær-handlinger:**
- "Start økt"-knapp → Live Session Intro
- Klikk økt-kort → Økt-detalj modal
- Klikk dag i ring → Plan > Kalender
- Klikk turnering → Turnering-detalj modal
- Klikk streak → Achievements modal

**Sekundær-handlinger:**
- Hover stats for mini-trendline (sparkline SVG)
- Klikk pyramide-bar → Tren > Plan filtered by område

**States:**
- **Normal:** Fullt innhold, alle kort lastet
- **Loading:** Skeleton-cards med fade-in stagger (0.06s delay)
- **Empty:** "Ingen plan denne uken — opprett med Ny økt"-CTA
- **Med Coach-plan:** Plan fra coach vises, "Godkjenn/Avvis agent-forslag"-knapper
- **Selvdrevet:** Bare egne økter, forslag-seksjon skjult

**Tier-gating:**
- Gratis: Hele dashboard synlig (read-only, ingen "Start økt")
- Pro: "Start økt" og drill-detaljer enabled
- Elite: + Coach-varsler, booking-reminder

**Datakilder:**
- `TrainingPlanSession` (dagens økt)
- `TrainingPlan` (uke-oversikt)
- `Round` (siste runde resultat)
- `TrackManSessionAnalytics` (siste import)
- `Signal` (agent-forslag)
- `Tournament` (neste turnering)
- `TestResult` (handicap, neste test)
- `Achievement` (streak, milestones)

**Kobler til:**
- Live Session (Intro screen via "Start økt")
- Tren > Kalender (dag-klikk)
- Tren > Plan (økt-detalj)
- Mål > Oversikt (SG-klikk)
- Coach (varsel-klikk Pro+)
- Meg > Achievements (streak-klikk)

---

## 1.2 Hjem — Toggle: Med Coach-plan vs Selvdrevet

**Komponenter som endres:**
- Coach-badge i top-left
- Forslag-seksjon viser "PlanAction" (PYRAMID_ADJUST, SESSION_ADD, etc.) fra agents
- Godkjenn/Avvis-knapper på forslag
- Plan opprinnelse-label ("Fra coach siden [dato]")

**Ikke spesifisert:** Eksakt UI for godkjenn/avvis — antas modal eller inline confirm

---

# TAB 2: TREN (Training)

## 2.1 Tren > Plan — Uke-oversikt & Økt-detalj

**URL/Route:** `/portal/tren/plan` (default undertab)  
**Hovedtab:** Tren  
**Undertab:** Plan [aktiv]  
**Beskrivelse:** Planens kjerne. Uke-stripe med dag-kort, valgt økt ekspandert til høyre med drill-detalj, pyramide-fordeling, og agent-forslag.

**Hovedseksjoner:**
- Top-bar: "Plan: [Plan navn]" + "Forrige uke" / "Denne uke" / "Neste uke" toggle
- Ukestrip (horisontalt scrollbar):
  - 7 dag-kort (M–S): økt-tittel, pyramide-fargekode-prikk, varighet, status (✓ grønn / ● lime / ○ grå)
  - Dag-kort klikk → ekspanderer til høyre
- Ekspandert økt-detalj (høyre panel):
  - Økt-tittel + pyramide-label (blå FYS / lilla TEK / grønn SLAG / etc.)
  - Økt-rationale (1-2 setninger fra plan)
  - Drills-liste:
    - Drill-navn
    - Reps/sets/durasjon
    - CS-range (e.g., "CS 60–80")
    - L-fase label (KROPP / ARM / KØLLE / BALL / AUTO)
    - Target-beskrivelse
  - "Start økt"-knapp (lime)
  - "Endre økt"-knapp (grå)
  - "Hops til" pop-in (fra agent-forslag)
- Høyre side-panel:
  - Pyramide-donut (this week % of FYS/TEK/SLAG/SPILL/TURN)
  - Bars (horisontale % per område)
  - Treningsområde-fordeling (pilarkart eller liste)
  - L-fase-fordeling (KROPP/ARM/KØLLE/BALL/AUTO % stack)
  - CS gjennomsnitt (denne uke)
  - M (miljø) og PR (psykisk press) gjennomsnitt/range
  - Periode-info (e.g., "Pre-season week 3 av 8")
  - Agent-forslag (PlanActions):
    - "Øk SLAG fra 2 til 3 økter"
    - "Legg til varmeopp FYS tirsdag"
    - "Reduser CS fredag"
    - Godkjenn / Avvis-knapper

**Modaler:**
- **Økt-detalj modal** (ved klikk økt-kort):
  - Ekspandert drill-liste med bilder/videoer
  - Coach-kommentar
  - Forrige gang denne økt var planlagt (resultat)
  - Endre/Kopier/Slett-handlinger (Pro+)

**Primær-handlinger:**
- Klikk dag-kort → Ekspander økt
- "Start økt"-knapp → Live Session Intro
- "Endre økt"-knapp → Modal (Pro+)

**Sekundær-handlinger:**
- Klikk drill → Detalj modal med video
- Klikk L-fase label → Filter Tren > Øvelser by L-fase
- Godkjenn forslag → Applies PlanAction, refresh uke-stripe

**States:**
- **Normal:** Uke lastet, økt ekspandert
- **Loading:** Uke-stripe skeleton, panel fade-in
- **Empty uke:** "Ingen økt denne uke — bruk Ny økt"-knapp
- **Agent-forslag:** Highlight på agent-seksjon med "Ny"-badge
- **Etter "Start økt":** Dag-status → ● (today) / (når session fullføres) ✓ (grønn)

**Tier-gating:**
- Gratis: Les-modus kun (ingen "Endre økt", ingen "Godkjenn forslag")
- Pro: Fullt edit, forslag synlig
- Elite: + Coach-kommentar edit, booking-link fra coach

**Datakilder:**
- `TrainingPlan` (uke-struktur)
- `TrainingPlanSession` (økt-detaljer)
- `ExerciseDefinition` (drill-navn, video, etc.)
- `Signal` (agent-beregning av pyramide/L-fase/CS gjennomsnitt)
- `PlanAction` (forslag fra agents)
- `TrainingPlanSessionLog` (forrige resultat)

**Kobler til:**
- Live Session Intro (via "Start økt")
- Økt-detalj modal
- Tren > Kalender (dag-klikk via toggle)
- Tren > Øvelser (drill-detalj modal)

---

## 2.2 Tren > Kalender — Månedsvisning

**URL/Route:** `/portal/tren/kalender`  
**Undertab:** Kalender  
**Beskrivelse:** Kalender-grid (7 dager × 4–5 uker). Dag-celler fargekodede (blå trening, oransje runde, rød test, grå hvile). Klikk dag → dag-detalj panel.

**Hovedseksjoner:**
- Måned-velger (← [Måned År] →)
- Kalender-grid (7 kolonner, S–L):
  - Dag-celle (32×32px, fargekode left-border):
    - Dag-nummer
    - Aktivitets-prikk: 
      - Blå = Trening
      - Oransje = Runde
      - Rød = Test
      - Grønn = Seremoni/turnering
      - Grå = Hvile/fri
    - Hover: Liten preview av økt-tittel
- Dag-detalj panel (høyre, sticky):
  - Dato + dag-navn
  - Aktiviteter denne dag:
    - Økt-kort (blå border-left hvis trening)
    - Runde-kort (oransje border-left hvis runde)
    - Test-kort (rød border-left hvis test)
  - "Legg til aktivitet"-knapp
  - Prev/next dag-navigasjon (← →)

**Modaler:**
- **Økt-detalj** (klikk økt-kort i dag-panel)
- **Runde-detalj** (klikk runde-kort i dag-panel)
- **Test-detalj** (klikk test-kort i dag-panel)

**Primær-handlinger:**
- Klikk dag-celle → dag-detalj panel vises
- "Legg til aktivitet"-knapp → Modal velg type (Økt / Runde / Test / etc.)
- Klikk økt i panel → Økt-detalj modal

**States:**
- **Normal:** Kalender-grid + dag-panel
- **Empty dag:** "Ingen aktiviteter — [+] Legg til"
- **Flere aktiviteter:** Dag-celle viser multi-dot, panel viser liste

**Tier-gating:**
- Gratis: Kun vis plan-økter (blå), runder/test read-only
- Pro: Redigering av økt, test-logging
- Elite: + Coaching notes per dag

**Datakilder:**
- `TrainingPlanSession` (blå — tjeningene)
- `Round` (oransje — runder)
- `TestResult` (rød — tester)
- `Tournament` (grønn — seremoni)
- `TrainingPlanSessionLog` (status per sesjon)

**Kobler til:**
- Økt-detalj modal (via økt-kort)
- Runde-detalj modal (via runde-kort)
- Test-detalj modal (via test-kort)

---

## 2.3 Tren > Øvelser — Søk & Filter

**URL/Route:** `/portal/tren/ovelser`  
**Undertab:** Øvelser  
**Beskrivelse:** Søkbar øvelses-bank med 150+ drill-definisjoner. Filter etter treningsområde (FYS/TEK/SLAG/SPILL/TURN), L-fase (KROPP–AUTO), CS-range. Kort-grid med øvelses-kort.

**Hovedseksjoner:**
- Søk-bar (top, full-bredde): "Søk drill-navn, tags..."
- Filter-sidebar (venstre, sticky):
  - Treningsområde (5 checkboxes): FYS / TEK / SLAG / SPILL / TURN (kan multi-select)
  - L-fase (5 checkboxes): KROPP / ARM / KØLLE / BALL / AUTO (kan multi-select)
  - CS-range slider: 0–100
  - "Tilbakestill"-knapp
  - Filter-resultat: "24 drills"
- Øvelses-grid (høyre, 3 eller 4 col responsive):
  - Øvelses-kort per drill:
    - Thumbnail / ikon
    - Drill-navn (Outfit, 16px)
    - Treningsområde-badge (fargekode: blå FYS, etc.)
    - L-fase-badge
    - "Vis detalj"-knapp eller klikk-hele-kortet

**Modaler:**
- **Drill-detalj modal**:
  - Drill-navn + beskrivelse
  - Video (embedded)
  - Målgruppe/handicap-range
  - Setup-instruksjoner
  - Scoring-regler (hvis benchmarkbar)
  - Benchmark-data (gjennomsnitt fra alle spillere, top 10%)
  - "Legg til i plan"-knapp (Pro+)

**Primær-handlinger:**
- Søk: Typeahead, filter resultat
- Filter: Velg område/L-fase, endrer grid
- "Vis detalj"-knapp → Drill-detalj modal
- "Legg til i plan"-knapp → Velg dag/økt, add to `TrainingPlanSession.exercises`

**States:**
- **Normal:** Grid med 24+ drills
- **Søk aktiv:** Viser kun matching
- **No results:** "Ingen drills matcher filterene — [Tilbakestill]"
- **Loading:** Skeleton-kort i grid

**Tier-gating:**
- Gratis: Alle drills lesbar, kan ikke legge til i plan
- Pro: Legge til i plan enabled
- Elite: + Custom drills, AI-forslåtte drills

**Datakilder:**
- `ExerciseDefinition` (alle drills, med L-fase, CS-range, treningsområde, video-URL)
- `ExerciseBenchmark` (benchmark-data per drill)

**Kobler til:**
- Drill-detalj modal
- Tren > Plan (via "Legg til i plan")

---

## 2.4 Tren > Tester — Tilgjengelige tester & Historikk

**URL/Route:** `/portal/tren/tester`  
**Undertab:** Tester  
**Beskrivelse:** Liste over 20 tilgjengelige tester (Driver Basic, 8-balls, Wedge Variation, etc.). Hver test viser siste resultat, dato, historikk-sparkline. Klikk test → test-detalj + logg-ny-test-modal.

**Hovedseksjoner:**
- Test-liste (vertikal scroll):
  - Test-kort per test-type:
    - Test-navn (f.eks. "Driver Basic")
    - Siste resultat + dato (f.eks. "247m, 28. apr")
    - Sparkline SVG (historikk over 12 måneder)
    - "Se detalj"-knapp
    - "Logg ny"-knapp (Pro+)
- Test-detalj panel (høyre, sticky, når test valgt):
  - Test-navn + beskrivelse
  - Scoring-regler + målgruppe-range
  - Siste 10 resultater (tabell):
    - Dato
    - Resultat-verdi(er) (e.g., "247m, 4° launch angle")
    - Notat (hvis coach-loggert)
  - Større sparkline (6 mnd eller 12 mnd toggle)
  - Statistikk: avg, max, min, std dev
  - "Logg ny test"-knapp

**Modaler:**
- **Logg ny test modal**:
  - Test-navn (read-only)
  - Input-felt(er) per test-type (f.eks. Driver Basic: distance, carry, side)
  - Valg av device (TrackMan / Radar / Manuel input)
  - Notat-felt (valgfritt)
  - "Lagre"-knapp → API call `POST /api/testresult`, refresh tabell + sparkline

**Primær-handlinger:**
- Klikk test-kort → Detalj panel og sparkline
- "Se detalj"-knapp → Samme som klikk
- "Logg ny"-knapp → Modal for input

**States:**
- **Normal:** Liste med alle tester + siste resultat
- **Ingen resultat:** Sparkline ikke vises, "Logg din første [test]"-CTA
- **Sparkline loading:** Skeleton-bar animeres
- **Ny resultat loggert:** Toast "Test logget", refresh sparkline med fade-in

**Tier-gating:**
- Gratis: Alle tester lesbar, kan ikke logg
- Pro: Logg tester, TrackMan-sync hvis tilkoblet
- Elite: + Coach-notater per test, benchmark-sammenligning med andre

**Datakilder:**
- `TestDefinition` (test-navn, scoring-regler, målgruppe)
- `TestResult` (historikk per test per player)
- `TrackManSessionAnalytics` (device-linking for auto-import)

**Kobler til:**
- Test-detalj modal
- Mål > Oversikt (resultat-trend)

---

## 2.5 LIVE SESSION — 4-Screen Wizard

**Url/Route:** `/portal/live-session/:sessionId` (fullscreen, ingen sidebar)  
**Beskrivelse:** Fullscreen training session flow. 4 skjermer i sekvens: Intro → Aktiv øvelse (repeat n drills) → Øvelse fullført → Oppsummering.

### 2.5.1 Live Session Screen 1: Intro

**Innhold:**
- Økt-tittel (stor, Instrument Serif)
- Pyramide-label (FYS/TEK/etc.) farget background
- Økt-rationale (1-2 setninger)
- Drills-preview (liste av 3–5 drills):
  - Drill-navn
  - Reps/sets/duration
  - L-fase badge
- "Start økt"-knapp (lime, stor)
- "Avbryt økt"-knapp (grå, underkryss)
- Estimert varighet (f.eks. "~45 min")

**State transitions:** "Start økt" → Screen 2 (Aktiv øvelse #1)

---

### 2.5.2 Live Session Screen 2: Aktiv øvelse

**Innhold:**
- Timer (øverst, stor): Elapsed tid
- Drill-tittel + reps/sets progress (f.eks. "Set 2/3")
- Drill-video (embedded eller large image)
- Instruksjoner (tekst)
- Scoring-felt(er) per repetisjon (e.g., "Resultat reps: [input], Kommentar: [textarea]")
- Horisontale knapper:
  - "Forrige" (grå, disabled på drill #1)
  - "Fullført" (lime, progress til neste drill eller Screen 3 hvis siste)
  - "Hopp over" (grå, disabled hvis ikke allowed)

**State transitions:**
- "Fullført" → Next drill or Screen 3
- "Hopp over" → Next drill or Screen 3 (log as skipped)
- "Forrige" → Previous drill (load saved results)

**Auto-tracking:** Timer og drill-nummer lager `LiveSessionLog` entries

---

### 2.5.3 Live Session Screen 3: Øvelse fullført

**Innhold (kort mellomskjerm):**
- Checkmark-ikon (grønn, stor)
- "Øvelse fullført!"
- Drill-navn som nettopp ble gjort
- Resultat-oppsummering (f.eks. "Beste slag: 247m")
- "Neste øvelse"-knapp (lime) — eller "Avslutt økt" hvis siste drill

---

### 2.5.4 Live Session Screen 4: Oppsummering

**Innhold:**
- "Økt fullført!" heading
- Økt-tittel
- Total tid
- Drills gjennomført (liste med resultat):
  - Drill-navn
  - Reps/sets
  - Beste resultat (hvis benchmarkbar)
  - Sammenlignet med benchmark (e.g., "Top 10%")
- Session-score / Impressions (om tilgjengelig)
- Statistikk-oppsummering:
  - Totalt sett
  - Gjennomsnitt per reps
- "Lagre økt"-knapp (lime) — `POST /api/training-session-log`
- "Gjør igjen"-knapp (grå)
- "Til hjem"-knapp (grå)

---

## 2.6 NY ØKT-WIZARD — 6-Step Flow

**URL/Route:** `/portal/ny-okt` (modal overlay eller fullscreen)  
**Beskrivelse:** Fremviser for å opprette custom treningsøkt eller velge fra template-bibliotek.

### 2.6.1 Step 1: Velg økt-type
**Innhold:**
- Radio buttons:
  - "Fra template" → Step 2 velg mal
  - "Egendefinert" → Step 3 velg drills
  - "AI-forslåtte" (Pro+) → Step 4 AI-velg
- Fremdriftslinje øverst: 1 / 6

---

### 2.6.2 Step 2: Velg template (if "Fra template")
**Innhold:**
- Liste over 10–20 templates:
  - Template-navn
  - Pyramide-område
  - Varighet
  - Vanskelig-nivå
- Radio select en
- "Neste"-knapp

---

### 2.6.3 Step 3: Velg drills (if "Egendefinert" eller "fra template")
**Innhold:**
- Drill-søk / filter (samme som Tren > Øvelser)
- Valgte drills (høyre panel):
  - Drag-droppbar liste
  - Endre reps/sets per drill
  - Fjern drill
- "Neste"-knapp

---

### 2.6.4 Step 4: Sett økt-detaljer
**Innhold:**
- Økt-tittel (text input)
- Treningsområde (select: FYS/TEK/SLAG/SPILL/TURN)
- L-fase-fokus (select)
- CS-intensitet (slider 0–100)
- M (miljø) (slider 0–5)
- PR (psykisk press) (slider 1–5)
- Notater (textarea)
- "Neste"-knapp

---

### 2.6.5 Step 5: Velg dato/dag
**Innhold:**
- Kalender-miniatyr eller uke-stripe
- Velg dag
- Tid-felt (HH:MM)
- "Neste"-knapp

---

### 2.6.6 Step 6: Bekreft & Lagre
**Innhold:**
- Oppsummering av hele økt (tittel, drills, dato, varighet estimat)
- "Lagre økt"-knapp (lime)
- "Tilbake for å redigere"-knapp (grå)
- **Lagring:** `POST /api/training-plan-session` → Response med sessionId
- **Suksess:** Toast "Økt opprettet" + redirect til Tren > Plan eller Hjem

---

# TAB 3: MÅL (Goals & Analytics)

## 3.1 Mål > Oversikt — SG Spider & Trender

**URL/Route:** `/portal/mal/oversikt` (default undertab)  
**Hovedtab:** Mål  
**Undertab:** Oversikt [aktiv]  
**Beskrivelse:** Spillerens prestasjons-senter. SG-radar diagram (OTT/APP/ARG/PUTT), trend-graf over tid, svakhetsanalyse fra agents, handicap-utvikling.

**Hovedseksjoner:**
- Top-bar: "SG-analyse — [12 siste måneder]" + date-range velger
- 2-kolonne layout:
  - **Venstre (6 col):**
    - **SG Spider/Radar**:
      - SVG 5-pointed radar
      - Akser: OTT (Off the Tee), APP (Approach), ARG (Around the green), PUTT (Putting), MSH (Mental/Schwartzel 🔥)
      - Innefoldet område (filled) = sjanger-strengths
      - Klikk axe → Filter Tren > Øvelser / Mål > Runder by område
    - **Trend-graf**:
      - X-axis: Tid (12 måneder, eller custom range)
      - Y-axis: SG Total
      - Linjegraf med dots per runde
      - Hover: Dato + SG + par-scoring
  - **Høyre (6 col):**
    - **Svakhetsanalyse**:
      - Kort med "Du er best på APP (+0.8), men svak på PUTT (-0.3)"
      - Farget badge per område (grønn = sterk, rød = svak)
      - Agent-genert tekst fra weakness-skill signal
    - **Handicap-utvikling**:
      - Mini line-graf (12 mnd)
      - Nåværende HCP: 3.2
      - Trend: "↓ bedre (siste 3 mnd)"
    - **Period-info**:
      - Seson / periode-navn
      - Treningsvolum (timer denne periode)
      - Runder gjennomført
      - Neste test-dato
    - **Rask-link til oppfølging**:
      - "Gå til Runder" → Mål > Runder
      - "Se tester" → Tren > Tester
      - "Trening basert på SG" → Åpner PlanAction-modal fra agents

**Modaler:**
- **Custom range modal** (fra date-velger): 
  - From / To date
  - "Apply"-knapp → Refresh radar + graf

**Primær-handlinger:**
- Klikk SG spider axe → Filter Mål > Runder by område
- Klikk trend-graf dot → Runde-detalj modal
- "Gå til Runder"-knapp → Navigate til Mål > Runder

**States:**
- **Normal:** Fullt innhold
- **Loading:** Radar + graf skeleton
- **Insufficient data:** "Ikke nok runder enda — [Logg runde]"
- **Custom date range:** Radar + graf re-beregnes, tooltip med nye SG-verdier

**Tier-gating:**
- Gratis: SG radar + HCP read-only (limited to last 3 rounds)
- Pro: Fullt 12-mnd historikk, trend-graf, weakness-analyse
- Elite: + Peer benchmarking (top 10% sammenligning), coach-notater per område

**Datakilder:**
- `Round` (score, par, SG per område)
- `Signal` (SG_TOTAL, SG_BREAKDOWN fra agent beregninger)
- `TestResult` (handicap-trend)
- `TrainingPlanSessionLog` (treningsvolum per periode)

**Kobler til:**
- Mål > Runder (via spider-klikk, trend-klikk)
- Tren > Tester (via "Se tester"-link)
- Tren > Plan (via agent-forslag modal)

---

## 3.2 Mål > Runder — Registrerte runder & SG per runde

**URL/Route:** `/portal/mal/runder`  
**Undertab:** Runder  
**Beskrivelse:** Tabell/liste over alle registrerte runder (10+ per spillare typisk). Hver rad: dato, bane, SG total, resultat (score). Klikk runde → Runde-detalj med hull-for-hull SG-oppdeiling.

**Hovedseksjoner:**
- Runder-liste (vertikal scroll):
  - Runde-kort / tabell-rad per runde:
    - Dato (short format: "28. apr")
    - Bane-navn (link → Mål > Baner detalj)
    - Score (e.g., "72 (+1)")
    - SG Total (farget: grønn +, rød −)
    - Resultat-kategori (e.g., "Bra runde" eller "Turnerig")
    - Klikk hele raden → Runde-detalj panel
- Runde-detalj panel (høyre, sticky, når runde valgt):
  - Runde-info header (dato, bane, score, SG total)
  - Hole-by-hole table:
    - Hole #
    - Par
    - Score
    - SG (OTT / APP / ARG / PUTT breakdown)
    - Strokes Gained pil (↑ eller ↓ fra GIR)
  - Sommering (avg SG per del)
  - Notater (if coach-loggert)

**Modaler:**
- **Runde-detalj modal** (for dypere analyse):
  - Samme innhold som panel + eksport-knapp (CSV/PDF)

**Primær-handlinger:**
- Klikk runde-kort → Runde-detalj panel
- Klikk bane-navn → Mål > Baner detalj
- Scroll runder-liste → Pagination (20 per side) eller "Last more"

**States:**
- **Normal:** Runder-liste lastet
- **Loading:** Skeleton-kort per runde
- **No rounds:** "Ingen runder logget enda — [Import fra TrackMan] eller [Logg manuelt]"
- **Detalj loading:** Panel fader inn med skeleton

**Tier-gating:**
- Gratis: Kun read-only summary per runde
- Pro: Detalj panel med SG-oppdeiling, export-knapp
- Elite: + Hole-by-hole coaching notes, peer comparison

**Datakilder:**
- `Round` (dato, bane, score, SG-data)
- `TrackManSessionAnalytics` (hvis imported, device-data)
- `CoachingSession` (coach-notater per runde)

**Kobler til:**
- Mål > Baner (via bane-navn)
- Mål > TrackMan (hvis TrackMan-import tilkoblet)

---

## 3.3 Mål > TrackMan — Siste import & Dispersion-plot

**URL/Route:** `/portal/mal/trackman`  
**Undertab:** TrackMan  
**Beskrivelse:** Launch monitor data fra Trackman eller annen device. Viser siste import-sesjon med dispersion plot (scatter SVG), kølle-statistikk tabell, trend.

**Hovedseksjoner:**
- Top-bar: "Siste TrackMan-import: [dato]" + "Synkroniser nå"-knapp
- 2-kolonne layout:
  - **Venstre (6 col):**
    - **Dispersion-plot (SVG scatter)**:
      - X-axis: Sidevariasjon (−30 til +30 yards)
      - Y-axis: Distanse-variasjon (−50 til +50 yards fra average)
      - Hver skudd = dot (fargekode per kølle: driver blå, iron grønn, etc.)
      - Hover: Kølle + distance + side
    - **Plot-statistikk**:
      - Totalt skudd i sesjon
      - Gjennomsnitt-distanse
      - Carry variabilitet (std dev)
  - **Høyre (6 col):**
    - **Kølle-statistikk tabell**:
      - Kolonne: Kølle | Skudd | Gjennomsnitt | Carry | Side variabilitet
      - Rad per kølle brukt (f.eks. Driver, 3W, 3I, ..., SW)
      - Sortérbar (klikk header)
    - **Trend-graf**:
      - Mini line-graf: Distanse-trend over 5 siste TrackMan-sesjoner
      - Hover: Sesjon-dato + gjennomsnitt-distance

**Modaler:**
- **Kølle-detalj modal** (klikk kølle i tabell):
  - Dispersion-plot bare for denne kølle (zoomed in)
  - Slagstatistikk (launch angle, ball speed, etc.)

**Primær-handlinger:**
- "Synkroniser nå"-knapp → Fetch fra TrackMan API, `POST /api/trackman-sync`, refresh plot + tabell
- Klikk dot i plot → Klikk-bare-for-inspect, viser kølle + distance
- Klikk kølle-rad → Kølle-detalj modal

**States:**
- **Normal:** Plot + tabell lastet
- **Loading:** Skeleton plot + tabell
- **No TrackMan data:** "Ingen TrackMan-sesjoner ennå — [Koble TrackMan-enhet]"
- **Syncing:** "Synkroniserer..." toast, disable "Synkroniser nå"-knapp
- **Sync successful:** Toast "TrackMan-data importert", refresh alle seksjoner

**Tier-gating:**
- Gratis: TrackMan-lesing disabled
- Pro: Siste 5 sesjoner synkroniserbar, plot lesbar
- Elite: + Ubegrenset historikk, AI-trend-analyse, coach-benchmark

**Datakilder:**
- `TrackManSessionAnalytics` (plotdata, kølle-stats)
- `TrackManDevice` (API-tilkobling, sync-status)
- `Round` (linking runde til TrackMan-sesjon hvis match)

**Kobler til:**
- Mål > Runder (via linking sesjon til runde)
- Coach (via AI-analyse av dispersion)

---

## 3.4 Mål > Baner — Registrerte baner & Per-bane SG

**URL/Route:** `/portal/mal/baner`  
**Undertab:** Baner  
**Beskrivelse:** Liste over baner der spilleren har spilt. Hver bane viser SG-gjennomsnitt, antall runder, par 3-oppdeiling. Klikk bane → Bane-detalj med SG per horisontal og oppladning-notater.

**Hovedseksjoner:**
- Baner-liste (vertikal scroll):
  - Bane-kort per bane:
    - Bane-navn (link)
    - Sted (by, stat)
    - Par
    - Runder spilt (f.eks. "4 runder")
    - SG-gjennomsnitt (farget grønn/rød)
    - Beste runde på bane (score)
    - Klikk kort → Bane-detalj panel
- Bane-detalj panel (høyre, sticky):
  - Bane-navn + sted + par
  - Runder på bane (tabell):
    - Dato
    - Score
    - SG
  - SG-oppdeiling:
    - OTT / APP / ARG / PUTT gjennomsnitt på banen
    - Mini-radar (sammenlignet med gjennomsnitt alle baner)
  - Bane-notater (fra coach, f.eks. "Narrow fairways, slow greens")
  - "Forbered for bane"-knapp (Pro+) → Velg dato, generer prep-plan basert på bane-kjennetegn

**Modaler:**
- **Forberedelse-modal** (fra "Forbered for bane"-knapp):
  - Velg dato for turnerig / viktig runde
  - Generer forslag til treningsfokus (weakness-skill filter + bane-karakteristikk)
  - Dager til turnerig
  - Foreslått oppladning-plan

**Primær-handlinger:**
- Klikk bane-kort → Bane-detalj panel
- "Forbered for bane"-knapp → Modal

**States:**
- **Normal:** Baner-liste lastet
- **Loading:** Skeleton-kort per bane
- **No banes played:** "Ingen baner registrert ennå"
- **Bane-detalj loading:** Panel fader inn

**Tier-gating:**
- Gratis: Bane-liste lesbar, SG read-only
- Pro: Detalj-panel, forberedelse-forslag (basis)
- Elite: + Personlig coach-notater per bane, videre strateginotater

**Datakilder:**
- `Round` (bane, score, SG)
- `CourseDefinition` (bane-navn, par, handicap-vurderinger)
- `CoachingSession` (coach-notater per bane)
- `Signal` (SG-gjennomsnitt per bane fra agent-aggregering)

**Kobler til:**
- Mål > Runder (via runde-liste i panel)
- Tren > Plan (via forberedelse-forslag)

---

# TAB 4: COACH (Coaching Interface)

## 4.1 Coach — Tier-avhengig layout

**URL/Route:** `/portal/coach`  
**Hovedtab:** Coach  
**Beskrivelse:** Tier-gated coaching interface. Gratis: locked med upgrade-prompt. Pro: AI Coach only. Elite: AI Coach + Direct coach chat + Booking calendar.

---

### 4.1.1 Coach — GRATIS (Locked)

**Innhold:**
- Stor modal / overlay:
  - Lock-ikon (rød)
  - "Coach-featurene krever Pro"
  - Verdi-forklaring:
    - "AI Coach: Personlig treningsrådgiver basert på SG-analyse"
    - "Pro: Chatte med AI, få forslag til drills"
    - "Elite: + Direkte coach-chat + Booking av sesjoner"
  - "Oppgrader til Pro [$12/mnd]"-knapp (lime)
  - Klikk → Meg > Abonnement side

---

### 4.1.2 Coach — PRO (AI Coach only)

**Innhold:**
- Top-bar: "AI Coach — Hva vil du trene på?"
- Chat-interface (horisontalt layout eller 2-kolonne):
  - **Venstre (chat-boble-liste):**
    - Chat-historikk (scrollbar):
      - User-boble: Brukers spørsmål (grå bg)
      - Coach-boble: AI-svar (grønn bg, Outfit tekst)
      - Timestamps
    - Input-felt (bottom):
      - Placeholder: "Spør AI Coach..."
      - Send-knapp (lime)
  - **Høyre (panel):**
    - Quick-prompts (knapper):
      - "Svakhet-analyse"
      - "Neste økt-forslag"
      - "Test-forberedelse"
      - "Mål-justering"
    - Context-panel (sticky):
      - Siste SG-data
      - Siste test
      - Aktiv treningsplan
      - "Se mer"-link til Mål / Tren

**Primær-handlinger:**
- Skriv spørsmål → Send → AI-svar streaming inn (fade-in stagger)
- Klikk quick-prompt → Pre-fill input med prompt, user-sender
- Klikk link i AI-svar (f.eks. "se din treningsplan") → Navigate til Tren > Plan

**States:**
- **Normal:** Chat-liste + input aktiv
- **Typing:** Input-felt har focus
- **Awaiting response:** Send-knapp disabled, spinner på coach-boble
- **Response streaming:** Coach-boble fades in, text-stream animerer med letter-by-letter timing (lav speed for readability)

**Tier-gating:**
- Pro: 20 chats per måned quota
- Elite: Unlimited chats

**Datakilder:**
- `CoachingSession` (chat-historikk per bruker)
- `Signal` (SG, test-data fed til AI-context)
- `TrainingPlan` (aktiv plan fed til AI-context)

**API/Service:**
- `POST /api/coach/ai-chat` → OpenAI GPT / Anthropic Claude endpoint med system-prompt

**Kobler til:**
- Mål > Oversikt (via SG-link i svar)
- Tren > Plan (via treningsplan-link i svar)

---

### 4.1.3 Coach — ELITE (AI Coach + Direct coach chat + Booking)

**Layout (3-panel eller tab-switcher):**

**Tab 1: AI Coach** (samme som Pro)

**Tab 2: Direct Coach Chat**
- **Innhold:**
  - Chat-liste (venstre):
    - Coach-boble: Coach-melding (blå bg)
    - User-boble: Din melding (grå bg)
    - Timestamps
    - Input-felt + send-knapp
  - **Høyre panel:**
    - Coach-info (kort):
      - Coach-navn
      - Bakgrunn / sertifikasjoner
      - Neste ledige slot
      - "Book session"-knapp → Tab 3

**Tab 3: Booking-kalender**
- **Innhold:**
  - Coach-kalender (månedsvisning):
    - Ledig slot (grønn)
    - Opptatt slot (grå)
    - Din booking (lime)
  - Velg slot → Modal:
    - Sesjon-type (30 min / 60 min)
    - Notat (valgfritt)
    - "Book"-knapp → Confirm booking, send coach-varsel
  - Dine bookinger (liste):
    - Dato / tid
    - Type
    - "Avbryt"-knapp (hvis mer enn 24h)
    - "Join"-knapp hvis sesjon snart

**Primær-handlinger:**
- Direct chat: Skriv + send til coach
- Booking: Velg slot → book → confirm
- Join sesjon: Klikk "Join"-knapp → Video-call modal (Zoom/Google Meet embedding)

**States:**
- **Normal:** Chat + kalender lastet
- **Awating coach reply:** "Typing..." indikator
- **Booking pending:** Toast "Booking sent to coach for approval" (hvis coach-approval required)
- **Video call active:** Embed video-kalender i modal

**Tier-gating:**
- Elite: Unlimited direct chats, 2 coaching sessions per måned (eller based på subscription variant)

**Datakilder:**
- `CoachingSession` (direkte chat-historikk)
- `CoachingBooking` (booking-oppføringer)
- `Coach` (coach-info, availability)

**Kobler til:**
- Video-call modal (Zoom/Google Meet API integration)

---

# TAB 5: MEG (Profile & Settings)

## 5.1 Meg — Profil & Statistikk

**URL/Route:** `/portal/meg` (default undertab) eller `/portal/meg/profil`  
**Hovedtab:** Meg  
**Undertab:** Profil [aktiv]  
**Beskrivelse:** Bruker-profil med bilde, navn, klubb, handicap-badge. Statistikk-oppsummering: totale økter, runder, timer treningsstoff, strekk-rekord. Abonnement-seksjon med tier-badge og oppgrader-CTA.

**Hovedseksjoner:**
- **Profil-header (hero-kort, glassmorfisme):**
  - Profilbilde (stor, 120×120px, gradient border-ring green → lime)
  - Navn (Instrument Serif, stor)
  - Klub (f.eks. "Oslo GK")
  - Handicap-badge (farget grønn hvis < 5, lime hvis 5–10, etc.)
  - "Rediger profil"-knapp (Pro+) → Modal

- **Statistikk-kort grid (bento-layout):**
  - Totale økter (tall + "denne året")
  - Totale runder (tall + siste måned-trend pil)
  - Totale trenings-timer (tall + gjennomsnitt per uke)
  - Longest streak (tall + dato-range)
  - Beste SG-runde (tall + dato)
  - Beste test-resultat (tall + test-type)

- **Abonnement-seksjon:**
  - Tier-badge (farget: grå Gratis / blå Pro / gull Elite)
  - "Pro — $12 / mnd" tekst
  - Neste billing-dato (f.eks. "Fornyes 15. juni")
  - "Oppgrader til Elite [$29/mnd]"-knapp (lime) eller "Manage subscription"-knapp (grå)
  - Link → Meg > Abonnement

- **Sosialt (undertabs eller ekspandérbar):**
  - Venner-liste (kort: navn + abbr-initialer + slett-knapp)
  - "Legg til venn"-knapp → Modal søk + invite
  - Challenges (liste: navn, motstand, status, resultat)
  - Leaderboards (link til Meg > Leaderboards)

**Modaler:**
- **Rediger profil modal** (Pro+):
  - Navn, Klub, Handicap (editerbare felt)
  - Profilbilde-upload (drag-drop)
  - "Lagre"-knapp

**Primær-handlinger:**
- "Rediger profil"-knapp → Modal
- "Oppgrader til Elite"-knapp → Meg > Abonnement
- "Legg til venn"-knapp → Modal søk
- Klikk challenge → Challenge-detalj modal

**States:**
- **Normal:** Profil + stats lastet
- **Loading:** Skeleton-kort per stat
- **Edit mode:** Inputs aktive, "Lagre"/"Avbryt"-knapper

**Tier-gating:**
- Gratis: Profil lesbar, ingen rediger, statistikk limited (last 3 rounds)
- Pro: Fullt statistikk, rediger profil, venner
- Elite: + Private challenges, coaching historikk, premium badges

**Datakilder:**
- `User` (navn, klub, profilbilde)
- `UserGolfId` (handicap)
- `TrainingPlanSessionLog` (økter, timer)
- `Round` (runder, SG-best)
- `TestResult` (test-best)
- `Achievement` (streak-rekord)
- `Friendship` (venner-liste)
- `Challenge` (aktive challenges)
- `Subscription` (tier-info)

**Kobler til:**
- Meg > Abonnement (via oppgrader-knapp)
- Meg > Leaderboards (via sosialt-panel)
- Challenge-detalj modal

---

## 5.2 Meg > Abonnement

**URL/Route:** `/portal/meg/abonnement`  
**Undertab:** Abonnement  
**Beskrivelse:** Subscription-styring. Viser tier, pris, neste billing-dato, feature-sammenligningsmatrise. Buttons for oppgrader/downgrade/cancel.

**Hovedseksjoner:**
- **Nåværende tier-kort:**
  - Tier-navn (Pro)
  - Pris ($12/mnd)
  - Neste billing-dato
  - "Håndter abonnement"-knapp (grå) → Link til Stripe portal
  - "Avbryt abonnement"-knapp (rød, confirm modal)

- **Feature-matrise (3 kolonner: Gratis / Pro / Elite):**
  - Rader per feature (f.eks. AI Coach, Direct coach chat, Training logging, etc.)
  - Checkmarks / X per tier
  - Highlight "Pro"-kolonne (nåværende)

- **Oppgrader/downgrade-seksjon:**
  - "Oppgrader til Elite"-knapp (lime) → Stripe checkout
  - "Downgrade til Gratis"-knapp (grå) → Confirm modal + process downgrade

**Primær-handlinger:**
- "Håndter abonnement"-knapp → External link til Stripe portal (Customers → Manage subscription)
- "Oppgrader til Elite"-knapp → `POST /api/subscription/upgrade`, redirect til Stripe checkout
- "Avbryt abonnement"-knapp → Confirm modal → `POST /api/subscription/cancel`

**States:**
- **Normal:** Tier-info + feature-matrise lastet
- **Processing upgrade:** Spinner + disable knapp
- **Upgrade successful:** Toast + redirect til Hjem
- **Cancelled:** Toast "Abonnement avsluttet", downgrade til Gratis-features

**Tier-gating:**
- Gratis: Se feature-matrise, "Oppgrader"-knapp
- Pro: Nåværende tier vises, "Oppgrader til Elite"+ "Downgrade til Gratis"-knapper
- Elite: Nåværende tier vises, "Downgrade til Pro" + "Avbryt"-knapper

**Datakilder:**
- `Subscription` (tier, billing-date, stripe-subscription-id)
- `SubscriptionFeature` (feature-matrise per tier)
- Stripe API (checkout, portal-link)

**Kobler til:**
- Stripe portal (ekstern)

---

## 5.3 Meg > Innstillinger

**URL/Route:** `/portal/meg/innstillinger`  
**Undertab:** Innstillinger  
**Beskrivelse:** Brukerpreferer. Varsler (push, SMS, email), enheter (meter/yards), språk (norsk/engelsk), sikkerhet (2FA), data-eksport.

**Hovedseksjoner:**
- **Varslinger-seksjon:**
  - Toggel: "Push-varslinger" (default ON)
  - Toggel: "Email-varslinger" (default ON)
  - Toggel: "SMS-varslinger" (default OFF)
  - Toggel: "Coach-varslinger" (default ON)
  - Toggel: "Agent-forslag-varslinger" (default ON)

- **Enheter-seksjon:**
  - Radio: "Meter" (default) / "Yards"
  - Radio: "Celsius" (default) / "Fahrenheit"

- **Språk-seksjon:**
  - Radio: "Norsk (bokmål)" (default) / "English"

- **Sikkerhet-seksjon:**
  - "Endre passord"-knapp → Modal
  - Toggel: "2-faktor-autentisering" (default OFF)
  - "Aktivert enheter"-liste (last login per device)
  - "Logg ut fra alle enheter"-knapp

- **Data-seksjon:**
  - "Eksporter mine data (CSV)"-knapp → Download .zip
  - "Slett konto"-knapp (rød, confirm modal) → Irreversible

**Modaler:**
- **Endre passord modal:**
  - Nåværende passord-felt
  - Nytt passord-felt
  - Bekreft passord-felt
  - "Lagre"-knapp

- **2FA aktivering modal:**
  - QR-kode (Google Authenticator / Authy)
  - Backup-koder (liste som kan kopieres)
  - "Aktivér"-knapp

- **Slett konto modal:**
  - "Denne handlingen er permanent"
  - Bekreftelse-checkbox: "Jeg forstår at alle mine data blir slettet"
  - "Slett konto"-knapp (rød)

**Primær-handlinger:**
- Toggle varsler → `POST /api/user/preferences/notifications`
- Velg enheter → `POST /api/user/preferences/units`
- "Endre passord"-knapp → Modal
- "Eksporter mine data"-knapp → `GET /api/user/export`, download zip
- "Slett konto"-knapp → Confirm modal → `POST /api/user/delete`

**States:**
- **Normal:** Alle toggel-innstillinger lastet
- **Saving:** Spinner + disable toggel
- **Saved:** Toast "Innstillinger lagret"
- **Exporting:** Toast "Eksporterer data..." → Download starts

**Tier-gating:**
- Gratis: Basis innstillinger (varsler, enheter, språk)
- Pro: + 2FA, sikkerhet
- Elite: Samme som Pro

**Datakilder:**
- `UserPreferences` (notifications, units, language, security)
- `UserSession` (active devices)

**Kobler til:**
- Ingen eksternt, men triggerer re-render av hele app (for språk-endring, etc.)

---

## 5.4 Meg > Dokumenter

**URL/Route:** `/portal/meg/dokumenter`  
**Undertab:** Dokumenter  
**Beskrivelse:** Bruker-dokumenter: kontrakt med coach (Pro+), trenings-guides, API-dokumentasjon (for developer-integrasjoner), vilkår.

**Hovedseksjoner:**
- **Coach-kontrakt (Pro+ only):**
  - PDF embed eller link til "Last ned kontrakt"
  - "Se undertegnede kontrakt"-link (hvis signert)

- **Trenings-guides:**
  - "Bli kjent med AK Golf Platform" (tutorial)
  - "Pyramide-forklaring" (definisjon av FYS/TEK/SLAG/SPILL/TURN)
  - "SG-guide" (hva er strokes gained)
  - "Testguide" (hvordan gjennomføre hver test)
  - PDF download-knapp per guide

- **API-dokumentasjon (for integrasjoner):**
  - Link til `/docs/api` eller ekstern Swagger-portal
  - "Generer API-nøkkel"-knapp → Modal med nøkkel-visning (one-time)

- **Juridiske dokumeter:**
  - "Vilkår og betingelser" (link)
  - "Personvern-policy" (link)
  - "Cookie-policy" (link)

**Primær-handlinger:**
- "Last ned guide"-knapp → PDF download
- "Se undertegnede kontrakt"-link → Modal PDF embed
- "Generer API-nøkkel"-knapp → Modal med nøkkel (copy-to-clipboard)

**States:**
- **Normal:** Alle dokumenter listerte
- **Loading PDF:** Skeleton embed
- **API-nøkkel generert:** Toast "Nøkkel kopiert til utklippstavle"

**Tier-gating:**
- Gratis: Kun trenings-guides + juridisk
- Pro: + Coach-kontrakt
- Elite: Samme som Pro

**Datakilder:**
- `Document` (guide PDFs, kontrakt)
- `APIKey` (user-generated API keys for integrations)
- Static pages (vilkår, privacy)

**Kobler til:**
- External PDF viewers
- External API docs

---

## 5.5 Meg > Leaderboards & Challenges (Optional)

**URL/Route:** `/portal/meg/leaderboards` (kan også være egen tab eller modal)  
**Beskrivelse:** Sosiale rangering og challenges. Drill-leaderboards (hvem har høyest benchmark-score), test-leaderboards, challenge-grid.

**Hovedseksjoner:**
- **Tab-velger:**
  - Drill-leaderboards
  - Test-leaderboards
  - Week challenges
  - Global challenges

- **Drill-leaderboards:**
  - Velg drill (dropdown)
  - Leaderboard-liste:
    - Rank
    - Navn
    - Beste resultat (farget grønn hvis top 3)
    - Din rank (highlighted row)

- **Test-leaderboards:**
  - Velg test (dropdown)
  - Leaderboard-liste (samme format)

- **Challenges:**
  - Challenge-kort grid:
    - Challenge-navn
    - Motstand (navn)
    - Periode (f.eks. "Denne uke")
    - Status (in progress / finished)
    - Din resultat vs motstand
    - "Utfordre"-knapp (grå, disabled hvis active) eller "Se resultat"-knapp

**Primær-handlinger:**
- Velg drill/test fra dropdown → Update leaderboard
- "Utfordre"-knapp → Modal send challenge-invite

**States:**
- **Normal:** Leaderboards lastet
- **Loading:** Skeleton-liste
- **Challenge active:** Countdown timer vises

**Tier-gating:**
- Gratis: Leaderboards lesbar (no personal rank)
- Pro: Personlig rank vises, challenges enabled
- Elite: Private challenges + invites, peer-benchmarking

**Datakilder:**
- `DrillScore` (benchmark-scores per drill)
- `TestResult` (test-resultater, leaderboard-aggregering)
- `Challenge` (active/completed challenges)

**Kobler til:**
- Challenge-detalj modal

---

# LIVE SESSION & WIZARD SUMMARY

## Live Session (4-step flow, fullscreen)
1. **Intro:** Økt-navn, drills-preview, "Start"-knapp
2. **Aktiv øvelse:** Timer, drill-video, scoring, "Fullført"-knapp
3. **Øvelse fullført:** Checkmark, resultat-oppsummering, "Neste"-knapp
4. **Oppsummering:** Total tid, drills gjennomført, benchmark-sammenligning, "Lagre økt"-knapp

## Ny økt-wizard (6-step flow)
1. **Velg økt-type:** Template / Egendefinert / AI-forslåtte (Pro+)
2. **Velg template:** (hvis template)
3. **Velg drills:** Søk + filter + drag-drop valgte
4. **Sett økt-detaljer:** Tittel, område, L-fase, CS, M, PR, notater
5. **Velg dato/dag:** Kalender + tid
6. **Bekreft og lagre:** Oppsummering → `POST /api/training-plan-session`

---

# TIER DISTRIBUTION SUMMARY

| Feature | Gratis | Pro | Elite |
|---------|--------|-----|-------|
| **Hjem** | Read-only | Start session | Full + agent-forslag |
| **Tren > Plan** | Read | Edit økter | + Coach-kommentar |
| **Tren > Kalender** | Read | Logg aktiviteter | + Coach-notes |
| **Tren > Øvelser** | Browse | Legge til i plan | + AI-forslag |
| **Tren > Tester** | Read (last 3) | Logg tester | + Benchmark |
| **Live Session** | N/A | Kjøre session | Kjøre + coach-chat |
| **Ny økt-wizard** | N/A | Manual + template | + AI-genering |
| **Mål > Oversikt** | Limited (3 runder) | Fullt 12 mnd | + Peer-compare |
| **Mål > Runder** | Summary | Detalj + export | + Coach-notes |
| **Mål > TrackMan** | N/A | Lesbar + sync | + Ubegrenset historikk |
| **Mål > Baner** | Read | Forbered-forslag | + Coach-strategi |
| **Coach** | Locked | AI Coach | AI + direktechat + booking |
| **Meg > Profil** | Read | Rediger + stats | + Private challenges |
| **Meg > Abonnement** | N/A | Oppgrader | Downgrade |
| **Meg > Innstillinger** | Basis | + 2FA | Samme |
| **Meg > Dokumenter** | Guides + vilkår | + Coach-kontrakt | Samme |

---

# IDENTIFIED GAPS

1. **Passive player experience** — spilleren har ingen vei til å aktivt påvirke planen (PlanAction acceptance, drill-valg). *Solution:* Player-driven adjustments (GAP 1A,1B i implementasjonsforslag).

2. **Keine gamification** — ingen drill-scoring, achievements, eller week-rings. *Solution:* Drill-benchmark system (GAP 2).

3. **Closed-loop mangler** — ingen automatic SG-to-training kobling eller tournament-prep-automodus. *Solution:* Agent-triggered actions (GAP 3).

4. **Baneguide frakoblet** — ingen course-specific training prep. *Solution:* Forberedelse-modal i Mål > Baner (GAP 4).

5. **TrackMan silo** — launch-monitor data kobles ikke til sessions. *Solution:* Session linking + per-club trend (GAP 5).

6. **Ingen FYS (fysikk/golf-fitness)** — pyramide-område mangler konkrete øvelser. *Solution:* Golf fitness templates (fase 2, GAP 6).

7. **Mental (M) frakoblet** — M og PR er ikke synlige eller trackbare. *Solution:* M/PR widgets i Hjem + Tren (GAP 7).

8. **Onboarding komplisert** — ny bruker får ikke 3-minute self-serve plan-oppretting. *Solution:* Streamlined wizard (GAP 8).

9. **Ingen sosial** — ingen drill-challenges, test-leaderboards, eller peer-comparison. *Solution:* Challenge-system + leaderboards (GAP 9).

10. **Offline ikke støttet** — session-prep og data må være online. *Solution:* Offline session-prep (GAP 10).

---

# DATAKILDER MATRISE

| Skjerm | Primær modeller | Signals brukt | API endpoints (tentativ) |
|--------|-----------------|---------------|-------------------------|
| Hjem | TrainingPlan, TrainingPlanSession, Round, Tournament, TestResult, Achievement | SG_TOTAL, COMPLETION_RATE, TOURNAMENT_PROXIMITY, STREAK | GET /training-plan, GET /rounds, GET /tournaments, GET /achievements |
| Tren > Plan | TrainingPlan, TrainingPlanSession, ExerciseDefinition, PlanAction | PYRAMIDE_ADHERENCE, TRAINING_INDEX | GET /training-plan, POST /plan-action/accept, PATCH /training-plan-session |
| Tren > Kalender | TrainingPlanSession, Round, TestResult, Tournament, TrainingPlanSessionLog | COMPLETION_RATE | GET /calendar, POST /activity/add |
| Tren > Øvelser | ExerciseDefinition, ExerciseBenchmark | (none) | GET /exercises, POST /exercise-to-plan |
| Tren > Tester | TestDefinition, TestResult, TrainingPlanSessionLog | TEST_DELTA, COMPOSITE_TEST | GET /tests, POST /test-result |
| Live Session | TrainingPlanSession, LiveSessionLog, DrillScore, ExerciseBenchmark | (real-time) | POST /live-session/start, POST /live-session/drill-complete, POST /live-session/end |
| Ny økt-wizard | TrainingPlan, ExerciseDefinition, TrainingPlanSession | (AI skill inputs) | POST /training-plan-session |
| Mål > Oversikt | Round, Signal, TestResult, TrainingPlanSessionLog | SG_TOTAL, SG_BREAKDOWN, HCP_DELTA, TRAINING_INDEX | GET /rounds/sga, GET /signals/weakness |
| Mål > Runder | Round, TrackManSessionAnalytics, CoachingSession | SG_BREAKDOWN | GET /rounds, GET /round/:id |
| Mål > TrackMan | TrackManSessionAnalytics, TrackManDevice, Round | DISPERSION_TREND, TRACKMAN_METRIC | GET /trackman/sessions, POST /trackman/sync |
| Mål > Baner | Round, CourseDefinition, CoachingSession, Signal | SG_AREA_DETAIL | GET /courses, GET /course/:id/stats |
| Coach > AI | CoachingSession, Signal, TrainingPlan, Round | SG_TOTAL, SG_BREAKDOWN, TRAINING_INDEX | POST /coach/ai-chat |
| Coach > Direct | CoachingSession, Coach, CoachingBooking | (none) | POST /coaching/chat, GET /coach/availability |
| Coach > Booking | CoachingBooking, Coach, UserAvailability | (none) | GET /coach/calendar, POST /coaching/booking |
| Meg > Profil | User, UserGolfId, Subscription, TrainingPlanSessionLog, Round, Achievement | (none) | GET /user/profile, PATCH /user/profile |
| Meg > Abonnement | Subscription, SubscriptionFeature | (none) | GET /subscription, POST /subscription/upgrade, POST /subscription/cancel |
| Meg > Innstillinger | UserPreferences, UserSession, APIKey | (none) | PATCH /user/preferences, POST /api-key/generate |
| Meg > Leaderboards | DrillScore, TestResult, Challenge | (none) | GET /leaderboards/drills, GET /challenges |

---

# FINAL NOTES

- **Ikke spesifisert:** Eksakt UI for "agent-forslag godkjenn/avvis" (antatt modal eller inline confirm)
- **Ikke spesifisert:** Video-call integrasjon (Zoom/Google Meet) for Elite coaching sessions — antas embedded iframe
- **Ikke spesifisert:** Pricing tiers for Pro ($12/mnd) og Elite ($29/mnd) — basert på wireframe-prompt antagelse
- **Ikke spesifisert:** Eksakt offline-strategi for session-prep (Service Worker / local cache)
- **Ikke spesifisert:** Multi-language support beyond Norwegian/English — wireframe spesifiserer norsk bokmål som primær
- **Ikke spesifisert:** Mobile responsiveness (wireframes spesifiserer desktop-first, men Next.js implementasjon antas responsive)

---

**Inventory generert:** 2026-05-10  
**Basert på:** playerhq-komplett-spec.md, playerhq-design-brief.md, playerhq-agent-arkitektur.md, 2026-05-08-informasjonsarkitektur.md, playerhq-wireframe-prompt.md, prompt-treningsdagbok.md, playerhq-10-prompts.md, playerhq-implementasjonsforslag.md, playerhq-gap-analyse.md

