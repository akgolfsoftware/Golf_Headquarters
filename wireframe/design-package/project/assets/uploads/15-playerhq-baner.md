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
