import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import type Stripe from "stripe";

const cookieverdier = new Map<string, string>();
const cookievalg: Record<string, unknown>[] = [];
let betaling: Stripe.Checkout.SessionCreateParams | null = null;
let bookingEier: string | null = null;
let rolle = "PARENT";
let godkjentRelasjon = true;
const cookieJar = {
  set: (name: string, value: string, options: Record<string, unknown>) => { cookieverdier.set(name, value); cookievalg.push(options); },
  get: (name: string) => { const value = cookieverdier.get(name); return value ? { value } : undefined; },
};
mock.module("server-only", { defaultExport: {} });
mock.module("next/headers", { namedExports: { cookies: async () => cookieJar } });
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: rolle === "PARENT" ? "syntetisk-forelder" : "syntetisk-spiller", role: rolle, email: "konto@example.test" }) } });
mock.module("@/lib/forelder", { namedExports: { hentBarnHvisTilhoerer: async (_parent: string, child: string) => godkjentRelasjon ? { id: child } : null } });
mock.module("@/lib/portal-booking/slot-vindu", { namedExports: { beregnSlotVindu: async () => ({}) } });
mock.module("@/lib/booking/credit-booking", { namedExports: { createCreditBooking: async () => ({}) } });
mock.module("@/lib/booking/credits-tilgang", { namedExports: { kanBrukeCredits: () => false } });
mock.module("@/lib/booking/availability", { namedExports: { isSlotStillAvailable: async () => true } });
mock.module("@/lib/booking/payment-start", { namedExports: { startBookingPayment: async (_id: string, params: Stripe.Checkout.SessionCreateParams) => { betaling = params; return { ok: true, url: "https://checkout.example.test/syntetisk" }; } } });
mock.module("@/lib/booking/kollisjonsvern", { namedExports: { sjekkKollisjon: async () => ({ plassNr: 1 }), erKollisjonsfeil: () => false, kollisjonsmelding: () => "Kollisjon" } });
mock.module("@/lib/booking/slot-hold", { namedExports: { acquireHold: async () => ({ ok: true }), releaseHold: async () => {}, DEFAULT_HOLD_TTL_MS: 1000 } });
mock.module("@/lib/booking/metrics", { namedExports: { recordBookingMetric: async () => {} } });
mock.module("@/lib/app-url", { namedExports: { APP_URL: "https://app.example.test" } });
const booking = { create: async ({ data }: { data: { userId: string } }) => { bookingEier = data.userId; return { id: "syntetisk-booking" }; } };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  serviceType: { findUnique: async () => ({ id: "tjeneste", active: true, priceOre: 100000, durationMin: 50, coachUserId: "syntetisk-coach", name: "Syntetisk time", slug: "coaching" }) },
  location: { findFirst: async () => ({ id: "syntetisk-sted", name: "Syntetisk anlegg" }) },
  $transaction: async (run: (tx: { booking: typeof booking }) => Promise<unknown>) => run({ booking }),
} } });

let opprett: typeof import("@/app/portal/booking/actions").opprettBookingMedKort;
let les: typeof import("./forelder-retur").lesForelderBookingRetur;
let lagRetur: typeof import("./forelder-retur").opprettForelderBookingRetur;
before(async () => {
  opprett = (await import("@/app/portal/booking/actions")).opprettBookingMedKort;
  ({ lesForelderBookingRetur: les, opprettForelderBookingRetur: lagRetur } = await import("./forelder-retur"));
});
beforeEach(() => { cookieverdier.clear(); cookievalg.length = 0; betaling = null; bookingEier = null; rolle = "PARENT"; godkjentRelasjon = true; });
const input = { serviceTypeId: "tjeneste", coachId: "syntetisk-coach", startIso: "2099-01-01T10:00:00Z", barnId: "syntetisk-barn", retururlBase: "/forelder/bookinger" };
function betalingsLenker() {
  assert.ok(betaling?.success_url && betaling.cancel_url);
  return { success: new URL(betaling.success_url), cancel: new URL(betaling.cancel_url) };
}

test("begge foreldrereturer bruker samme tilfeldige referanse uten barn-ID i Stripe-URL", async () => {
  assert.equal((await opprett(input)).ok, true);
  const { success, cancel } = betalingsLenker();
  const retur = success.searchParams.get("retur");
  assert.ok(retur); assert.equal(cancel.searchParams.get("retur"), retur);
  assert.equal(success.pathname, "/forelder/bookinger"); assert.equal(cancel.pathname, "/forelder/bookinger");
  assert.equal(success.searchParams.get("betalt"), "1"); assert.equal(cancel.searchParams.get("avbrutt"), "1");
  assert.equal(success.searchParams.has("barn"), false); assert.equal(cancel.searchParams.has("barn"), false);
  assert.ok(!success.href.includes(input.barnId) && !cancel.href.includes(input.barnId));
  assert.equal(bookingEier, input.barnId); assert.equal(betaling?.metadata?.paaVegneAv, input.barnId);
  assert.equal(await les(retur, "syntetisk-forelder", [input.barnId]), input.barnId);
  assert.deepEqual(cookievalg[0], { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/forelder/bookinger", maxAge: 2100 });
});

test("returreferansen gir aldri annet barn eller annen foresatt tilgang", async () => {
  const retur = await lagRetur("syntetisk-forelder", "syntetisk-barn");
  assert.equal(await les(retur, "annen-forelder", ["syntetisk-barn"]), null);
  assert.equal(await les(retur, "syntetisk-forelder", ["annet-barn"]), null);
  assert.equal(await les(retur, "syntetisk-forelder", []), null);
});

test("parallelle betalinger bevarer hvert sitt barn", async () => {
  await opprett(input); const forste = betalingsLenker().success.searchParams.get("retur");
  await opprett({ ...input, barnId: "syntetisk-barn-to" }); const andre = betalingsLenker().success.searchParams.get("retur");
  assert.notEqual(forste, andre);
  const barn = [input.barnId, "syntetisk-barn-to"];
  assert.equal(await les(forste, "syntetisk-forelder", barn), input.barnId);
  assert.equal(await les(andre, "syntetisk-forelder", barn), "syntetisk-barn-to");
});

test("utløpt, manipulert eller ukjent cookie gir ingen automatisk barnekontekst", async () => {
  const retur = await lagRetur("syntetisk-forelder", "syntetisk-barn");
  const key = `ak-booking-retur-${retur}`;
  cookieverdier.set(key, JSON.stringify({ parentId: "syntetisk-forelder", childId: "syntetisk-barn", expiresAt: Date.now() - 1 }));
  assert.equal(await les(retur, "syntetisk-forelder", ["syntetisk-barn"]), null);
  cookieverdier.set(key, JSON.stringify({ parentId: "syntetisk-forelder", childId: "syntetisk-barn", expiresAt: Date.now() + 86_400_000 }));
  assert.equal(await les(retur, "syntetisk-forelder", ["syntetisk-barn"]), null);
  cookieverdier.set(key, "ugyldig-json"); assert.equal(await les(retur, "syntetisk-forelder", ["syntetisk-barn"]), null);
  cookieverdier.delete(key); assert.equal(await les(retur, "syntetisk-forelder", ["syntetisk-barn"]), null);
  assert.equal(await les([retur], "syntetisk-forelder", ["syntetisk-barn"]), null);
});

test("avvist forelderrelasjon starter verken retur eller betaling", async () => {
  godkjentRelasjon = false;
  assert.equal((await opprett(input)).ok, false);
  assert.equal(betaling, null); assert.equal(bookingEier, null); assert.equal(cookieverdier.size, 0);
});

test("spillerbooking beholder eksisterende portalretur uten foreldrecookie", async () => {
  rolle = "PLAYER";
  await opprett({ ...input, barnId: undefined, retururlBase: undefined });
  const { success, cancel } = betalingsLenker();
  assert.equal(success.href, "https://app.example.test/portal/booking?betalt=1");
  assert.equal(cancel.href, "https://app.example.test/portal/booking?avbrutt=1");
  assert.equal(cookieverdier.size, 0); assert.equal(bookingEier, "syntetisk-spiller");
});

test("vilkårlig returbase kan ikke sende til annet domene", async () => {
  await opprett({ ...input, retururlBase: "https://annen.example.test/retur" });
  const { success, cancel } = betalingsLenker();
  assert.equal(success.origin, "https://app.example.test"); assert.equal(cancel.origin, "https://app.example.test");
  assert.equal(success.pathname, "/portal/booking"); assert.equal(cookieverdier.size, 0);
});
