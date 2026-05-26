# AK Golf Platform — CoachHQ — Økonomi

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/finance`
- **Arketype:** A — Dashboard (financial dashboard)
- **Tier-gating:** Ikke relevant (finance er admin-only — sjekk RBAC)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/finance.html` (lastet opp som vedlegg)

## Designsystem

Bruk `design-system-v2.md`. Spesielt for tall:
- **JetBrains Mono med tabular-nums** for ALLE pengetall — slik at kolonner radjusterer perfekt
- **Norsk valuta-format:** «12 350 kr» (mellomrom som tusenseparator, "kr" som suffix). Aldri "12.350" eller "12,350"
- **Komma som desimal:** «1 250,50 kr»
- **Status-farger:** Success grønn for betalt, Warning oransje for venter, Danger rød for overforfallen
- **Status-pills:** Brøk-format (3/12 fakturaer venter)

## Spec — hva skjermen er for

CoachHQ Økonomi er **det finansielle pulsmåleren**. Skal svare på:
- Hvor mye har vi tjent denne måneden / sesongen?
- Hvem skylder hva?
- Hvilke fakturaer går ut snart?
- Hvilke nye kunder kom til (revenue-bidrag)?

## Layout-anvisning

- **Sidebar (CoachHQ to-lags — 56px mørk rail + 200px lys nav, totalt 256px)** Drift-gruppe → Økonomi-tab active i nav-kolonnen (`rgba(209,248,67,0.30)` lime tint bg)

- **Hovedinnhold**
  - **Hero**
    - Italic Inter Tight 36px: «Økonomi — pulsen i driften»
    - Sub (caption): «{Måned} {År} · Sesong-til-dato»
    - Periode-velger til høyre

  - **KPI-strip (4 store kort, asymmetrisk)**
    - **Stor (hero):** Inntekt MTD — JetBrains Mono 48px «48 250 kr» + trend «+12% mot forrige måned» (success)
    - Medium: Utestående totalt — «3 200 kr» + brøk «3/12 fakturaer venter»
    - Medium: Snitt per spiller (MTD) — «1 270 kr»
    - Medium: Forfalt (>30 dager) — «800 kr» + Danger-pill «1 faktura»

  - **Inntekt-trend-chart (full bredde, hero-card)**
    - Stacked bar-chart: månedlig inntekt fordelt på kategori (Coaching / Booking / Pakker / Klippekort)
    - 12 måneder, hover for breakdown
    - Sammenligning mot fjoråret som linje

  - **Bento-rad (3 kort, asymmetrisk)**
    - Stor (2-bred): Faktura-status — pill-strip (Betalt 9 / Venter 3 / Forfalt 1) + liste over forfallne
    - Liten: Top 3 betalende kunder (måneden) — mini-avatar-rad + beløp

  - **Faktura-tabell (full bredde, scrollable)**
    - Kolonner: Faktura-nr, Kunde-avatar+navn, Beløp, Forfallsdato, Status-pill, Handling-meny
    - Filter-chip-rad over: Status (alle / venter / forfalt / betalt), Periode
    - Søk-felt
    - "Eksporter →" CTA øverst (åpner ExportMenu-popover)

  - **Footer-rad (3 quick-action cards)**
    - "Ny faktura →" (primary CTA)
    - "Send påminnelser →" (sekundær)
    - "Tripletex-eksport →" (sekundær — åpner TripletexExportModal)

## Klikkbare elementer som må designes (states)

| Element | States å designe |
|---|---|
| Periode-velger | default, open, item-hover, item-selected |
| KPI-card (klikkbar) | default, hover |
| Inntekt-trend-bar (per måned) | default, hover (tooltip med breakdown), bar-segment-hover |
| Sammenlign-toggle (med fjoråret) | on, off, hover |
| Faktura-status-pill | per status (Betalt grønn / Venter oransje / Forfalt rød) |
| Filter-chip (multi) | default, hover, selected, disabled |
| Søk-felt | default, focus, with-text, clear-button |
| Faktura-rad | default, hover, klikk → faktura-detalj-side |
| "..."-meny per rad | default, hover, popover-open (Send påminnelse / Marker betalt / Slett) |
| "Eksporter →" CTA | default, hover, popover-open (CSV / PDF / Tripletex) |
| "Ny faktura →" primary CTA | default, hover, active, focus, disabled, loading |
| "Send påminnelser →" sekundær | default, hover, focus |
| "Tripletex-eksport →" | default, hover, focus, klikk → modal-trigger |

## Empty / loading / error-states

- **Empty (ingen fakturaer):** Hero + KPI viser «0 kr» / «—», faktura-tabell viser «Ingen fakturaer ennå. Lag din første →» med onboarding-card
- **Empty (alle betalt):** Faktura-tabell viser «Alt oppdatert. Ingen utestående.» med Success-ikon (lucide CheckCircle)
- **Loading:** KPI-skeleton, chart-skeleton (12 grå bars), tabell-skeleton (5 grå rader)
- **Error:** Per-card error med retry

## Ønsket output fra Claude Design

1. Lyst tema med full data (3 venter, 1 forfalt, 9 betalt)
2. Mørkt tema
3. Hover-state på inntekt-bar (tooltip viser kategori-breakdown)
4. Open-state på "..."-meny (popover med 3 actions)
5. Open-state på "Eksporter →" (popover med 3 valg)
6. Filter-chip aktiv ("Forfalt" valgt)
7. Loading-state
8. Empty-state (alle betalt)
9. Mobil-versjon (≤768px) — KPI 2×2, chart full bredde, tabell scrollable horisontalt

## Ikke-mål

- Ikke designe faktura-detalj-siden (`/admin/finance/invoices/:id`) — egen pakke
- Ikke designe TripletexExportModal — kommer i B2

## Når du er ferdig

Lim **design-link** tilbake til Claude Code.
