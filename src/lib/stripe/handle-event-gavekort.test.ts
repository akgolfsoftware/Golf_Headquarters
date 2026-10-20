/**
 * Gavekort (bookingplanen steg 7): en betalt checkout-økt merket som gavekort gir et gavekort
 * (ikke en booking), og webhooken rører ingen bookinger.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type Stripe from "stripe";

test("checkout.session.completed for gavekort oppretter gavekortet og rører ingen booking", async (t) => {
  const opprettet: string[] = [];
  let bookingRort = 0;
  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        booking: { updateMany: async () => { bookingRort += 1; return { count: 0 }; }, findUnique: async () => { bookingRort += 1; return null; } },
        processedWebhookEvent: { create: async () => ({}), findUnique: async () => null, deleteMany: async () => ({ count: 0 }) },
        subscription: { findUnique: async () => null, upsert: async () => ({}) },
        user: { update: async () => ({}), findMany: async () => [] },
      },
    },
  });
  t.mock.module("@/lib/payments/record", {
    namedExports: {
      recordPaymentIntent: async () => undefined, recordCheckoutSession: async () => undefined,
      recordInvoice: async () => undefined, recordChargeRefund: async () => undefined,
    },
  });
  t.mock.module("@/lib/booking/gavekort-kjop", {
    namedExports: {
      erGavekortSession: (s: Stripe.Checkout.Session) => s.metadata?.gavekort === "1",
      opprettGavekortFraSession: async (s: Stripe.Checkout.Session) => { opprettet.push(s.id); },
    },
  });
  t.mock.module("@/lib/google-calendar-kilder", { namedExports: { pushBooking: async () => undefined } });
  t.mock.module("@/lib/booking/varsle-ny-booking", { namedExports: { varsleNyBooking: async () => undefined } });
  t.mock.module("@/lib/notifications", { namedExports: { notify: async () => undefined } });
  t.mock.module("@/lib/email", { namedExports: { resendKlient: () => ({ emails: { send: async () => ({}) } }), FRA_EPOST: "test@akgolf.test" } });

  const { handleStripeEvent } = await import("./handle-event");
  const stripe = { subscriptions: { retrieve: async () => ({}) } } as unknown as Stripe;
  await handleStripeEvent(
    {
      id: "evt_gave", type: "checkout.session.completed",
      data: { object: { id: "cs_gave", payment_status: "paid", currency: "nok", amount_total: 100000, metadata: { gavekort: "1", gavekortOre: "100000" } } },
    } as unknown as Stripe.Event,
    { stripe, ventPaaSideeffekter: true },
  );
  assert.deepEqual(opprettet, ["cs_gave"]);
  assert.equal(bookingRort, 0);
});
