# PlayerHQ — UI Kit

Spillerportal `/portal`. Mobile-first. Bygd for daglig bruk: dagens økt, ukens plan, framgang, profil.

## Kjernemønstre

- **Foto-hero med eyebrow + greeting** — alltid atmosfærisk foto øverst (golden-hour fairway, putting green), to gradient-lag for legibility. Eyebrow i lime mono caps, italic eyebrow i Inter Tight + primary, og en avatar med live-puls.
- **Dagens økt-kort** — featured card med forest-gradient, KPI-strip nederst.
- **KPI-strip** — 4 kolonner, mono tabular tall, sparkline-vink (mini-bars i lime).
- **Treningspyramide** — fem horisontale bars i pyramide-akse-farger.
- **Bunn-nav** — 4-elements bottom nav, lime aktiv-indikator.

## Skjermer (interaktivt i `index.html`)

1. **Hjem** — foto-hero + dagens økt + KPI + pyramide + neste runde
2. **Plan** — ukesgrid med økter, måneds-overblick
3. **Profil** — handicap-trend, runder, fakturaer

## Komponenter

- `Eyebrow`, `PulseDot`, `Avatar`
- `Hero` (foto-bakgrunn, gradient-overlays)
- `KPI`, `KPIStrip`
- `PyramidProgress`
- `FeaturedCard`
- `SessionRow` — listevisning av kommende økter
- `BottomNav`

## Kjennetegn

- Mobil-bredde 430px (iPhone 15 Pro Max). All padding er multipler av 8.
- Foto bruker `placehold.co` med varm tonering — bytt til ekte foto i prod.
- Touch-targets 44px+ overalt.
