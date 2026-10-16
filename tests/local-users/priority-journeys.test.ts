/** Local persistence + real Stripe test refunds. Identity is supplied by the test;
 * Resend HTTP requests are captured locally, not delivered by the real provider.
 */
import assert from "node:assert/strict";
import { before, after, mock, test } from "node:test";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { once } from "node:events";
import { parse } from "dotenv";
import pg from "pg";
import { z } from "zod";
import { assertLocalUsersTargets, assertLocalUsersDatabase } from "../../scripts/local-users-target.mjs";
import { assertStripeTestSettings } from "../../scripts/local-stripe-target.mjs";
const targets = assertLocalUsersTargets(process.env);
const credentials = parse(readFileSync(".codex/environments/brukere/.env.users"));
const stripeSettings = parse(readFileSync(".codex/environments/brukere/.env.stripe-test"));
assertStripeTestSettings(stripeSettings);
Object.assign(process.env, stripeSettings, { NODE_ENV: "development", LOCAL_STRIPE_E2E: "1", RESEND_API_KEY: "re_synthetic_local_only" });
let actor = { id: credentials.LOCAL_COACH_A_ID, role: "COACH" };
const captured: string[] = [];
const mailbox = createServer(async (req, res) => {
  try {
    if (req.method !== "POST" || req.url !== "/emails") { res.writeHead(404).end(); return; }
    const chunks: Buffer[] = []; let length = 0;
    for await (const chunk of req) { length += chunk.length; if (length > 100_000) throw new Error("too large"); chunks.push(chunk); }
    const message = z.object({ to: z.union([z.string(), z.array(z.string())]), html: z.string() }).parse(JSON.parse(Buffer.concat(chunks).toString()));
    const recipients = Array.isArray(message.to) ? message.to : [message.to];
    if (!recipients.every(value => value.endsWith("@akgolf.test"))) throw new Error("Not synthetic");
    captured.push(message.html);
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ id: randomUUID() }));
  } catch { res.writeHead(400).end(); }
});
mock.module("@/lib/auth/requireConsentingUser", { namedExports: { requireConsentingUser: async () => actor } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/google-calendar-kilder", { namedExports: { pushBooking: async () => undefined, fjernBooking: async () => undefined } });
mock.module("@/lib/notifications", { namedExports: { notify: async () => undefined } });
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/booking/metrics", { namedExports: { recordBookingMetric: async () => undefined } });
let db: typeof import("../../src/lib/prisma").prisma;
let actions: typeof import("../../src/app/portal/meg/bookinger/actions");
let stripe: ReturnType<typeof import("../../src/lib/stripe").stripeKlient>;
let template: Awaited<ReturnType<typeof db.emailTemplate.findUnique>>;
const ownBookings: string[] = [];
let subscriptionId: string | undefined;
before(async () => {
  const sql = new pg.Pool({ connectionString: targets.database.toString() });
  try { await assertLocalUsersDatabase(sql); } finally { await sql.end(); }
  mailbox.listen(0, "127.0.0.1"); await once(mailbox, "listening");
  const address = mailbox.address(); assert.ok(address && typeof address !== "string");
  process.env.RESEND_BASE_URL = `http://127.0.0.1:${address.port}`;
  db = (await import("../../src/lib/prisma")).prisma;
  stripe = (await import("../../src/lib/stripe")).stripeKlient();
  // Authenticate before test writes; never fall back to production credentials.
  const check = await stripe.checkout.sessions.list({ limit: 1 });
  assert.ok(check.data.every(session => !session.livemode));
  actions = await import("../../src/app/portal/meg/bookinger/actions");
  template = await db.emailTemplate.findUnique({ where: { slug: "booking-avbestilt" } });
  await db.emailTemplate.upsert({ where: { slug: "booking-avbestilt" },
    create: { slug: "booking-avbestilt", name: "Lokal prøve", subject: "Syntetisk avbestilling", body: "{{name}}\n\n{{refundLine}}", active: true },
    update: { body: "{{name}}\n\n{{refundLine}}", active: true },
  });
});
after(async () => {
  mailbox.closeAllConnections(); await new Promise<void>(resolve => mailbox.close(() => resolve()));
  if (!db) return;
  await db.booking.deleteMany({ where: { id: { in: ownBookings } } });
  if (subscriptionId) await db.subscription.delete({ where: { id: subscriptionId } });
  if (template) await db.emailTemplate.update({ where: { id: template.id }, data: { body: template.body, active: template.active } });
  else await db.emailTemplate.deleteMany({ where: { slug: "booking-avbestilt", name: "Lokal prøve" } });
  await db.$disconnect();
});
test("ekte testbetaling refunderes én gang, med lagret resultat og riktig e-post", async () => {
  const booking = await db.booking.findFirst({ where: {
    serviceTypeId: "local-users-20261001-service", status: "CONFIRMED",
    guestEmail: { startsWith: "stripe-e2e-", endsWith: "@akgolf.test" }, stripePaymentIntentId: { not: null },
  }, orderBy: { createdAt: "desc" }, include: { serviceType: true } });
  assert.ok(booking, "Run the local Stripe checkout journey first");
  assert.ok(booking.coachId?.startsWith("local-users-20261001-"));
  actor = { id: booking.coachId!, role: "COACH" };
  const intent = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId!);
  assert.equal(intent.livemode, false); assert.equal(intent.amount, 10000);
  await actions.cancelBooking(booking.id);
  await actions.cancelBooking(booking.id);
  const refunds = await stripe.refunds.list({ payment_intent: intent.id });
  assert.equal(refunds.data.length, 1); assert.equal(refunds.data[0].amount, 10000); assert.equal(refunds.data[0].status, "succeeded");
  const payments = await db.payment.findMany({ where: { bookingId: booking.id } });
  assert.equal(payments.length, 1); assert.equal(payments[0].status, "REFUNDED");
  assert.equal((await db.webhookFailure.findUniqueOrThrow({ where: { eventId: `booking-refund-${booking.id}` } })).status, "RESOLVED");
  assert.match(captured.at(-1) ?? "", /Refusjon er behandlet/);
  // Keep this synthetic provider/ledger history for inspection.
});
test("to samtidige avbestillinger i ekte lokal database gir ett klipp", async () => {
  actor = { id: credentials.LOCAL_P01_ID, role: "PLAYER" };
  const service = await db.serviceType.findUniqueOrThrow({ where: { id: "local-users-20261001-service" } });
  const source = await db.booking.findFirstOrThrow({ where: { serviceTypeId: service.id } });
  const sub = await db.subscription.create({ data: { userId: actor.id, kind: `SYNTHETIC-${randomUUID()}`, creditsRemaining: 0 } });
  subscriptionId = sub.id;
  const booking = await db.booking.create({ data: {
    userId: actor.id, serviceTypeId: service.id, locationId: source.locationId, subscriptionId: sub.id,
    startAt: new Date("2031-10-01T09:00:00Z"), endAt: new Date("2031-10-01T10:00:00Z"), status: "CONFIRMED", priceOre: 0,
  } });
  ownBookings.push(booking.id);
  await Promise.all([actions.cancelBooking(booking.id), actions.cancelBooking(booking.id)]);
  assert.equal((await db.subscription.findUniqueOrThrow({ where: { id: sub.id } })).creditsRemaining, 1);
  assert.equal((await db.booking.findUniqueOrThrow({ where: { id: booking.id } })).status, "CANCELLED");
});
test("personvernets tørrkjøring lar ekte lokale profil- og treningsrader være uendret", async () => {
  const { anonymiserBruker } = await import("../../src/lib/gdpr/anonymiser-bruker");
  const id = credentials.LOCAL_P01_ID;
  const snapshot = async () => JSON.stringify({
    user: await db.user.findUniqueOrThrow({ where: { id } }),
    sessions: await db.trainingSessionV2.findMany({ where: { studentId: id }, orderBy: { id: "asc" } }),
  });
  const before = await snapshot();
  const result = await anonymiserBruker(id, new Date(), { dryRun: true });
  assert.equal(result.dryRun, true); assert.equal(await snapshot(), before);
});
