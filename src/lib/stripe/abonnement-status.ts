import type { SubscriptionStatus } from "@/generated/prisma/client";

/**
 * Statusregler for Stripe-abonnement (steg 7 i `docs/plan-testdekning.md`).
 *
 * Trukket ut av `handle-event.ts` fordi regelen satt inline i `syncSubscription`,
 * som treffer Prisma og derfor ikke kunne enhetstestes. `gotchas.md` beskriver
 * feilen som gjør dette verdt en egen test:
 *
 *   «Webhooken må mappe Stripe-status `active` + `cancel_at_period_end` →
 *    `CANCELLED`, ellers overskriver neste `customer.subscription.updated` den
 *    lokale statusen tilbake til ACTIVE.»
 *
 * Den feilen har skjedd før, og den er stille: brukeren avbestiller, ser
 * «avbestilt», og neste webhook fra Stripe setter status tilbake til ACTIVE
 * uten at noen merker det før kortet belastes igjen.
 *
 * Ren flytting — reglene er identiske med originalen.
 */

/**
 * Stripe sin status → vår enum. Ukjent status behandles som ACTIVE (som før).
 * A2: `trialing` mapper nå til TRIALING (var ACTIVE) — vinn-tilbake-broen
 * (nytt PlayerHQ-abonnement som starter når coaching-perioden utløper) skal
 * vises ærlig som «starter {dato}». Tilgang: harAktivPakke godtar TRIALING;
 * credits gjør BEVISST ikke (kanBrukeCredits) — en pakke i prøvetid har ikke
 * betalt for timer ennå.
 */
export function mapStripeStatus(s: string): SubscriptionStatus {
  switch (s) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELLED";
    default:
      return "ACTIVE";
  }
}

/**
 * Statusen appen skal LAGRE, gitt Stripe-statusen og `cancel_at_period_end`.
 *
 * Avbestilt-men-betalt: Stripe rapporterer «active» + `cancel_at_period_end`
 * frem til periodeslutt. Appen skal vise CANCELLED (fornyes ikke, kan ikke
 * avbestilles på nytt). Tier/credits beholdes ut den betalte perioden —
 * det styres separat av `stripeStatus`, ikke av denne funksjonen.
 */
export function effektivAbonnementStatus(
  stripeStatus: SubscriptionStatus,
  cancelAtPeriodEnd: boolean | null | undefined,
): SubscriptionStatus {
  // A2: også en TRIALING-rad (vinn-tilbake-broen) kan sies opp før start —
  // da skal den vises som CANCELLED, ikke bli stående som «starter snart».
  if ((stripeStatus === "ACTIVE" || stripeStatus === "TRIALING") && cancelAtPeriodEnd) {
    return "CANCELLED";
  }
  return stripeStatus;
}
