/**
 * Bookingplanen steg 4: coachen merker en time gjennomført og skriver notat fra
 * Bookingen, bare på egne bookinger.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type B = { id: string; coachId: string; status: string; startAt: Date; notes: string | null; subscriptionId?: string | null; stripePaymentIntentId?: string | null };
let bruker = { id: "coach-a", role: "COACH" };
let bookinger: B[] = [];
let auditer: string[] = [];

function treffer(b: B, where: Record<string, unknown>): boolean {
  if (where.id && where.id !== b.id) return false;
  const or = where.OR as Array<{ coachId?: string }> | undefined;
  if (or && !or.some((o) => o.coachId === b.coachId)) return false;
  if (where.status && where.status !== b.status) return false;
  const start = where.startAt as { lte: Date } | undefined;
  if (start && b.startAt > start.lte) return false;
  return true;
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", { namedExports: { requireCoachActionUser: async () => bruker } });
mock.module("@/lib/audit", { namedExports: { audit: async (e: { action: string }) => { auditer.push(e.action); } } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      booking: {
        updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Partial<B> }) => {
          const hit = bookinger.filter((b) => treffer(b, where));
          for (const b of hit) Object.assign(b, data);
          return { count: hit.length };
        },
      },
    },
  },
});

test.beforeEach(() => {
  bruker = { id: "coach-a", role: "COACH" };
  auditer = [];
  bookinger = [
    { id: "b1", coachId: "coach-a", status: "CONFIRMED", startAt: new Date(Date.now() - 3_600_000), notes: null },
    { id: "b2", coachId: "coach-a", status: "CONFIRMED", startAt: new Date(Date.now() + 86_400_000), notes: null },
    { id: "b3", coachId: "coach-b", status: "CONFIRMED", startAt: new Date(Date.now() - 3_600_000), notes: null },
  ];
});

test("en bekreftet time som har startet, merkes gjennomført", async () => {
  const { merkGjennomfort } = await import("./oppfolging-actions");
  assert.deepEqual(await merkGjennomfort("b1"), { ok: true });
  assert.equal(bookinger[0].status, "COMPLETED");
  assert.deepEqual(auditer, ["booking.completed.by-coach"]);
});

test("en time fram i tid kan ikke merkes gjennomført", async () => {
  const { merkGjennomfort } = await import("./oppfolging-actions");
  assert.equal((await merkGjennomfort("b2")).ok, false);
  assert.equal(bookinger[1].status, "CONFIRMED");
});

test("en annen coachs booking kan ikke røres", async () => {
  const { merkGjennomfort, lagreNotat } = await import("./oppfolging-actions");
  assert.equal((await merkGjennomfort("b3")).ok, false);
  assert.equal((await lagreNotat({ bookingId: "b3", notat: "Hei" })).ok, false);
  assert.equal(bookinger[2].status, "CONFIRMED");
  assert.equal(bookinger[2].notes, null);
});

test("notat lagres trimmet, tomt notat nullstiller", async () => {
  const { lagreNotat } = await import("./oppfolging-actions");
  assert.deepEqual(await lagreNotat({ bookingId: "b2", notat: "  Ta med wedger  " }), { ok: true });
  assert.equal(bookinger[1].notes, "Ta med wedger");
  await lagreNotat({ bookingId: "b2", notat: "   " });
  assert.equal(bookinger[1].notes, null);
  assert.equal((await lagreNotat({ bookingId: "b2", notat: "x".repeat(2001) })).ok, false);
});

test("no-show: en bekreftet time som har startet, merkes, og klipp og betaling røres ikke", async () => {
  const { merkNoShow } = await import("./oppfolging-actions");
  bookinger[0].subscriptionId = "sub-1";
  bookinger[0].stripePaymentIntentId = "pi_1";
  assert.deepEqual(await merkNoShow("b1"), { ok: true });
  assert.equal(bookinger[0].status, "NO_SHOW");
  assert.equal(bookinger[0].subscriptionId, "sub-1");
  assert.equal(bookinger[0].stripePaymentIntentId, "pi_1");
  assert.deepEqual(auditer, ["booking.no-show.by-coach"]);
});

test("no-show: en time fram i tid kan ikke merkes", async () => {
  const { merkNoShow } = await import("./oppfolging-actions");
  assert.equal((await merkNoShow("b2")).ok, false);
  assert.equal(bookinger[1].status, "CONFIRMED");
});

test("no-show: en coach kan ikke merke en annen coachs booking", async () => {
  const { merkNoShow } = await import("./oppfolging-actions");
  assert.equal((await merkNoShow("b3")).ok, false);
  assert.equal(bookinger[2].status, "CONFIRMED");
});
