/**
 * Når coach avlyser en bekreftet booking (Anders 29.09.2026): FULL refusjon
 * uansett tidspunkt. 24-timersfristen i policy.ts gjelder spillerens egen
 * avbestilling, aldri coachens. Ren funksjon, så regelen kan låses med test.
 *
 * - Betalt i Stripe: hele beløpet refunderes (AK Golf dekker gebyret).
 * - Klipp: klippet føres tilbake til pakken.
 * - Ingen av delene (gratis, faktura, ubetalt): ingenting å refundere.
 */
export function avlysningsplan(b: {
  stripePaymentIntentId: string | null;
  subscriptionId: string | null;
}): { refunderPaymentIntent: string | null; klippTilbake: boolean } {
  if (b.stripePaymentIntentId) return { refunderPaymentIntent: b.stripePaymentIntentId, klippTilbake: false };
  return { refunderPaymentIntent: null, klippTilbake: b.subscriptionId != null };
}
