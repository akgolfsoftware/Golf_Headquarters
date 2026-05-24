# Prompt 04 — Avbestill booking modal

## Hensikt

Når Markus klikker "Avbestill" på en kommende booking i `/portal/meg/bookinger`, åpnes en bekreftelses-modal som forklarer refund-policy, viser tidsfrist, og lar ham velge årsak (for coachhq-statistikk).

## Trigger

Klikk på "Avbestill"-CTA i bookings-rad eller -drawer.

## Layout

- Modal 520 × auto, sentrert, cream, `rounded-2xl`, `p-10`.
- Header: eyebrow JetBrains Mono `PLAYERHQ · BOOKING · AVBESTILL`, X-ikon.
- Hero: Inter Tight 26 px "Avbestille *Performance Coaching*?" (italic på tjenestenavn).
- Sammendrag-card: dato, klokkeslett, coach, fasilitet i kompakt 2×2 grid.
- Refund-info-blokk:
  - `> 24 t`: lime-card "Du får full refusjon (850 kr) på samme betalingsmetode innen 5 dager."
  - `< 24 t`: gul/destructive-card "Avbestilling innen 24 t — 50 % refusjon (425 kr)."
- Årsak-velger: `Select` med 6 valg ("Skadet/syk", "Kollisjon i kalender", "Vær", "Familie", "Trenger ikke", "Annet").
- Fritekst-felt (valgfritt): textarea 3 rader "Skriv en valgfri kommentar til coachen din".
- Bunn-handlinger:
  - Primær destructive `bg-destructive` "Bekreft avbestilling"
  - Secondary outline "Behold booking"

## Komponenter

- `Dialog`, `Select`, `Textarea`, `Button`
- Lucide: X, Calendar, Clock, MapPin, User, AlertTriangle, Check

## Eksempel-data

```
Booking: Performance Coaching 60 min
Dato: 24. mai 2026 (5 dager unna)
Pris: 850 kr
Refund: full (>24 t)
Coach: Anders Kristiansen
```

## Branding-krav

- Forest, lime, destructive `#A32D2D`.
- Inter Tight italic på tjenestenavn.
- JetBrains Mono for pris/tid.
- Norsk bokmål, ingen emojier.

## Tilstander

- **Pending**: spinner i CTA.
- **Suksess**: lukkes + toast "Booking avbestilt. Refusjon kommer innen 5 dager."
- **Feil**: destructive-banner øverst.
