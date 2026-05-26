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

## Når du er ferdig

Lim design-link tilbake til Claude Code.
