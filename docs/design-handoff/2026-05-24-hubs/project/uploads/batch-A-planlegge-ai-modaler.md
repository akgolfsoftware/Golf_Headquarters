# Claude Design — Batch A · PlayerHQ Planlegge + 3 AI-modaler

> **Output:** 6 HTML-filer i ZIP. Bruk samme designsystem som Bundle 3.
>
> **Designspråk (må følges):**
> - **Farger:** Forest `#005840`, Forest dark `#003A2A`, Accent lime `#D1F843`, Lime deep `#BFE933`, Cream surface `#FAFAF7`, Card `#FFFFFF`, Tint `#F1EEE5`, Ink `#0A1F18`, Muted `#5E5C57`, Border `#E5E3DD`
> - **Pyramide-farger:** FYS `#005840`, TEK `#1A7D56`, SLAG `#D1F843`, SPILL `#B8852A`, TURN `#5E5C57`
> - **Fonts (Google Fonts):** Inter (body), Inter Tight (display), Instrument Serif italic (hero-aksent-ord), JetBrains Mono (eyebrows + tabular tall)
> - **Radius:** 16px cards, 12px inputs/buttons, 8px badges, 999px pills
> - **Spacing:** 8pt-grid (kun multipler av 8px)
> - **Ikoner:** Lucide kun, inline SVG, 24px default, 1.5px stroke
> - **Aldri emojis.** Norsk bokmål.
> - **Mobile-first:** iPhone 14 (375px) til desktop (1280px+)

## Output-filer

1. `planlegge-arsplan.html` — Skjerm 1, tab "Årsplan" (default)
2. `planlegge-treningsplan.html` — Skjerm 1, tab "Treningsplan"
3. `planlegge-turneringer.html` — Skjerm 1, tab "Turneringer"
4. `ai-foresla-drill.html` — Modal A
5. `ai-foresla-turnering.html` — Modal B
6. `ai-mal-bygger.html` — Modal C (wizard, 4 steg som 4 varianter ELLER én scrollbar fil)

---

## 0. `/portal/planlegge` — PlayerHQ PLANLEGGE-hovedseksjon (NY 2026-05-23)

**Kontekst:**
Den viktigste siden for spilleren. Sentral planleggings-hub som samler årsplan, periodisering, turneringsplan, treningsplan og teknisk plan. 5 tabs på top — dette er navet for all planlegging.

**Eksisterende container:** `/portal/planlegge` har basic tab-bar + summary-cards med "Åpne"-CTA til gamle sider. Vi trenger en helt ny pixel-perfekt design.

**Hovedstruktur:**
- Hero: eyebrow "PLAYERHQ · PLANLEGGE" + tittel "Plan din *utvikling*"
- Tab-bar (5 tabs med lime-accent active): Årsplan · Treningsplan · Mål · Turneringer · Drills

### Tab 1: ÅRSPLAN (default)

**Inneholder periodisering for hele sesongen (Bompa-modellen):**

**1A. Sesong-gantt (top, full bredde):**
- Tidslinje JAN → DES med måneder som kolonner
- 6 periodeblokker som horisontal-strips med ulike farger:
  - GRUNNTRENING (jan-feb) — `#5E5C57` (turn-grå)
  - OPPBYGGING (mar-apr) — `#1A7D56` (tek-grønn)
  - SPESIALISERING (mai-jun) — `#005840` (fys-forest)
  - KONKURRANSE (jul-aug) — `#D1F843` (slag-lime)
  - OVERGANG (sep-okt) — `#B8852A` (spill-okker)
  - HVILE (nov-des) — lett grå
- "I dag"-stiplet vertikal linje med dato-label
- Tournament-flagg som pin-ikoner på datoer (klikkbar → tournament-detail)
- Drag-resize-handles på periodeblokk-kanter (drag for å justere lengde)
- Live tooltip ved drag: "Spesialisering · 1. mai → 14. juni · 6 uker"
- "Periodiserings-popup" trigges når periode endres (legger inn FYS/TEK/SLAG-volum per uke)

**1B. Aktiv periode-status (under gantt):**
- Card: "Du er i SPESIALISERING · uke 3 av 6"
- 4 mini-KPI: Volum % · Intensitet % · Sesjoner denne uka · Neste turnering
- 2 CTA: "Endre periode" (åpner popup) · "Hopp til Treningsplan-tab"

**1C. Tournament-strip (under aktiv periode):**
- Horisontal scrollbar liste med kommende 5 turneringer
- Per kort: dato, navn, tour-badge (Olyo/Srixon/etc.), HCP-krav, forberedelse-status
- "Meld på"-CTA hvis ikke påmeldt, "Se forberedelse"-CTA hvis påmeldt

### Tab 2: TRENINGSPLAN

**Den ukentlige planen + teknisk plan i ett view:**

**2A. Aktiv teknisk plan-card (top):**
- "Vinter 2026 · grunntrening" (italic Instrument Serif)
- 4-celle KPI: Status (UTKAST/AKTIV/FULLFØRT) · Periode · CS-progresjon · TM hit-rate
- Tabs INNI: Oversikt · Posisjoner · Drills · Hit-rate

**2B. Ukeplan (under, 7-dagers grid):**
- DAG/UKE/MÅNED-switcher øverst-høyre
- Grid med 7 kolonner (Man-Søn) + tidssystem
- Drill-blokker plassert per dag/tidspunkt:
  - Farge per pyramide (FYS/TEK/SLAG/SPILL/TURN)
  - Klikk → drill-detail-modal
  - Drag-drop for å flytte mellom dager
- Empty-state: "Ingen økter denne uka. Be coach om plan eller AI-generer."

**2C. Drill-bibliotek-strip (under ukeplan):**
- "Favoritter" · "Anbefalt" · "Coach foreslår"-tabs
- Horisontal scrollbar liste med drill-kort
- Per kort: navn, kategori, tid, hit-rate, "Legg til denne uka"-CTA

### Tab 3: MÅL

**Sesongmål + prosessmål:**

**3A. Aktive mål-grid (3 cards i rad):**
- Per mål-card:
  - Type-badge: RESULTAT / PROSESS
  - Title (italic): "HCP +3,0 innen sesongslutt"
  - Progress-ring (sentralt): "60%"
  - Sub-info: "60 dager igjen"
  - Mini-graf med fremgang siste 4 uker
- "Nytt mål"-card til slutt (lime-stiplet border + +)

**3B. Mål-historikk (under, expandable):**
- Tabell med tidligere mål + status (OPPNÅDD/AVBRUTT/UTLØPT)

### Tab 4: TURNERINGER

**Turneringsplanlegger med tour-integrasjon:**

**4A. Sesong-overview (top):**
- Tidslinje JAN→DES med turnering-prikker plassert
- Tour-filter pills: Alle · Olyo · Srixon · Garmin · Klubb
- HCP-krav-filter

**4B. Påmeldte turneringer-liste:**
- Per row: dato, navn, sted, status, forberedelse-progress, link
- Status-pills: PÅMELDT / FORBEREDER / FULLFØRT
- Hver turnering har 4-ukers forberedelse-plan som auto-genereres

**4C. AI-foreslå turnering-knapp (sticky):**
- Lime CTA "AI-foreslå turnering" → åpner AI-modal (separat prompt)

### Tab 5: DRILLS

**Drill-biblioteket:**

**5A. Filter-bar:**
- Kategori: ALLE · FYS · TEK · SLAG · SPILL · TURN
- Anlegg: ALLE · Mulligan Indoor · GFGK Range · GFGK Bane
- Tid: < 15 min / 15-30 / 30+

**5B. Drill-grid (3 kolonner desktop, 1 mobile):**
- Per drill-card:
  - Cover-bilde / illustrasjon
  - Tittel + kategori-badge
  - Tid + utstyrskrav (TrackMan-ikon hvis krevd)
  - CS-nivå-prikker
  - Favoritt-stjerne (klikkbar)
  - "Legg til ukens plan"-CTA

**5C. AI-foreslå drill-knapp (sticky bottom):**
- "AI foreslå drill basert på SG-svakhet"

### Mobile-tilpasning

- Tabs blir horizontal scroll med fade-edges
- Gantt blir kortere, scrollable
- Mål-grid blir 1 kolonne
- Drill-grid blir 1 kolonne
- Sticky CTAs bunner

### Interaksjoner / krav

- URL-state: `?tab=arsplan|treningsplan|mal|turneringer|drills`
- Drag-resize på årsplan trigger periodiserings-popup (separat)
- Drill-favoritt = optimistic update (Q10)
- AI-modaler er separate prompts (foreslå drill, turnering, mål-bygger)

### Data-dependencies (Prisma)

- SeasonPlan + PeriodBlock (gantt)
- TechnicalPlan + PositionTask (teknisk plan-card)
- TrainingSessionV2 (ukeplan)
- Goal (mål-tab)
- Tournament + TournamentEntry + TournamentPreparation (turneringer)
- ExerciseDefinition + UserFavoriteDrill (drill-bibliotek)
- ClubMetricTrend (CS-progresjon)

---

## 5. AI foreslå drill — Modal

**Kontekst:**
Spiller klikker "AI-foreslå drill" knapp.

**Modal-spec:**
- 600px bred (mobile fullscreen)
- Loading: "Analyserer dine siste 90 dager..."
- Resultat: 3 drill-kort med "Hvorfor denne?"-begrunnelse + "Legg til i ukens plan"-CTA

---

## 6. AI foreslå turnering — Modal

**Modal-spec:**
- Loading: "Sjekker Olyo Tour, Srixon Tour, Garmin Norges Cup..."
- 3-5 turneringskort med HCP-vurdering + AI-sannsynlighet for topp-10
- "Meld på" + "Se detaljer"-CTA

---

## 7. AI mål-bygger — Modal

**Modal-spec (3-stegs flyt):**
1. Input: "Hva vil du oppnå?" (free-text + kategori-select)
2. AI-genererer: 3-5 SMART-mål med KPI + avhengighet
3. Velg + lagre

---

