# AK Golf Platform — CoachHQ — Finance (utvidet)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/finance`
- **Arketype:** G — Other (finance-konsoll)
- **Tier-gating:** Hovedcoach + admin
- **HTML-referanse:** `wireframe/screen-deck/coachhq/finance.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `InvoiceDetailModal`, `RefundModal`, `ExportFinanceModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Finance er Anders' økonomi-cockpit. Aggregerer alt fra Stripe + Pengekonto + manuelle fakturaer: inntekter (coaching, fasilitet-leie, gruppe-medlemskap), utbetalinger (Stripe payouts), utestående (uoppgjorte fakturaer), refunderinger. Viser også margin per produkt-kategori. Forskjellig fra batch-1 finance-card (som er én KPI på dashboard) — dette er full konsoll.

## Layout — UNIKT for denne skjermen

Tre-kolonne-layout (3-rader-grid):

### Rad 1: KPI-strip (4 kort, asymmetrisk)

1. **Brutto MTD** (stort kort, span 2): `142 800 kr` — sparkline 30 dager
2. Netto MTD: `118 240 kr` (etter kort-gebyr 2,9%)
3. Utestående: `12 400 kr` — 4 fakturaer
4. Refundert MTD: `3 600 kr`

### Rad 2: Inntekts-grafikk

- **Stacked area chart** (Recharts-stil) — siste 90 dager
- Stacks: Coaching / Fasilitet / Gruppe / Greenfee / Event
- Toggle: `Daglig / Ukentlig / Månedlig`
- Hover → tooltip med per-kategori-fordeling
- Y-akse: `kr` (mellomrom som tusenseparator)
- X-akse: dato (`11 mai`)

### Rad 3: To kolonner

#### Venstre: Transaksjonsliste

Tabell-kolonner:
| Kolonne | Innhold |
|---|---|
| Dato | "11. mai 2026 14:32" (Geist Mono) |
| Spiller | Avatar + navn |
| Type | Pill (Coaching / Fasilitet / Gruppe / Refund) |
| Beløp | "1 600 kr" (høyrejustert, Mono) — refund i destructive |
| Status | Pill (Betalt / Venter / Mislyktes / Refundert) |
| ... | RowActionsMenu (Detaljer, Refund, Eksporter) |

20 transaksjoner, paginert.

#### Høyre: Margin per produkt-kategori

Sortert liste, hver rad:
- Kategori-navn + ikon
- Inntekt MTD: `47 200 kr`
- Direkte kostnad: `8 400 kr`
- Margin: `82,2%` (progress-bar)
- Margin-trend (sparkline 30d)

Eksempel:
- Coaching 1:1 — 82,2% margin
- Mulligan Studio-leie — 91,4% margin
- Greenfee — 12,8% margin (lav fordi pass-through)
- Gruppe-medlemskap — 76,0% margin

## Filter-bar — UNIKT

- Periode-velger: Dropdown (`I dag / Denne uka / MTD / YTD / Egendefinert`) + datepicker
- Chip: Kategori (Coaching / Fasilitet / Gruppe / Greenfee / Event)
- Chip: Status (Betalt / Venter / Mislyktes / Refundert)
- Søk: "Søk spiller eller transaksjon-ID"
- Primary CTA: `Eksporter →` → `ExportFinanceModal` (CSV / PDF / Fiken)

## Klikkbare elementer

| Element | States |
|---|---|
| KPI-kort | default, hover (lift), klikk → drill-down (filter til kun den kategori) |
| Stacked area chart | default, hover (tooltip + crosshair) |
| Transaksjon-rad | default, hover, klikk → `InvoiceDetailModal` |
| Refund-aksjon | default, hover, klikk → `RefundModal` (med beløp pre-fyllt) |
| Margin-rad | default, hover (highlight), klikk → drill-down |
| Eksporter-CTA | default, hover, loading (spinner), success (download) |

## Empty / loading / error

- **Empty (ingen transaksjoner):** Sentrert ikon `Receipt` + "Ingen transaksjoner ennå. Når en spiller betaler en booking, vises det her."
- **Loading:** Skeleton-KPI-kort + skeleton-graf + 5 skeleton-tabell-rader
- **Stripe-sync-error:** Banner-warning "Kunne ikke nå Stripe API. Viser cached data fra 14:32 →"

## Ønsket output fra Claude Design

1. Lyst tema, full konsoll med 90d data
2. Mørkt tema, samme
3. Hover på stacked area chart med tooltip
4. Periode-velger åpen (datepicker-state)
5. Mobil ≤640px — KPI-kort stables, graf full bredde, transaksjons-tabell blir kort-layout

## Ikke-mål

- Ikke designe `InvoiceDetailModal`, `RefundModal`, `ExportFinanceModal` (egen batch)
- Ikke designe Stripe-onboarding (egen sub-flow)
- Ikke designe Fiken-sync-konfig

## Når du er ferdig

Lim design-link tilbake til Claude Code.
