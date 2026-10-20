/**
 * Coach-booking betalt via Stripe-lenke: webhooken merker riktig booking som betalt
 * (betalings-ID), uten å bekrefte på nytt eller sende ny bekreftelse.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type Stripe from "stripe";

test("checkout.session.completed for coach-booking merker bookingen betalt", async (t) => {
  type Args = { where: Record<string, unknown>; data: Record<string, unknown> };
  const oppdateringer: Args[] = [];
  let epostSendt = 0;

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        booking: {
          updateMany: async (args: Args) => {
            oppdateringer.push(args);
            // Bookingen er CONFIRMED allerede: PENDING-grenen treffer ikke, betalt-grenen gjør.
            return { count: args.where.status === "PENDING" ? 0 : 1 };
          },
          findUnique: async () => ({ priceOre: 120000, status: "CONFIRMED", stripeCheckoutSessionId: "cs_coach" }),
        },
        processedWebhookEvent: { create: async () => ({}), findUnique: async () => null, deleteMany: async () => ({ count: 0 }) },
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
      recordChargeRefund: async () => undefined,
    },
  });
  t.mock.module("@/lib/google-calendar-kilder", { namedExports: { pushBooking: async () => undefined } });
  t.mock.module("@/lib/booking/varsle-ny-booking", { namedExports: { varsleNyBooking: async () => undefined } });
  t.mock.module("@/lib/notifications", { namedExports: { notify: async () => undefined } });
  t.mock.module("@/lib/email/booking-emails", { namedExports: { sendBookingConfirmation: async () => { epostSendt += 1; } } });
  t.mock.module("@/lib/email", {
    namedExports: { resendKlient: () => ({ emails: { send: async () => ({}) } }), FRA_EPOST: "test@akgolf.test" },
  });

  const { handleStripeEvent } = await import("./handle-event");
  const stripe = { subscriptions: { retrieve: async () => ({}) } } as unknown as Stripe;

  await handleStripeEvent(
    {
      id: "evt_coach_betalt",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_coach",
          payment_status: "paid",
          currency: "nok",
          amount_total: 120000,
          payment_intent: "pi_coach",
          metadata: { bookingId: "booking-coach-1", kilde: "coach" },
        },
      },
    } as unknown as Stripe.Event,
    { stripe, ventPaaSideeffekter: true },
  );

  const betalt = oppdateringer.find((u) => u.where.status === "CONFIRMED");
  assert.ok(betalt, "betalt-oppdateringen mangler");
  assert.equal(betalt.where.id, "booking-coach-1");
  assert.equal(betalt.where.paymentMethod, "STRIPE");
  assert.equal(betalt.where.stripePaymentIntentId, null);
  assert.equal(betalt.where.stripeCheckoutSessionId, "cs_coach");
  assert.deepEqual(betalt.data, { stripePaymentIntentId: "pi_coach" });
  assert.equal(epostSendt, 0, "ingen ny bekreftelse for en booking som allerede var bekreftet");
});
