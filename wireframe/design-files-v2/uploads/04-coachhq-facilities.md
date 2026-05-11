# AK Golf Platform — CoachHQ — Fasiliteter (utvidet detail)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/facilities`
- **Arketype:** G — Other (master-detail med utvidet konfig)
- **Tier-gating:** Admin
- **HTML-referanse:** `wireframe/screen-deck/coachhq/facilities.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `NewFacilityModal`, `EditOpeningHoursModal`, `PriceMatrixModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Fasiliteter er den utvidede admin-flaten for hver bookbar enhet under en lokasjon. Eksempler: Mulligan Studio 1, 2, 3, 4 (alle under lokasjon `Mulligan Indoor Golf`), GFGK Range (under lokasjon `Gamle Fredrikstad GK`). Hver fasilitet har egen åpningstid, pris-matrise (peak/off-peak), kapasitet (antall samtidige bookinger), utstyrsliste, og koblet kalender.

Forskjellig fra batch-1 facilities-card (som er KPI på dashboard) — dette er full konfig.

## Layout — UNIKT for denne skjermen

Master-detail med 30/70-split:

### Master (venstre, 30%)

- Filter-bar: chip Lokasjon (Mulligan / GFGK / Bossum / WANG), søk
- Liste over fasiliteter, hver med:
  - Navn (Geist 14px)
  - Lokasjon (muted 12px)
  - Status-prikk (aktiv accent / inaktiv muted / vedlikehold gold)
  - Belegg-prosent (sparkline siste 7 dager)
- CTA bunn: `+ Ny fasilitet` → `NewFacilityModal`

### Detail (høyre, 70%)

For valgt fasilitet, vertikalt stablet:

#### Header
- Stort fasilitet-navn (italic Instrument Serif 36px)
- Subtitle: `Mulligan Indoor Golf · Studio 1 · Aktiv`
- Aksjons-rad: `Rediger`, `Dupliser`, `Arkiver` (destructive)

#### Seksjon 1: Grunnopplysninger
- Felter (read-only med "Endre →"):
  - Type: Trackman-simulator
  - Kapasitet: 4 personer
  - Areal: 24 m²
  - Utstyr: Trackman 4, Mevo+ launch monitor, 3 putters, …

#### Seksjon 2: Åpningstider
- Visuell uke-bar (Mandag–Søndag)
- Hver dag viser åpningstid (`08:00–22:00`) + lukket-dager med diagonal stripes
- `Endre →` → `EditOpeningHoursModal`

#### Seksjon 3: Pris-matrise
- Tabell:
  | Tidsslot | Hverdag | Helg |
  |---|---|---|
  | Off-peak (08–15) | 450 kr/t | 550 kr/t |
  | Peak (15–22) | 650 kr/t | 750 kr/t |
- Toggle: Member-pris / Standard-pris
- `Endre →` → `PriceMatrixModal`

#### Seksjon 4: Belegg (siste 30d)
- Stacked bar chart per uke
- Snitt: 67%, peak: 94% (onsdag 17:00)

#### Seksjon 5: Inntekt (MTD)
- Stort tall: `47 200 kr`
- Sparkline 30 dager
- Drill-down-link til Finance med fasilitet-filter

## KPI-strip (4 kort, øverst)

1. Aktive fasiliteter: 7
2. Snitt-belegg: 67%
3. Inntekt MTD (alle): 142 800 kr
4. Vedlikehold påkrevd: 1 (Studio 3 — Trackman re-kalibrering)

## Klikkbare elementer

| Element | States |
|---|---|
| Master-rad | default, hover (bg-shift), selected (accent-border + bg-shift) |
| Endre-link per seksjon | default, hover, klikk → modal |
| Status-prikk | default, hover (tooltip "Aktiv siden 2025-09-12") |
| Aksjons-rad-knapp | default, hover, destructive for Arkiver |
| Belegg-bar | hover (tooltip per uke) |

## Empty / loading / error

- **Empty (ingen fasiliteter):** "Ingen fasiliteter registrert. Lag din første →" CTA
- **Detail-empty (ingen valgt):** "Velg en fasilitet i listen for å se detaljer"
- **Loading detail:** Skeleton-seksjoner
- **Endre-error:** Inline rød tekst per modal

## Ønsket output fra Claude Design

1. Lyst tema, master-detail åpent på Studio 1
2. Mørkt tema, samme
3. Master-rad hover-state
4. Detail-empty (ingen valgt)
5. Mobil ≤640px — master blir top-liste, detail under (1-kolonne flow)

## Ikke-mål

- Ikke designe `NewFacilityModal`, `EditOpeningHoursModal`, `PriceMatrixModal` (egen batch)
- Ikke designe Trackman-konfig
- Ikke designe vedlikeholds-sjekkliste

## Når du er ferdig

Lim design-link tilbake til Claude Code.
