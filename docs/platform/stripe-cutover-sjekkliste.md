# Stripe-cutover-sjekkliste — betaling starter 1. september 2026

> Opprettet 2026-08-16 (plan A2). Dette er Anders' manuelle løype for å
> verifisere hele betalingskjeden i Stripe TEST-modus før live-nøklene slås på.
> Koden er `now`-parameterisert og enhetstestet — denne listen dekker det
> testene ikke kan: ekte Stripe-oppsett, priser og webhook-abonnementet.

## 1. Priser og produkter

### TEST-modus — FERDIG SATT OPP 2026-08-16 (via Stripe-connectoren)

Testkontoen var helt tom. Produkter og priser er opprettet med norske navn,
beskrivelser og `ak_*`-metadata (så koden kan kjenne dem igjen):

| Produkt | Pris | Intervall | Test-price-id | Env-navn |
|---|---|---|---|---|
| PlayerHQ | 299 kr | månedlig | `price_1U5B6yIi0dOlyJWh6dNdyOy8` | `STRIPE_PRICE_ID_PRO` |
| PlayerHQ | **2 690 kr** | **årlig** | `price_1U5B71Ii0dOlyJWhs8ues5cW` | `STRIPE_PRICE_ID_PRO_AAR` |
| Performance | 1 200 kr | månedlig | `price_1U5B74Ii0dOlyJWh6sfI58xL` | `STRIPE_PRICE_ID_PERFORMANCE` |
| Performance Pro | 2 220 kr | månedlig | `price_1U5B75Ii0dOlyJWhcx1riW6c` | `STRIPE_PRICE_ID_PERFORMANCE_PRO` |

Produkt-id-er: PlayerHQ `prod_V5LoillFCVndWR` · Performance `prod_V5LoLJCvrNguDQ` ·
Performance Pro `prod_V5Loo3LmLI4S94`. Konto: `acct_1RMhR1Ii0dOlyJWh` (testmodus).

- [ ] Legg de fire test-id-ene i `.env.local` for lokal testing.

### LIVE-modus — gjenstår (kun Anders)

Connectoren har **kun testmodus-tilgang**, så live-produktene må settes opp i
dashbordet. Speil tabellen over (samme navn, beskrivelser og priser).

- [ ] Opprett de fire prisene i live-modus.
- [ ] `STRIPE_PRICE_ID_PRO_AAR` (+ de tre andre) i Vercel env, alle miljøer.
- [ ] `.env.example` oppdatert med de tre manglende navnene
      (fila er hook-beskyttet for agenter — Anders legger inn navnene).
- [ ] Billing Portal-konfigurasjonen i Stripe LÅSES så kunder ikke kan bytte
      pris mellom coaching- og PlayerHQ-produkter der (bytte skal gå via appen).

## 1b. Design på betalingssidene — SATT 2026-08-16 (test-modus)

Merkevare-innstillingene er satt til Paper-fasitens farger via connectoren
(`/v1/_unstable/settings/brand`), verifisert med skjermbilde av en ekte
testbetalingsside:

| Innstilling | Verdi | Kilde |
|---|---|---|
| Bakgrunn på checkout | `#faf9f5` | `--p-bg` (ivory) |
| Knappefarge | `#141413` | `--p-cta` (blekk — Paper-regelen: CTA er blekk, ikke farge) |
| Primærfarge | `#141413` | `--p-fg` |
| Aksentfarge | `#d97757` | `--p-accent` (oransje) |
| Kontrastfarge | `#111111` | primær mørknet 1 % (Stripe-krav) |
| Tekstfarge | `#ffffff` | luminans-regel (Stripe-krav) |
| Font | Lora | én av Paper-fontene; Poppins finnes ikke i Stripes liste |
| Hjørner | `default` (rundet) | matcher Paper |

- [ ] **Last opp logoen** — `public/icon-512.png` (blekk-bakgrunn, ivory «ak»,
      oransje prikk). Kan ikke lastes opp via connectoren (Stripes filopplasting
      er ikke eksponert der), så det må gjøres i dashbordet:
      Innstillinger → Merkevare → Ikon. Ett minutt.
- [ ] Gjenta fargeoppsettet i **live-modus** (merkevare settes per modus).

**Språk:** appens egen betalingsside og kundeportal er norsk (`locale: "nb"` i
`checkout/route.ts` og `portal/route.ts`). Payment Links støtter ikke språkvalg
og vises på engelsk — men den flaten brukes ikke av kunder.

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
      `npx tsx scripts/arkiv/add-abonnement-v2-2026-08-16.ts --dropp-gammel-indeks`
      (fjerner den gamle unike indeksen på userId som gammel kode trengte).

Status 2026-08-28 (V1, kun repo — **ikke** kjørt mot prod herfra):
scriptet ligger i `scripts/arkiv/` (ikke `scripts/`). `DROP INDEX` kjører
KUN med `--dropp-gammel-indeks`. Schema har `@@unique([userId, kind])`.
Om flagget er kjørt i prod kan ikke leses fra git. Sjekk før du kjører:

```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'subscriptions';
```

Skal ha `subscriptions_userId_kind_key`. Skal IKKE ha `subscriptions_userId_key`.
Hvis den gamle fortsatt står, kan ikke én bruker ha både coaching- og
PlayerHQ-rad — da må flagget kjøres (Anders, mot prod).

## 5. Cutover-dagen (1. september)

- [ ] `gratisForAlle()` slår av automatisk (BETALING_STARTER i
      `src/lib/feature-flags.ts`) — ingen deploy nødvendig.
- [ ] Verifiser med testbruker uten gruppe/pakke/abonnement: /portal viser
      oppgraderingsvei, betalende og gruppespillere er upåvirket.
