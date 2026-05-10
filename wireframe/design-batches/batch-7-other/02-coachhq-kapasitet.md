# AK Golf Platform — CoachHQ — Kapasitet

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/kapasitet`
- **Arketype:** G — Other (kapasitets-grid: fasilitet × tid)
- **Tier-gating:** Ikke relevant (admin-only)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/kapasitet.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `BulkBlockModal`, `CapacityDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Kapasitet er Anders' admin-verktøy for å se **belegg** på alle fasiliteter samtidig — Mulligan Studio 1–4, GFGK Range, Bossum Driving, WANG-hallen. Hver celle viser hvor mange prosent av tilgjengelig tid som er booket. Brukes for: identifisere flaskehalser, planlegge åpningstid-justering, blokkere tider for vedlikehold/private events.

## Layout — UNIKT for denne skjermen

### Heatmap-grid

- **Rader:** Fasiliteter (én rad per: Studio 1, Studio 2, Studio 3, Studio 4, GFGK Range, Bossum Driving, WANG-hallen) — typisk 7 rader
- **Kolonner:** Timer i døgnet (06:00–22:00), 1-times-bredde
- **Celler:** Fargekodet etter belegg-prosent:
  - 0–20% — `#F1EEE5` (muted, "lite belegg")
  - 21–50% — `#D1F843 / 0.3` (lime/30%, "moderat")
  - 51–80% — `#D1F843 / 0.6` (lime/60%, "godt")
  - 81–95% — `#D1F843 / 1.0` (lime full, "fullt")
  - 96–100% — `#005840` (primary, "overbooket-risiko")
  - Sperret — diagonal stripes på muted-bakgrunn
- Hver celle viser tall i midten: `73%` (Geist Mono, 11px)

### Tids-toggle

Segmentert kontroll øverst: `I dag / Denne uka / Denne mnd / Snitt 90d`

### Right-rail aggregert visning

Høyre side, 320px bredt:
- **Topp 3 mest brukte tider** (f.eks. "Onsdag 17:00–20:00 — 94% belegg")
- **Topp 3 minst brukte tider** (f.eks. "Tirsdag 09:00–11:00 — 12%")
- **Foreslåtte tiltak** (AI-generert): "Senk pris med 15% på onsdag 09–11 for å øke belegg"
- **Inntekts-summary:** "Inntekt MTD: 142 800 kr. Snitt-belegg: 67%"

## KPI-strip (4 kort)

1. Snitt-belegg alle fasiliteter: 67%
2. Overbookede slots (>95%): 4
3. Underbookede (<20%): 11
4. Inntekt MTD: 142 800 kr (+12% vs forrige mnd)

## Filter-bar — UNIKT

- Chip: Fasilitet (multi: Studio 1-4 / Range / Bossum / WANG)
- Chip: Dag-type (Hverdag / Helg / Alle)
- Sort/visning: Belegg-prosent / Inntekt / Variasjon
- Primary CTA: `Bulk-blokker tider →` → `BulkBlockModal`

## Klikkbare elementer

| Element | States |
|---|---|
| Celle | default, hover (ring + tooltip "Studio 1, ons 17:00 — 8/10 booket, 1 600 kr"), klikk → `CapacityDetailModal` |
| Rad-header (fasilitet-navn) | default, hover, klikk → filter til kun den fasiliteten |
| Tids-toggle | default, hover, active per periode |
| Foreslått tiltak | default, klikk → "Apply" (åpner pris-editor) eller "Avvis" |

## Empty / loading / error

- **Empty (ingen booking-data ennå):** Heatmap viser kun grå celler + tekst "Belegg-data vises etter første booking. Inviter spillere →"
- **Loading:** Skeleton-grid med pulserende celler
- **Error:** "Kunne ikke laste belegg-data. Prøv igjen →"

## Ønsket output fra Claude Design

1. Lyst tema, "Denne uka", full heatmap med varierte farger
2. Mørkt tema, samme
3. Hover-state på en celle (tooltip + ring)
4. "I dag"-view (kun ett døgn, mer detaljert)
5. Empty
6. Mobil ≤640px — fasiliteter blir tabs, heatmap kollapses til en rad-per-fasilitet med horisontal scroll

## Ikke-mål

- Ikke designe `BulkBlockModal`, `CapacityDetailModal` (egen batch)
- Ikke designe pris-editor (egen sub-flow)
- Ikke designe AI-tiltaks-konfig

## Når du er ferdig

Lim design-link tilbake til Claude Code.
