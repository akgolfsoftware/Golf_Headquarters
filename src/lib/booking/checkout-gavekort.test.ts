/**
 * Gavekort (bookingplanen steg 7): innløsning i betalingssteget for gjest. Gavekortet trekkes
 * i samme transaksjon som bookingen, kortet betaler resten, og dekker det alt, bekreftes
 * bookingen uten Stripe.
 */
import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import { hashGavekode, normaliserGavekode } from "./gavekort";

const KODE = "ABCD-EFGH-JKMN-PQRS";
type Kort = { id: string; codeHash: string; balanceOre: number; expiresAt: Date };
let kort: Kort;
let lagret: Array<Record<string, unknown>> = [];
let stripeBelop: number[] = [];
let transaksjoner: Array<{ id: string; bookingId: string | null; amountOre: number }> = [];
let bekreftelser: string[] = [];

mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => null } });
mock.module("@/lib/booking/offentlig-booking", { namedExports: { kanBrukeInnebygdBooking: async () => true } });
mock.module("@/lib/booking/availability", { namedExports: { isSlotStillAvailable: async () => true } });
mock.module("@/lib/booking/slot-hold", { namedExports: { DEFAULT_HOLD_TTL_MS: 1000, acquireHold: async () => ({ ok: true }), releaseHold: async () => undefined } });
mock.module("@/lib/booking/kollisjonsvern", { namedExports: { sjekkKollisjon: async () => ({ plassNr: 1 }), erKollisjonsfeil: () => false, kollisjonsmelding: () => "collision" } });
mock.module("@/lib/booking/metrics", { namedExports: { recordBookingMetric: async () => {} } });
mock.module("@/lib/audit", { namedExports: { audit: async () => {} } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => {} } });
mock.module("@/lib/google-calendar-kilder", { namedExports: { pushBooking: async () => undefined } });
mock.module("@/lib/booking/varsle-ny-booking", { namedExports: { varsleNyBooking: async () => undefined } });
mock.module("@/lib/email/booking-emails", { namedExports: { sendBookingConfirmation: async (id: string) => { bekreftelser.push(id); } } });
mock.module("@/lib/stripe", { namedExports: { stripeKlient: () => ({ checkout: { sessions: { create: async (p: { line_items: Array<{ price_data: { unit_amount: number } }> }) => {
  stripeBelop.push(p.line_items[0].price_data.unit_amount);
  return { id: "cs_x", url: "https://example.test/checkout" };
} } } }) } });

const booking = {
  create: async ({ data }: { data: Record<string, unknown> }) => { const rad = { id: `b${lagret.length + 1}`, status: "PENDING", ...data }; lagret.push(rad); return rad; },
  updateMany: async () => ({ count: 1 }),
};
const tx = {
  booking,
  giftCard: {
    findUnique: async ({ where }: { where: { codeHash: string } }) => (kort.codeHash === where.codeHash ? { id: kort.id, balanceOre: kort.balanceOre, expiresAt: kort.expiresAt } : null),
    updateMany: async ({ where, data }: { where: { id: string; balanceOre: number }; data: { balanceOre: number } }) => {
      if (kort.balanceOre !== where.balanceOre) return { count: 0 };
      kort.balanceOre = data.balanceOre;
      return { count: 1 };
    },
  },
  giftCardTransaction: {
    create: async ({ data }: { data: { amountOre: number } }) => { const t = { id: `t${transaksjoner.length + 1}`, bookingId: null, amountOre: data.amountOre }; transaksjoner.push(t); return { id: t.id }; },
    update: async ({ where, data }: { where: { id: string }; data: { bookingId: string } }) => { transaksjoner.find((t) => t.id === where.id)!.bookingId = data.bookingId; },
  },
};
mock.module("@/lib/prisma", { namedExports: { prisma: {
  serviceType: { findUnique: async () => ({ id: "service", slug: "coaching", active: true, coachUserId: "coach", priceOre: 100_000, durationMin: 50, name: "Coaching", maxDeltakere: 1 }) },
  location: { findFirst: async () => ({ id: "location", name: "Range" }) },
  ...tx,
  $transaction: async (run: (t: unknown) => Promise<unknown>) => run(tx),
} } });

let checkout: typeof import("@/app/(marketing)/booking/[slug]/bekreft/actions").createBookingCheckout;
before(async () => { checkout = (await import("@/app/(marketing)/booking/[slug]/bekreft/actions")).createBookingCheckout; });

const input = (giftCode?: string) => ({ slug: "coaching", coachId: "coach", start: "2030-10-01T10:00:00.000Z", name: "Test Person", email: "test@example.test", phone: "00000000", notes: "", ...(giftCode ? { giftCode } : {}) });

test.beforeEach(() => {
  kort = { id: "k1", codeHash: hashGavekode(normaliserGavekode(KODE)!), balanceOre: 40_000, expiresAt: new Date(Date.now() + 86_400_000) };
  lagret = []; stripeBelop = []; transaksjoner = []; bekreftelser = [];
});

test("delvis dekning: kortet tømmes, bookingen venter på betaling av resten i Stripe", async () => {
  const r = await checkout(input(KODE));
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(kort.balanceOre, 0);
  assert.equal(lagret[0].priceOre, 60_000);
  assert.equal(lagret[0].giftCardOre, 40_000);
  assert.equal(lagret[0].status, "PENDING");
  assert.deepEqual(stripeBelop, [60_000]);
  assert.equal(transaksjoner[0].bookingId, "b1");
});

test("full dekning: bekreftet uten Stripe, resten blir stående på kortet", async () => {
  kort.balanceOre = 150_000;
  const r = await checkout(input(KODE));
  assert.equal(r.ok, true);
  assert.ok(r.ok && r.url.endsWith("/booking/kvittering/b1"));
  assert.equal(kort.balanceOre, 50_000);
  assert.equal(lagret[0].status, "CONFIRMED");
  assert.equal(lagret[0].paymentMethod, "GAVEKORT");
  assert.equal(lagret[0].priceOre, 0);
  assert.deepEqual(stripeBelop, []);
  assert.deepEqual(bekreftelser, ["b1"]);
});

test("resten på kortet blir aldri under Stripe-minimum på 3 kr", async () => {
  kort.balanceOre = 99_900;
  const r = await checkout(input(KODE));
  assert.equal(r.ok, true);
  assert.deepEqual(stripeBelop, [300]);
  assert.equal(kort.balanceOre, 200);
});

test("feil eller tom kode lager ingen booking og trekker ingenting", async () => {
  const feil = await checkout(input("AAAA-BBBB-CCCC-DDDD"));
  assert.equal(feil.ok, false);
  kort.balanceOre = 0;
  const tomt = await checkout(input(KODE));
  assert.equal(tomt.ok, false);
  assert.equal(lagret.length, 0);
  assert.deepEqual(stripeBelop, []);
});
