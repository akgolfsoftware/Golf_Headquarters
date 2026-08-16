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

/** Stripe sin status → vår enum. Ukjent status behandles som ACTIVE (som før). */
export function mapStripeStatus(s: string): SubscriptionStatus {
  switch (s) {
    case "active":
    case "trialing":
      return "ACTIVE";
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
  if (stripeStatus === "ACTIVE" && cancelAtPeriodEnd) return "CANCELLED";
  return stripeStatus;
}
