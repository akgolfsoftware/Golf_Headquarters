# Stripe-cutover-sjekkliste — betaling starter 1. september 2026

> Opprettet 2026-08-16 (plan A2). Dette er Anders' manuelle løype for å
> verifisere hele betalingskjeden i Stripe TEST-modus før live-nøklene slås på.
> Koden er `now`-parameterisert og enhetstestet — denne listen dekker det
> testene ikke kan: ekte Stripe-oppsett, priser og webhook-abonnementet.

## 1. Opprett prisene i Stripe (test-modus først, så live)

| Produkt | Pris | Intervall | Env-navn |
|---|---|---|---|
| PlayerHQ | 299 kr | månedlig | `STRIPE_PRICE_ID_PRO` (finnes) |
| PlayerHQ årlig | **2 690 kr** | årlig | `STRIPE_PRICE_ID_PRO_AAR` (**NY**) |
| Performance | 1 200 kr | månedlig | `STRIPE_PRICE_ID_PERFORMANCE` |
| Performance Pro | 2 220 kr | månedlig | `STRIPE_PRICE_ID_PERFORMANCE_PRO` |

- [ ] `STRIPE_PRICE_ID_PRO_AAR` opprettet i test + live og lagt i Vercel env
      (alle tre miljøer) og i `.env.local`.
- [ ] `.env.example` oppdatert med `STRIPE_PRICE_ID_PRO_AAR`,
      `STRIPE_PRICE_ID_PERFORMANCE`, `STRIPE_PRICE_ID_PERFORMANCE_PRO`
      (fila er hook-beskyttet for agenter — Anders legger inn navnene).
- [ ] Billing Portal-konfigurasjonen i Stripe LÅSES så kunder ikke kan bytte
      pris mellom coaching- og PlayerHQ-produkter der (bytte skal gå via appen).

## 2. Webhook-abonnementet

- [ ] Endepunktet abonnerer på de 13 event-typene i
      `src/lib/stripe/handle-event.ts` (subscription created/updated/deleted,
      checkout.session completed/expired, payment_intent
      succeeded/payment_failed/canceled, invoice
      paid/payment_succeeded/payment_failed/finalized, charge.refunded).

## 3. Test-clock-løypen (Stripe test-modus)

Kjør med en Stripe **test clock** og en testbruker i preview:

1. [ ] Kjøp PlayerHQ månedlig (299) → `Payment`-rad + `Subscription`
       kind=PLAYERHQ, plan=PLAYERHQ_MND.
2. [ ] Kjøp PlayerHQ årlig (2 690) → plan=PLAYERHQ_AAR, interval=year.
3. [ ] Kjøp Performance (testbruker 2) → kind=COACHING, credits 2, og
       ADMIN får «Forslag: nytt Academy-medlem»-varsel (forslag-køen).
4. [ ] Avbestill Performance i appen → status CANCELLED,
       `cancelAtPeriodEnd=true`, credits fungerer fortsatt (ut perioden).
5. [ ] (Etter A4) Vinn-tilbake-e-post kommer; aksepter årlig → NYTT
       PlayerHQ-abonnement i TRIALING med trial_end = coaching-periodens slutt.
       To rader i `subscriptions`, ingen dobbelbetaling.
6. [ ] Rykk test-klokken forbi coaching-periodens slutt →
       `customer.subscription.deleted` for coaching: credits nulles,
       PlayerHQ-raden aktiveres (TRIALING→ACTIVE), `user.tier` forblir PRO.
7. [ ] Replay et event fra Stripe-dashbordet → «duplicate», ingen ny e-post.
8. [ ] Avbestill via Billing Portal (ikke appen) → webhooken fanger det og
       (etter A4) vinn-tilbake-tilbudet opprettes likevel.

## 4. Post-deploy-steg for A1 (én gang)

- [ ] Etter at PR #503 (A1) er deployet til prod: kjør
      `npx tsx scripts/add-abonnement-v2-2026-08-16.ts --dropp-gammel-indeks`
      (fjerner den gamle unike indeksen på userId som gammel kode trengte).

## 5. Cutover-dagen (1. september)

- [ ] `gratisForAlle()` slår av automatisk (BETALING_STARTER i
      `src/lib/feature-flags.ts`) — ingen deploy nødvendig.
- [ ] Verifiser med testbruker uten gruppe/pakke/abonnement: /portal viser
      oppgraderingsvei, betalende og gruppespillere er upåvirket.
