# O06 — booking og betaling, teknisk kontroll 12.09.2026

Gren: `grok/o06-booking-betaling-2026-09-12`. Ingen visuell portering. Ingen reell betaling, e-postutsending, migrasjon eller utrulling. Stripe er kun mocket.

## Hva som er prøvd

Testene kaller eksporterte handlinger og serverregler med syntetiske data.

- Kollisjon: credit-booking avviser tatt tid uten credit-trekk. Eksisterende `sjekkKollisjon`-tester står.
- Idempotens og hendelsesrekkefølge: `savePayment` slår session og intent sammen; eldre PENDING overskriver ikke SUCCEEDED; motstridende identiteter avvises. Utløpt checkout etter bekreftet treffer bare PENDING. Refusjons-event avlyser aktiv booking.
- Credits: siste credit i race oppretter ingen booking.
- Avbestilling: andres booking avvises. Mer enn 24 timer kaller Stripe-refusjon. Under 24 timer avlyser uten refusjon. Pakketime fører credit tilbake.
- Oppsigelse: Stripe kalles før lokal status. Feilet Stripe-kall rører ikke databasen.
- Trygg retur: `startBookingPayment` (eksisterende) frigjør bare ubekreftet reservasjon ved entydig avvist forsøk.

## Isolert testdatabase — blokkering

`tests/integration/launch-database.test.ts` krever ekte Postgres og Docker. Samme blokkering som [P0-TEST](p0-test-blokkering-2026-09-12.md). Innlogget booking-/betalingsreise er ikke bevis her.

## Ikke påstått

- Reell Stripe-testnøkkel eller live-kjøp.
- Innlogget Next-reise gjennom checkout.
- Visuell godkjenning, D0 eller lanseringsklar app.
