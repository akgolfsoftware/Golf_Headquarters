import assert from "node:assert/strict";
import { mock, test } from "node:test";
let failed = false;
let marks = 0;
let refunded = 0;
let updates: Array<{ status: string; attemptCount?: number }> = [];
mock.module("@/lib/prisma", { namedExports: { prisma: { webhookFailure: {
  findMany: async ({ where }: { where: { webhookSource: { in: string[] } } }) => {
    assert.ok(where.webhookSource.in.includes("stripe-refund"));
    return [{ id: "job", eventId: "booking-refund-synthetic", webhookSource: "stripe-refund", payload: { bookingId: "synthetic" }, attemptCount: 0 }];
  },
  update: async ({ data }: { data: { status: string; attemptCount?: number } }) => { updates.push(data); },
} } } });
mock.module("@/lib/booking/refund", { namedExports: { refundCancelledBooking: async (id: string) => {
  assert.equal(id, "synthetic"); refunded++;
  if (failed) throw new Error("synthetic outage");
} } });
mock.module("@/lib/stripe", { namedExports: { stripeKlient: () => ({}) } });
mock.module("@/lib/stripe/handle-event", { namedExports: {
  markerBehandlet: async () => { marks++; return false; },
  angreBehandlet: async () => { throw new Error("refund jobs must not touch event dedup"); },
  handleStripeEvent: async () => { throw new Error("wrong handler"); },
} });
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });
mock.module("@/lib/cron/auth", { namedExports: { avvisUgyldigCron: () => null } });
mock.module("@/lib/slack-alert", { namedExports: { sendSlackAlert: async () => undefined } });
test.beforeEach(() => { failed = false; marks = 0; refunded = 0; updates = []; });
test("refusjonsjobb fra avbrutt forespørsel kjøres uten webhook-deduplisering", async () => {
  const { GET } = await import("./route");
  const response = await GET(new Request("http://localhost/api/cron/webhook-retry"));
  assert.equal(response.status, 200); assert.equal(refunded, 1); assert.equal(marks, 0);
  assert.equal(updates[0].status, "RESOLVED");
});
test("feilet refusjonsjobb beholder køstatus og teller forsøk", async () => {
  failed = true;
  const { GET } = await import("./route");
  await GET(new Request("http://localhost/api/cron/webhook-retry"));
  assert.equal(updates[0].status, "PENDING"); assert.equal(updates[0].attemptCount, 1);
});
