/**
 * Coach avlyser en bekreftet booking (Anders 29.09.2026): FULL refusjon uansett
 * tidspunkt, varig refusjonsjobb og atomisk klipp tilbake for klippbookinger. Og
 * avvisning med begrunnelse: utkast i Innboks, ingenting sendes.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN";
let bruker: { id: string; role: Rolle; name: string } | null = null;
let booking: Record<string, unknown> | null = null;
let refusjoner: string[] = [];
let jobber: unknown[] = [];
let klippFeiler = false;
let utkastFeiler = false;
let versjonEndret = false;
let stripeFeiler = false;
let bookingOppdateringer: unknown[] = [];
let klippTilbake: unknown[] = [];
let innboks: Array<Record<string, unknown>> = [];
let eposter: unknown[] = [];
let rekkefolge: string[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  booking = {
    id: "b1",
    userId: "spiller-a",
    status: "CONFIRMED",
    updatedAt: new Date("2026-01-01"),
    // Starter om én time — langt innenfor spillerens 24-timersfrist.
    startAt: new Date(Date.now() + 60 * 60_000),
    subscriptionId: null,
    stripePaymentIntentId: "pi_123",
    googleEventId: null,
    coachId: "coach-a",
    serviceType: { coachUserId: "coach-a", name: "Privattime" },
    payments: [],
    guestName: null,
    guestEmail: null,
    user: { name: "Ola Testesen", email: "ola@eksempel.no" },
  };
  refusjoner = []; jobber = []; klippFeiler = false; utkastFeiler = false; versjonEndret = false;
  stripeFeiler = false;
  bookingOppdateringer = [];
  klippTilbake = [];
  innboks = [];
  eposter = [];
  rekkefolge = [];
}
nullstill();

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (!bruker) throw new Error("unauthenticated");
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/booking/refund", { namedExports: {
  bookingRefundKey: (id: string) => `booking-refund-${id}`,
  refundCancelledBooking: async (id: string) => {
    rekkefolge.push("stripe");
    assert.equal(booking?.status, "CANCELLED");
    assert.equal(jobber.length, 1);
    if (stripeFeiler) throw new Error("stripe nede eller refusjon venter");
    refusjoner.push(id);
  },
} });
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/notifications", { namedExports: { notify: async () => undefined } });
mock.module("@/lib/google-calendar-kilder", { namedExports: { fjernBooking: async () => undefined } });
mock.module("@/lib/email/booking-emails", {
  namedExports: { sendBookingCancellation: async (...a: unknown[]) => { eposter.push(a); } },
});
const prismaMock: Record<string, unknown> = {
  booking: {
    findFirst: async () => booking,
    updateMany: async (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      rekkefolge.push("db");
      if (versjonEndret) return { count: 0 };
      assert.deepEqual(args.where.updatedAt, booking?.updatedAt);
      assert.ok(args.where.OR);
      booking = { ...booking, ...args.data };
      bookingOppdateringer.push(args);
      return { count: 1 };
    },
  },
  subscription: { update: async (args: unknown) => { if (klippFeiler) throw Error("klippfeil"); klippTilbake.push(args); return {}; } },
  innboksEpost: { create: async ({ data }: { data: Record<string, unknown> }) => { if (utkastFeiler) throw Error("utkastfeil"); innboks.push(data); return { id: "e1" }; } },
  serviceType: { findUnique: async () => null },
  webhookFailure: { upsert: async (args: unknown) => { rekkefolge.push("jobb"); jobber.push(args); } },
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
    const before = structuredClone(booking);
    try { return await fn(prismaMock); } catch (error) {
      booking = before; bookingOppdateringer = []; klippTilbake = []; jobber = []; innboks = []; throw error;
    }
  },
};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });

const actions = () => import("./actions");

test.beforeEach(nullstill);

test("coach avlyser 1 time før start: avlysning og varig refusjonsjobb kommer før refusjonsforsøket", async () => {
  const { avlysBookingSomCoach } = await actions();
  const res = await avlysBookingSomCoach({ bookingId: "b1" });
  assert.deepEqual(res, { ok: true, refundert: true, refusjonVenter: false, klippTilbake: false });
  assert.equal(refusjoner.length, 1);
  assert.equal(refusjoner[0], "b1");
  assert.deepEqual(rekkefolge, ["db", "jobb", "stripe"]);
  assert.equal(eposter.length, 1);
});

test("refusjon fra betalingsraden når bookingen mangler payment intent", async () => {
  booking = { ...booking!, stripePaymentIntentId: null, payments: [{ stripePaymentIntentId: "pi_fra_payment" }] };
  const { avlysBookingSomCoach } = await actions();
  await avlysBookingSomCoach({ bookingId: "b1" });
  assert.equal(booking?.stripePaymentIntentId, "pi_fra_payment");
});

test("feiler eller venter Stripe, beholdes avlysning og refusjonsjobb med ærlig status", async () => {
  stripeFeiler = true;
  const { avlysBookingSomCoach } = await actions();
  const res = await avlysBookingSomCoach({ bookingId: "b1" });
  assert.deepEqual(res, { ok: true, refundert: false, refusjonVenter: true, klippTilbake: false });
  assert.equal(booking?.status, "CANCELLED");
  assert.equal(jobber.length, 1);
  assert.deepEqual(eposter[0], ["b1", { refundIssued: false, refundPending: true, isCreditBooking: false }]);
});

test("klippbooking: klippet føres tilbake, ingen Stripe", async () => {
  booking = { ...booking!, stripePaymentIntentId: null, subscriptionId: "sub-1" };
  const { avlysBookingSomCoach } = await actions();
  const res = await avlysBookingSomCoach({ bookingId: "b1" });
  assert.deepEqual(res, { ok: true, refundert: false, refusjonVenter: false, klippTilbake: true });
  assert.equal(refusjoner.length, 0);
  assert.equal(klippTilbake.length, 1);
});

test("spiller kan ikke avlyse via coach-handlingen", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller" };
  const { avlysBookingSomCoach } = await actions();
  await assert.rejects(() => avlysBookingSomCoach({ bookingId: "b1" }));
  assert.equal(refusjoner.length, 0);
});

test("avvisning med begrunnelse lager utkast i Innboks, sender ingenting", async () => {
  booking = { ...booking!, status: "PENDING", stripePaymentIntentId: null };
  const { avvisBookingMedBegrunnelse } = await actions();
  const res = await avvisBookingMedBegrunnelse({ bookingId: "b1", begrunnelse: "Studio er stengt for service." });
  assert.deepEqual(res, { ok: true, utkast: true });
  assert.equal(innboks.length, 1);
  assert.equal(innboks[0].status, "UTKAST_KLART");
  assert.equal(innboks[0].bookingId, "b1");
  assert.equal(innboks[0].fraEpost, "ola@eksempel.no");
  assert.match(String(innboks[0].utkastSvar), /Studio er stengt for service\./);
  assert.equal(eposter.length, 0);
});

test("for kort begrunnelse avvises før noe skrives", async () => {
  const { avvisBookingMedBegrunnelse } = await actions();
  const res = await avvisBookingMedBegrunnelse({ bookingId: "b1", begrunnelse: "nei" });
  assert.equal(res.ok, false);
  assert.equal(bookingOppdateringer.length, 0);
  assert.equal(innboks.length, 0);
});


test("klippfeil ruller tilbake avlysningen og sender ingen bekreftelse", async () => {
  booking = { ...booking!, stripePaymentIntentId: null, subscriptionId: "sub-1" }; klippFeiler = true;
  await assert.rejects((await actions()).avlysBookingSomCoach({ bookingId: "b1" }), /klippfeil/);
  assert.equal(booking?.status, "CONFIRMED"); assert.equal(eposter.length, 0); assert.equal(jobber.length, 0);
});
test("samtidig bookingendring stopper før klippretur og Stripe", async () => {
  versjonEndret = true;
  assert.equal((await (await actions()).avlysBookingSomCoach({ bookingId: "b1" })).ok, false);
  assert.equal(jobber.length, 0); assert.equal(refusjoner.length, 0); assert.equal(eposter.length, 0);
});
test("avvisningsutkast og avvisning rulles tilbake sammen ved utkastfeil", async () => {
  booking = { ...booking!, status: "PENDING", stripePaymentIntentId: null }; utkastFeiler = true;
  await assert.rejects((await actions()).avvisBookingMedBegrunnelse({ bookingId: "b1", begrunnelse: "Syntetisk begrunnelse" }), /utkastfeil/);
  assert.equal(booking?.status, "PENDING"); assert.equal(innboks.length, 0);
});
test("betalt eller klippdekket forespørsel kan ikke avvises uten tilbakeføring", async () => {
  const base = structuredClone(booking);
  for (const fields of [{stripePaymentIntentId:"pi_123"},{subscriptionId:"sub-1"},{payments:[{id:"payment"}]}]) {
    booking = { ...base, status: "PENDING", stripePaymentIntentId: null, ...fields };
    assert.equal((await (await actions()).avvisBookingMedBegrunnelse({ bookingId: "b1", begrunnelse: "Syntetisk begrunnelse" })).ok, false);
  }
  assert.equal(bookingOppdateringer.length, 0); assert.equal(innboks.length, 0);
});
