# Prompt 20 — Leaderboard-filter (drawer)

## Hensikt
La spilleren filtrere leaderboard på alder, region, klubb, kjønn og HCP-bånd for å se relevante sammenligninger.

## Trigger
Filter-ikon i toppen av `/portal/mal/leaderboard`. URL/drawer: `/portal/mal/leaderboard/filter`.

## Layout
Slide-in drawer fra høyre på desktop (400px bredde, full høyde), bottom-sheet på mobil. Header: "Filtrer leaderboard" + X. Body: form-grupper. Footer: Nullstill (ghost) + Vis resultater (primary lime).

## Komponenter
- Aldersgruppe — radio chips: Alle · U12 · U14 · U16 · U18 · Senior · Senior 50+
- Kjønn — radio chips: Alle · Gutter · Jenter · Mixed
- Region — multi-select: Oslo/Akershus · Østfold · Vestfold · Telemark · Innlandet · Vestland · Trøndelag · Nordland · ... (norske golfregioner)
- Klubb — søkbar select (autocomplete): start med "G..." → liste
- HCP-bånd — range-slider: min/maks (-5,0 til 36,0)
- Tidsperiode — radio: Siste 30 dager · Siste 90 dager · Sesong 2026 · All tid
- Vis bare venner — toggle
- Footer: Nullstill (ghost venstre) + Vis 124 spillere (primary, viser antall live)

## Eksempel-data
- Markus R.P. — A1, GFGK, HCP +3,5
- Default filtre: U18 · Alle kjønn · Alle regioner · Alle klubber · HCP -5 til 18 · Sesong 2026
- Antall som matcher: 247
- Etter Markus' filtre (U18 · Gutter · Østfold + Oslo · HCP -5 til 5 · Siste 90 dager): 124 spillere

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (tall), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75 (filter, x, search, sliders-horizontal)
- Chips: pill-form, line-border, forest fill når valgt
- Norsk bokmål, ingen emojier

## Form-felter
- `aldersgruppe` enum
- `kjonn` enum
- `regioner` multi-select
- `klubber` multi-select
- `hcp_min` number, `hcp_max` number
- `periode` enum
- `kun_venner` boolean

## Submit / actions
- "Vis resultater" → lukker drawer, oppdaterer leaderboard
- "Nullstill" → tilbakestiller alle felter til defaults
- Live count: hver endring debouncer 300ms og henter antall fra server (GET `/api/portal/leaderboard/count?...`)

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Drawer-animasjon med translateX (250ms ease-out)
- Range-slider med to handles (HCP min/maks)
- A11y: dialog-rolle, esc lukker, trap focus
- Norsk bokmål
