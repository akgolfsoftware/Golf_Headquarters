# Prompt 05 — Reschedule-bekreftelse modal

## Hensikt

Når Markus har valgt nytt tidspunkt på `/portal/meg/bookinger/reschedule/[bookingId]`, vises en kompakt før/etter-bekreftelse før commit.

## Trigger

Klikk på "Bytt til dette tidspunktet" på reschedule-side.

## Layout

- Modal 560 × auto, cream, `rounded-2xl`, `p-10`.
- Hero: Inter Tight 24 px "Flytt *coaching-time*?" italic.
- To-kolonners før/etter-card:
  - Venstre `bg-secondary`: "Nåværende" eyebrow, ikon Clock, dato + tid i JetBrains Mono.
  - Pil i midten: Lucide ArrowRight 24 px forest.
  - Høyre `bg-primary/10`: "Nytt" eyebrow lime, dato + tid i JetBrains Mono store sifre.
- Politikk-blokk: "Du flytter mer enn 24 t fram — ingen avgift." (eller motsvarende advarsel).
- Bunn-handlinger:
  - Primær forest "Bekreft flytting"
  - Secondary "Velg annet tidspunkt"

## Komponenter

- `Dialog`, `Button`
- Lucide: X, Clock, ArrowRight, AlertTriangle

## Eksempel-data

```
Booking: Performance Coaching 60 min
Nåværende: 24. mai · 16:00
Nytt: 27. mai · 14:00
Differanse: +3 dager (gratis flytting)
```

## Branding-krav

- Forest, lime accent på "nytt"-side.
- JetBrains Mono tabular nums for tid.
- Norsk bokmål, ingen emojier.

## Tilstander

- **<24 t**: gul-card med advarsel og 100 kr endringsgebyr.
- **Pending**: spinner + disable.
- **Suksess**: lukkes + redirect til `/portal/meg/bookinger` med toast.
