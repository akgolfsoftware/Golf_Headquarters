/**
 * Flytting i PlayerHQ: tiden sjekkes alltid mot bookingens egen coach (klienten kan ikke
 * bytte coach), og to som flytter til samme tid samtidig får ikke begge tiden.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

const start = new Date(Date.now() + 72 * 3600_000);
const ny = new Date(Date.now() + 96 * 3600_000);

const booking = {
  id: "b1", userId: "spiller-a", coachId: "coach-a", facilityId: null as string | null, serviceTypeId: "svc",
  startAt: start, status: "CONFIRMED", subscriptionId: null, stripePaymentIntentId: null, priceOre: 0, googleEventId: null,
  serviceType: { id: "svc", durationMin: 60, coachUserId: "coach-a" },
};

let sjekketCoach: string | null = null;
let kollisjonCoach: string | null = null;
let oppdateringer = 0;
let lagretCoachFelt = false;
let ledig = true;
// Simulerer låsen + utelukkelsen i basen: bare den første som skriver tiden vinner.
let tidTattAv: string | null = null;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requireConsentingUser", { namedExports: { requireConsentingUser: async () => ({ id: "spiller-a", role: "PLAYER" }) } });
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/google-calendar-kilder", { namedExports: { pushBooking: async () => undefined, fjernBooking: async () => undefined } });
mock.module("@/lib/notifications", { namedExports: { notify: async () => undefined } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/booking/metrics", { namedExports: { recordBookingMetric: async () => undefined } });
mock.module("@/lib/booking/refund", { namedExports: { bookingRefundKey: (i: string) => i, refundCancelledBooking: async () => undefined } });
mock.module("@/lib/email/booking-emails", { namedExports: { sendBookingConfirmation: async () => undefined, sendBookingCancellation: async () => undefined } });
mock.module("@/lib/booking/availability", {
  namedExports: { isSlotStillAvailable: async (_s: string, _t: Date, coachId: string) => { sjekketCoach = coachId; return ledig; } },
});
class Kollisjon extends Error {}
mock.module("@/lib/booking/kollisjonsvern", {
  namedExports: {
    erKollisjonsfeil: (e: unknown) => e instanceof Kollisjon,
    kollisjonsmelding: () => "Tidspunktet ble nettopp tatt — velg en annen tid.",
    sjekkKollisjon: async (_tx: unknown, i: { coachId?: string | null }) => {
      kollisjonCoach = i.coachId ?? null;
      if (tidTattAv) throw new Kollisjon("tatt");
      return { plassNr: 1 };
    },
  },
});
const db = {
  booking: {
    findUnique: async () => booking,
    update: async (a: { data: Record<string, unknown> }) => {
      oppdateringer += 1;
      tidTattAv = "forste";
      if ("coachId" in a.data) lagretCoachFelt = true;
      return {};
    },
  },
};
mock.module("@/lib/prisma", { namedExports: { prisma: { ...db, $transaction: async (fn: (tx: typeof db) => Promise<unknown>) => fn(db) } } });

test.beforeEach(() => {
  sjekketCoach = null; kollisjonCoach = null; oppdateringer = 0; lagretCoachFelt = false; ledig = true; tidTattAv = null;
});

test("flytting sjekker tiden mot bookingens coach, ikke coachen klienten sender", async () => {
  const { rescheduleBooking } = await import("./actions");
  await rescheduleBooking({ bookingId: "b1", newStartIso: ny.toISOString(), newCoachId: "coach-b" });
  assert.equal(sjekketCoach, "coach-a");
  assert.equal(kollisjonCoach, "coach-a");
  assert.equal(lagretCoachFelt, false);
  assert.equal(oppdateringer, 1);
});

test("to flyttinger til samme tid: bare den første får tiden", async () => {
  const { rescheduleBooking } = await import("./actions");
  await rescheduleBooking({ bookingId: "b1", newStartIso: ny.toISOString(), newCoachId: "coach-a" });
  await assert.rejects(() => rescheduleBooking({ bookingId: "b1", newStartIso: ny.toISOString(), newCoachId: "coach-a" }), /nettopp tatt/);
  assert.equal(oppdateringer, 1);
});

test("tid som ikke er ledig hos bookingens coach avvises uten å skrive", async () => {
  ledig = false;
  const { rescheduleBooking } = await import("./actions");
  await assert.rejects(() => rescheduleBooking({ bookingId: "b1", newStartIso: ny.toISOString(), newCoachId: "coach-b" }), /ikke ledig/);
  assert.equal(oppdateringer, 0);
});
