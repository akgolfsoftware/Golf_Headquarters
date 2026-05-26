# Prompt 20 — Bane-detalj modal

## Hensikt

`/portal/mal/baner` er i dag en stub (73 linjer). Når Markus klikker en bane-rad, åpnes en modal som viser bane-stats: SG på denne banen, beste runde, hull-for-hull-snitt.

## Trigger

Klikk på bane-card i bane-listen.

## Layout

- Modal 720 × auto (max-h 90vh, scrollable), cream, `rounded-2xl`, `p-10`.
- Hero: Inter Tight 28 px italic "*GFGK Old Course*"
- Meta-rad: par 71, slope 130, rating 71.4 — alle JetBrains Mono.
- Hero-stats 4-kol grid:
  - Runder: 28
  - Beste: 67 (−4)
  - Snitt: 73.2
  - SG totalt: +1.4
- Hull-for-hull-tabell:
  - 18 rader
  - Kolonner: hull, par, snitt JetBrains Mono, SG-color (forest/lime når under par, destructive når over)
  - Hover-rad: åpner mini-popover med beste/verste/vanligste score
- Tab-rad: "Hull-for-hull / Tidslinje / Strategi-notater"
  - Tidslinje: scatter plot av siste 28 runder
  - Strategi-notater: liste av notater fra coach + Markus om banen
- Bunn:
  - Primær forest "Logg runde på denne banen" → `/portal/mal/runder/ny?course=...`
  - Outline "Se på kart"
  - Ghost "Lukk"

## Komponenter

- `Dialog`, `Tabs`, `Table`, scatter-chart (custom SVG)
- Lucide: X, Flag, MapPin, BarChart3, Clock, NotebookPen

## Eksempel-data

```
Bane: GFGK Old Course
Par: 71, Slope 130, Rating 71.4
Runder: 28
Beste: 67 (−4), 14. juni 2025
Snitt: 73.2
SG: +1.4 totalt (T2G +0.8, Putt +0.6)
Vanskeligste hull: 17 (snitt 4.8, par 4)
Lettest: 6 (snitt 3.4, par 4)
```

## Branding-krav

- JetBrains Mono tabular nums for alle tall.
- Forest/lime under par, destructive over par.
- Norsk bokmål.

## Tilstander

- **Ingen runder**: empty-state "Logg første runde her".
- **Loading hull-stats**: skeleton.
