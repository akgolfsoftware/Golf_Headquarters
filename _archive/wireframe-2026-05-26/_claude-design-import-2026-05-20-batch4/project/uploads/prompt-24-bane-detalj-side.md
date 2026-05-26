# Prompt 24 — Bane-detalj full-page side

## Hensikt

`/portal/mal/baner/[id]` — full-page versjon (komplement til modal i prompt 20). Brukes ved direkte deling/permanent visning og dypere analyse.

## Trigger

Klikk på "Åpne full side" fra bane-modal eller direkte lenke.

## Layout

- Full-page, cream, `py-12 px-6`, max-width 1200 px.
- Hero:
  - Eyebrow "PLAYERHQ · BANER"
  - Tittel Inter Tight 40 px italic "*GFGK Old Course*"
  - Bane-info-rad: par, slope, rating, lengde — JetBrains Mono
  - Liten kart-snippet høyre (Mapbox/Leaflet), klikkbar
- Stats-cards 4-kol:
  - Runder · Beste · Snitt · SG totalt
- Tabs: "Hull-for-hull / Tidslinje / Strategi / Foto"
  - Hull-for-hull: 18-rad tabell med snitt, beste, verste, SG-fordeling
  - Tidslinje: scatter chart over alle runder + linje for trend
  - Strategi: notater fra Markus + coach, kategorisert per hull
  - Foto: galleri av runder på denne banen
- Sticky bunn-bar:
  - "Logg runde her" primær
  - "Bestill caddy/coach-runde" outline
  - "Del bane med venn" ghost

## Komponenter

- `Tabs`, `Table`, `Card`, Map-embed, scatter chart
- Lucide: Flag, MapPin, BarChart3, Clock, NotebookPen, Camera, Share2

## Eksempel-data

Samme som prompt 20, men utvidet:
- Bilder: 12 stk fra forskjellige runder
- Strategi-notater: 8 stk
- Tidslinje: 28 runder over 3 år

## Branding-krav

- JetBrains Mono tabular nums.
- Forest/lime/destructive for SG-skala.
- Inter Tight italic på hero.
- Norsk bokmål.

## Tilstander

- **Ingen runder**: empty-state med "Logg første runde".
- **Loading**: skeleton + tabs.
