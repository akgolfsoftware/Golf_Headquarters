import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let viewer: { id: string; role: string } | null;
let parent = false;
let privateReads = 0;
let stripeReads = 0;
let stripeFailed = false;
let payment = "unpaid";
let metadataBooking = "booking";
let status = "CONFIRMED";
const checkout = "cs_test_syntheticreceipt";
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => viewer } });
mock.module("@/lib/stripe", { namedExports: { stripeKlient: () => ({ checkout: { sessions: { retrieve: async (id: string) => {
  stripeReads++; assert.equal(id, checkout); if (stripeFailed) throw new Error("syntetisk feil");
  return { id, mode: "payment", currency: "nok", amount_total: 95050, metadata: { bookingId: metadataBooking }, payment_status: payment, payment_intent: null };
} } } }) } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  parentRelation: { findFirst: async ({ where }: { where: { approved: boolean; child: { deletedAt: null } } }) => { assert.equal(where.approved, true); assert.equal(where.child.deletedAt, null); return parent ? { id: "relation" } : null; } },
  booking: { findUnique: async ({ select }: { select: Record<string, boolean> }) => { assert.equal(select.guestEmail, undefined); return { id: "booking", userId: "owner", stripeCheckoutSessionId: checkout, priceOre: 95050 }; },
    findFirst: async ({ where }: { where: { userId?: string; stripeCheckoutSessionId?: string; user?: { parentRelations?: { some: { parentId: string; approved: boolean } } } } }) => {
      privateReads++;
      if (viewer?.id === "owner") assert.equal(where.userId, "owner");
      else if (parent) assert.equal(where.user?.parentRelations?.some.parentId, "parent");
      else assert.equal(where.stripeCheckoutSessionId, checkout);
      return { id: "booking", status, startAt: new Date("2026-11-12T16:30:00Z"), endAt: new Date("2026-11-12T17:00:00Z"), priceOre: 95050, subscriptionId: null,
        stripeCheckoutSessionId: checkout, guestEmail: "syntetisk@example.invalid", serviceType: { name: "Syntetisk time" }, location: { name: "Syntetisk sted" }, coach: null, user: null };
    } },
} } });
let load: typeof import("./receipt").hentBookingKvittering;
before(async () => { load = (await import("./receipt")).hentBookingKvittering; });
beforeEach(() => { viewer = null; parent = false; privateReads = stripeReads = 0; stripeFailed = false; payment = "unpaid"; metadataBooking = "booking"; status = "CONFIRMED"; });
test("booking-ID alene eller andres checkout gir ingen navn, epost eller Stripe-kall", async () => {
  for (const session of [undefined, "cs_test_anothersession"]) {
    const result = await load("booking", session); assert.equal(result.state, "denied"); assert.equal(result.details, null);
  }
  assert.equal(privateReads, 0); assert.equal(stripeReads, 0);
});
test("gjestens eksakte Stripe-referanse kontrolleres mot bookingmetadata", async () => {
  metadataBooking = "other-booking";
  assert.equal((await load("booking", checkout)).state, "denied"); assert.equal(privateReads, 0);
  metadataBooking = "booking";
  const result = await load("booking", checkout);
  assert.equal(result.details?.epost, "syntetisk@example.invalid"); assert.equal(result.details?.betaling, "Betaling ikke bekreftet");
  assert.match(result.details?.betalt ?? "", /950,50/); assert.match(result.details?.tid ?? "", /16:30–17:00/);
});
test("bekreftet booking og Stripe-ID blir ikke tolket som faktisk betaling", async () => {
  viewer = { id: "owner", role: "PLAYER" };
  assert.equal((await load("booking", null)).details?.betaling, "Betaling ikke bekreftet");
  payment = "paid"; assert.equal((await load("booking", null)).details?.betaling, "Betaling bekreftet av Stripe");
  stripeFailed = true; assert.equal((await load("booking", null)).details?.betaling, "Betalingsstatus er ikke tilgjengelig");
});
test("aktiv foresatt får gjenkontrollert innsyn; bortfalt relasjon får ingen detaljer", async () => {
  viewer = { id: "parent", role: "PARENT" }; parent = true;
  const result = await load("booking", null); assert.equal(result.bookingsHref, "/forelder/bookinger/booking");
  parent = false; assert.equal((await load("booking", null)).state, "denied");
});
test("avlyst og gjennomført er egne kvitteringstilstander uten betalingsgjetning", async () => {
  viewer = { id: "owner", role: "PLAYER" };
  for (const [raw, expected] of [["PENDING", "pending"], ["CANCELLED", "cancelled"], ["COMPLETED", "completed"]]) {
    status = raw; assert.equal((await load("booking", null)).state, expected);
  }
});
