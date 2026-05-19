# Unified Workbench — Design Spec

**Status:** Design approved (Anders, 2026-05-19)
**Arkitektur:** A02 — Alt på én side (vertikal scroll)
**Skopet:** Workbench-UI (master spec). Datalag (SG-engine, TrackMan, Goals, Slag-prioritering) er submoduler med egne specs senere.

---

## 1. Kontekst og hensikt

Etter en lang designprosess (478 wireframes, 6 hoved-design-eksempler, flere Linear-hybrider, og 5 workbench-iterasjoner TPK01–TPK05) har Anders besluttet:

**PlayerHQ + CoachHQ skal ha én unified workbench der ALL planlegging skjer.** Spilleren og coachen får hver sin rute, men deler komponent-bibliotek. Workbench skal være ett vertikalt scroll-område — ingen tabs, ingen drawers — alt synlig samtidig.

**De 7 MVP-funksjonene som alle bor i workbench:**

1. Årsplanlegger med periodisering
2. Treningsplanlegger
3. Kalenderoversikter (dag/uke/måned/sesong)
4. Turneringsplanlegger
5. Statistikk (aggregat = **snittscore**, ikke HCP)
6. SG Players Hub (med DataGolf-sammenligning)
7. Målsetninger (Resultatmål + Prosessmål med live trackers)

**Felles for begge roller:** Spiller og coach bruker samme workbench-shell + samme primitive komponenter, men forskjellige ruter og dataset.

---

## 2. Arkitektur

### Ruter

| Rolle | Rute | Datasubjekt |
|---|---|---|
| Spiller | `/portal/tren` | Den innloggede spilleren (én bruker) |
| Coach | `/admin/plans/[spillerId]` | Valgt spiller fra coachens stall |

Coach navigerer til workbench ved å klikke en spiller fra `/admin/spillere`. Coach kan ikke selv være "i" workbench — workbench er alltid sentrert på en spiller. Coach-spesifikke views (multi-spiller-oversikt, kalender på tvers, lagstats) lever på andre ruter.

### Komponent-bibliotek (delt)

Begge ruter rendrer `<WorkbenchShell>` med to props:
- `role: "PLAYER" | "COACH"`
- `data: WorkbenchData` (player profile, season plan, week sessions, goals, sg insights, trackman history)

`<WorkbenchShell>` komponerer 7 vertikale seksjoner:

1. `<WorkbenchHero>` — eyebrow + title + actions
2. `<AnnualGanttStrip>` — sesong-kontekst
3. `<ThreePaneWorkbench>` — uke-planlegging (spillere/profil + kalender + drills)
4. `<MaalTrackerRow>` — mål-trackers
5. `<InsightStrip>` — SG + DataGolf + slag-prioritering
6. `<TrackManTimeline>` — siste TrackMan-økter
7. `<WorkbenchStickyFooter>` — pyramide + stats + CTAs

Hver seksjon er rolle-aware (rendrer ulikt for spiller vs coach), men deler grunnstruktur og styling.

### Side-DNA (begge roller)

```
┌──────────────────────────────────────────────────────────┐
│ Sidebar 220px │ Topbar 56px (⌘K + breadcrumb + actions)  │
│ (Linear-stil) ├──────────────────────────────────────────│
│               │ Hero 80px                                 │
│               │ Årsplan-Gantt-strip 120px                 │
│               │ 3-pane workbench 600-800px                │
│               │ Mål-tracker-rad 250px                     │
│               │ Insight-strip 320px                       │
│               │ TrackMan-timeline 150px                   │
│               │ ...vertikal scroll...                     │
│               ├──────────────────────────────────────────│
│               │ Sticky footer 64px                        │
└──────────────────────────────────────────────────────────┘
```

Total høyde: ~1900px scrollable. Sticky topbar + sticky footer.

---

## 3. Branding (låst)

### Farger

```css
--bg: #FAFAF7;            /* cream */
--fg: #0A1F17;            /* deep forest */
--primary: #005840;       /* forest green */
--accent: #D1F843;        /* lime */
--card: #FFFFFF;
--border: #E5E3DD;
--muted: #5E5C57;
--danger: #A32D2D;
--success: #2C7D52;
```

### Disciplin-farger

```css
--fys: #1A4D2E;
--tek: #005840;
--slag: #2C7D52;
--spill: #88B45A;
--turn: #D1F843;
```

### Typografi (Google Fonts)

- `Inter Tight` (500, 700) — hero, section headings
- `Inter` (400, 500) — UI body
- `JetBrains Mono` (400, 500) — **alle tall, eyebrows, timestamps, data-labels**
- `Instrument Serif` italic — sparsomt på 1–2 utvalgte ord per hero

### Andre tokens

- Border-radius: 16px (cards), 12px (buttons), 999px (pills/CTAs)
- Ikoner: inline SVG, Lucide-stil, stroke 1.75, currentColor
- INGEN emojier
- Norsk bokmål (æ, ø, å)
- Tallformat norsk: `+3,5` (komma), `47 250 kr`
- Dato: `19. mai 2026`
- Tid: 24h `09:00`

---

## 4. Seksjonsspesifikasjon

### 4.1 Hero (80px)

**Spiller:**
- Eyebrow mono: `MIN WORKBENCH · UKE 21 · 19—25 MAI 2026`
- Title Inter Tight 32px: `Min ` + *workbench* (Instrument Serif italic) + ` — bygg, juster, be om hjelp`
- Actions right: `+ Ny økt` (lime) · `Be om økt fra coach` (forest) · `AI-foreslå uke` (outline) · `Logg gjennomført økt` (outline)

**Coach:**
- Eyebrow mono: `WORKBENCH · COACH-MODUS · UKE 21 · MARKUS R.P.`
- Title: `Planlegg for ` + *Markus R.P.* (italic) + ` — uke 21`
- Actions: `+ Ny økt` · `AI-foreslå uke` · `Kopier forrige uke` · `Send til spiller`

### 4.2 Annual Gantt strip (120px)

12 mnd jan—des. 5 periode-blokker:
- GRUNNTRENING (jan—mars) — lys grå-grønn
- OPPBYGGING (mars—april) — medium grønn
- **SPESIALISERING** (april—juni) — forest med 2px lime ring (AKTIV)
- KONKURRANSE (juni—aug) — lime fyll
- OVERGANG (sept—okt)
- HVILE (nov—des)

5 turneringsflagg (røde, klikkbare):
- 10. juni Sørlandsåpent (lime stjerne ★ hvis "mitt hovedmål")
- 24. juni Bossum Open
- 8. juli NM Slag (lime stjerne ★ for spiller; coach ser markering hvis spilleren har markert)
- 22. juli Trondheim Open
- 5. aug GFGK Mesterskap

"I DAG"-pin: rød vertikal linje på 19. mai.

Klikkbar uke-markør under bar (U17, U18, U19, U20, U21 highlightet lime).

### 4.3 3-pane workbench (600—800px)

#### Spiller-versjon:

**Pane A — Min profil (240px)**
- Profilkort i forest gradient: avatar 80×80 + navn + HCP + status-pill "På plan denne uka"
- "MINE MÅL" mini-snippets (3 mål med micro-progress, klikk for å scrolle til mål-rad)
- "MIN STREAK" 14-dagers visualisering
- "MIN COACH" card med Anders + 2 buttons: "Send melding" + "Be om økt"

**Pane B — Min kalender (sentralt)**
- Tab-strip: DAG · **UKE** · MÅNED · SESONG
- 7-dagers grid Man—Søn, Man = today med 2px lime ring
- Tid 08:00—20:00
- Økt-blokker med:
  - Drill-name (Inter Tight)
  - Tidsintervall (mono)
  - Discipline-pill (FYS/TEK/SLAG/SPILL/TURN)
  - Badge: `AV ANDERS` (mono forest) / `SELVPLANLAGT` (lime) / `✓ FULLFØRT` (grønn med checkmark SVG)
- Tomme slots: "Selvplanlegg eller be om økt" hint-tekst
- Stor lime "+"-CTA på søndag: "Be om plan-justering"

**Pane C — Drills + Periodisering (320px)**
- "ANBEFALT FOR DEG" (lime stripe topp): 3 AI-forslag med Bruk-knapp
- "Mine drills" tabs: Alle · Favoritter · Coach har tildelt (5 nye)
- 6 drill-kort med discipline-pill + duration mono + status-badge
- "AKTIV PERIODE" forest dark card:
  - "Spesialisering" + mono "uke 17—22 · CS70 → CS80"
  - 5 pyramide-bars (TUR/SPILL/SLAG/TEK/FYS)
  - Ring-progress 75% mot CS80
  - Countdown rød: "Sørlandsåpent · 21 dager"
  - Coach-melding italic: *"Du har vært jevn denne uka, Markus."*

#### Coach-versjon:

**Pane A — Spillere (240px)**
- "8 aktive" mono header
- Søk + filter-chips: Alle · Aktiv plan · Trenger plan · Pauset
- 8 player-cards (Markus aktiv, lime tint + 2px lime left-border)
- Hver card: avatar + navn + HCP-mono + 5 pyramide-dots + status-prikk

**Pane B — Markus' kalender (sentralt)**
- Samme som spiller-versjon, men ALL data er for valgt spiller
- Konflikt-markører hvis andre spillere har samme slot
- Drag-handles synlige

**Pane C — Drill-bibliotek + Periodisering for Markus (340px)**
- "AI-FORESLÅR FOR MARKUS" (lime stripe): 3 AI-forslag basert på Markus' SG + pyramide-balanse
- Full drill-bibliotek "84 tilgjengelige" (ikke filtrert)
- "AKTIV PERIODE for Markus" forest card (samme som spiller, men coach kan redigere)

### 4.4 Mål-tracker-rad (250px)

3 store mål-kort horisontalt (`<MaalTrackerRow>`):

**Card 1 — Resultatmål (`<ResultatMaalTracker>`):**
- Eksempel: "Top 10 NM Slag"
- Stor SVG ring-progress: sannsynlighet 38% basert på siste form
- Mono: `50 DAGER`
- Sub italic: *"Du må forbedre approach-spillet med +0,4 SG for 50% sannsynlighet"*

**Card 2 — Prosessmål (`<ProsessMaalTracker>`):**
- Eksempel: "Snitt under 72 på Srixon"
- SVG linje-graf 12 punkter — siste 12 runder snittscore
- Status-chip: `⬇ 71,4` (mono, grønn hvis bedre enn mål)
- Streak: 5 av siste 7 runder under 72

**Card 3 — Resultatmål med deadline:**
- Eksempel: "HCP under +2,0 innen sesongslutt"
- Horisontal progress-bar med soner (rød/gul/grønn) — 60% fremgang
- Mono: `82 DAGER IGJEN`

Alle 3 trackers bruker `<MaalProgressRing>`, `<MaalProgressBar>`, og `<MaalCountdown>` primitiver.

CTA bunn-right: `+ Nytt mål` (lime outline)

### 4.5 Insight-strip (320px)

3 kolonner side om side (`<InsightStrip>`):

**Kolonne 1 — SG-trend per disipplin:**
- SVG linjegraf 90 dager
- 4 linjer: Off-the-tee, Approach, Around-green, Putting
- Lime highlight på linjen med størst forbedring
- Y-axis mono SG-verdier
- X-axis mono måneds-labels

**Kolonne 2 — Slag-prioritering for neste turnering:**
- Header: `SLAG-PRIORITERING · SØRLANDSÅPENT (21 DAGER)`
- Topp 3 prioriteringer (basert på SG + bane-profile + svakheter):
  1. **Approach 100—150m** — `+0,42 SG potensial` — "Bossum har 6 hull i dette området"
  2. **Putting 3—6m** — `+0,38 SG potensial` — "SG har sunket 0,4 siste 30 dager"
  3. **Driver-presisjon** — `+0,22 SG potensial` — "Smale fairways på Bossum"
- Hver med Bruk-knapp: "Opprett drill-økt" (oppretter session med discipline-prefilled)

**Kolonne 3 — DataGolf-sammenligning:**
- Header: `DU vs DATAGOLF BENCHMARK · KATEGORI A1`
- 5 horisontale bars (én per disipplin):
  - Off-the-tee: du -0,12 vs benchmark
  - Approach: du -0,42 (rød — størst gap)
  - Around-green: du +0,15
  - Putting: du -0,28
  - Strategy: du +0,08
- Mono SG-deltaer per bar

### 4.6 TrackMan-timeline (150px)

5 siste TrackMan-økt-kort horisontalt:
- Dato mono
- Drill-type (Inter Tight)
- Hovedmetrikk (f.eks. "Club-speed 112 mph", "Smash 1,48")
- Lime "Åpne" — lenker til `/portal/mal/sg-hub/[club]`

Header: "MIN TRACKMAN · SISTE ØKTER" (spiller) / "MARKUS' TRACKMAN" (coach)

CTA right: "Importer ny økt" eller "Last opp TrackMan-fil"

### 4.7 Sticky footer (64px)

- **Venstre:** "Min pyramide denne uka:" + 5 mini horizontal bars (FYS/TEK/SLAG/SPILL/TURN, discipline-fargede) med mono prosenter
- **Senter:** Mono summary: `5 PLANLAGT · 1 FULLFØRT · 195 MIN · 67% PYRAMIDE`
- **Høyre:** 2 buttons:
  - Spiller: `Be om økt-forslag` + `Logg ny økt` (lime, primary)
  - Coach: `Lagre` + `Send plan til Markus` (lime, primary)

---

## 5. Datalag — Submodul-referanser

Disse er **out-of-scope for denne specen** men kreves for at workbench skal fungere. Hver får egen spec senere:

### 5.1 SG-engine

- **Hva:** Stroke Gained-beregning per shot, aggregering per disipplin, sammenligning mot DataGolf-benchmark
- **Trenger:** `Round`-modell utvidet med shot-by-shot data, `SGInsight`-modell med category + value + timestamp, DataGolf-benchmark-tabell per kategori
- **Spec:** `2026-05-XX-sg-engine-design.md` (TBD)

### 5.2 TrackMan-pipeline

- **Hva:** Import av TrackMan-CSV/CSV-eksport, parsing til `TrackManSession` + `Shot`-rader, automatisk SG-beregning, kobling til drill-økter
- **Spec:** `2026-05-XX-trackman-pipeline-design.md` (TBD)

### 5.3 Goal-system

- **Hva:** Schema-utvidelse med `goalCategory: OUTCOME | PROCESS`, reusable trackers, validering, detalj-side `/portal/mal/goal/[id]`
- **Spec:** `2026-05-XX-goal-system-design.md` (TBD)

### 5.4 Slag-prioritering (AI)

- **Hva:** Algoritme som tar SG-svakheter + neste turnering + bane-profile → topp 3 slag som bør prioriteres
- **Trenger:** `CourseProfile`-modell (Bossum krever mer pitch enn Sørlandsåpent), prioriterings-engine
- **Spec:** `2026-05-XX-slag-prioritering-design.md` (TBD)

### 5.5 Aggregate innsikter

- **Regel:** Aggregate score-innsikter bruker **snittscore** (ikke HCP) som benchmark
- **Trenger:** `MovingAverageScore`-beregning over siste N runder, vises som referanse-linje i alle relevante grafer

---

## 6. Stats og forklaringer

**Hvorfor "alt på én side"?** Anders vil at workbench skal føles som et virkelig verksted — alt verktøy synlig, ingen klikk for å bytte kontekst. Vertikal scroll matcher "fokuser → zoom inn"-mentalt mønster.

**Hvorfor delt komponent-bibliotek og ikke role-toggle?** Spiller og coach har fundamentalt forskjellig context. Coach ser alltid for én spiller om gangen. Role-toggle ville bli forvirrende.

**Hvorfor sticky footer?** Pyramide-balanse + ukens stats er den viktigste "her er du nå"-informasjonen — bør være synlig under alt arbeid.

### Designprinsipp: Naturlig flyt, ikke overveldende

Workbench har mye innhold, men må IKKE føles kaotisk. Følgende regler styrer flyten:

1. **Top-down narrativ:** Seksjonene følger en planleggings-fortelling, ikke tilfeldig rekkefølge:
   1. *Hvor er jeg?* (hero + årsplan-gantt — sesong-kontekst)
   2. *Hva planlegger jeg nå?* (3-pane workbench — denne uka)
   3. *Hva er jeg på vei mot?* (mål-trackers)
   4. *Hva må jeg jobbe med?* (SG + slag-prioritering)
   5. *Hva har jeg gjort sist?* (TrackMan-historikk)
   6. *Hvor står jeg akkurat nå?* (sticky footer — pyramide + stats)

2. **Vertikal rytme:** Hver seksjon har klar høyde (Hero 80px, Gantt 120px, 3-pane 600-800px, mål 250px, insight 320px, TrackMan 150px). Konsistente gap (32px) mellom seksjoner. Aldri to seksjoner med samme dominant farge ved siden av hverandre.

3. **Visuell hierarki:** Hver seksjon har én tydelig "hovedaktør":
   - 3-pane: KALENDEREN (sentralt, dominerer bredde)
   - Mål-rad: TRACKERS (3 like kort)
   - Insight-strip: SG-GRAF til venstre (mest plass)
   - Andre elementer er støttende, ikke konkurrerende

4. **Whitespace som verktøy:** Padding 24-32px innenfor cards, 16-24px gap mellom subkomponenter. Tette tabeller bare når det gir mening (drill-bibliotek, spillerliste).

5. **Progressive disclosure:** Detaljerte data åpnes på klikk, ikke vist by default:
   - Klikk en uke i Gantt → scrollIntoView til 3-pane workbench for den uka
   - Klikk en økt i kalender → modal eller drawer med drill-detaljer
   - Klikk mål-card → full mål-detaljside `/portal/mal/goal/[id]`
   - Klikk insight i SG → opprett drill-økt fra insight

6. **Konsistente CTA-plasseringer:**
   - Primary CTA (lime fyll) alltid bunn-høyre i seksjon
   - Sekundære actions (outline) på samme rad
   - Floating actions kun i sticky footer

7. **Empty states som forteller:** Når en seksjon mangler data, vis hva som kommer hit i stedet for tom firkant. F.eks. tom mål-rad: "Du har ingen aktive mål ennå. Resultatmål er hva du vil oppnå (vinne Srixon Tour). Prosessmål er hva du må gjøre (snitt under 72)."

### Live Session Logger — separat skjerm

Når spilleren klikker en økt i kalenderen for å GJENNOMFØRE den (ikke bare se), åpnes Live Session Logger på `/portal/live/[sessionId]/active` — en mobil-først fullscreen-modus utenfor workbench. Se egen spec: `2026-05-19-live-session-logger-design.md`.

---

## 7. Verifikasjon

Når workbench er implementert:
- `/portal/tren` og `/admin/plans/[spillerId]` rendrer begge `<WorkbenchShell>` med riktig role + data
- Alle 7 seksjoner viser ekte Prisma-data (eller tydelig empty-state)
- Sticky footer kalkulerer pyramide-balanse live fra ukens økter
- Mål-trackers oppdateres når ny økt logges
- AI-forslag i drill-bibliotek og slag-prioritering bruker SG-engine
- TrackMan-timeline viser siste 5 økter fra `TrackManSession`
- DataGolf-sammenligning rendrer benchmark fra `DataGolfBenchmark`-tabell
- `npx tsc --noEmit` 0 feil
- `npm run build` rent
- AK Golf-branding strengt: cream + forest + lime + Inter Tight + JetBrains Mono + Instrument Serif italic
- Lucide-ikoner stroke 1.75, ingen emojier
- Norsk bokmål gjennomgående

---

## 8. Implementeringsrekkefølge (foreslått)

1. Bygg `<WorkbenchShell>` + 7 tomme seksjons-komponenter med role-aware skeleton
2. Implementer `<AnnualGanttStrip>` (gjenbruk fra eksisterende årsplan-komponent)
3. Implementer `<ThreePaneWorkbench>` — bruk TPK05-design som referanse
4. Implementer `<MaalTrackerRow>` med 3 tracker-primitiver — krever Goal schema-utvidelse
5. Implementer `<InsightStrip>` — krever SG-engine submodul
6. Implementer `<TrackManTimeline>` — krever TrackMan-pipeline submodul
7. Implementer `<WorkbenchStickyFooter>` med live pyramide-beregning
8. Bytt `/portal/tren/page.tsx` til ny `<WorkbenchShell role="PLAYER">`
9. Bygg `/admin/plans/[spillerId]/page.tsx` med `<WorkbenchShell role="COACH" spillerId={id}>`
10. Verifikasjon + Vercel deploy + iPad-test
