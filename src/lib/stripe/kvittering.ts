import "server-only";

import type Stripe from "stripe";

type Betaling = {
  stripeChargeId: string | null;
  stripePaymentIntentId: string | null;
  stripeInvoiceId: string | null;
};

/**
 * Finner Stripes egen kvittering for en betaling: kvitteringen på belastningen (charge.receipt_url),
 * ellers fakturasiden for et abonnementstrekk (invoice.hosted_invoice_url). null når Stripe ikke
 * har noen. Kalleren må selv ha sjekket at betalingen tilhører brukeren.
 */
export async function stripeKvitteringUrl(stripe: Stripe, b: Betaling): Promise<string | null> {
  if (b.stripeChargeId) {
    const charge = await stripe.charges.retrieve(b.stripeChargeId);
    if (charge.receipt_url) return charge.receipt_url;
  }
  if (b.stripePaymentIntentId) {
    const pi = await stripe.paymentIntents.retrieve(b.stripePaymentIntentId, { expand: ["latest_charge"] });
    const charge = pi.latest_charge;
    if (charge && typeof charge !== "string" && charge.receipt_url) return charge.receipt_url;
  }
  if (b.stripeInvoiceId) {
    const invoice = await stripe.invoices.retrieve(b.stripeInvoiceId);
    if (invoice.hosted_invoice_url) return invoice.hosted_invoice_url;
  }
  return null;
}
