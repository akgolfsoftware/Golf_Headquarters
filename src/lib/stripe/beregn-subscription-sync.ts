/**
 * Ren beregning av hva en Stripe-subscription-webhook skal skrive til
 * Subscription-raden (plan A2). Trukket ut av `syncSubscription` i
 * handle-event.ts så regelsettet kan enhetstestes uten Prisma/Stripe —
 * samme mønster (og av samme grunn) som abonnement-status.ts.
 *
 * Regler:
 * - kind/plan utledes av PRISEN (planForPriceId/kindForPriceId), aldri av
 *   credits-feltet — et kansellert Performance-abonnement er fortsatt
 *   COACHING-raden, og årsprisen (0 credits) er PLAYERHQ_AAR, ikke _MND.
 * - Tilgangsgivende tier krever ACTIVE eller TRIALING (vinn-tilbake-broen).
 * - Credits gis KUN ved ACTIVE — en pakke i prøvetid har ikke betalt timer.
 */

import type { SubscriptionStatus } from "@/generated/prisma/client";
import { creditsForPriceId, kindForPriceId, planForPriceId, tierForPriceId } from "@/lib/stripe";
import { effektivAbonnementStatus, mapStripeStatus } from "@/lib/stripe/abonnement-status";

export interface StripeSubInput {
  stripeStatus: string;
  cancelAtPeriodEnd: boolean;
  priceId: string | null;
  /** price.recurring.interval fra Stripe — "month" | "year". */
  interval: string | null;
  /** items.data[0].current_period_end (unix-sekunder) eller null. */
  currentPeriodEnd: number | null;
}

export interface SubscriptionSyncVerdier {
  kind: "COACHING" | "PLAYERHQ";
  plan: string | null;
  interval: string;
  cancelAtPeriodEnd: boolean;
  status: SubscriptionStatus;
  tier: "PRO" | "GRATIS";
  monthlyCredits: number;
  currentPeriodEnd: Date | null;
}

export function beregnSubscriptionSync(input: StripeSubInput): SubscriptionSyncVerdier {
  const stripeStatus = mapStripeStatus(input.stripeStatus);
  const status = effektivAbonnementStatus(stripeStatus, input.cancelAtPeriodEnd);
  const betaltEllerTrial = stripeStatus === "ACTIVE" || stripeStatus === "TRIALING";

  return {
    kind: kindForPriceId(input.priceId),
    plan: planForPriceId(input.priceId),
    interval: input.interval ?? "month",
    cancelAtPeriodEnd: input.cancelAtPeriodEnd,
    status,
    tier: betaltEllerTrial ? tierForPriceId(input.priceId) : "GRATIS",
    monthlyCredits: stripeStatus === "ACTIVE" ? creditsForPriceId(input.priceId) : 0,
    currentPeriodEnd: input.currentPeriodEnd ? new Date(input.currentPeriodEnd * 1000) : null,
  };
}
