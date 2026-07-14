# Claude Design-bestilling — D4-gap: Booking-detalj + Forelder-flater

> Skrevet 2026-07-06 (design-bølgeplan D4). Genuint nye komposisjonsmønstre som ikke finnes i
> v13-kit-et — skal tegnes i Claude Design mot kit-et. Se D1-bestillingen for felles kontekst-
> blokk (lim inn samme innledning). Auth-flytene er IKKE bestilt — de monteres fra login-kanonen.

## Bestilling 4 — Booking-detalj (3 skjermer)

Ruter: `/portal/booking/[bookingId]` (min booking), `/portal/booking/coach/[coachId]`
(coach-profil m/ booking), `/portal/booking/anlegg/[anleggId]` (anlegg-profil m/ booking).
PlayerHQ lys, mobil-først 390 px.

- **Booking-detalj:** status (bekreftet/venter/avlyst), tid/sted/coach, hva økten gjelder,
  endre/avlys-handlinger (aldri sperrende språk), kvittering/pris hvis betalt, legg-i-kalender.
- **Coach-profil (booking):** foto, navn, coaching-pakker, neste ledige tider (DayStrip-aktig),
  book-CTA. Ekte coach: Markus Røinås Pedersen — behold navnet.
- **Anlegg-profil:** fasiliteter (Tag-liste), åpningstider, kart-plassholder, ledige tider, book-CTA.

Datafelter (låst): Booking { status, startTime, service, coach, facility, payment }.

## Bestilling 5 — Forelderportal-komplettering (3 skjermer)

Ruter: `/forelder/barn` (barneliste), `/forelder/ukerapport`, `/forelder/varsler`.
Terminal-lys (#F7F7F4-familien), read-only-profil: foreldre OBSERVERER, redigerer ikke trening.

- **Barneliste:** ett fremgangskort per barn (navn, gruppe, SG-trend-sparkline, siste økt,
  neste hendelse) → klikk til `/forelder/barn/[childId]` (finnes).
- **Ukerapport:** narrativ ukeoppsummering per barn — treningsvolum per pyramide-akse,
  coach-kommentar, neste ukes plan. Skal kunne leses på 60 sekunder.
- **Varsler:** varselpreferanser (toggles per kanal/type) + kronologisk feed.

## Bestilling 6 — Marketing-booking checkout (3 skjermer)

Ruter: `/booking/[slug]` (offentlig booking-landing per tjeneste), `/booking/[slug]/bekreft`,
`/booking/kvittering/[bookingId]`. Marketing-lys, konverteringsfokus, Stripe-betaling i
bekreft-steget. NB: betaling går live 1. august — denne bestillingen bør prioriteres.

## Leveransekrav

Samme som D1-bestillingen: begge temaer der relevant, alle tilstander, kun tokens,
triade-format for nye komponenter, norsk bokmål, tall med enhet.
