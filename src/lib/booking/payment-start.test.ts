import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import type Stripe from "stripe";

let createError: unknown;
let expiryError: unknown;
let linkError: unknown;
let linkCount = 1;
let cancelCount = 1;
let sessionUrl: string | null = "https://checkout.example.test/session";
const calls: string[] = [];
const updates: Array<{ where: Record<string, unknown>; data: Record<string, unknown> }> = [];
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/stripe", { namedExports: { stripeKlient: () => ({ checkout: { sessions: {
  create: async (_params: unknown, options: unknown) => {
    calls.push("create");
    assert.deepEqual(options, { idempotencyKey: "booking-checkout:booking", maxNetworkRetries: 2 });
    if (createError) throw createError;
    return { id: "session", url: sessionUrl };
  },
  expire: async (id: string) => {
    assert.equal(id, "session"); calls.push("expire");
    if (expiryError) throw expiryError;
    return { status: "expired" };
  },
} } }) } });
mock.module("@/lib/prisma", { namedExports: { prisma: { booking: {
  updateMany: async (args: typeof updates[number]) => {
    updates.push(args);
    if (args.data.status === "CANCELLED") { calls.push("cancel"); return { count: cancelCount }; }
    calls.push("link");
    if (linkError) throw linkError;
    return { count: linkCount };
  },
} } } });
let startBookingPayment: typeof import("./payment-start").startBookingPayment;
before(async () => { ({ startBookingPayment } = await import("./payment-start")); });
const params = { mode: "payment" } as Stripe.Checkout.SessionCreateParams;
beforeEach(() => {
  createError = expiryError = linkError = undefined;
  linkCount = cancelCount = 1; sessionUrl = "https://checkout.example.test/session";
  calls.length = updates.length = 0;
});

test("lagret betalingsøkt returnerer URL og beholder reservasjonen", async () => {
  assert.deepEqual(await startBookingPayment("booking", params), { ok: true, url: sessionUrl });
  assert.deepEqual(calls, ["create", "link"]);
  assert.equal(updates[0].where.status, "PENDING");
});
test("et entydig avvist betalingsforsøk frigjør bare ubekreftet reservasjon", async () => {
  createError = { type: "StripeInvalidRequestError" };
  const result = await startBookingPayment("booking", params);
  assert.ok(!result.ok && result.releaseHold);
  assert.deepEqual(calls, ["create", "cancel"]);
  assert.deepEqual(updates[0].where, { id: "booking", status: "PENDING", stripeCheckoutSessionId: null });
});
test("nettfeil med ukjent Stripe-utfall frigjør ikke tiden", async () => {
  createError = { type: "StripeConnectionError" };
  const result = await startBookingPayment("booking", params);
  assert.ok(!result.ok && !result.releaseHold);
  assert.deepEqual(calls, ["create"]);
});
test("feilet kobling utløper betalingslenken før tiden frigjøres", async () => {
  linkError = new Error("database unavailable");
  const result = await startBookingPayment("booking", params);
  assert.ok(!result.ok && result.releaseHold);
  assert.deepEqual(calls, ["create", "link", "expire", "cancel"]);
});
test("en betalingslenke som ikke kan utløpes beholder tiden for oppfølging", async () => {
  linkCount = 0; expiryError = new Error("already completed");
  const result = await startBookingPayment("booking", params);
  assert.ok(!result.ok && !result.releaseHold);
  assert.deepEqual(calls, ["create", "link", "expire"]);
});
test("manglende URL ryddes opp uten å etterlate en betalbar lenke", async () => {
  sessionUrl = null;
  const result = await startBookingPayment("booking", params);
  assert.ok(!result.ok && result.releaseHold);
  assert.deepEqual(calls, ["create", "link", "expire", "cancel"]);
});
test("samtidig bekreftet booking kan ikke kanselleres av feilhåndteringen", async () => {
  linkCount = cancelCount = 0;
  const result = await startBookingPayment("booking", params);
  assert.ok(!result.ok && !result.releaseHold);
  assert.ok(updates.every(u => u.where.status === "PENDING"));
});
