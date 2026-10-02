import assert from "node:assert/strict";
import { mock, test } from "node:test";
let html = "";
let rejected = false;
let logged = 0;
let templateActive = true;
let templateMissing = false;
let providerThrows = false;
let sentCount = 0;
let bookingOverride: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: {
  booking: { findUnique: async () => ({
    id: "synthetic", user: null, guestName: '<img src="x">', guestEmail: "synthetic@akgolf.test",
    startAt: new Date("2026-10-10T10:30:00Z"), endAt: new Date("2026-10-10T11:30:00Z"), priceOre: 10000, subscriptionId: null,
    serviceType: { name: "Syntetisk time", durationMin: 60 }, location: { name: "Testlokale" },
    ...bookingOverride,
  }) },
  emailTemplate: { findUnique: async () => templateMissing ? null : ({ active: templateActive, subject: "Test", body: "Hei {{name}}\n\n{{time}}\n\n{{refundLine}}" }) },
} } });
mock.module("@/lib/email", { namedExports: {
  FRA_EPOST: "test@akgolf.test", resendKlient: () => ({ emails: { send: async (input: { html: string }) => {
    sentCount++;
    if (providerThrows) throw new Error("Syntetisk transportfeil");
    html = input.html; return { data: null, error: rejected ? { message: "synthetic rejection" } : null };
  } } }),
} });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => { logged++; } } });
test.beforeEach(() => { html = ""; rejected = false; logged = 0; templateActive = true; templateMissing = false; providerThrows = false; sentCount = 0; bookingOverride = {}; });
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

for (const mode of ["deaktivert", "mangler"]) test(`bekreftelse sender ikke når malen er ${mode}`, async () => {
  const { sendBookingConfirmation } = await import("./booking-emails");
  templateActive = mode !== "deaktivert"; templateMissing = mode === "mangler";
  await assert.rejects(() => sendBookingConfirmation("synthetic"), /mangler eller er deaktivert/);
  assert.equal(sentCount, 0); assert.equal(html, "");
});
test("bekreftelse kaster og logger transportfeil uten å late som e-posten er sendt", async () => {
  const { sendBookingConfirmation } = await import("./booking-emails");
  providerThrows = true;
  await assert.rejects(() => sendBookingConfirmation("synthetic"), /transportfeil/);
  assert.equal(sentCount, 1); assert.equal(logged, 1);
});
for (const mode of ["gratis", "klipp", "betalt"]) test(`bekreftelse har riktig betalingsinnhold for ${mode}`, async () => {
  const { sendBookingConfirmation } = await import("./booking-emails");
  bookingOverride = { user: { name: "Syntetisk spiller", email: "spiller@akgolf.test" }, priceOre: mode === "gratis" ? 0 : 95050, subscriptionId: mode === "klipp" ? "synthetic-sub" : null };
  await sendBookingConfirmation("synthetic");
  assert.equal(sentCount, 1); assert.match(html, /Timen er bekreftet/);
  assert.doesNotMatch(html, /Fortsett i PlayerHQ/);
  if (mode === "klipp") { assert.match(html, /1 klipp/); assert.doesNotMatch(html, /950/); }
  else if (mode === "gratis") { assert.match(html, /0 kr/); assert.doesNotMatch(html, /belastes full pris/); }
  else assert.match(html, /950,50 kr/);
});

for (const [start, deadline] of [["2026-03-29T10:30:00Z", "lørdag 28.03.2026 kl. 09:30"], ["2026-10-25T10:30:00Z", "lørdag 24.10.2026 kl. 11:30"]]) test(`bekreftelse bruker faktisk 24-timersfrist ved ${start}`, async () => {
  const { sendBookingConfirmation } = await import("./booking-emails");
  bookingOverride = { startAt: new Date(start), endAt: new Date(new Date(start).getTime() + 3_600_000) };
  await sendBookingConfirmation("synthetic");
  assert.ok(html.includes(deadline));
  assert.match(html, /kl. 10:30–11:30/);
});

test("bekreftelse uten mottaker gjør ingen utsending", async () => {
  const { sendBookingConfirmation } = await import("./booking-emails");
  bookingOverride = { guestEmail: null };
  await sendBookingConfirmation("synthetic");
  assert.equal(sentCount, 0);
});
