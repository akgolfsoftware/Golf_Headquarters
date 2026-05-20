# Prompt 13 — Coach-melding vedlegg-modal

## Hensikt

Når Markus klikker `Paperclip` i compose-feltet i `/portal/coach/melding`, åpnes en vedlegg-modal med 4 valg: opplast fil, koble til runde, koble til økt, koble til TrackMan-sesjon.

## Trigger

Klikk på vedlegg-ikon i compose-feltet.

## Layout

- Modal 600 × auto, cream, `rounded-2xl`, `p-8`.
- Hero: Inter Tight 22 px "Legg ved *kontekst*".
- 4 store handlings-cards i 2×2 grid:
  - **Fil** — Lucide Upload, "Bilde, video eller PDF"
  - **Runde** — Lucide Flag, "Velg en logget runde"
  - **Økt** — Lucide Dumbbell, "Koble til treningsøkt"
  - **TrackMan** — Lucide Activity, "Velg session med tall"
- Når kortet klikkes, ekspanderer den valgte til full bredde:
  - **Fil**: drag-drop område 240 px høyt + filliste
  - **Runde**: søk-input + liste av siste 10 runder
  - **Økt**: kalender-snippet siste 14 dager
  - **TrackMan**: liste av siste 5 sessions med dato + key metric
- Bunn:
  - Primær forest "Legg ved (1)" (count oppdateres)
  - Outline "Avbryt"

## Komponenter

- `Dialog`, `FileInput`, `Combobox`, `Button`
- Lucide: X, Upload, Flag, Dumbbell, Activity, Search, Check

## Eksempel-data

```
Tilgjengelige runder: 8 (siste 30 dager)
Tilgjengelige økter: 24
TrackMan sessions: 12
Filtype-grense: 10 MB
```

## Branding-krav

- Lime accent på valgt card.
- JetBrains Mono for tall/dato.
- Norsk bokmål.

## Tilstander

- **Ingen valgt**: CTA disabled.
- **Pending upload**: progressbar i fil-listen.
- **Suksess**: lukkes + vedlegg vises som chip i compose-feltet.
