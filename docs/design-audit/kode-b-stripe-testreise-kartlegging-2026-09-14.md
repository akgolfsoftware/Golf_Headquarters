# KODE-B · Stripe-testreise (R4–R9) — kartlegging og blokkering, 14.09.2026

Status: **B1 (kartlegging) levert. B2–B4 blokkert på manglende miljø.** Ingen kode
skrevet for betalingsreisen. Ingen reell belastning. Ingen produksjonsnøkkel berørt.

Bestillingen sier uttrykkelig: mangler testnøklene i miljøet, skal arbeidet stoppe og
det eksakt manglende dokumenteres — ikke gjettes eller hardkodes. Det er det som er
gjort her.

## Blokkeringen, målt 14.09.2026

To uavhengige mangler. Begge må løses før B2–B4 kan kjøres.

### 1. Ingen Stripe-testnøkler i miljøet

Miljøet denne økten kjørte i har **ingen** `STRIPE_*`-variabel satt. Arbeidskopien har
heller ingen `.env`-fil (kun `.env.example`), og P0-riggen krever nettopp det — den
nekter å starte hvis en `.env*`-fil finnes, slik at ingen live-nøkkel kan lekke inn.

Eksakt hva som må settes for at en innlogget testreise skal kunne kjøres, lest fra koden:

| Variabel | Leses i | Kreves for |
|---|---|---|
| `STRIPE_SECRET_KEY` | `src/lib/stripe.ts` (`stripeKlient()`) | Alt. Klienten kaster uten den |
| `STRIPE_WEBHOOK_SECRET` | `src/app/api/stripe/webhook/route.ts` | Signaturkontroll av hendelser |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | klientflate | Checkout i nettleser |
| `STRIPE_PRICE_ID_PRO` | `src/lib/stripe.ts` | PlayerHQ månedlig (299 kr) |
| `STRIPE_PRICE_ID_PRO_AAR` | `src/lib/stripe.ts` | PlayerHQ årlig (2 690 kr) |
| `STRIPE_PRICE_ID_PERFORMANCE` | `src/lib/stripe.ts` | Coaching-pakke, 2 credits/mnd |
| `STRIPE_PRICE_ID_PERFORMANCE_PRO` | `src/lib/stripe.ts` | Coaching-pakke, 4 credits/mnd |

Alle må være **test-modus**-verdier (`sk_test_…`, `pk_test_…`, `price_…` opprettet i
test-modus). De fire prisene finnes fra før i test-modus per
`docs/platform/stripe-cutover-sjekkliste.md` (16.08.2026) — ID-ene er ikke i repoet, og
skal ikke være det.

Webhooken må dessuten nås utenfra av Stripe. For en lokal rigg betyr det
`stripe listen --forward-to 127.0.0.1:3010/api/stripe/webhook`, som selv skriver ut den
`whsec_…` som skal inn i `STRIPE_WEBHOOK_SECRET`.

### 2. Riggen for innlogget reise er miljøavhengig

`npm run test:p0-test` krever Docker + Supabase CLI for den isolerte HQ-stacken på
54421/54422. I denne økten ble begge etablert og reisen kjørt (se KODE-A-kontrollen),
men stacken er ikke en del av repoet og må reetableres i hvert miljø. En Stripe-reise
uten denne stacken har ingen innlogget bruker å betale som.

## Hva som ALLEREDE er bevist med mocket Stripe

Dette er ikke tomt område. Serverreglene har dekning fra før — det som mangler er at
ekte Stripe-svar går gjennom kjeden. Målt i koden 14.09:

| Fil | Dekker |
|---|---|
| `src/lib/booking/payment-start.test.ts` (7 tester) | Lagret betalingsøkt beholder reservasjonen; entydig avvist forsøk frigjør kun ubekreftet tid; **nettfeil med ukjent utfall frigjør IKKE tiden**; feilet kobling utløper lenken før tiden frigjøres; manglende URL etterlater ingen betalbar lenke; samtidig bekreftet booking kan ikke kanselleres av feilhåndteringen |
| `src/lib/payments/save.test.ts` (4) | Session + intent slås sammen til én rad (idempotens); refusjon senker ikke status; eldre PENDING overskriver ikke SUCCEEDED; motstridende Stripe-identiteter avvises |
| `src/lib/__tests__/stripe-webhook.test.ts` (4) | Signaturkontroll: gyldig, feil secret, tuklet body, tom header |
| `src/lib/__tests__/stripe-handle-event.test.ts` · `handle-event-rekkefolge.test.ts` | Dedup av hendelser og sideeffekter; utløpt etter bekreftet, og refusjon, i ulik rekkefølge |
| `src/lib/stripe/beregn-subscription-sync.test.ts` (5) | `active`/`trialing`/`canceled`/`cancel_at_period_end` → riktig status og tier; ukjent pris gir GRATIS (fail-closed) |
| `src/app/portal/meg/abonnement/avbestill/actions.test.ts` (3) | Oppsigelse kaller Stripe FØR lokal status endres; Stripe-feil rører ikke basen |
| `src/app/portal/meg/bookinger/actions.test.ts` (4) | Andres booking avvises uten refusjon; >24 t refunderer via Stripe; <24 t avlyser uten refusjon; credit føres tilbake |
| `src/lib/booking/checkout-coach.test.ts` | Samme løste coach gjennom tilgjengelighet, hold, kollisjon, booking og betaling |

Kjedene som faktisk mangler ekte Stripe er derfor smale:
`/api/stripe/checkout` → Stripe Checkout i nettleser → retur/avbrudd →
`/api/stripe/webhook` med ekte signatur → `handle-event.ts`.

## Hva B2–B4 skal dekke når miljøet finnes

Hendelsestypene webhooken allerede håndterer (`src/lib/stripe/handle-event.ts`) gir
listen:

1. **Avbrudd** — bruker forlater Checkout. `checkout.session.expired` /
   `async_payment_failed`: reservert tid frigjøres, ingen tilgang gis.
2. **Retur** — `checkout.session.completed` + `payment_intent.succeeded`: abonnement
   aktiveres, booking bekreftes, kvittering lagres.
3. **Gjentakelse/idempotens** — samme hendelse levert to ganger, og session/intent i
   ulik rekkefølge, gir én betalingsrad og én tilgangsendring.
4. **Eierskap (O05)** — forelder betaler for barnet: abonnementet havner på barnets
   bruker-id, en annen forelder kan ikke betale seg til innsyn.
5. **Refusjon** — `charge.refunded` senker ikke status, men øker refundert beløp.

Alt med testkort `4242 4242 4242 4242`. Ingen reell belastning, ingen produksjonsnøkkel.

## Ikke påstått

- At noen Stripe-reise er kjørt med ekte nøkkel, verken test eller live.
- At de mockede testene over beviser at ekte Stripe-svar tolkes riktig.
- At betaling for barn (O05) er prøvd som innlogget reise.
- At prisene finnes i live-modus. Beslutningskø punkt 28 (årspris-ID i live) er fortsatt åpen.
