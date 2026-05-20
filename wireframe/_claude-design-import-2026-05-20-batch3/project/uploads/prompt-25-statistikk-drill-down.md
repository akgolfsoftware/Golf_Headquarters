# Prompt 25 — Statistikk drill-down per kategori

## Hensikt

`/portal/mal/statistikk/[kategori]` — fra `/portal/mal/statistikk` skal Markus kunne klikke seg inn på én kategori (driving, approach, short-game, putting) og se dypanalyse.

## Trigger

Klikk på en SG-kategori-card i statistikk-hub.

## Layout

- Full-page, cream, `py-12 px-6`, max-width 1100 px.
- Hero:
  - Eyebrow "PLAYERHQ · STATISTIKK · APPROACH"
  - Tittel Inter Tight 36 px italic "*Approach* i tall"
  - Periode-pills i header (7d / 30d / 90d / 1år / alt)
- Hero-stat-card lime-gradient:
  - SG Approach: +0.42 (JetBrains Mono 48 px)
  - Trend vs forrige periode: +0.18 (forest-pill)
  - Antall slag: 142
- Hovedchart: stor line/area chart 480 px høyt, SG over tid.
- 4 sub-stat-cards:
  - GIR%: 67%
  - Avstand til pin snitt: 9.2 m
  - Long/short bias: -2.1 m (long)
  - Klubb-fordeling pie
- Distance-bucket-tabell:
  - 0–50 m, 50–100, 100–150, 150–200, 200+
  - Per bucket: antall, SG, GIR%
- "Hva å trene på"-blokk (AI-generert):
  - 3 anbefalte drills
  - Hver med "Legg til i plan"-CTA
- Coach-perspektiv-card: kort note fra hovedcoach

## Komponenter

- Recharts/custom line+area, pie, `Tabs`, `Table`, `Card`
- Lucide: Target, TrendingUp, TrendingDown, Activity, Flag, ChevronRight

## Eksempel-data

```
Kategori: Approach
Periode: 30 dager
SG: +0.42 (forrige periode +0.24, trend +0.18)
Slag: 142
GIR: 67%
Avstand snitt til pin: 9.2 m
Bias: 2.1 m long
Drills: "Pin-attack 100m", "Long iron contact", "Lag-distance"
```

## Branding-krav

- Lime-gradient hero-card.
- Forest/lime stigning, destructive nedgang.
- JetBrains Mono tabular nums alle tall.
- Norsk bokmål.

## Tilstander

- **<10 runder**: gul-card "Trenger flere runder for å gi presise tall".
- **Loading**: skeleton chart + cards.
