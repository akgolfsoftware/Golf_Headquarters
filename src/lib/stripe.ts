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
