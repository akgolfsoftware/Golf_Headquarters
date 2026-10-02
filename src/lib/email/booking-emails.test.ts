import assert from "node:assert/strict";
import { mock, test } from "node:test";
let html = "";
let cancellationAt: Date | null = new Date("2026-10-09T07:14:00Z");
let rejected = false;
let logged = 0;
let templateActive = true;
let templateMissing = false;
let providerThrows = false;
let sentCount = 0;
let providerKeys: string[] = [];
let bookingOverride: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: {
  auditLog: { findFirst: async () => cancellationAt ? { createdAt: cancellationAt } : null },
  booking: { findUnique: async () => ({
    id: "synthetic", status: "CONFIRMED", userId: null, user: null, guestName: '<img src="x">', guestEmail: "synthetic@akgolf.test",
    startAt: new Date("2026-10-10T10:30:00Z"), endAt: new Date("2026-10-10T11:30:00Z"), priceOre: 10000, subscriptionId: null,
    serviceType: { name: "Syntetisk time", durationMin: 60 }, location: { name: "Testlokale" },
    ...bookingOverride,
  }) },
  emailTemplate: { findUnique: async () => templateMissing ? null : ({ active: templateActive, subject: "Test", body: "Hei {{name}}\n\n{{time}}\n\n{{refundLine}}" }) },
} } });
mock.module("@/lib/email", { namedExports: {
  FRA_EPOST: "test@akgolf.test", resendKlient: () => ({ emails: { send: async (input: { html: string }, options?: { idempotencyKey?: string }) => {
    if (options?.idempotencyKey) providerKeys.push(options.idempotencyKey);
    sentCount++;
    if (providerThrows) throw new Error("Syntetisk transportfeil");
    html = input.html; return { data: null, error: rejected ? { message: "synthetic rejection" } : null };
  } } }),
} });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => { logged++; } } });
test.beforeEach(() => { html = ""; rejected = false; logged = 0; templateActive = true; templateMissing = false; providerThrows = false; sentCount = 0; providerKeys = []; bookingOverride = {}; cancellationAt = new Date("2026-10-09T07:14:00Z"); });
test("avbestillingsmelding viser refusjon og behandler navn som tekst", async () => {
  const { sendBookingCancellation } = await import("./booking-emails");
  bookingOverride = { status: "CANCELLED" };
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
  bookingOverride = { status: "CANCELLED" };
  await sendBookingCancellation("synthetic", { refundPending: true });
  assert.match(html, /venter på behandling/); assert.doesNotMatch(html, /Refusjon er behandlet|ingen refusjon/);
});

test("gratis avbestilling påstår ikke at kunden overskred fristen", async () => {
  const { sendBookingCancellation } = await import("./booking-emails");
  bookingOverride = { status: "CANCELLED", priceOre: 0 };
  await sendBookingCancellation("synthetic", { lateCancelNoRefund: true });
  assert.match(html, /Timen er avbestilt/); assert.doesNotMatch(html, /etter avbestillingsfristen/);
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

for (const mode of ["deaktivert", "mangler"]) test(`påminnelse sender ikke når malen er ${mode}`, async () => {
  const { sendBookingReminder } = await import("./booking-emails");
  templateActive = mode !== "deaktivert"; templateMissing = mode === "mangler";
  await assert.rejects(() => sendBookingReminder("synthetic"), /mangler eller er deaktivert/);
  assert.equal(sentCount, 0);
});
test("påminnelse behandler returnert leverandørfeil som mislykket", async () => {
  const { sendBookingReminder } = await import("./booking-emails"); rejected = true;
  await assert.rejects(() => sendBookingReminder("synthetic"), /avviste/); assert.equal(logged, 1);
});
for (const state of ["CANCELLED", "COMPLETED", "PENDING"]) test(`påminnelse sendes ikke for ${state}`, async () => {
  const { sendBookingReminder } = await import("./booking-emails"); bookingOverride = { status: state };
  assert.equal(await sendBookingReminder("synthetic"), false); assert.equal(sentCount, 0);
});
test("påminnelse uten mottaker melder ikke sendt", async () => {
  const { sendBookingReminder } = await import("./booking-emails"); bookingOverride = { guestEmail: null };
  assert.equal(await sendBookingReminder("synthetic"), false); assert.equal(sentCount, 0);
});
for (const mode of ["gratis", "klipp", "betalt"]) test(`påminnelse har riktig ${mode}-regel ved nøyaktig 24 timer`, async () => {
  const { sendBookingReminder } = await import("./booking-emails");
  bookingOverride = { userId: "synthetic-player", user: { name: "Syntetisk", email: "spiller@akgolf.test" }, priceOre: mode === "gratis" ? 0 : 95050, subscriptionId: mode === "klipp" ? "synthetic-sub" : null };
  assert.equal(await sendBookingReminder("synthetic", new Date("2026-10-09T08:30:00Z")), true);
  assert.equal(sentCount, 1); assert.match(html, /Vi ses i morgen/); assert.match(html, /Se bookingen i PlayerHQ/);
  if (mode === "gratis") { assert.match(html, /Timen er gratis/); assert.doesNotMatch(html, /belastes|Gratis avbestilling er ikke/); }
  else if (mode === "klipp") { assert.match(html, /tilbakeføres ikke klippet/); assert.doesNotMatch(html, /full pris/); }
  else { assert.match(html, /950,50 kr/); assert.match(html, /Gratis avbestilling er ikke lenger mulig/); }
});
test("påminnelse viser riktig frist over vintertid og trygg gjestekontakt", async () => {
  const { sendBookingReminder } = await import("./booking-emails");
  bookingOverride = { startAt: new Date("2026-10-25T10:30:00Z"), endAt: new Date("2026-10-25T11:30:00Z") };
  await sendBookingReminder("synthetic", new Date("2026-10-24T08:30:00Z"));
  assert.match(html, /24.10.2026 kl. 11:30/); assert.match(html, /kl. 10:30–11:30/);
  assert.match(html, /mailto:post@akgolf.no/); assert.doesNotMatch(html, /booking\/kvittering\//);
});
test("påminnelse lover ikke i morgen når tidspunktet er en annen dag", async () => {
  const { sendBookingReminder } = await import("./booking-emails");
  await sendBookingReminder("synthetic", new Date("2026-10-08T08:30:00Z"));
  assert.doesNotMatch(html, /i morgen/); assert.match(html, /Påminnelse om timen/);
});

for (const method of ["sendBookingConfirmation", "sendBookingReminder"] as const) test(`${method} viser bestilt varighet selv om tjenestekatalogen er endret`, async () => {
  const senders = await import("./booking-emails");
  bookingOverride = { serviceType: { name: "Syntetisk time", durationMin: 45 } };
  await senders[method]("synthetic");
  assert.match(html, /Syntetisk time 60 min/); assert.doesNotMatch(html, /Syntetisk time 45 min/);
});

test("flyttet booking etter kandidatutvalg gir ingen utdatert påminnelse", async () => {
  const { sendBookingReminder } = await import("./booking-emails");
  assert.equal(await sendBookingReminder("synthetic", new Date("2026-10-09T08:30:00Z"), new Date("2026-10-10T12:30:00Z")), false);
  assert.equal(sentCount, 0);
});
test("gjentatte forsøk bruker samme leverandørnøkkel; ny tid har egen nøkkel", async () => {
  const { sendBookingReminder } = await import("./booking-emails");
  const now = new Date("2026-10-09T08:30:00Z");
  await Promise.all([sendBookingReminder("synthetic", now), sendBookingReminder("synthetic", now)]);
  assert.deepEqual(providerKeys, ["booking-reminder/synthetic/2026-10-10T10:30:00.000Z", "booking-reminder/synthetic/2026-10-10T10:30:00.000Z"]);
  bookingOverride = { startAt: new Date("2026-10-11T10:30:00Z"), endAt: new Date("2026-10-11T11:30:00Z") };
  await sendBookingReminder("synthetic", now);
  assert.notEqual(providerKeys[2], providerKeys[0]);
});

test("avbestilling viser faktisk historikktid i Oslo og bestilt veggklokke", async () => {
  const { sendBookingCancellation } = await import("./booking-emails");
  bookingOverride = { status: "CANCELLED", serviceType: { name: "Syntetisk time", durationMin: 45 } };
  await sendBookingCancellation("synthetic");
  assert.match(html, /09.10.2026 kl. 09:14/);
  assert.match(html, /10:30–11:30/);
  assert.match(html, /Syntetisk time 60 min/);
  assert.doesNotMatch(html, /etter avbestillingsfristen|Refusjon er behandlet/);
});
test("manglende avbestillingshistorikk blir ukjent, ikke dagens klokke", async () => {
  const { sendBookingCancellation } = await import("./booking-emails");
  bookingOverride = { status: "CANCELLED" }; cancellationAt = null;
  await sendBookingCancellation("synthetic");
  assert.match(html, />—</); assert.doesNotMatch(html, /09:14/);
});
for (const state of ["CONFIRMED", "COMPLETED", "PENDING"]) test(`avbestilling sendes ikke for ${state}`, async () => {
  const { sendBookingCancellation } = await import("./booking-emails");
  bookingOverride = { status: state };
  await sendBookingCancellation("synthetic"); assert.equal(sentCount, 0);
});
test("avbestilling uten mottaker sender ingen melding", async () => {
  const { sendBookingCancellation } = await import("./booking-emails");
  bookingOverride = { status: "CANCELLED", guestEmail: null };
  await sendBookingCancellation("synthetic"); assert.equal(sentCount, 0);
});
for (const mode of ["deaktivert", "mangler"]) test(`avbestilling respekterer ${mode} mal`, async () => {
  const { sendBookingCancellation } = await import("./booking-emails");
  bookingOverride = { status: "CANCELLED" }; templateActive = mode !== "deaktivert"; templateMissing = mode === "mangler";
  await assert.rejects(() => sendBookingCancellation("synthetic"), /mangler eller er deaktivert/); assert.equal(sentCount, 0);
});
for (const mode of ["avvist", "transport"]) test(`avbestilling melder ${mode} leverandørfeil`, async () => {
  const { sendBookingCancellation } = await import("./booking-emails");
  bookingOverride = { status: "CANCELLED" }; rejected = mode === "avvist"; providerThrows = mode === "transport";
  await assert.rejects(() => sendBookingCancellation("synthetic")); assert.equal(logged, 1);
});
test("avbestilling bevarer øre og skiller gjenopprettet klipp fra pengebetaling", async () => {
  const { sendBookingCancellation } = await import("./booking-emails");
  bookingOverride = { status: "CANCELLED", priceOre: 95050 };
  await sendBookingCancellation("synthetic", { refundIssued: true }); assert.match(html, /950,50 kr/);
  bookingOverride = { ...bookingOverride, subscriptionId: "synthetic-sub", subscription: { creditsRemaining: 6, monthlyCredits: 4 } };
  await sendBookingCancellation("synthetic", { isCreditBooking: true });
  assert.match(html, /6 klipp igjen/); assert.doesNotMatch(html, /6 av 4|950,50|til kortet/);
});
