# AK Golf Platform — CoachHQ — 360-spillerprofil

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/elever/:id`
- **Arketype:** C — Detail + tabs (deep-dive, 7 tabs)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/360-profil.html`
- **Audit:** `wireframe/audit/coachhq-360-profil.md`
- **Tilhørende modaler:** `SendMessageModal`, `BookSessionModal`, `AIChatModal`, `PyramidTierDetailDrawer`, `StatDetailDrawer`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Coachens dypeste view av én spiller. Fra `Elever`-listen klikker coach inn hit for å se hele bildet — pyramide-fokus over tid, SG-utvikling, TrackMan-data, test-resultater, plan-status, turneringer og notater. 40+ klikkbare elementer. Skjermen brukes før hver coaching-økt og når agent-anbefalinger trenger menneskelig kontekst.

## Header-blokk — UNIKT

- **Avatar:** 64px sirkel med profilbilde av Markus Roinås Pedersen
- **H1:** `Markus Roinås Pedersen` (Geist 32px)
- **Subtittel:** `Kategori A · Elite · WANG Toppidrett · 17 år` (muted)
- **Stat-pills (4):** `HCP +2,4` · `SG +0,8 (12u)` · `Sist trent: i dag` · `Plan: Sommer-toppform`
- **Primary CTA:** `Book ny økt` (åpner BookSessionModal)
- **Sekundær:** `Send melding` + `...`-meny (Eksporter rapport, AI-coach chat, Marker skadet)

## Tab-strip (7 tabs)

| Tab | Innhold |
|---|---|
| **Pyramide** (default) | Donut med 5-tier fordeling + heatmap (12 uker × 5 områder) |
| **SG** | Strokes Gained-stripe per kategori + sparklines siste 12 uker |
| **TrackMan** | Per-kølle KPI-grid + trajectory snapshot |
| **Tester** | Tabell over alle tester med personlig rekord (★) |
| **Plan** | Aktiv plan-card med fase-fremdrift + ukens 5 økter |
| **Tournaments** | Kommende + 6 siste resultater (score, sted, dato) |
| **Notater** | Coach-notat-feed (10 siste, italic Instrument Serif quote) |

## Layout — UNIKT for hver tab

### Pyramide-tab (default)

Asymmetrisk grid:
- **Stort donut-card (8-col):** Pyramide siste 4 uker, klikk-segment åpner PyramidTierDetailDrawer
- **Stat-rich 2x2 (4-col):** FYS 18 % / TEK 32 % / SLAG 24 % / SPILL 14 % / TURN 12 % med spark
- **Heatmap-stripe (12-col):** 12 uker × 5 områder, hver celle hover → tooltip `uke 18 · TEK 4t 20m`
- **Hvor henger han? (12-col):** 5 stat-cards stilt opp horisontalt, klikk → StatDetailDrawer

### SG-tab

- **SG-bento (12-col):** 5 kategorier som horisontal bar-stripe (OTT / APP / ARG / PUTT / TEE)
- **Trend-graf (8-col):** Spark-linjer for hver kategori, 12 uker
- **Best/verst (4-col):** Listet hva som har bedret/forverret seg

### TrackMan-tab

- **Per-kølle-grid (12-col):** Driver / 3W / 5i / 7-jern / Wedge / Putter — hver med carry, ball-speed, spin
- **Trajectory SVG:** Apex-markører klikkbare, popover

### Tester-tab

Tabell med kolonner: `Test | Beste | Sist | Mål | Status (PR ★)`. Klikk-rad → TestAttemptDetailModal.

### Plan-tab

- **Plan-card (8-col):** "Sommer-toppform" + fase-progresjon
- **Ukens økter (4-col):** 5 stk listet med "I dag / I morgen / Onsdag..."

### Tournaments-tab

Tidslinje vertikalt, kommende først, deretter 6 siste resultater.

### Notater-tab

10 siste coach-notater som feed-cards. Hvert kort: dato, italic Instrument Serif quote, "Les hele →".

## Klikkbare elementer (utenfor felles arketype-C)

| Element | States |
|---|---|
| Tab-chip | default, hover, active (2px stripe), disabled |
| Donut-segment | default, hover (utvid 2px), klikk → drawer |
| Heatmap-celle (60 stk) | default, hover (border + tooltip), klikk → drill |
| Stat-rich-card spark | hover → SparkTooltip med `dato + verdi` |
| Drawer "Akkurat nå"-rader | klikk neste → BookSessionModal, klikk sist → RoundDetailModal, klikk agent → PlanActionDetailModal |

## Empty / loading / error

- **Empty (ny spiller, ingen data):** Stort sentrert "Ingen aktivitet ennå. Book første økt →"
- **Empty per tab:** Dempet ikon (Lucide `BarChart3` for SG, `Target` for tester)
- **Loading:** Skeleton hele profilen (avatar-sirkel, header-pills, donut-placeholder)

## Eksempel-data

- **Spiller:** Markus Roinås Pedersen, A-kategori Elite
- **Pyramide siste 4u:** TEK 32 % · SLAG 24 % · FYS 18 % · SPILL 14 % · TURN 12 %
- **Aktiv plan:** "Sommer-toppform" — fase 3 av 5 (Spesifikk), 64 % gjennomført
- **Siste tournament:** Sørlandsåpent 2026, T12 (-3), 7. mai 2026
- **Coach:** Anders Kristiansen

## Ønsket output fra Claude Design

1. Lyst tema, default Pyramide-tab med Markus
2. Mørkt tema, samme
3. Tab-bytte til SG-tab (samme spiller)
4. Drawer åpen: PyramidTierDetailDrawer for "Slag (24 %)"
5. Header-collapse-state (sticky-bar etter scroll)
6. Loading-state hele profilen
7. Mobil ≤640px — header stables, tab-strip horisontal scroll, content 1-col

## Ikke-mål

- Ikke designe `BookSessionModal`, `SendMessageModal` (egne pakker)
- Ikke designe sub-drawers — kun Pyramide-drawer som referanse
- Ikke designe AI-chat-interface (egen Fase-pakke)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
