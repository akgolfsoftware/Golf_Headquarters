/**
 * Steg 5: gjest flytter og avbestiller fra e-postlenken. Låser at utløpt eller
 * endret lenke avvises, at flytting utenfor coachens tilgjengelighet avvises, og
 * at 24-timersfristen gir riktig utfall for flytting og refusjon.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

process.env.CRON_SECRET = "test-cron-hemmelighet-0123456789";

type Rad = Record<string, unknown> & { startAt: Date; userId: string | null; stripePaymentIntentId: string | null };
let rad: Rad;
let ledig = true;
let oppdateringer: unknown[] = [];
let refusjoner = 0;
let epost: string[] = [];

function lagRad(overstyr: Partial<Rad> = {}): Rad {
  return {
    id: "booking-1", userId: null, coachId: "coach-a", serviceTypeId: "svc-1", facilityId: null,
    startAt: new Date("2030-06-10T10:00:00Z"), endAt: new Date("2030-06-10T11:00:00Z"),
    status: "CONFIRMED", subscriptionId: null, stripePaymentIntentId: "pi_1", priceOre: 120000,
    googleEventId: null, updatedAt: new Date("2030-05-01T00:00:00Z"),
    serviceType: { id: "svc-1", name: "Coaching", durationMin: 60, coachUserId: "coach-a", maksDagerFram: 7 },
    location: { name: "Mulligan" }, coach: { name: "Coach A" },
    ...overstyr,
  };
}

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      booking: { findUnique: async () => rad },
      $transaction: async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          booking: { updateMany: async (args: unknown) => { oppdateringer.push(args); return { count: 1 }; } },
          webhookFailure: { upsert: async () => undefined },
        }),
    },
  },
});
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/booking/availability", {
  namedExports: { isSlotStillAvailable: async () => ledig, getAvailableSlots: async () => [] },
});
mock.module("@/lib/booking/kollisjonsvern", {
  namedExports: { sjekkKollisjon: async () => ({ plassNr: 1 }), erKollisjonsfeil: () => false, kollisjonsmelding: () => "opptatt" },
});
mock.module("@/lib/booking/refund", {
  namedExports: { bookingRefundKey: (id: string) => `booking-refund-${id}`, refundCancelledBooking: async () => { refusjoner += 1; } },
});
mock.module("@/lib/google-calendar-kilder", { namedExports: { pushBooking: async () => undefined, fjernBooking: async () => undefined } });
mock.module("@/lib/email/booking-emails", {
  namedExports: {
    sendBookingRescheduled: async () => { epost.push("flyttet"); },
    sendBookingCancellation: async () => { epost.push("avbestilt"); },
  },
});

const lang = new Date("2030-06-01T10:00:00Z"); // ni dager før
const kort = new Date("2030-06-10T00:00:00Z"); // ti timer før
const nyTid = new Date("2030-06-12T10:00:00Z");

async function moduler() {
  const lenke = await import("./gjest-lenke");
  const endring = await import("./gjest-endring");
  return { ...lenke, ...endring };
}

test.beforeEach(() => {
  rad = lagRad();
  ledig = true;
  oppdateringer = [];
  refusjoner = 0;
  epost = [];
});

test("utløpt eller endret lenke avvises uten endring", async () => {
  const m = await moduler();
  const token = m.signerGjestLenke("booking-1", rad.startAt)!;
  const etter = await m.gjestAvbestillTime(token, new Date("2030-06-11T00:00:00Z"));
  assert.equal(etter.ok, false);
  const fiklet = await m.gjestAvbestillTime(token.slice(0, -3) + "abc", lang);
  assert.equal(fiklet.ok, false);
  assert.equal(oppdateringer.length, 0);
});

test("lenke til en time som er flyttet, avvises", async () => {
  const m = await moduler();
  const token = m.signerGjestLenke("booking-1", rad.startAt)!;
  rad = lagRad({ startAt: new Date("2030-06-11T10:00:00Z") });
  const svar = await m.gjestFlyttTime(token, nyTid, lang);
  assert.equal(svar.ok, false);
  assert.match(svar.melding, /ny tid/);
  assert.equal(oppdateringer.length, 0);
});

test("booking med konto kan ikke endres med gjestelenke", async () => {
  const m = await moduler();
  rad = lagRad({ userId: "spiller-1" });
  const token = m.signerGjestLenke("booking-1", rad.startAt)!;
  assert.equal((await m.hentGjestBooking(token, lang)).ok, false);
});

test("flytting utenfor coachens tilgjengelighet avvises", async () => {
  const m = await moduler();
  ledig = false;
  const token = m.signerGjestLenke("booking-1", rad.startAt)!;
  const svar = await m.gjestFlyttTime(token, nyTid, lang);
  assert.equal(svar.ok, false);
  assert.match(svar.melding, /ikke ledig/);
  assert.equal(oppdateringer.length, 0);
});

test("flytting 24 timer eller mindre før start avvises", async () => {
  const m = await moduler();
  const token = m.signerGjestLenke("booking-1", rad.startAt)!;
  const svar = await m.gjestFlyttTime(token, nyTid, kort);
  assert.equal(svar.ok, false);
  assert.match(svar.melding, /24 timer/);
  assert.equal(oppdateringer.length, 0);
});

test("flytting til ledig tid mer enn 24 timer før lagres og varsler", async () => {
  const m = await moduler();
  const token = m.signerGjestLenke("booking-1", rad.startAt)!;
  const svar = await m.gjestFlyttTime(token, nyTid, lang);
  assert.equal(svar.ok, true);
  assert.equal(oppdateringer.length, 1);
  assert.deepEqual(epost, ["flyttet"]);
});

test("avbestilling mer enn 24 timer før refunderer betalingen", async () => {
  const m = await moduler();
  const token = m.signerGjestLenke("booking-1", rad.startAt)!;
  const svar = await m.gjestAvbestillTime(token, lang);
  assert.equal(svar.ok, true);
  assert.equal(refusjoner, 1);
  assert.match(svar.melding, /tilbake til kortet/);
  assert.deepEqual(epost, ["avbestilt"]);
});

test("avbestilling 24 timer eller mindre før gir ingen refusjon", async () => {
  const m = await moduler();
  const token = m.signerGjestLenke("booking-1", rad.startAt)!;
  const svar = await m.gjestAvbestillTime(token, kort);
  assert.equal(svar.ok, true);
  assert.equal(refusjoner, 0);
  assert.match(svar.melding, /refunderes ikke/);
});
