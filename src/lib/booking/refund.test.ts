import assert from "node:assert/strict";
import { mock, test } from "node:test";
let amount = 10000;
let refunded = 0;
let calls = 0;
let resolved = 0;
let recorded = 0;
let fails = false;
let key: string | undefined;
let pending = false;
const stripe = {
  paymentIntents: { retrieve: async () => ({ id: "pi_test", amount, currency: "nok", status: "succeeded", latest_charge: "ch_test" }) },
  charges: { retrieve: async () => ({ id: "ch_test", amount: 10000, amount_refunded: refunded }) },
  refunds: { list: async function* () { yield { status: pending ? "pending" : "succeeded", amount: refunded }; }, create: async (_body: unknown, options: { idempotencyKey?: string }) => {
    calls++; key = options.idempotencyKey;
    if (fails) throw new Error("synthetic provider unavailable");
    refunded = 10000;
    return { status: "succeeded" };
  } },
};
mock.module("@/lib/stripe", { namedExports: { stripeKlient: () => stripe } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  booking: { findUnique: async () => ({ status: "CANCELLED", stripePaymentIntentId: "pi_test", priceOre: 10000 }) },
  webhookFailure: { updateMany: async () => { resolved++; } },
} } });
mock.module("@/lib/payments/record", { namedExports: { recordChargeRefund: async () => { recorded++; } } });
test.beforeEach(() => { amount = 10000; refunded = 0; calls = 0; resolved = 0; recorded = 0; fails = false; key = undefined; pending = false; });
test("refusjon bruker stabil nøkkel og registrerer full tilbakebetaling", async () => {
  const { refundCancelledBooking } = await import("./refund");
  await refundCancelledBooking("synthetic-booking");
  assert.equal(key, "booking-refund-synthetic-booking");
  assert.equal(recorded, 1); assert.equal(resolved, 1);
});
test("sent gjenforsøk oppretter ikke ny refusjon når pengene er tilbakeført", async () => {
  const { refundCancelledBooking } = await import("./refund");
  refunded = 10000;
  await refundCancelledBooking("synthetic-booking");
  assert.equal(calls, 0); assert.equal(resolved, 1); assert.equal(recorded, 1);
});
test("feil betalingsbeløp avvises før Stripe kan refundere", async () => {
  const { refundCancelledBooking } = await import("./refund");
  amount = 20000;
  await assert.rejects(() => refundCancelledBooking("synthetic-booking"), /samsvarer/);
  assert.equal(calls, 0); assert.equal(resolved, 0);
});
test("leverandørfeil lar jobben stå uløst for gjenforsøk", async () => {
  const { refundCancelledBooking } = await import("./refund");
  fails = true;
  await assert.rejects(() => refundCancelledBooking("synthetic-booking"), /unavailable/);
  assert.equal(resolved, 0); assert.equal(recorded, 0);
});

test("ventende refusjon står i kø og markeres ikke som fullført", async () => {
  const { refundCancelledBooking } = await import("./refund");
  pending = true;
  await assert.rejects(() => refundCancelledBooking("synthetic-booking"), /ikke fullført/);
  assert.equal(resolved, 0); assert.equal(recorded, 0);
  pending = false;
  await refundCancelledBooking("synthetic-booking");
  assert.equal(calls, 1); assert.equal(resolved, 1);
});
