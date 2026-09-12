/**
 * O06: Stripe-hendelser i feil rekkefølge. Utløpt etter bekreftet skal ikke
 * avlyse. Refusjon avlyser aktiv booking, ikke allerede avlyst.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type Stripe from "stripe";

test("stripe handle-event — utløpt etter bekreftet og refusjon", async (t) => {
  const bookingUpdates: Array<{ where: Record<string, unknown>; data: Record<string, unknown> }> = [];
  let refundRegistrert = 0;

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        booking: {
          updateMany: async (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
            bookingUpdates.push(args);
            const status = args.where.status;
            if (status === "PENDING") return { count: 0 };
            if (status && typeof status === "object" && "not" in status) {
              return { count: 1 };
            }
            return { count: 0 };
          },
          findUnique: async () => ({
            priceOre: 10000,
            status: "CONFIRMED",
            stripeCheckoutSessionId: "cs_1",
          }),
        },
        processedWebhookEvent: {
          create: async () => ({}),
          findUnique: async () => null,
          deleteMany: async () => ({ count: 0 }),
        },
        subscription: { findUnique: async () => null, upsert: async () => ({}) },
        user: { update: async () => ({}), findMany: async () => [] },
      },
    },
  });
  t.mock.module("@/lib/payments/record", {
    namedExports: {
      recordPaymentIntent: async () => undefined,
      recordCheckoutSession: async () => undefined,
      recordInvoice: async () => undefined,
      recordChargeRefund: async () => {
        refundRegistrert += 1;
      },
    },
  });
  t.mock.module("@/lib/google-calendar-kilder", {
    namedExports: { pushBooking: async () => undefined },
  });
  t.mock.module("@/lib/booking/varsle-ny-booking", {
    namedExports: { varsleNyBooking: async () => undefined },
  });
  t.mock.module("@/lib/notifications", {
    namedExports: { notify: async () => undefined },
  });
  t.mock.module("@/lib/email", {
    namedExports: {
      resendKlient: () => ({ emails: { send: async () => ({}) } }),
      FRA_EPOST: "test@akgolf.test",
    },
  });

  const { handleStripeEvent } = await import("./handle-event");
  const stripe = { subscriptions: { retrieve: async () => ({}) } } as unknown as Stripe;

  await handleStripeEvent(
    {
      id: "evt_expired_late",
      type: "checkout.session.expired",
      data: {
        object: {
          id: "cs_1",
          metadata: { bookingId: "booking-1" },
        },
      },
    } as unknown as Stripe.Event,
    { stripe, ventPaaSideeffekter: true },
  );
  assert.equal(bookingUpdates[0]?.where.status, "PENDING");
  assert.deepEqual(bookingUpdates[0]?.data, { status: "CANCELLED" });

  bookingUpdates.length = 0;
  await handleStripeEvent(
    {
      id: "evt_refund",
      type: "charge.refunded",
      data: {
        object: {
          id: "ch_1",
          payment_intent: "pi_1",
        },
      },
    } as unknown as Stripe.Event,
    { stripe, ventPaaSideeffekter: true },
  );
  assert.equal(refundRegistrert, 1);
  assert.equal(
    (bookingUpdates[0]?.where as { stripePaymentIntentId?: string }).stripePaymentIntentId,
    "pi_1",
  );
  assert.deepEqual(bookingUpdates[0]?.data, { status: "CANCELLED" });
});
