import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
let fixed: string | null = null;
let coaches: string[] = [];
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => null } });
mock.module("@/lib/booking/offentlig-booking", { namedExports: { kanBrukeInnebygdBooking: async () => true } });
mock.module("@/lib/booking/availability", { namedExports: { isSlotStillAvailable: async (_s: string, _d: Date, coach: string) => { coaches.push(coach); return true; } } });
mock.module("@/lib/booking/slot-hold", { namedExports: { DEFAULT_HOLD_TTL_MS: 1000, acquireHold: async ({ coachId }: { coachId: string }) => { coaches.push(coachId); return { ok: true }; } } });
mock.module("@/lib/booking/kollisjonsvern", { namedExports: { sjekkKollisjon: async (_tx: unknown, { coachId }: { coachId: string }) => { coaches.push(coachId); return { plassNr: 1 }; }, erKollisjonsfeil: () => false, kollisjonsmelding: () => "collision" } });
mock.module("@/lib/booking/metrics", { namedExports: { recordBookingMetric: async () => {} } });
mock.module("@/lib/audit", { namedExports: { audit: async () => {} } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => {} } });
mock.module("@/lib/stripe", { namedExports: { stripeKlient: () => ({ checkout: { sessions: { create: async ({ metadata }: { metadata: { coachId: string } }) => { coaches.push(metadata.coachId); return { id: "checkout", url: "https://example.test/checkout" }; } } } }) } });
const booking = { create: async ({ data }: { data: { coachId: string; userId: string | null } }) => { coaches.push(data.coachId); assert.equal(data.userId, null); return { id: "booking" }; }, updateMany: async () => ({ count: 1 }) };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  serviceType: { findUnique: async () => ({ id: "service", slug: "coaching", active: true, coachUserId: fixed, priceOre: 100000, durationMin: 50, name: "Coaching" }) },
  location: { findFirst: async () => ({ id: "location", name: "Range" }) },
  booking, $transaction: async (run: (tx: unknown) => Promise<unknown>) => run({ booking }),
} } });
let checkout: typeof import("@/app/(marketing)/booking/[slug]/bekreft/actions").createBookingCheckout;
before(async () => { checkout = (await import("@/app/(marketing)/booking/[slug]/bekreft/actions")).createBookingCheckout; });
test("gjestebooking bruker samme løste coach i tilgjengelighet, hold, kollisjon, booking og betaling", async () => {
  for (const start of ["2026-10-01T10:00:00.000Z", "2026-10-01T10:00:00"]) for (fixed of [null, "fixed-coach"]) {
    coaches = [];
    const result = await checkout({ slug: "coaching", coachId: "selected-coach", start, name: "Test Person", email: "test@example.test", phone: "00000000", notes: "" });
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.deepEqual(coaches, Array(5).fill(fixed ?? "selected-coach"));
  }
});
