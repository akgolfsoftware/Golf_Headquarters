# Prompt 02 — Marker alle som lest, bekreftelse

## Hensikt

Når Markus trykker `MarkAllReadButton` i `/portal/varsler` og det finnes 5+ uleste, vises en kompakt bekreftelse for å unngå utilsiktet tap av oversikt.

## Trigger

Klikk på "Marker alle som lest" knapp i header.

## Layout

- Sentrert modal 420 × auto, cream `#FAFAF7` (dark: `#163027`), border `border-border`, `rounded-2xl`, `p-8`, drop-shadow soft.
- Topp: Lucide `CheckCheck`-ikon i lime-circle 48×48.
- Tittel Inter Tight 22 px: "Marker *alle* 12 varsler som lest?" (italic Instrument Serif på "alle 12").
- Underbeskrivelse Inter 14 px muted-foreground: "Du kan ikke angre. Tidligere varsler forblir tilgjengelig i historikken."
- To knapper i `gap-3` flex-row:
  - Primær forest "Marker alle"
  - Secondary outline "Avbryt"

## Komponenter

- `Dialog` shadcn/ui
- `Button`
- Lucide: CheckCheck, X

## Eksempel-data

Antall uleste: 12

## Branding-krav

- Cream/forest/lime + Inter Tight + Instrument Serif italic.
- Lucide stroke 1.75, ingen emojier.
- 8pt-grid: `p-8`, `gap-3`.
- Norsk bokmål.

## Tilstander

- **Pending** (under submit): knapp viser `Loader2`-spinner, disabled.
- **Suksess**: lukkes + toast nede til høyre "12 varsler markert som lest".
- **<5 uleste**: skip modal, marker direkte med toast.
