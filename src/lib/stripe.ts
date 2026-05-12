// Stripe-klient som lazy singleton. Throws hvis miljøvariabel mangler.

import Stripe from "stripe";

let _klient: Stripe | null = null;

export function stripeKlient(): Stripe {
  if (_klient) return _klient;
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY mangler i miljø.");
  }
  _klient = new Stripe(apiKey, {
    apiVersion: "2026-04-22.dahlia",
  });
  return _klient;
}

export const STRIPE_PRICE_ID_PRO = process.env.STRIPE_PRICE_ID_PRO ?? "";
export const STRIPE_PRICE_ID_PERFORMANCE =
  process.env.STRIPE_PRICE_ID_PERFORMANCE ?? "";
export const STRIPE_PRICE_ID_PERFORMANCE_PRO =
  process.env.STRIPE_PRICE_ID_PERFORMANCE_PRO ?? "";

// Coaching-abonnement: pris-ID → antall booking-credits per måned.
// Performance = 2 økter, Performance Pro = 4 økter.
// PlayerHQ-only abonnement (STRIPE_PRICE_ID_PRO) gir 0 credits — kun portal-tilgang.
export function creditsForPriceId(priceId: string | null | undefined): number {
  if (!priceId) return 0;
  if (priceId === STRIPE_PRICE_ID_PERFORMANCE) return 2;
  if (priceId === STRIPE_PRICE_ID_PERFORMANCE_PRO) return 4;
  return 0;
}

// Tier-mapping. Academy-abonnement → PRO (samme tier som PlayerHQ-only).
// PlayerHQ-only → PRO. Ukjent pris → GRATIS (defensiv default).
export function tierForPriceId(
  priceId: string | null | undefined,
): "PRO" | "GRATIS" {
  if (!priceId) return "GRATIS";
  if (
    priceId === STRIPE_PRICE_ID_PRO ||
    priceId === STRIPE_PRICE_ID_PERFORMANCE ||
    priceId === STRIPE_PRICE_ID_PERFORMANCE_PRO
  ) {
    return "PRO";
  }
  return "GRATIS";
}
