# AK Golf Platform — Modal — LiveBetweenModal (Screen 3 — mellom øvelser)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** Modal — `LiveBetweenModal`
- **Arketype:** E — Fullscreen / Live (pust-pause mellom øvelser)
- **Tier-gating:** Ingen ekstra
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/live-between.html`
- **Audit:** `wireframe/audit/modal-live-between.md`
- **Tilhørende skjermer:** Vises mellom hver øvelse i Live Session; leder tilbake til `LiveActiveModal` (neste øvelse) eller `LiveSummaryModal` (siste)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

LiveBetweenModal er Screen 3 i Live Session-flyten — den korte pause-skjermen mellom hver øvelse. Spilleren har akkurat fullført forrige øvelse (f.eks. 25/25 driver-rep) og skal kobles av mentalt før neste. Skjermen viser kort oppsummering av forrige øvelse, en pust-nedtelling (60 sek default), preview av neste øvelse, og en stor `Start neste →`-knapp. Brukes også for hydration-reminder og mental reset.

## Layout — UNIKT for denne modalen

Bruker arketype-E-felles-spec. **Fullscreen-modal, ingen sidebar.** Bakgrunn `#0A1F18` med pulserende grad-bevegelse (subtil breathing-effekt — bg pulser fra `#0A1F18` til `#0E2520` på 4 sek loop).

### Topp-bar (56px)

- **Venstre:** Live-pill (dempet, ikke pulserende) + "Mellom øvelser" Geist 12px
- **Senter:** Mini-progress-bar fortsatt synlig fra `LiveActiveModal`
- **Høyre:** Lukk-X 40×40px

### Senter — split-content

```
┌─────────────────────────────────────────────┐
│  ✓ Øvelse 3 ferdig                          │
│  TEK · Driver · 25/25 reps                  │
└─────────────────────────────────────────────┘

         ┌─────────────────┐
         │     [PUST]      │
         │       60        │   ← stor JetBrains Mono nedtelling
         │     sekunder    │
         └─────────────────┘

         "Drikk vann · Strekk skuldrene"

┌─────────────────────────────────────────────┐
│  Neste: Øvelse 4 av 6                       │
│  SLAG · Pitch · 30 reps · ~6 min            │
└─────────────────────────────────────────────┘
```

- **Forrige-oppsummering-kort:** bg `#163027`, lime check-ikon, padding 24px, `rounded-xl`
- **Pust-nedtelling:** Sentrert sirkel 200px, JetBrains Mono 96px, lime accent når ≤10 sek
- **Hydration-tips:** italic Instrument Serif 16px sentrert
- **Neste-preview-kort:** bg `#1B3B30`, pyramide-pill venstre, padding 24px, `rounded-xl`

### Bunn-bar (88px)

- Venstre 30%: `Hopp over pause` (ghost, 56px) — starter neste umiddelbart
- Høyre 70%: `Start neste øvelse →` (primary lime, 88px, `rounded-full`)
- Knappen er disabled-look (40% opasitet) til nedtellingen er ferdig, men kan trykkes for å overstyre

## States å designe

| State | Beskrivelse |
|---|---|
| Initial (60 sek igjen) | Nedtelling går, knapp dempet |
| Mid (30 sek igjen) | Nedtelling, knapp fortsatt dempet |
| Last 10 sek | Nedtelling i lime accent (større visuell vekt) |
| Klar (0 sek) | Nedtelling stopper, knapp lyser opp lime |
| Hopp-over-state | "Hopp over"-knapp klikket — direkte til neste |
| Siste øvelse ferdig | Skjermen erstattes med "Siste øvelse i økta neste!" + transition mot `LiveSummaryModal` ved fullført |

## Klikkbare elementer

| Element | States |
|---|---|
| Start neste-knapp | dempet (under nedtelling), aktiv (etter 0 sek), hover, klikk → neste øvelse |
| Hopp over pause | default, hover, klikk → neste umiddelbart |
| Lukk-X | klikk → avslutt-bekreftelse |
| Pust-sirkel | static visual, ingen interaksjon |

## Empty / loading / error

Felles arketype-E + UNIKT:
- **Loading (transition fra active):** 200ms fade-in
- **Connection lost:** Toast + lokal-lagring
- **Siste-øvelse-flag:** Sub-tekst "Siste øvelse i økta!" pulserer subtilt

## Ønsket output fra Claude Design

1. Initial — 60 sek igjen, knapp dempet
2. Last 10 sek — nedtelling i lime accent
3. Klar (0 sek) — knapp lyser opp lime
4. Siste-øvelse-state ("Siste øvelse i økta!")
5. Hopp-over-knapp hover-state
6. Mobil — identisk (mobile-first)

## Ikke-mål

- Ikke designe `LiveActiveModal`, `LiveSummaryModal` (egne pakker 10, 12)
- Ikke designe pust-konfig (varighet er fast 60 sek)
- Ikke designe hydration-reminder-konfig

## Når du er ferdig

Lim design-link tilbake til Claude Code.
