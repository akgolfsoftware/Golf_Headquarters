/**
 * Deltaker 2s lenke kan bare fjerne deltaker 2. Den rører aldri status, Stripe,
 * refusjon eller klipp på betalerens time.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

test("meld av endrer bare partner-feltene, aldri status eller betaling", async (t) => {
  const kall: Array<{ where: Record<string, unknown>; data: Record<string, unknown> }> = [];
  let refusjoner = 0;
  t.mock.module("@/lib/prisma", {
    namedExports: { prisma: { booking: { updateMany: async (a: (typeof kall)[number]) => { kall.push(a); return { count: 1 }; } } } },
  });
  t.mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
  t.mock.module("@/lib/booking/refund", { namedExports: { refundCancelledBooking: async () => { refusjoner += 1; }, bookingRefundKey: (i: string) => i } });
  t.mock.module("@/lib/booking/gjest-lenke", { namedExports: { gjestLenkeNokkel: () => Buffer.from("x".repeat(32)) } });
  t.mock.module("server-only", { namedExports: {} });

  const { signerDeltaker2Lenke } = await import("./deltaker2-lenke");
  const { deltaker2MeldAv } = await import("./deltaker2-avmelding");
  const start = new Date("2099-01-10T10:00:00.000Z");
  const token = signerDeltaker2Lenke("b1", start)!;

  const res = await deltaker2MeldAv(token, new Date("2098-01-01T00:00:00Z"));
  assert.equal(res.ok, true);
  assert.equal(kall.length, 1);
  assert.deepEqual(kall[0].data, { partnerName: null, partnerEmail: null });
  assert.equal(kall[0].where.id, "b1");
  assert.equal(refusjoner, 0);

  kall.length = 0;
  const ugyldig = await deltaker2MeldAv("ikke-en-lenke.abc", new Date("2098-01-01T00:00:00Z"));
  assert.equal(ugyldig.ok, false);
  assert.equal(kall.length, 0);
});
