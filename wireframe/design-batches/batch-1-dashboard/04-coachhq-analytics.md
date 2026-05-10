# AK Golf Platform — CoachHQ — Analytics

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/analytics`
- **Arketype:** A — Dashboard (analytics-dashboard, datatung)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/analytics.html` (lastet opp som vedlegg)
- **Også relevant:** `coachhq/analytics-v2.html` (variant — viser samlet stall — kan brukes som referanse for cards med flere spillere)

## Designsystem

Bruk `design-system-v2.md`. Spesielt for charts:
- **Datalinje-farger:** Bruk pyramide-fargene (FYS/TEK/SLAG/SPILL/TURN) hvis kategorisert. Ellers `--primary` for hovedlinje.
- **Tabular nums:** Alle datatall skal ha JetBrains Mono med tabular-nums-feature
- **Status-farger:** Success (`#10B981`) for positiv trend, Danger (`#EF4444`) for negativ
- **Maks 3 lime per skjerm** — bruk lime kun for utvalgte highlight-kort

## Spec — hva skjermen er for

CoachHQ Analytics er **performance-dashboardet for stallen**. Coach skal raskt kunne svare:
- Hvem trender opp / ned?
- Hvor er fellesutfordringer (på tvers av spillere)?
- Hva er ROI per coaching-time?

## Layout-anvisning

- **Sidebar** (CoachHQ, Analytics-tab active)

- **Hovedinnhold**
  - **Hero**
    - Italic Inter Tight 36px: «Analytics — hvordan stallen utvikler seg»
    - Sub (caption): «Periode: {Date Range} · 38 spillere · 142 økter`»
    - Periode-velger til høyre (dropdown: 7d / 30d / 90d / Sesong / Custom)

  - **KPI-strip (5 kort, asymmetrisk)**
    - Stort: Snitt SG-forbedring — JetBrains Mono tall + trend-pil
    - Medium: Antall økter (period) — tall + brøk vs forrige periode
    - Medium: Top 3 spillere som forbedret seg mest (mini-avatar-rad + tall)
    - Medium: Bottom 3 (samme format)
    - Medium: Coach-belegg — % av tilgjengelig tid

  - **Hovedchart (full bredde, hero-card)**
    - SG-trend per spillergruppe (3 linjer: Talent / Mid-tier / Junior)
    - X-akse: ukenummer, Y-akse: SG total
    - Legend nederst, hover-tooltip per datapunkt
    - "Sammenlign mot forrige sesong"-toggle

  - **Bento-rad (4 cards, asymmetrisk)**
    - Stor (2-bred): Pyramide-heatmap — 38 spillere som matrix, hvert lag fargekodet
    - Liten: Test-completion-rate — donut + tall
    - Liten: Plan-godkjenningsrate — % + sparkline
    - Liten: Avg session-rating — stjerner (eller tall) + trend

  - **Spillerliste-summary (full bredde, scrollable tabell)**
    - Kolonner: Avatar+navn, HCP, SG (period delta), Antall økter, Status-pill, "→" til 360-profil
    - Sortable per kolonne, filter-chip-rad over (rolle, klubb, tier)

## Klikkbare elementer som må designes (states)

| Element | States å designe |
|---|---|
| Periode-velger (dropdown) | default, hover, open, item-hover, item-selected |
| KPI-card (klikkbar) | default, hover, focus |
| Top/Bottom 3 mini-avatar | default, hover (tooltip med navn+tall), klikk → 360-profil |
| Hovedchart linje | default, hover på datapunkt → tooltip, legend-toggle |
| "Sammenlign"-toggle | default, on, off, hover, focus |
| Pyramide-heatmap-celle | default, hover (tooltip med spillernavn+tall), klikk → spiller-detalj |
| Bento-cards | default, hover, focus |
| Filter-chip (multi) | default, hover, selected, disabled |
| Spillerlist-rad | default, hover, klikk → 360-profil |
| Sort-icon på kolonne | default, hover, sort-asc, sort-desc |

## Empty / loading / error-states

- **Empty (ingen data i periode):** Hero ok, KPI-strip viser «—», hovedchart viser «Ingen data i valgt periode. Velg større periode →»
- **Empty (ny coach):** «Du har ingen spillere ennå. Inviter første spiller →»
- **Loading:** KPI-strip skeleton, chart skeleton (linje-skeleton-mønster), heatmap-skeleton (grå grid)
- **Error:** Per-card error, ikke full-page

## Ønsket output fra Claude Design

1. Lyst tema med full data
2. Mørkt tema med full data
3. Hover-state på chart-datapunkt (tooltip)
4. Hover-state på heatmap-celle (tooltip)
5. Open-state på periode-velger (dropdown)
6. Filter-chip aktiv-state (selected)
7. Loading-state
8. Empty-state (ingen data i periode)
9. Mobil-versjon (≤768px) — sidebar collapsed, charts beholder full bredde, tabell scrollable horisontalt

## Ikke-mål

- Ikke designe drilldown-skjermer (`/admin/analytics/sg`) — egne pakker
- Ikke designe modaler eller export-popovers her

## Når du er ferdig

Lim **design-link** tilbake til Claude Code.
