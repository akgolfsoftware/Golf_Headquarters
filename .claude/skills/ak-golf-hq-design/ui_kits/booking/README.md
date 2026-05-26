# Booking — UI Kit

Booking-flow. Brukes både av spillere (logget inn fra `/portal`) og besøkende fra `akgolf.no`. Tre steg: velg coach → velg tid → bekreft.

## Layout

Sentral kolonne 720px på desktop, full-bredde mobile. Stepper øverst.

## Skjermer (interaktivt i `index.html`)

1. **Step 1 · Coach** — kort med coach-foto, spesialitet, valg.
2. **Step 2 · Tidsslot** — uke-grid m/ ledige tider, valgt slot highlight i lime.
3. **Step 3 · Bekreft** — oppsummering + betalingsmetode + CTA.

## Komponenter

- `Stepper` — 3-stegs indikator
- `CoachOptionCard`
- `WeekSelector`, `SlotGrid` — radio-grid med disabled tider
- `SummaryRow`, `PaymentMethodRow`
- `BookingActions` — sticky nederste rad
