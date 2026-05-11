# AK Golf Platform — PlayerHQ — TrackMan-økter

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/mal/trackman`
- **Arketype:** B — List + filter (med stat-grid)
- **Tier-gating:** Pro/Elite. **Free ser hele siden med lock-overlay** + CTA til `UpgradeToProModal`.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/trackman.html`
- **Audit:** `wireframe/audit/playerhq-trackman.md`
- **Tilhørende modaler:** `TrackManImportModal`, `TrackManSessionModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar er LYS. Tabular nums på alle radar-tall. Eksakte token-navn — ikke hardkode hex. Markus er referanse-spilleren.

## Spec — hva skjermen er for

TrackMan-økter er Markus' radardata-loggbok. Hver økt importeres fra TrackMan-software (CSV) eller screenshot, og inneholder ballhastighet, carry, smash factor, spin osv. Dette er Pro-feature som demonstrerer plattformens dybde for seriøse spillere. Free ser hele siden bak en lock-overlay som viser hva de går glipp av.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec fra `README.md`. I tillegg:

- **Hero italic Instrument Serif 36px:** *«12 økter med radar-data, Markus.»* Sub: «Sist økt: 7. mai · 187 baller · Snitt smash: 1,46»
- **Stat-grid 2×3 (6 kort)** — øverst, like under hero:
  - Snitt clubhead-speed driver: «107 mph» (JetBrains Mono 28px) + sparkline
  - Snitt ball-speed driver: «158 mph»
  - Snitt carry 7-jern: «164 m»
  - Snitt smash factor: «1,46»
  - Total baller hit: «2 184»
  - Snitt spin 7-jern: «6 920 rpm»
- **Tabell-rader:** 12 økter, 64px høy
  - Kol 1: Dato (JetBrains Mono 12px) + sub: lokasjon-pill («Mulligan Performance»)
  - Kol 2: Varighet («45 min»)
  - Kol 3: Antall baller («147»)
  - Kol 4: Klubber brukt — pill-rad: «Driver · 7i · PW»
  - Kol 5: Snitt smash: «1,47» (med ↑/↓ vs forrige økt)
  - Kol 6: Beste carry: «248 m (Driver)»
  - Kol 7: Kilde-ikon: lucide `FileText` (CSV) eller `Image` (screenshot)
  - Kol 8: «Detaljer →»-link → `TrackManSessionModal`

## Filter-bar — UNIKT

- Søk: «Søk lokasjon …»
- Chip: **Lokasjon** — Mulligan Performance · Mulligan Indoor · GFGK Range · Hjemme
- Chip: **Klubb** — Driver · 7i · PW · Wedge · Putter
- Chip: **Periode** — Siste 30 dager · Siste 90 dager · Sesongen
- Sort: Dato (default) · Antall baller · Snitt smash · Lokasjon
- Primary CTA: `+ Importer økt` → `TrackManImportModal` (CSV/screenshot-valg)

## Klikkbare elementer

Se `wireframe/audit/playerhq-trackman.md`. UNIKT:

| Element | States |
|---|---|
| Stat-card | default, hover (lift 2px), klikk → drilldown til klubb-trend |
| Sparkline tooltip | hover viser «Forrige økt: 106 mph (4. mai)» |
| Økt-rad | default, hover, klikk → `TrackManSessionModal` |
| `+ Importer økt`-CTA | default, hover, active, focus, loading (under upload) |
| Klubb-pill | default, hover (filter-chip-trigger) |
| Kilde-ikon | tooltip («Importert via CSV» / «Tolket fra screenshot via OCR») |
| Lock-overlay (Free) | full skjerm-overlay 40% opacity + sentrert lucide `Lock` + CTA «Oppgrader til Pro for TrackMan-data →» |

## Empty / loading / error / tier-låst-states

Bruker arketype-B-felles. UNIKT:
- **Empty (Pro, ingen økter):** «Ingen TrackMan-økter ennå. Importer din første →» + onboarding-tekst om CSV-eksport fra TrackMan
- **Tier-låst (Free):** Hele siden vises med blur + sentrert lock-overlay-card med:
  - Lucide `Lock` 48px
  - «TrackMan-analyse er en Pro-feature»
  - Liste med 3 fordeler (carry-trend, smash-trend, klubb-sammenligning)
  - CTA «Oppgrader til Pro →»
- **Loading:** 6 grå skeleton-stat-cards + 5 grå skeleton-rader
- **Error:** Per-stat-card og per-tabell retry

## Ønsket output fra Claude Design

1. Hovedskjerm lyst tema (Pro-bruker — full data)
2. Hovedskjerm lyst tema (Free-bruker — full lock-overlay)
3. Mørkt tema (Pro)
4. Hover-state på stat-card med sparkline-tooltip
5. Empty (Pro, ingen økter ennå)
6. Loading
7. Mobil ≤640px — stat-grid kollapser til 1×6, tabell blir kort

## Ikke-mål

- Ikke designe `TrackManImportModal` eller `TrackManSessionModal` (egne pakker senere)
- Ikke designe TrackMan-analyse-skjerm (`/portal/mal/trackman/analyse` — egen batch)
- Ikke designe `UpgradeToProModal` (Tier-1 kritisk modal, egen pakke)
