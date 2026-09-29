/**
 * Coach avlyser en bekreftet booking (Anders 29.09.2026): FULL refusjon uansett
 * tidspunkt, Stripe før egen database, klipp tilbake for klippbookinger. Og
 * avvisning med begrunnelse: utkast i Innboks, ingenting sendes.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN";
let bruker: { id: string; role: Rolle; name: string } | null = null;
let booking: Record<string, unknown> | null = null;
let refusjoner: Array<{ params: Record<string, unknown>; opts: unknown }> = [];
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
  refusjoner = [];
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
mock.module("@/lib/stripe", {
  namedExports: {
    stripeKlient: () => ({
      refunds: {
        create: async (params: Record<string, unknown>, opts: unknown) => {
          rekkefolge.push("stripe");
          if (stripeFeiler) throw new Error("stripe nede");
          refusjoner.push({ params, opts });
          return { id: "re_1" };
        },
      },
    }),
  },
});
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
    updateMany: async (args: unknown) => {
      rekkefolge.push("db");
      bookingOppdateringer.push(args);
      return { count: 1 };
    },
  },
  subscription: { update: async (args: unknown) => { klippTilbake.push(args); return {}; } },
  innboksEpost: { create: async ({ data }: { data: Record<string, unknown> }) => { innboks.push(data); return { id: "e1" }; } },
  serviceType: { findUnique: async () => null },
};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });

const actions = () => import("./actions");

test.beforeEach(nullstill);

test("coach avlyser 1 time før start: hele beløpet refunderes i Stripe før databasen", async () => {
  const { avlysBookingSomCoach } = await actions();
  const res = await avlysBookingSomCoach({ bookingId: "b1" });
  assert.deepEqual(res, { ok: true, refundert: true, klippTilbake: false });
  assert.equal(refusjoner.length, 1);
  assert.equal(refusjoner[0].params.payment_intent, "pi_123");
  assert.equal("amount" in refusjoner[0].params, false, "uten amount refunderer Stripe hele beløpet");
  assert.deepEqual(rekkefolge, ["stripe", "db"]);
  assert.equal(eposter.length, 1);
});

test("refusjon fra betalingsraden når bookingen mangler payment intent", async () => {
  booking = { ...booking!, stripePaymentIntentId: null, payments: [{ stripePaymentIntentId: "pi_fra_payment" }] };
  const { avlysBookingSomCoach } = await actions();
  await avlysBookingSomCoach({ bookingId: "b1" });
  assert.equal(refusjoner[0].params.payment_intent, "pi_fra_payment");
});

test("feiler Stripe, avlyses ingenting", async () => {
  stripeFeiler = true;
  const { avlysBookingSomCoach } = await actions();
  const res = await avlysBookingSomCoach({ bookingId: "b1" });
  assert.equal(res.ok, false);
  assert.equal(bookingOppdateringer.length, 0);
  assert.equal(eposter.length, 0);
});

test("klippbooking: klippet føres tilbake, ingen Stripe", async () => {
  booking = { ...booking!, stripePaymentIntentId: null, subscriptionId: "sub-1" };
  const { avlysBookingSomCoach } = await actions();
  const res = await avlysBookingSomCoach({ bookingId: "b1" });
  assert.deepEqual(res, { ok: true, refundert: false, klippTilbake: true });
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
  booking = { ...booking!, status: "PENDING" };
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
