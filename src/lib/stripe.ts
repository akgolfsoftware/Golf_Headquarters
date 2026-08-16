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
// PlayerHQ årlig — 2 690 kr/år («tre måneder gratis», Anders 2026-08-16).
export const STRIPE_PRICE_ID_PRO_AAR = process.env.STRIPE_PRICE_ID_PRO_AAR ?? "";
export const STRIPE_PRICE_ID_PERFORMANCE =
  process.env.STRIPE_PRICE_ID_PERFORMANCE ?? "";
export const STRIPE_PRICE_ID_PERFORMANCE_PRO =
  process.env.STRIPE_PRICE_ID_PERFORMANCE_PRO ?? "";

// Coaching-abonnement: pris-ID → antall booking-credits per måned.
// Performance = 2 økter, Performance Pro = 4 økter.
// PlayerHQ-abonnement (mnd/år) gir 0 credits — kun portal-tilgang.
export function creditsForPriceId(priceId: string | null | undefined): number {
  if (!priceId) return 0;
  if (priceId === STRIPE_PRICE_ID_PERFORMANCE) return 2;
  if (priceId === STRIPE_PRICE_ID_PERFORMANCE_PRO) return 4;
  return 0;
}

// Tier-mapping. Academy-abonnement → PRO (samme tier som PlayerHQ-only).
// PlayerHQ mnd/år → PRO. Ukjent pris → GRATIS (defensiv default).
export function tierForPriceId(
  priceId: string | null | undefined,
): "PRO" | "GRATIS" {
  if (!priceId) return "GRATIS";
  if (
    priceId === STRIPE_PRICE_ID_PRO ||
    priceId === STRIPE_PRICE_ID_PRO_AAR ||
    priceId === STRIPE_PRICE_ID_PERFORMANCE ||
    priceId === STRIPE_PRICE_ID_PERFORMANCE_PRO
  ) {
    return "PRO";
  }
  return "GRATIS";
}

// Abonnement-plan (Subscription.plan) fra pris-ID. null for ukjent pris —
// da får raden aldri tilgang (girPlayerHqTilgang i domain/abonnement.ts).
export function planForPriceId(
  priceId: string | null | undefined,
): "PLAYERHQ_MND" | "PLAYERHQ_AAR" | "PERFORMANCE" | "PERFORMANCE_PRO" | null {
  if (!priceId) return null;
  if (priceId === STRIPE_PRICE_ID_PRO) return "PLAYERHQ_MND";
  if (priceId === STRIPE_PRICE_ID_PRO_AAR) return "PLAYERHQ_AAR";
  if (priceId === STRIPE_PRICE_ID_PERFORMANCE) return "PERFORMANCE";
  if (priceId === STRIPE_PRICE_ID_PERFORMANCE_PRO) return "PERFORMANCE_PRO";
  return null;
}

// Abonnement-kind (Subscription.kind) fra pris-ID — utledes av PRISEN, aldri
// av credits-FELTET (som nulles ved kansellering).
export function kindForPriceId(priceId: string | null | undefined): "COACHING" | "PLAYERHQ" {
  return creditsForPriceId(priceId) > 0 ? "COACHING" : "PLAYERHQ";
}
