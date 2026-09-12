/**
 * O06: credit-booking. Siste credit og kollisjon ruller tilbake uten
 * negativ saldo eller opprettet booking.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

class BookingKollisjon extends Error {
  override name = "BookingKollisjon";
}

let creditsTrekk = 0;
let bookingerOpprettet = 0;
let updateCount = 1;
let kollisjon = false;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async () => ({ id: "spiller-a", role: "PLAYER" }),
  },
});
mock.module("@/lib/forelder", {
  namedExports: { hentBarnHvisTilhoerer: async () => null },
});
mock.module("@/lib/booking/availability", {
  namedExports: { isSlotStillAvailable: async () => true },
});
mock.module("@/lib/booking/kollisjonsvern", {
  namedExports: {
    BookingKollisjon,
    erKollisjonsfeil: (err: unknown) => err instanceof BookingKollisjon,
    sjekkKollisjon: async () => {
      if (kollisjon) throw new BookingKollisjon("opptatt");
      return { plassNr: 1 };
    },
  },
});
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/google-calendar-kilder", {
  namedExports: { pushBooking: async () => undefined },
});
mock.module("@/lib/booking/varsle-ny-booking", {
  namedExports: { varsleNyBooking: async () => undefined },
});
mock.module("@/lib/notifications", { namedExports: { notify: async () => undefined } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/email/booking-emails", {
  namedExports: { sendBookingConfirmation: async () => undefined },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      subscription: {
        findUnique: async () => ({
          id: "sub-1",
          status: "ACTIVE",
          currentPeriodEnd: new Date("2026-10-01"),
          monthlyCredits: 2,
          creditsRemaining: 1,
        }),
      },
      serviceType: {
        findUnique: async () => ({
          id: "svc-1",
          active: true,
          durationMin: 60,
          slug: "flex-60",
          name: "Time",
          coachUserId: "coach-a",
        }),
      },
      location: {
        findFirst: async () => ({ id: "loc-1" }),
      },
      $transaction: async (fn: (tx: {
        subscription: { updateMany: (args: unknown) => Promise<{ count: number }> };
        booking: { create: (args: unknown) => Promise<{ id: string }> };
      }) => Promise<unknown>) =>
        fn({
          subscription: {
            updateMany: async () => {
              creditsTrekk += 1;
              return { count: updateCount };
            },
          },
          booking: {
            create: async () => {
              bookingerOpprettet += 1;
              return { id: "booking-ny" };
            },
          },
        }),
    },
  },
});

async function action() {
  return (await import("./credit-booking")).createCreditBooking;
}

const input = {
  serviceTypeId: "svc-1",
  coachId: "coach-a",
  start: new Date(Date.now() + 48 * 3600_000).toISOString(),
};

test.beforeEach(() => {
  creditsTrekk = 0;
  bookingerOpprettet = 0;
  updateCount = 1;
  kollisjon = false;
});

test("createCreditBooking oppretter når credit og tid er ledig", async () => {
  const fn = await action();
  const svar = await fn(input);
  assert.equal(svar.bookingId, "booking-ny");
  assert.equal(creditsTrekk, 1);
  assert.equal(bookingerOpprettet, 1);
});

test("createCreditBooking avviser siste-credit-race uten å opprette booking", async () => {
  updateCount = 0;
  const fn = await action();
  await assert.rejects(fn(input), /Ingen coaching-timer igjen/);
  assert.equal(creditsTrekk, 1);
  assert.equal(bookingerOpprettet, 0);
});

test("createCreditBooking ruller tilbake ved kollisjon uten credit-trekk", async () => {
  kollisjon = true;
  const fn = await action();
  await assert.rejects(fn(input), /nettopp tatt/);
  assert.equal(creditsTrekk, 0);
  assert.equal(bookingerOpprettet, 0);
});
