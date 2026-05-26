# Prompt 03 — Booking-betaling modal (Stripe Checkout-shim)

## Hensikt

Når Markus klikker "Bekreft booking" i `/portal/booking/ny/bekreft`, åpnes betalingsmodalen som viser pris, valgt tjeneste, og Stripe-Element. Modalen er en in-page shim før redirect til Stripe — gir Markus mulighet til å se hele kvitteringen og velge "Pro-rabatt"/Trekk på credits.

## Trigger

Klikk på primær CTA i `/portal/booking/ny/bekreft`.

## Layout

- Modal 560 × auto, sentrert, cream `#FAFAF7`, `rounded-2xl`, `p-10`.
- Header: eyebrow JetBrains Mono 10 px `PLAYERHQ · BOOKING · BETALING`, X-ikon.
- Hero: Inter Tight 28 px "Bekreft *coaching-time*" (italic på siste ord).
- Oppsummering-card secondary `rounded-lg p-6 gap-4`:
  - Tjeneste-rad: ikon (Lucide Trophy/Target) + tittel + dato/tidspunkt
  - Coach-rad: avatar + navn
  - Fasilitet-rad: ikon MapPin + navn
- Pris-blokk JetBrains Mono tabular nums:
  - Ordrelinje: "Performance Coaching 60 min" – `850 kr`
  - Pro-rabatt (hvis aktivt): "−10%" muted
  - Credit-bruk (toggle): "Bruk 2 credits" – `0 kr`
  - Total: stor 32 px Inter Tight bold tabular nums
- Betalingsmetode-blokk: radio cards (Vipps / Kort / Faktura), hver med Lucide-ikon.
- Bunn-CTA: primær forest pill 100 % bred "Betal 850 kr" — viser Stripe-knapp eller åpner Vipps-deeplink ved klikk.
- Fotnote JetBrains Mono 10 px: "Avbestilling gratis inntil 24 t før".

## Komponenter

- `Dialog`, `RadioGroup`, `Button`, `Switch` (credits-toggle)
- Lucide: X, Trophy, Target, MapPin, CreditCard, Smartphone, FileText, Loader2

## Eksempel-data

```
Tjeneste: Performance Coaching 60 min
Dato: 24. mai 2026, 16:00–17:00
Coach: Anders Kristiansen
Fasilitet: GFGK Performance Studio
Pris: 850 kr
Tier: PRO (10% rabatt aktivt)
Credits tilgjengelig: 3 av 4 (denne måneden)
```

## Branding-krav

- Forest primær, lime accent for credit-toggle aktiv.
- JetBrains Mono for alle priser, tabular nums.
- Norsk bokmål, ingen emojier.

## Tilstander

- **Credits valgt**: pris går til `0 kr`, knapp blir "Bekreft credit-booking".
- **Pending**: spinner i CTA, disabled inputs.
- **Feil**: rødt destructive-card øverst med Lucide AlertCircle.
