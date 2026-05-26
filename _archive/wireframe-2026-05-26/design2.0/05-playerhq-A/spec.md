# Mini-batch playerhq-A - Maal-data

**5 skjermer i denne mini-batchen.** Felles moenster: PlayerHQ-list/detalj rundt
maal-data (baner, HCP-maal, leaderboard, tester, TrackMan). Tier-gating er
sentralt: Free ser kjernen, Pro laaser opp trender og projeksjon, Elite tilbyr
coach-vurdering. Markus Roinaas Pedersen er referansespiller.

**Generer alle 5 skjermer i denne sesjonen.** Foelg anti-state-katalog-regel
fra `felles-instruks.md` (last opp foerst) -- EEN produksjons-skjerm per HTML,
ikke captioned mini-mockups.

---

## Felles for PlayerHQ-skjermer

- **Sidebar:** LYS, 220px (#FFFFFF), enkelt-lag. Active item: rgba(209,248,67,0.30) bg + #0A1F18 tekst. ALDRI moerk rail som i CoachHQ.
- **Hero:** Italic Instrument Serif 36px observasjons-fragment (aldri "God morgen, Markus" eller "Welcome back"). Eksempel: *"8 baner spilt, Markus."*
- **Tier-gating:** Free / Pro / Elite. Bruk lock-overlay-card med Lucide `Lock` 48px + 3 fordeler + CTA "Oppgrader til Pro ->". Pro-only-features paa Elite-skjermer faar inline lock-state.
- **Pyramide-farger:** FYS groenn `#16A34A`, TEK darker primary `#005840`, SLAG lime accent `#D1F843`, SPILL gold `#F4C430`, TURN graa `#5E5C57`.
- **Lower-is-better metrics (HCP, score, puttar):** Nedgang vises som success-groenn, oppgang som danger-roed. Dette er kritisk paa Mal-detalj (HCP-mal) og test-detalj.
- **Higher-is-better metrics (SG, distanse, antall oekter, badges):** Motsatt.
- **Tabular nums** (JetBrains Mono) paa alle score-, rang-, distanse- og dato-kolonner.

---

## Pakker i denne mini-batchen

---

## Pakke 1/5: Baner

# AK Golf Platform — PlayerHQ — Baner

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/mal/baner`
- **Arketype:** B — List + filter (kart + tab-variant)
- **Tier-gating:** Alle. Anbefalt-tab bruker Pro-AI for personalisering (Free ser «Populært»-fallback).
- **HTML-referanse:** `wireframe/screen-deck/playerhq/baner.html`
- **Audit:** `wireframe/audit/playerhq-baner.md`
- **Tilhørende modaler:** `CourseDetailModal`, `GolfBoxImportModal`, `MapFilterModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar er LYS. Eksakte token-navn — ikke hardkode hex. Markus er referanse-spilleren (basert i Fredrikstad).

## Spec — hva skjermen er for

Baner er Markus' bibliotek over golfbaner — både de han har spilt (8 stk i 2026) og anbefalte han bør prøve. Skjermen kombinerer kart-utforskning med tabbede lister. Han bruker den når han planlegger en runde og vil sjekke distanse, beste score, eller ny bane i nærheten. GolfBox-import lar ham trekke historikk fra GolfBox-konto.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec fra `README.md`. I tillegg:

- **Hero italic Instrument Serif 36px:** *«8 baner spilt, Markus.»* Sub: «Hjemmebane: GFGK · Beste: Borre 74 (–1)»
- **Kart øverst (300px høy, full bredde):**
  - Lyst kart-tile med 8 spilte pins (accent) + 6 anbefalte pins (primary outline)
  - Markus' lokasjon-prikk (Fredrikstad) i sentrum med lucide `MapPin`
  - Filter-knapp øverst-høyre på kartet → `MapFilterModal` (radius/baneklasse/par)
  - Knapp nederst-høyre: «Vis liste ↓» (scroll til tabs)
- **Tabs under kart (3):**
  - **Spilte** (8) — default
  - **Anbefalt** (6) — Pro-AI-personalisering
  - **Søk** (åpner søkefelt + inline-resultater)
- **Bane-card-grid 3×N:**
  - Card 280×220px
  - Topp-thumbnail: bane-foto (placeholder grønn-gradient med flagg-ikon)
  - Tittel (Inter Tight 16px semibold): «Borre Golfklubb»
  - Meta-rad-1: «Par 71 · 6 124 m · Slope 132» (JetBrains Mono 12px)
  - Meta-rad-2: lucide `MapPin` + «142 km fra hjem»
  - Stats-rad (kun på Spilte-tab): «3 runder · Beste 74 · Snitt 78»
  - Footer-CTA: «Detaljer →» → `CourseDetailModal`

## Filter-bar — UNIKT

- Søk: «Søk bane eller sted …»
- Chip: **Avstand** — ≤50 km · 50–150 km · 150+ km
- Chip: **Type** — Park · Links · Skog · Resort
- Chip: **Par** — Par 70 · Par 71 · Par 72
- Sort: Avstand (default) · Beste score · Antall spilt · A–Å
- Primary CTA: `Importer fra GolfBox →` → `GolfBoxImportModal`

## Klikkbare elementer

Se `wireframe/audit/playerhq-baner.md`. UNIKT:

| Element | States |
|---|---|
| Kart-pin (spilt) | default, hover (popover med navn + beste score), klikk → `CourseDetailModal` |
| Kart-pin (anbefalt) | default, hover, klikk → `CourseDetailModal` |
| Tab-toggle (Spilte/Anbefalt/Søk) | default, hover, active |
| Bane-card | default, hover (lift + accent-border), klikk → `CourseDetailModal` |
| «Detaljer →»-link | default, hover, focus |
| Filter-knapp på kart | default, hover, klikk → `MapFilterModal` |
| `Importer fra GolfBox →`-CTA | default, hover, active, loading (under import) |
| «Vis liste ↓»-knapp | default, hover, klikk → smooth-scroll til tabs |

## Empty / loading / error / tier-låst-states

Bruker arketype-B-felles. UNIKT:
- **Spilte tom:** «Ingen runder logget ennå. Logg første runde →» eller «Importer fra GolfBox →»
- **Anbefalt (Free):** Bytter til «Populært i Norge» med generisk topp-6-liste + tooltip «Personlig anbefaling med Pro»
- **Søk-tab tom:** «Søk på banenavn eller sted for å finne baner»
- **Kart-loading:** Grå rektangel med sentrert spinner
- **Loading cards:** 6 grå skeleton-cards
- **Error kart:** Kart kollapser med «Kart ikke tilgjengelig — bruk listen under»

## Ønsket output fra Claude Design

1. Hovedskjerm lyst tema, Spilte-tab (8 cards + kart med pins)
2. Anbefalt-tab Pro (6 personlige forslag)
3. Anbefalt-tab Free (fallback til Populært)
4. Mørkt tema
5. Kart-pin hover med popover
6. Empty Spilte-tab (ny bruker)
7. Mobil ≤640px — kart 200px høy, cards 1 kolonne, tabs som dropdown

## Ikke-mål

- Ikke designe `CourseDetailModal`, `GolfBoxImportModal`, `MapFilterModal` (egne pakker)
- Ikke designe bane-detalj-skjerm (`/portal/mal/baner/:id` — egen batch)
- Ikke implementere ekte kart — bruk placeholder med pins

---

## Pakke 2/5: Mål-detalj (HCP-trend)

# AK Golf Platform — PlayerHQ — Mål-detalj (HCP-trend)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/mal/:id`
- **Arketype:** C — Detail + tabs (3 tabs, mål-detalj med projeksjon)
- **Tier-gating:** **Pro** for trend + projeksjon. Free ser kun current HCP.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/mal-detalj.html`
- **Audit:** `wireframe/audit/playerhq-mal-detalj.md`
- **Tilhørende modaler:** `EditGoalModal`, `ShareWithParentModal`, `DataPointPopover`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Spilleren ser sitt HCP-mål med historikk siste 6 måneder + projeksjon 7 måneder fremover (basert på trend). Delmål er sub-komponenter (f.eks. "Score < 75 i 3 runder på rad"). Foresatte kan dele rapporten.

## Header-blokk — UNIKT

- **Avatar/ikon:** rounded-lg 64px med Lucide `TrendingDown` (HCP er lower-is-better — ned er bra → grønn)
- **H1:** `HCP-mål: 0,0` (Geist 28px)
- **Subtittel:** `Nåværende: +2,4 · Mål-dato: 31. desember 2026 · Forventet truffet: ja`
- **Stat-pills (4):** `Δ -1,8 siste 6m` · `Sist runde: +1,2` · `Beste: -2,8 (4. mai)` · `Peer-snitt: +3,1`
- **Primary CTA:** `Del med foresatte` (åpner ShareWithParentModal)
- **Sekundær:** `Endre mål` (åpner EditGoalModal) · `Eksporter rapport (PDF)`

## Tab-strip (3 tabs)

| Tab | Innhold |
|---|---|
| **Trend** (default) | SVG-graf: 6m historikk + 7m projeksjon |
| **Delmål** | 5 delmål-cards |
| **Sammenlikning** | Vs peer-gruppe (percentil-bar) |

## Layout — Trend-tab (default)

### Hero-graf (12-col)
SVG linje-graf:
- X-akse: 13 måneder (6 historikk + 7 projeksjon)
- Y-akse: HCP (lower-is-better — invertert akse)
- Faktisk linje (mørk, solid) for 6 måneder
- Projeksjon (lime accent, stiplet) for 7 måneder
- Mål-linje horisontal (gold) på 0,0
- 13 datapunkter klikkbare → DataPointPopover

### Status-banner (12-col)
Grønn banner: "✓ Forventet truffet — 31. desember 2026 (basert på trend siste 12 uker)"
Eller rød: "⚠ I fare — du må forbedre 0,3 HCP/mnd for å nå mål"

### Delmål-mini (12-col)
5 delmål-cards horisontalt med progress (3/5 = ferdig, 2/5 = pågår).

## Layout — Delmål-tab

5 delmål-cards (full bredde stack):

| Delmål | Status |
|---|---|
| Score < 75 i 3 runder på rad | 2 av 3 ✓ |
| TrackMan: Driver carry > 270m | Ferdig (5. mai) ✓ |
| Sand-test 30m: 8,0 | 6,8 (på rute) |
| 18-hulls SG-Total > 1,0 | 0,8 (i fare) |
| Vinne klubbmesterskap juni | Pågår |

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| `Endre mål` | default, hover, klikk → EditGoalModal |
| `Del med foresatte` CTA | default, hover, modal-trigger |
| SVG-datapunkt | default, hover (utvid + tooltip), klikk → popover |
| Mål-linje | static, hover viser "Mål: 0,0 innen 31. des 2026" |
| Delmål-card | default, hover (lift), klikk → sub-mål-skjerm |

## Free-tier lock-overlay

- Trend-tab: graf-projeksjon dimmet, "Pro for å se projeksjon →"
- Sammenlikning-tab: helt låst med lock-overlay
- Delmål-tab: synlig, men `Endre mål` disabled

## Empty / loading / error

- **Empty (mål ikke satt):** "Sett ditt HCP-mål for å spore fremgang →" CTA `Sett mål`
- **Forsinket-state:** Rød banner "I fare — siste 4 ukers trend feil retning"
- **Loading:** Skeleton graf med pulserende strek

## Eksempel-data

- **Spiller:** Markus Roinås Pedersen
- **Mål:** HCP 0,0 innen 31. desember 2026
- **Nåværende:** +2,4
- **Δ siste 6m:** -1,8
- **Status:** Forventet truffet (på rute)

## Ønsket output fra Claude Design

1. Lyst tema, Trend-tab default (på rute, grønn banner)
2. Mørkt tema, samme
3. I-fare-state (rød banner)
4. Tab-bytte til Delmål
5. DataPointPopover åpen på 4. mai (-2,8 beste runde)
6. Free-tier lock-state
7. Mobil ≤640px — graf full bredde

## Ikke-mål

- Ikke designe `EditGoalModal`, `ShareWithParentModal` (egne pakker)
- Ikke designe sub-delmål-skjerm

---

## Pakke 3/5: Mål-leaderboard

# AK Golf Platform — PlayerHQ — Leaderboard

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/mal/leaderboard`
- **Arketype:** B — List + filter (rangert tabell + tab-variant)
- **Tier-gating:** **Pro/Elite.** Free ser full lock-overlay + CTA til `UpgradeToProModal`.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/mal-leaderboard.html`
- **Audit:** `wireframe/audit/playerhq-mal-leaderboard.md`
- **Tilhørende modaler:** `LeaderboardModal` (utvidet view)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar er LYS. Tabular nums (JetBrains Mono) på alle rang-/score-kolonner. Eksakte token-navn — ikke hardkode hex. Markus er referanse-spilleren — uthevet med «deg»-pill.

## Spec — hva skjermen er for

Leaderboard er Markus' konkurransedrivende sammenligning mot venner, klubb og hele plattformen. Han ser hvor han ligger på ukens SG, antall økter og badges. Skjermen er ukentlig destinasjon for motivasjon — «hvor er jeg på topplisten?» Fungerer som kraftig oppgrader-driver for Free-brukere som vil se sine egne tall.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec fra `README.md`. I tillegg:

- **Hero italic Instrument Serif 36px:** *«#7 av 24 i klubben, Markus.»* Sub: «Uke 19 (5–11. mai) · +2 plasseringer fra forrige uke»
- **Tabs øverst (segmentert kontroll, 320px bred):**
  - **Venner** (8) — folk Markus har lagt til
  - **Klubb** (24) — GFGK-medlemmer — default
  - **Globalt** (Topp 100 i Norge)
- **«Din rang»-card** (sticky, like under tabs):
  - Rang-tall stort: «#7» (JetBrains Mono 48px)
  - Avatar Markus 40px
  - Navn + HCP («Markus · 12,4»)
  - Pill-rad: «↑ +2 denne uka» (accent)
  - Knapp «Se mine stats →» (sekundær)
- **Tabell-rader (Topp 20):**
  - Rad-høyde 56px
  - Markus-rad uthevet: accent-bg-tint + venstre accent-stripe + «deg»-pill etter navn
  - Kol 1: Rang (JetBrains Mono 18px tabular) — topp-3 har medalje-emoji erstattet med lucide `Trophy`/`Medal` i pyramide-farge
  - Kol 2: Avatar 32px + navn (Inter Tight 14px) + sub: klubb (muted 11px)
  - Kol 3: HCP (JetBrains Mono 14px tabular)
  - Kol 4: Ukens SG: «+0,8» (farget — positiv accent, negativ destructive subtil)
  - Kol 5: Antall økter denne uka: «12»
  - Kol 6: Badges-rad: opptil 3 lucide-ikoner (`Flame` streak, `Target` test-master, `TrendingUp` momentum)
  - Kol 7: «Detaljer →»-link → `LeaderboardModal` (utvidet)

## Filter-bar — UNIKT

- Søk: «Søk spiller …»
- Chip: **Periode** — Denne uka (default) · Måned · Sesongen
- Chip: **Metric** — SG total · Økter · Streak · Tester · Badges
- Chip: **HCP-range** — 0–10 · 11–20 · 21–36
- Sort: Rang (default, basert på valgt metric) · Navn · HCP
- Ingen primary CTA (Markus deltar automatisk)

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-toggle (Venner/Klubb/Globalt) | default, hover, active, count-badge |
| «Din rang»-card | default, hover, sticky shadow ved scroll |
| Spiller-rad | default, hover (subtil bg-shift), klikk → `LeaderboardModal` |
| Markus-rad | static highlight (accent-bg-tint + venstre stripe) — kan ikke klikke seg vekk |
| «deg»-pill | static (accent-fyll, primary tekst) |
| Topp-3-medalje-ikon | tooltip («Gull/Sølv/Bronse uka») |
| Badge-ikon | tooltip per badge («7-dagers streak» etc.) |
| Periode-chip | endrer alle kolonner ved skift |
| Lock-overlay (Free) | full skjerm-overlay + lucide `Lock` + CTA «Sammenlign deg med Pro →» |

## Empty / loading / error / tier-låst-states

Bruker arketype-B-felles. UNIKT:
- **Venner-tab tom:** «Ingen venner lagt til. Inviter en venn →»
- **Empty rang (ny bruker uten data):** «Du må logge minst én økt for å rangeres»
- **Tier-låst (Free):** Hele siden bak full lock-overlay-card:
  - Lucide `Lock` 48px
  - «Leaderboard er en Pro-feature»
  - 3 fordeler (sammenlign med klubb, ukens topp-spillere, badges og streaks)
  - CTA «Oppgrader til Pro →»
- **Loading:** «Din rang»-skeleton + 5 grå rader

## Ønsket output fra Claude Design

1. Klubb-tab lyst tema (Pro — Markus uthevet på rang #7)
2. Venner-tab lyst tema (Pro — 8 venner, Markus #3)
3. Free — full lock-overlay
4. Mørkt tema (Klubb-tab)
5. Hover på spiller-rad
6. Empty Venner-tab
7. Mobil ≤640px — kompaktet tabell (rang + avatar + navn + metric, resten i row-actions-meny)

## Ikke-mål

- Ikke designe `LeaderboardModal` (utvidet view — egen pakke)
- Ikke designe `UpgradeToProModal` (Tier-1 kritisk modal — egen pakke)

---

## Pakke 4/5: Test-detalj

# AK Golf Platform — PlayerHQ — Test-detalj

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/tren/tester/:id`
- **Arketype:** C — Detail + tabs (3 tabs, test-historikk + projeksjon)
- **Tier-gating:** **Pro** for historikk + projeksjon. Free ser kun siste forsøk.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/test-detalj.html`
- **Audit:** `wireframe/audit/playerhq-test-detalj.md`
- **Tilhørende modaler:** `TestAttemptDetailModal`, `VideoPlayerModal`, `BookSessionModal`, `AgentInsightDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Detaljvisning av én test (f.eks. "Sand-test 30m") med beste resultat, mål, alle forsøk over tid, og agent-insights. Spilleren bruker denne for å se hvor de står og bestemme om de skal kjøre nytt forsøk eller booke trening på testet område.

## Header-blokk — UNIKT

- **Avatar/ikon:** rounded-lg 64px med Lucide `Target` på primary
- **H1:** `Sand-test 30m` (Geist 28px)
- **Subtittel:** `Slag-kategori · Standard NGF-protokoll · 4 forsøk siste 8 uker`
- **Stat-pills (5):** `Beste 7,2` · `Sist 6,8` · `Mål 8,0` · `PR 7,2 ★` · `Forrige 5,8`
- **Primary CTA:** `+ Start nytt forsøk` (åpner `/portal/live/:id/tapper`)
- **Sekundær:** `Eksporter CSV` · `Book sand-tid GFGK` (åpner BookSessionModal)

## Tab-strip (3 tabs)

| Tab | Innhold |
|---|---|
| **Beskrivelse** (default) | Test-protokoll + utstyr + standard |
| **Resultater** | Tabell over alle forsøk + SVG-graf med trend |
| **Insights** | Agent-insight-cards + relaterte tester |

## Layout — Resultater-tab

### SVG-graf (12-col)
Linje-graf, x = dato, y = score. 4 datapunkter + projeksjon-stiplet linje til mål 8,0. Datapunkter klikkbare → DataPointPopover.

### Tabell (12-col)
| Dato | Score | Forhold | Coach | PR? | ... |
|---|---|---|---|---|---|
| 8. mai 2026 | 6,8 | Sand tørr | Anders K | – | ... |
| 1. mai 2026 | 7,2 ★ | Sand våt | Anders K | PR | ... |
| 17. apr 2026 | 6,4 | Innendørs | Anders K | – | ... |
| 3. apr 2026 | 5,8 | Sand tørr | Anders K | – | ... |

Klikk-rad → TestAttemptDetailModal.

### Mål-progress-bar (12-col)
Visuell bar fra 0 til 10, med markører for: nåværende (7,2) + mål (8,0) + peer-snitt (6,4).

## Layout — Insights-tab

3 agent-insight-cards:
- "Konsistens-agent: Du bommer 32 % oftere på våt sand → tren mer i dette forholdet"
- "Trend-agent: +0,8 score på 8 uker — du er på rute mot mål 12. juni"
- "Sammenligning-agent: Du er #3 av 8 i WANG-laget på denne testen"

Hvert kort: ikon + tekst + "Se detaljer →" (åpner AgentInsightDetailModal).

## Free-tier lock-overlay

Pro-features med lock:
- Historikk-tabell viser kun siste forsøk
- SVG-graf-projeksjon dimmet
- Insights-tab helt låst
- Lock-banner: "Test-historikk er Pro. Oppgrader →"

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| `+ Start nytt forsøk` CTA | default, hover, loading |
| `Book sand-tid GFGK` | default, hover, modal-trigger |
| SVG-datapunkt | default, hover (utvid + tooltip), klikk → popover |
| Tabell-rad | default, hover, PR-rad (★ accent), klikk → modal |
| Agent-insight-card | default, hover (lift), klikk → modal |
| `Se video-protokoll →` | default, hover, klikk → VideoPlayerModal |

## Empty / loading / error

- **Empty (0 forsøk):** "Ingen forsøk ennå. Start første for å sette baseline →"
- **Pågår-state:** Warning-pill "Pågår — sluttføres i live-session"
- **Loading:** Skeleton graf + tabell-rader
- **PR-highlight:** Stjerne ★ + lime accent på rad

## Eksempel-data

- **Test:** Sand-test 30m
- **Spiller:** Markus Roinås Pedersen
- **Beste:** 7,2 (1. mai 2026, sand våt)
- **Sist:** 6,8 (8. mai 2026, sand tørr)
- **Mål:** 8,0 innen 12. juni 2026

## Ønsket output fra Claude Design

1. Lyst tema, Resultater-tab med 4 forsøk
2. Mørkt tema, samme
3. Free-tier lock-state
4. Tab-bytte til Insights
5. DataPointPopover åpen på 1. mai (PR 7,2)
6. Empty: 0 forsøk (baseline)
7. Mobil ≤640px — graf full bredde, tabell stables til kort

## Ikke-mål

- Ikke designe `TestAttemptDetailModal`, `VideoPlayerModal` (egne pakker)
- Ikke designe live-tapper (egen Fase 5)

---

## Pakke 5/5: TrackMan-analyse

# AK Golf Platform — PlayerHQ — TrackMan-analyse

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/mal/trackman/analyse`
- **Arketype:** C — Detail + tabs (per-kølle, trender)
- **Tier-gating:** **Pro** for alt. **Elite** for "Be om coach-vurdering" + advanced trends.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/trackman-analyse.html`
- **Audit:** `wireframe/audit/playerhq-trackman-analyse.md`
- **Tilhørende modaler:** `TrackManImportModal`, `RequestCoachReviewModal`, `ComparisonModal`, `TrajectoryDetailPopover`, `ShotDetailPopover`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Trender på TrackMan-data over tid, per kølle. Spilleren laster opp TrackMan-økter, plattformen aggregerer per kølle og viser trajectory, heatmap, og KPI-er. Pro-spillere ser dette; Elite kan be coach om vurdering.

## Header-blokk — UNIKT

- **Avatar/ikon:** rounded-lg 64px med Lucide `Radar` på primary
- **H1:** `TrackMan-analyse` (Geist 28px)
- **Subtittel:** `342 slag · 8 økter siste 4 uker · Sist: 7. mai · Driver valgt`
- **Stat-pills (5):** `Driver carry 268m` · `Ball-speed 168 mph` · `Spin 2 580` · `Smash 1,49` · `Avvik ±8m`
- **Primary CTA:** `Eksporter til SG` (CSV-download)
- **Sekundær:** `Last opp ny økt` (åpner TrackManImportModal)

## Per-kølle-chips (under header)

Horisontal chip-rad: **Driver** (active) · 3W · 5i · 7-jern · Wedge · Putter. Klikk skifter all data.

## Tab-strip (4 tabs)

| Tab | Innhold |
|---|---|
| **Oversikt** (default) | KPI-grid + trajectory SVG |
| **Heatmap** | 16+ shot-dots på target-vs-faktisk-grid |
| **Trender** | Sparklines 12 uker per KPI |
| **Sammenligning** | Vs peer / pro (åpner ComparisonModal) |

## Layout — Oversikt-tab (default)

### KPI-bento (12-col)
5 stat-rich-cards: Carry / Ball-speed / Spin / Smash / Apex — hver med tabular-nums + spark + delta

### Trajectory SVG (12-col)
Side-view av baner — hver eldste lys (faded), nyeste mørk. Apex-markører klikkbare → TrajectoryDetailPopover med launch / spin / carry per slag.

### Last 8 økter (12-col)
Tabell: `Dato | Antall slag | Snitt-carry | Best-carry | Worst-carry | ...`

## Layout — Heatmap-tab

Target-vs-faktisk-grid (kart-stil):
- Grønn target-zone (akseptabel)
- Gul ring rundt
- Rød utenfor
- 16+ shot-dots, hver klikkbar → ShotDetailPopover med ball-data

## Klikkbare elementer

| Element | States |
|---|---|
| Per-kølle-chip | default, hover, active (lime) |
| Tab-strip | default, hover, active |
| `Last opp ny økt` | default, hover, modal-trigger |
| KPI stat-rich-card | default, hover, klikk → drill |
| Apex-markør | default, hover (utvid), klikk → popover |
| Heatmap-dot | default, hover (utvid + ring), klikk → popover |
| `Be om coach-vurdering` (Elite) | default, hover, lock-state for Pro |
| `Eksporter til SG` | default, hover, loading (spinner under download) |

## Tier-gating

**Pro:** Hele skjermen unlocked.
**Elite-features:**
- "Be om coach-vurdering" knapp — synlig for Pro med lock-overlay
- Advanced trends (siste 24 uker i stedet for 12) — Elite-only
- ComparisonModal vs pro-baseline — Elite-only

**Free:** Hele skjermen låst med stort lock-overlay + UpgradeToProModal-CTA.

## Empty / loading / error

- **Empty (ingen TrackMan-data):** "Last opp første økt fra TrackMan-app →" CTA-knapp
- **Loading:** Skeleton SVG (komplekse) + KPI-cards
- **Trajectory-fade:** Eldste 30 % opacity → nyeste 100 %

## Eksempel-data

- **Spiller:** Markus Roinås Pedersen
- **Driver-snitt:** Carry 268m, ball-speed 168 mph, spin 2 580, smash 1,49
- **Sist økt:** 7. mai 2026, 42 slag
- **8 økter:** siste 4 uker

## Ønsket output fra Claude Design

1. Lyst tema, Oversikt-tab Driver
2. Mørkt tema, samme
3. Tab-bytte til Heatmap (target-grid)
4. TrajectoryDetailPopover åpen
5. Free-tier full lock
6. Pro-tier med Elite-feature `Be om coach-vurdering` med lock
7. Mobil ≤640px — KPI-cards 2x3 grid, SVG full bredde

## Ikke-mål

- Ikke designe `TrackManImportModal`, `RequestCoachReviewModal` (egne pakker)
- Ikke designe TrackMan-list-skjerm (i batch 2)
