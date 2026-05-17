# AK Golf Platform — CoachHQ — Analytics V2 (stallen samlet)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/analytics-v2`
- **Arketype:** G — Other (multi-pane analytics-dashboard)
- **Tier-gating:** Pro+ (Free får begrenset)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/analytics-v2.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `MetricDetailModal`, `CompareModal`, `ExportAnalyticsModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Analytics V2 er Anders' aggregerte spiller-stallens-utvikling. Forskjellig fra individuell spiller-progresjon — dette er **stallen samlet**: snitt-HCP-utvikling, totalt treningsvolum, agent-effektivitet (godkjenningsrate), pyramide-balanse på tvers av alle spillere. Brukes til ledermøter og styrerapporter.

## Layout — UNIKT for denne skjermen

Multi-pane med 4 kvadranter + global filter:

### Global filter-bar (sticky øverst)

- Periode: dropdown + datepicker (`Siste 30d / 90d / 6 mnd / 12 mnd / Egendefinert`)
- Spiller-segment: chip (Alle / Pro+ / Elite / Kategori A-K / WANG)
- Sammenligne med: dropdown ("Forrige periode" / "Samme periode i fjor" / "Ingen")

### Kvadrant 1: HCP-utvikling (top-left)

- Linje-chart, hver spiller som en linje (semi-transparent), snitt som tykk lime-linje
- Y-akse: HCP, X-akse: dato
- Hover → tooltip per linje (spillernavn + HCP)

### Kvadrant 2: Treningsvolum (top-right)

- Stacked bar chart per uke
- Stacks: Coaching / Selvtrening / Gruppe / Runder
- Snitt per spiller som overlay-linje

### Kvadrant 3: Pyramide-balanse (bottom-left)

- Stacked area chart over tid
- Stacks: FYS / TEK / SLAG / SPILL / TURN
- Viser hvordan pyramide-fokus har endret seg over perioden
- Toggle: "Volum" (timer) eller "Andel" (%)

### Kvadrant 4: Agent-effektivitet (bottom-right)

- Tabell:
  | Agent | Anbefalinger | Godkjent | Avslått | Snitt-respons |
  |---|---|---|---|---|
  | Periodiserings | 47 | 38 (81%) | 9 | 1t 24m |
  | Deload | 23 | 19 (83%) | 4 | 2t 8m |
  | Escalation | 5 | 5 (100%) | 0 | 14m |

### Compare-overlay (når aktivert)

Hvert chart får en sekundær linje/bar i secondary-farge for sammenligningsperioden, samt delta-pill øverst-høyre: `+12,4% vs forrige periode` (success) eller `-3,2%` (destructive).

## KPI-strip (4 kort, øverst over kvadranter)

1. Snitt-HCP: 12,4 (`-1,2 vs samme periode i fjor`, success)
2. Total treningsvolum: 482t (`+18,2%`, success)
3. Agent-godkjenning: 84% (`+4 pp`, success)
4. Pyramide-balanse-score: 7,8/10 (`+0,4`, success)

## Filter-bar (UNIKT, allerede beskrevet over)

CTA: `Eksporter →` → `ExportAnalyticsModal` (PDF-rapport eller CSV-rådata)

## Klikkbare elementer

| Element | States |
|---|---|
| KPI-kort | default, hover (lift), klikk → drill-down |
| Chart-linje | hover (highlight + tooltip), klikk → spiller-profil |
| Stack-segment | hover (zoom + tooltip), klikk → `MetricDetailModal` |
| Compare-toggle | default, active (overlay synlig) |
| Periode-velger | default, open (dropdown med datepicker) |
| Eksporter | default, hover, loading (spinner), success (download) |

## Empty / loading / error

- **Empty (for kort periode):** "Velg periode med minst 7 dager med data"
- **Loading:** Skeleton-charts med pulserende streker
- **Compare-error:** "Ingen data for sammenligningsperiode"

## Ønsket output fra Claude Design

1. Lyst tema, full multi-pane "Siste 90d", uten compare
2. Mørkt tema, samme
3. Med compare-overlay aktivert ("Forrige 90d")
4. Hover-state på et chart med tooltip
5. Mobil ≤640px — kvadranter stables 1-kolonne, hvert chart full bredde, filter blir bottom-sheet

## Ikke-mål

- Ikke designe `MetricDetailModal`, `CompareModal`, `ExportAnalyticsModal` (egen batch)
- Ikke designe per-spiller-drill-down (det er sin egen flate)
- Ikke designe scheduling av automatiske rapporter (i Reports)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
