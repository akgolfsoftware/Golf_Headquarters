/**
 * O06: avbestilling kaller Stripe-refusjon kun når policy tillater det.
 * Uvedkommende avvises. Sen avbestilling lagrer avlysning uten refusjon.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "spiller-a", role: "PLAYER" as string };
const om48t = new Date(Date.now() + 48 * 3600_000);
const om1t = new Date(Date.now() + 1 * 3600_000);

let booking = {
  id: "booking-1",
  userId: "spiller-a",
  coachId: "coach-a",
  startAt: om48t,
  status: "CONFIRMED",
  subscriptionId: null as string | null,
  stripePaymentIntentId: "pi_1" as string | null,
  priceOre: 10000,
  googleEventId: null,
  serviceType: { coachUserId: "coach-a", id: "svc", durationMin: 60 },
};

let stripeRefunds = 0;
let creditsOkning = 0;
let bookingStatus: string | null = null;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requireConsentingUser", {
  namedExports: { requireConsentingUser: async () => bruker },
});
mock.module("@/lib/stripe", {
  namedExports: {
    stripeKlient: () => ({
      refunds: {
        create: async () => {
          stripeRefunds += 1;
          return { id: "re_1" };
        },
      },
    }),
  },
});
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/google-calendar-kilder", {
  namedExports: {
    pushBooking: async () => undefined,
    fjernBooking: async () => undefined,
  },
});
mock.module("@/lib/notifications", { namedExports: { notify: async () => undefined } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/booking/metrics", {
  namedExports: { recordBookingMetric: async () => undefined },
});
mock.module("@/lib/email/booking-emails", {
  namedExports: {
    sendBookingCancellation: async () => undefined,
    sendBookingConfirmation: async () => undefined,
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      booking: {
        findUnique: async () => booking,
        update: async ({ data }: { data: { status: string } }) => {
          bookingStatus = data.status;
          return {};
        },
      },
      subscription: {
        update: async () => {
          creditsOkning += 1;
          return {};
        },
      },
      webhookFailure: {
        create: async () => ({}),
      },
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  bruker = { id: "spiller-a", role: "PLAYER" };
  booking = {
    id: "booking-1",
    userId: "spiller-a",
    coachId: "coach-a",
    startAt: om48t,
    status: "CONFIRMED",
    subscriptionId: null,
    stripePaymentIntentId: "pi_1",
    priceOre: 10000,
    googleEventId: null,
    serviceType: { coachUserId: "coach-a", id: "svc", durationMin: 60 },
  };
  stripeRefunds = 0;
  creditsOkning = 0;
  bookingStatus = null;
});

test("cancelBooking avviser andres booking uten refusjon", async () => {
  booking = { ...booking, userId: "spiller-b" };
  const { cancelBooking } = await actions();
  await assert.rejects(() => cancelBooking("booking-1"), /forbidden/);
  assert.equal(stripeRefunds, 0);
  assert.equal(bookingStatus, null);
});

test("cancelBooking mer enn 24 timer refunderer via Stripe og avlyser", async () => {
  const { cancelBooking } = await actions();
  await cancelBooking("booking-1");
  assert.equal(stripeRefunds, 1);
  assert.equal(bookingStatus, "CANCELLED");
  assert.equal(creditsOkning, 0);
});

test("cancelBooking under 24 timer avlyser uten refusjon", async () => {
  booking = { ...booking, startAt: om1t };
  const { cancelBooking } = await actions();
  await cancelBooking("booking-1");
  assert.equal(stripeRefunds, 0);
  assert.equal(bookingStatus, "CANCELLED");
  assert.equal(creditsOkning, 0);
});

test("cancelBooking fører credit tilbake når pakketime avbestilles i tide", async () => {
  booking = { ...booking, stripePaymentIntentId: null, subscriptionId: "sub-1", priceOre: 0 };
  const { cancelBooking } = await actions();
  await cancelBooking("booking-1");
  assert.equal(stripeRefunds, 0);
  assert.equal(creditsOkning, 1);
  assert.equal(bookingStatus, "CANCELLED");
});
