/** Varig refusjonsjobb. Bestillingen ligger i samme transaksjon som avbestillingen. */
import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { recordChargeRefund } from "@/lib/payments/record";

export const bookingRefundKey = (bookingId: string) => `booking-refund-${bookingId}`;

export async function refundCancelledBooking(bookingId: string, stripe: Stripe = stripeKlient()): Promise<void> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.status !== "CANCELLED" || !booking.stripePaymentIntentId) {
    throw new Error("Refusjonsjobben mangler en avbestilt, betalt booking.");
  }
  const intent = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);
  if (intent.amount !== booking.priceOre || intent.currency !== "nok" || intent.status !== "succeeded") {
    throw new Error("Betalingen samsvarer ikke med bookingen som skal refunderes.");
  }
  const chargeId = typeof intent.latest_charge === "string" ? intent.latest_charge : intent.latest_charge?.id;
  if (!chargeId) throw new Error("Betalingen mangler belastning.");
  let charge = await stripe.charges.retrieve(chargeId);
  // Stripe beholder ikke idempotensnøkler evig. Les totalen før et sent gjenforsøk.
  if (charge.amount_refunded < charge.amount) {
    const refund = await stripe.refunds.create({
      payment_intent: intent.id,
      reason: "requested_by_customer",
      metadata: { bookingId },
    }, { idempotencyKey: bookingRefundKey(bookingId) });
    if (refund.status !== "succeeded" && refund.status !== "pending") {
      throw new Error("Stripe har ikke akseptert refusjonen. Krever oppfølging.");
    }
    charge = await stripe.charges.retrieve(chargeId);
  }
  // En akseptert, men ventende refusjon er ikke en ferdig tilbakebetaling.
  // Kontroller også ved gjenforsøk der belastningen alt viser refundert beløp.
  let succeeded = 0;
  for await (const refund of stripe.refunds.list({ charge: chargeId, limit: 100 })) {
    if (refund.status === "succeeded") succeeded += refund.amount;
  }
  if (succeeded < charge.amount) throw new Error("Refusjonen er ikke fullført hos Stripe ennå.");
  await recordChargeRefund(charge);
  await prisma.webhookFailure.updateMany({
    where: { eventId: bookingRefundKey(bookingId) },
    data: { status: "RESOLVED", resolvedAt: new Date(), errorMessage: "", lastAttemptAt: new Date() },
  });
}
