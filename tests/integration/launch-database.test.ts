/** Real, isolated Postgres. Auth identity and outbound integrations are controlled test doubles. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mock, test } from "node:test";

const connection = process.env.LAUNCH_TEST_DATABASE_URL;
if (!connection) throw new Error("LAUNCH_TEST_DATABASE_URL is required; production defaults are forbidden");
const target = new URL(connection);
if (target.hostname !== "127.0.0.1" || target.port !== "54379" || target.pathname !== "/ak_hq_launch_tests") {
  throw new Error("Only the isolated loopback launch database is allowed");
}
process.env.DATABASE_URL = connection;
process.env.DIRECT_URL = connection;
let identity = "";
let failNotification = false;
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: identity } } }) } }) } });
mock.module("next/navigation", { namedExports: { redirect: (path: string) => { throw new Error(`Redirect: ${path}`); } } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/notifications", { namedExports: { notify: async () => { if (failNotification) throw new Error("syntetisk varslingsfeil"); } } });
mock.module("@/lib/admin/stallen-data", { namedExports: { loadStallen: async () => [] } });
mock.module("@/lib/google-calendar", { namedExports: { getCalendarBusy: async () => ({ ok: true, busy: [] }) } });
mock.module("@/lib/google-calendar-kilder", { namedExports: { pushBooking: async () => undefined } });
mock.module("@/lib/email/booking-emails", { namedExports: { sendBookingConfirmation: async () => undefined } });
mock.module("@/lib/booking/varsle-ny-booking", { namedExports: { varsleNyBooking: async () => undefined } });

mock.module("@/lib/audit", { namedExports: { audit: async () => { if (failNotification) throw new Error("syntetisk loggfeil"); } } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });

test("lanseringsreiser mot isolert Postgres", async t => {
  const { prisma } = await import("@/lib/prisma");
  const { loadGoalForViewer } = await import("@/lib/portal/goals/detail-data");
  const { createCreditBooking } = await import("@/lib/booking/credit-booking");
  const { sjekkKollisjon } = await import("@/lib/booking/kollisjonsvern");
  const wb = await import("@/lib/workbench/wb-actions");
  const { saveTnTest } = await import("@/app/portal/tren/tester/team-norway/actions");
  const { loadSpillerTesterData } = await import("@/lib/admin/spiller-tester-data");
  const { hentBarnHvisTilhoerer } = await import("@/lib/forelder");
  const { getAvailableSlots, isSlotStillAvailable } = await import("@/lib/booking/availability");
  const { recordCheckoutSession, recordPaymentIntent, recordChargeRefund } = await import("@/lib/payments/record");
  const prefix = `launch-${randomUUID()}`;
  const users = await Promise.all((["COACH", "COACH", "PLAYER", "PLAYER", "PARENT", "PARENT"] as const).map((role, index) => prisma.user.create({ data: {
    id: `${prefix}-${index}`, authId: randomUUID(), email: `${prefix}-${index}@example.test`, name: `Test ${role} ${index}`, role,
    trialEndsAt: new Date("2099-01-01"), lastLoginAt: new Date(),
  } })));
  const [coach, otherCoach, player, otherPlayer, parent, otherParent] = users;
  const location = await prisma.location.create({ data: { name: "Gamle Fredrikstad GK", address: "Test" } });
  const service = await prisma.serviceType.create({ data: { slug: prefix, name: "Testtime", priceOre: 10000, durationMin: 30 } });
  await prisma.playerEnrollment.create({ data: { userId: player.id, coachId: coach.id, program: "AK_ACADEMY" } });
  await prisma.parentRelation.create({ data: { parentId: parent.id, childId: player.id, approved: true } });
  try {
    await t.test("to samtidige bestillinger: bare én får samme plass", async () => {
      const startAt = new Date("2090-05-01T10:00:00Z"), endAt = new Date("2090-05-01T10:30:00Z");
      const book = () => prisma.$transaction(async tx => {
        const guard = await sjekkKollisjon(tx, { coachId: coach.id, serviceTypeId: service.id, startAt, endAt });
        return tx.booking.create({ data: { coachId: coach.id, serviceTypeId: service.id, locationId: location.id, startAt, endAt, plassNr: guard.plassNr, priceOre: 10000 } });
      });
      const results = await Promise.allSettled([book(), book()]);
      assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
      assert.equal(await prisma.booking.count({ where: { serviceTypeId: service.id } }), 1);
    });
    await t.test("ledig coach skjules ikke av annen coach; direkte bestilling må treffe tilbudt tid", async () => {
      const date = new Date(2090, 4, 1, 12);
      await prisma.coachAvailability.createMany({ data: [coach, otherCoach].map(c => ({ coachId: c.id, date, startTime: "10:00", endTime: "11:00" })) });
      const slots = await getAvailableSlots(service.id, date);
      assert.ok(slots.some(s => s.coachId === otherCoach.id && s.start.getHours() === 10));
      assert.equal(await isSlotStillAvailable(service.id, new Date(2090, 4, 1, 9), otherCoach.id), false);
      assert.equal(await isSlotStillAvailable(service.id, new Date(2090, 4, 1, 10), otherCoach.id), true);
      await prisma.serviceType.update({ where: { id: service.id }, data: { active: false } });
      assert.equal(await isSlotStillAvailable(service.id, new Date(2090, 4, 1, 10), otherCoach.id), false);
      await prisma.serviceType.update({ where: { id: service.id }, data: { active: true } });
    });
    await t.test("delte økter har riktig kapasitet og respekterer fast coach", async () => {
      await prisma.serviceType.update({ where: { id: service.id }, data: { maxDeltakere: 2, coachUserId: coach.id } });
      const when = new Date(2090, 4, 1, 10);
      const slots = await getAvailableSlots(service.id, when);
      assert.ok(slots.some(s => s.start.getTime() === when.getTime()));
      assert.ok(slots.every(s => s.coachId === coach.id));
      await prisma.$transaction(async tx => {
        const endAt = new Date(when.getTime() + 30 * 60000);
        const guard = await sjekkKollisjon(tx, { coachId: coach.id, serviceTypeId: service.id, startAt: when, endAt });
        assert.equal(guard.plassNr, 2);
        await tx.booking.create({ data: { coachId: coach.id, serviceTypeId: service.id, locationId: location.id, startAt: when, endAt, plassNr: guard.plassNr, priceOre: 10000 } });
      });
      assert.equal(await isSlotStillAvailable(service.id, when, coach.id), false);
      await prisma.serviceType.update({ where: { id: service.id }, data: { maxDeltakere: 1, coachUserId: null } });
    });
    await t.test("abonnement beholder valgt coach, trekker siste time én gang og tåler varslingsfeil", async () => {
      identity = parent.authId;
      const subscription = await prisma.subscription.create({ data: { userId: player.id, kind: "COACHING", plan: "PERFORMANCE", monthlyCredits: 2, creditsRemaining: 1 } });
      const input = { serviceTypeId: service.id, coachId: otherCoach.id, barnId: player.id, start: "2090-05-01T10:30:00" };
      identity = otherParent.authId;
      await assert.rejects(createCreditBooking(input), /ikke koblet/);
      assert.equal((await prisma.subscription.findUniqueOrThrow({ where: { id: subscription.id } })).creditsRemaining, 1);
      identity = parent.authId;
      failNotification = true;
      try {
        const results = await Promise.allSettled([createCreditBooking(input), createCreditBooking(input)]);
        assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
        const bookings = await prisma.booking.findMany({ where: { subscriptionId: subscription.id } });
        assert.equal(bookings.length, 1);
        assert.equal(bookings[0].coachId, otherCoach.id);
        assert.equal(bookings[0].userId, player.id);
        assert.equal(bookings[0].status, "CONFIRMED");
        assert.equal((await prisma.subscription.findUniqueOrThrow({ where: { id: subscription.id } })).creditsRemaining, 0);
      } finally { failNotification = false; }
    });
    await t.test("coach → utkast → publisert → spiller → fullført med samme innhold", async () => {
      identity = coach.authId;
      const created = await wb.createSession({ playerId: player.id, date: "2090-05-01", startMinute: 600, durationMinutes: 30, title: "Kontrolløkt", pyramid: "SLAG", blockType: "OEKT", drills: [] });
      assert.ok(created.ok); if (!created.ok) return;
      const id = created.data.id;
      identity = player.authId;
      assert.deepEqual(await wb.loadPlayerSession(id), { ok: true, data: null });
      identity = coach.authId;
      assert.equal((await wb.publishSessions([id])).ok, true);
      identity = player.authId;
      const day = await wb.loadPlayerDay({ playerId: player.id, date: "2090-05-01" });
      assert.ok(day.ok && day.data.sessions.some(s => s.id === id));
      assert.equal((await wb.startSession(id)).ok, true);
      assert.equal((await wb.completeSession(id)).ok, true);
      const stored = await prisma.workbenchSession.findUniqueOrThrow({ where: { id } });
      assert.equal(stored.status, "COMPLETED"); assert.equal(stored.title, "Kontrolløkt");
      const afterDay = await wb.loadPlayerDay({ playerId: player.id, date: "2090-05-01" });
      assert.ok(afterDay.ok);
      if (afterDay.ok) {
        assert.equal(afterDay.data.nextSessionId, null);
        assert.equal(afterDay.data.sessions.find(s => s.id === id)?.status, "COMPLETED");
      }
      const detail = await wb.loadPlayerSession(id);
      assert.ok(detail.ok && detail.data?.status === "COMPLETED");
      await prisma.workbenchSession.update({ where: { id }, data: { hiddenByPlayer: true } });
      assert.deepEqual(await wb.loadPlayerSession(id), { ok: true, data: null });
      const hiddenDay = await wb.loadPlayerDay({ playerId: player.id, date: "2090-05-01" });
      assert.ok(hiddenDay.ok && !hiddenDay.data.sessions.some(s => s.id === id));
      assert.equal((await wb.startSession(id)).ok, false);
      identity = otherPlayer.authId;
      assert.equal((await wb.completeSession(id)).ok, false);
    });
    await t.test("coach og forelder får bare egne tilknyttede spillere", async () => {
      assert.ok(await loadSpillerTesterData(player.id, coach));
      assert.equal(await loadSpillerTesterData(player.id, otherCoach), null);
      assert.ok(await hentBarnHvisTilhoerer(parent.id, player.id));
      assert.equal(await hentBarnHvisTilhoerer(otherParent.id, player.id), null);
    });
    await t.test("mål krever spillerrelasjon og bruker mål-eierens handicap", async () => {
      await prisma.user.update({ where: { id: player.id }, data: { hcp: 8 } });
      await prisma.user.update({ where: { id: coach.id }, data: { hcp: 2 } });
      const goal = await prisma.goal.create({ data: { userId: player.id, type: "HCP_TARGET", title: "Testmål", targetValue: 5 } });
      assert.equal(await loadGoalForViewer(goal.id, otherCoach), null);
      assert.equal(await loadGoalForViewer(goal.id, otherPlayer), null);
      assert.equal(await loadGoalForViewer(goal.id, parent), null);
      assert.equal((await loadGoalForViewer(goal.id, coach))?.hcp, 8);
      assert.equal((await loadGoalForViewer(goal.id, player))?.hcp, 8);
    });
    await t.test("TN-utkast tåler samtidige forespørsler og gir ett fullført resultat", async () => {
      identity = player.authId;
      const sessionId = randomUUID();
      const input = { sessionId, protocolId: "putt-1-3m", count: 25, revision: 0, values: {}, notes: "", intent: "draft" as const };
      assert.equal((await saveTnTest(input)).ok, true);
      const full = { ...input, revision: 1, intent: "complete" as const, values: Object.fromEntries(Array.from({ length: 25 }, (_, i) => [String(i + 1), { strokes: 1 }])) };
      await Promise.all([saveTnTest(full), saveTnTest(full)]);
      assert.equal(await prisma.testResult.count({ where: { userId: player.id } }), 1);
      assert.equal((await prisma.testSession.findUniqueOrThrow({ where: { id: sessionId } })).status, "COMPLETED");
      assert.equal((await saveTnTest(full)).ok, true);
    });
    await t.test("forsinket ubetalt hendelse kan ikke nedgradere lagret betaling", async () => {
      const base = { id: `${prefix}-checkout`, mode: "payment", payment_intent: `${prefix}-intent`, payment_status: "paid", amount_total: 10000, currency: "nok", metadata: { userId: player.id }, created: 1 } as unknown as import("stripe").default.Checkout.Session;
      await recordCheckoutSession(base);
      await recordCheckoutSession({ ...base, payment_status: "unpaid" }, true);
      const payment = await prisma.payment.findUniqueOrThrow({ where: { stripeSessionId: base.id } });
      assert.equal(payment.status, "SUCCEEDED");
    });
    await t.test("betalingshendelser i begge rekkefølger og refusjon gir én varig betalingsrad", async () => {
      for (const order of ["intent-first", "session-first", "concurrent"]) {
        const pi = `${prefix}-${order}`;
        const session = { id: `${pi}-session`, mode: "payment", payment_intent: pi, payment_status: "paid", amount_total: 10000, currency: "nok", metadata: { userId: player.id }, created: 1 } as unknown as import("stripe").default.Checkout.Session;
        const intent = { id: pi, status: "succeeded", amount: 10000, currency: "nok", metadata: { userId: player.id }, created: 1 } as unknown as import("stripe").default.PaymentIntent;
        if (order === "intent-first") { await recordPaymentIntent(intent); await recordCheckoutSession(session); }
        else if (order === "session-first") { await recordCheckoutSession(session); await recordPaymentIntent(intent); }
        else await Promise.all([recordCheckoutSession(session), recordPaymentIntent(intent)]);
        assert.equal(await prisma.payment.count({ where: { OR: [{ stripePaymentIntentId: pi }, { stripeSessionId: session.id }] } }), 1);
        const refund = { id: `${pi}-charge`, payment_intent: pi, amount: 10000, amount_refunded: 10000, currency: "nok", created: 1 } as unknown as import("stripe").default.Charge;
        await recordChargeRefund(refund);
        await recordPaymentIntent(intent);
        await recordCheckoutSession(session);
        await recordChargeRefund({ ...refund, amount_refunded: 2500 });
        const payment = await prisma.payment.findUniqueOrThrow({ where: { stripePaymentIntentId: pi } });
        assert.equal(payment.status, "REFUNDED"); assert.equal(payment.amountRefundedOre, 10000);
        assert.equal(payment.stripeSessionId, session.id);
      }
    });
  } finally {
    await prisma.payment.deleteMany({ where: { userId: { in: users.map(u => u.id) } } });
    await prisma.booking.deleteMany({ where: { serviceTypeId: service.id } });
    await prisma.workbenchSession.deleteMany({ where: { playerId: { in: users.map(u => u.id) } } });
    await prisma.user.deleteMany({ where: { id: { in: users.map(u => u.id) } } });
    await prisma.serviceType.delete({ where: { id: service.id } });
    await prisma.location.delete({ where: { id: location.id } });
    await prisma.$disconnect();
  }
});
