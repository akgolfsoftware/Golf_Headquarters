import assert from "node:assert/strict";
import { mock, test } from "node:test";
let html = "";
let rejected = false;
let logged = 0;
let templateActive = true;
mock.module("@/lib/prisma", { namedExports: { prisma: {
  booking: { findUnique: async () => ({
    id: "synthetic", user: null, guestName: '<img src="x">', guestEmail: "synthetic@akgolf.test",
    startAt: new Date("2026-10-10T10:30:00Z"), endAt: new Date("2026-10-10T11:30:00Z"), priceOre: 10000, subscriptionId: null,
    serviceType: { name: "Syntetisk time", durationMin: 60 }, location: { name: "Testlokale" },
  }) },
  emailTemplate: { findUnique: async () => ({ active: templateActive, subject: "Test", body: "Hei {{name}}\n\n{{time}}\n\n{{refundLine}}" }) },
} } });
mock.module("@/lib/email", { namedExports: {
  FRA_EPOST: "test@akgolf.test", resendKlient: () => ({ emails: { send: async (input: { html: string }) => {
    html = input.html; return { data: null, error: rejected ? { message: "synthetic rejection" } : null };
  } } }),
} });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => { logged++; } } });
test.beforeEach(() => { html = ""; rejected = false; logged = 0; templateActive = true; });
test("avbestillingsmelding viser refusjon og behandler navn som tekst", async () => {
  const { sendBookingCancellation } = await import("./booking-emails");
  await sendBookingCancellation("synthetic", { refundIssued: true });
  assert.match(html, /Refusjon er behandlet/); assert.doesNotMatch(html, /ingen refusjon/);
  assert.doesNotMatch(html, /<img/); assert.match(html, /&lt;img/); assert.match(html, /10:30/);
});
test("leverandørens returnerte feil logges og kastes", async () => {
  const { sendBookingConfirmation } = await import("./booking-emails");
  rejected = true;
  await assert.rejects(() => sendBookingConfirmation("synthetic"), /avviste/);
  assert.equal(logged, 1);
});
test("ventende refusjon lover ikke at pengene allerede er tilbakeført", async () => {
  const { sendBookingCancellation } = await import("./booking-emails");
  await sendBookingCancellation("synthetic", { refundPending: true });
  assert.match(html, /venter på behandling/); assert.doesNotMatch(html, /Refusjon er behandlet|ingen refusjon/);
});

test("gratis avbestilling påstår ikke at kunden overskred fristen", async () => {
  const { sendBookingCancellation } = await import("./booking-emails");
  await sendBookingCancellation("synthetic");
  assert.match(html, /Bookingen er avbestilt/); assert.doesNotMatch(html, /etter avbestillingsfristen/);
});


test("flyttet time behandler returnert leverandørfeil som mislykket sending", async () => {
  const { sendBookingRescheduled } = await import("./booking-emails");
  rejected = true;
  await assert.rejects(() => sendBookingRescheduled("synthetic", new Date("2026-10-09T10:30:00Z")), /avviste/);
  assert.equal(logged, 1);
});

test("flyttet time bruker ny mal og behandler navn som tekst", async () => {
  const { sendBookingRescheduled } = await import("./booking-emails");
  await sendBookingRescheduled("synthetic", new Date("2026-10-09T10:30:00Z"));
  assert.match(html, /Timen er flyttet/);
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img/);
  assert.equal(logged, 0);
});


test("deaktivert flyttevarsel sender ikke e-post med den nye malen", async () => {
  const { sendBookingRescheduled } = await import("./booking-emails");
  templateActive = false;
  await assert.rejects(() => sendBookingRescheduled("synthetic", new Date("2026-10-09T10:30:00Z")), /deaktivert/);
  assert.equal(html, "");
});
