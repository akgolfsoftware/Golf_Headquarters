# Design-system-regel — v13/golfdata er gjeldende (IKKE låst)

Skrevet 5. juli 2026. Denne regelen avgjør hvilket komponent-/design-lag som brukes.
Se full kartlegging i `docs/DESIGN-LAG-OVERSIKT.md`.

## Regelen (sterk default, ikke hard lås)

**v13 er det gjeldende designsystemet.** Alt nytt og alt som redesignes komponeres fra:
- Kode: `src/components/athletic/golfdata/` (v13 portert til TSX).
- Fasit/utseende: `public/design-handover/` (komponenter + prompt.md + guidelines).
- Fonter: Familjen Grotesk (display) · Inter (UI) · JetBrains Mono (tall).
- Tokens: `golfdata-tokens.css` for v13-flater; `globals.css` er app-basis.

## «Ikke låst» — hva det betyr

Dette er en **retning, ikke en grunnlov**. Til forskjell fra de låste beslutningene i CLAUDE.md:
- Verdier (spacing, komponent-API, farge-nyanser) **kan utvikles**. Claude Design kan foreslå
  endringer i v13, og de tas inn i `public/design-handover/` + reflekteres i `golfdata/`.
- Nye komponenter kan legges til i v13 og portes til `golfdata/` ved behov (88 av 113 er ikke portet ennå).
- Layout/skjermkomposisjon er **åpen for redesign** — skjermene skal *designes*, ikke bare re-skinnes.

Det som IKKE endres uten egen beslutning (fortsatt låst, se CLAUDE.md): merkevarefargene som hue
(forest #005840, lime #D1F843), Familjen Grotesk/Inter/JetBrains Mono, Lucide-ikoner, norsk bokmål,
terminologi/ordbok, lys=aldri lime-fyll-på-lys.

## Vedlikehold-modus (ikke utvid, ikke slett ennå)

Disse lagene er i bruk av eksisterende skjermer og skal IKKE utvides med ny funksjonalitet.
De fases ut etterhvert som skjermer redesignes til v13 — ikke i én omgang:
- `src/components/athletic/*.tsx` (det gamle branded-biblioteket: button, card, kpi, sparkline …).
- Feature-bespoke UI (`portal/`, `sg-hub/`, `stats/`, `workbench-hybrid/`, `teknisk-plan/` …).

`src/components/ui/` (shadcn: Dialog, Input, Sheet, Popover, Tabs) er IKKE i vedlikehold — det er
den gjeldende primitiv-kilden for skjema/overlay og overlapper ikke golf-UI-en.

## Praktisk beslutningsregel

| Skal lage | Bruk |
|---|---|
| Ny golf-UI-komponent (knapp, kort, KPI, SG-viz) | `athletic/golfdata/` |
| Dialog / input / sheet / tabs / popover | `src/components/ui/` |
| Ny skjerm | komponér fra `golfdata/` per prompt.md; meld gap, ikke improviser |
| Farge/spacing/type | tokens — aldri hardkodet hex |

## Design-veiledning

Kun `.claude/skills/ak-designekspert` (+ `public/design-handover/guidelines/`). De øvrige design-skills
gir motstridende råd og skal ikke brukes for dette prosjektet.
