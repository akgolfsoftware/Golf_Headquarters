# Lansering P0 — sjekkliste for Anders (panel/DNS)

> Opprettet 2026-07-24 som del av ferdigstillingsplanen. Agent kan ikke utføre disse stegene — de krever paneltilgang. Kryss av når gjort, og oppdater `docs/STATUS-NÅ.md`.

## Før aktiverings-e-post

| # | Handling | Hvor | Status |
|---|---|---|---|
| 1 | Hent DKIM-CNAME fra Resend for `send.akgolf.no` | Resend → Domains | ☐ |
| 2 | Legg inn DKIM-CNAME hos Domeneshop | Domeneshop DNS | ☐ |
| 3 | Trykk Verify i Resend | Resend | ☐ |
| 4 | Send test-e-post (signup/reset) og bekreft den ikke lander i spam | Egen innboks | ☐ |

## Domene og betaling

| # | Handling | Hvor | Status |
|---|---|---|---|
| 5 | Legg til `akgolf.no` i Vercel-prosjektet | Vercel → Domains | ☐ |
| 6 | Oppdater DNS hos registrar (fjern Acuity-redirect når klar) | Domeneshop | ☐ |
| 7 | Bekreft `NEXT_PUBLIC_APP_URL` i Vercel prod peker på riktig host | Vercel → Env | ☐ |
| 8 | Verifiser live Stripe-nøkler + webhook (9 events) i Vercel prod | Stripe + Vercel | ☐ |
| 9 | Re-koble Google Calendar for begge coacher | `/admin/settings/calendar` | ☐ |

## Spiller-aktivering

| # | Handling | Merknad | Status |
|---|---|---|---|
| 10 | Vent til DKIM er grønn (#1–4) | Ellers spam | ☐ |
| 11 | Kjør `npx tsx scripts/send-aktiverings-epost.ts` (etter merge av A2) | Først `--dry-run` | ☐ |
| 12 | Bekreft minst én spiller har `lastLoginAt` satt | AgencyOS / DB | ☐ |

## Etter 1. august

| # | Handling | Status |
|---|---|---|
| 13 | Bekreft at gratis-for-alle er av (`gratisForAlle()` false) | ☐ |
| 14 | Røyk-test Checkout for spillere uten coaching-pakke | ☐ |

## Referanser
- `docs/STATUS-NÅ.md` — P0-seksjonen
- `src/lib/feature-flags.ts` — `BETALING_STARTER = 2026-08-01`
- Booking midlertidig via Acuity (`akgolfgroup.as.me`) til eget domene er klart
