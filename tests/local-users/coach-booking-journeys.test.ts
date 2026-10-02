/** Actual actions and local PostgreSQL; identity, notifications and provider calls are test boundaries. */
import assert from "node:assert/strict";
import { before, after, mock, test } from "node:test";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { assertLocalUsersTargets, assertLocalUsersDatabase } from "../../scripts/local-users-target.mjs";
import type { UserRole } from "../../src/generated/prisma/client";

const targets = assertLocalUsersTargets(process.env);
const prefix = `local-coach-booking-${randomUUID()}`;
const identity = new AsyncLocalStorage<{ id: string; role: UserRole; name: string }>();
const sql = new pg.Pool({ connectionString: targets.database.toString() });
const id = (part: string) => `${prefix}-${part}`;
const sent: unknown[] = [];
let attempts = 0;
let failRefund = false;
let db: typeof import("../../src/lib/prisma").prisma;
let actions: typeof import("../../src/app/admin/bookinger/actions");
let calendar: typeof import("../../src/app/admin/(legacy)/calendar/actions");
let proposals: typeof import("../../src/app/admin/kalender/flytt-actions");
let playerActions: typeof import("../../src/app/portal/booking/[bookingId]/actions");
let data: typeof import("../../src/app/admin/bookinger/data");
const actor = (who = "coach") => ({ id: id(who), role: (who === "player" ? "PLAYER" : "COACH") as UserRole, name: "Syntetisk coach" });
const as = <T>(fn: () => Promise<T>, who = "coach") => identity.run(actor(who), fn);
mock.module("@/lib/auth/action-guards", { namedExports: { requireCoachActionUser: async () => {
  const user = identity.getStore(); if (!user || user.role !== "COACH") throw Error("forbidden"); return user;
} } });
mock.module("@/lib/auth/requireConsentingUser", { namedExports: { requireConsentingUser: async () => identity.getStore() } });
mock.module("@/lib/forelder", { namedExports: { hentBarnHvisTilhoerer: async () => null } });
mock.module("@/lib/workbench/wb-actions", { namedExports: { moveSession: async () => { throw Error("Not exercised by this test"); } } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/google-calendar-kilder", { namedExports: { pushBooking: async () => undefined, fjernBooking: async () => undefined } });
mock.module("@/lib/booking/varsle-ny-booking", { namedExports: { varsleNyBooking: async () => undefined } });
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/notifications", { namedExports: { notify: async () => undefined } });
mock.module("@/lib/email/booking-emails", { namedExports: { sendBookingCancellation: async (...args: unknown[]) => { sent.push(args); }, sendBookingFlytteforslag: async () => undefined, sendBookingRescheduled: async () => undefined } });
mock.module("@/lib/booking/refund", { namedExports: {
  bookingRefundKey: (key: string) => `booking-refund-${key}`,
  refundCancelledBooking: async (key: string) => {
    attempts++;
    assert.equal((await db.booking.findUniqueOrThrow({ where: { id: key } })).status, "CANCELLED");
    assert.equal((await db.webhookFailure.findUniqueOrThrow({ where: { eventId: `booking-refund-${key}` } })).status, "PENDING");
    if (failRefund) throw Error("Synthetic refund pending");
    await db.webhookFailure.update({ where: { eventId: `booking-refund-${key}` }, data: { status: "RESOLVED", resolvedAt: new Date() } });
  },
} });
before(async () => {
  await assertLocalUsersDatabase(sql);
  db = (await import("../../src/lib/prisma")).prisma;
  for (const who of ["coach", "other", "player"]) await db.user.create({ data: {
    id: id(who), authId: randomUUID(), email: `${who}-${prefix}@akgolf.test`, name: `Syntetisk ${who}`, role: actor(who).role,
  } });
  await db.location.create({ data: { id: id("place"), name: "Syntetisk sted", address: "Test" } });
  await db.serviceType.create({ data: { id: id("service"), slug: id("service"), name: "Syntetisk time", priceOre: 10000, durationMin: 30, coachUserId: id("coach") } });
  await db.subscription.create({ data: { id: id("sub"), userId: id("player"), kind: "COACHING", monthlyCredits: 2, creditsRemaining: 0 } });
  actions = await import("../../src/app/admin/bookinger/actions");
  calendar = await import("../../src/app/admin/(legacy)/calendar/actions");
  proposals = await import("../../src/app/admin/kalender/flytt-actions");
  playerActions = await import("../../src/app/portal/booking/[bookingId]/actions");
  data = await import("../../src/app/admin/bookinger/data");
});
after(async () => {
  if (db) {
    await db.innboksEpost.deleteMany({ where: { bookingId: { startsWith: prefix } } });
    await db.webhookFailure.deleteMany({ where: { eventId: { startsWith: `booking-refund-${prefix}` } } });
    await db.payment.deleteMany({ where: { bookingId: { startsWith: prefix } } });
    await db.booking.deleteMany({ where: { serviceTypeId: id("service") } });
    await db.subscription.deleteMany({ where: { id: id("sub") } });
    await db.serviceType.deleteMany({ where: { id: id("service") } });
    await db.location.deleteMany({ where: { id: id("place") } });
    await db.user.deleteMany({ where: { id: { startsWith: prefix } } });
    await db.$disconnect();
  }
  await sql.end();
});
let index = 0;
async function booking(fields: { status?: "PENDING" | "CONFIRMED" | "COMPLETED"; subscriptionId?: string; stripePaymentIntentId?: string } = {}) {
  const startAt = new Date(Date.UTC(2098, 0, ++index, 10));
  return db.booking.create({ data: { id: id(`booking-${index}`), userId: id("player"), coachId: id("coach"),
    serviceTypeId: id("service"), locationId: id("place"), startAt, endAt: new Date(+startAt + 1800000), priceOre: 10000, status: "CONFIRMED", ...fields } });
}
const cancel = (key: string, who = "coach") => as(() => actions.avlysBookingSomCoach({ bookingId: key }), who);
const reject = (key: string) => as(() => actions.avvisBookingMedBegrunnelse({ bookingId: key, begrunnelse: "Syntetisk begrunnelse" }));
const balance = async () => (await db.subscription.findUniqueOrThrow({ where: { id: id("sub") } })).creditsRemaining;

test("to samtidige avlysninger tilbakefører akkurat ett klipp", async () => {
  const b = await booking({ subscriptionId: id("sub") }); const before = await balance();
  const results = await Promise.all([cancel(b.id), cancel(b.id)]);
  assert.equal(results.filter(r => r.ok).length, 1); assert.equal(await balance(), before + 1);
  assert.equal((await db.booking.findUniqueOrThrow({ where: { id: b.id } })).status, "CANCELLED");
});
test("databasefeil ved klippretur lar bookingen stå og sender ingenting", async () => {
  const b = await booking({ subscriptionId: id("sub") }); const before = await balance(); const mails = sent.length;
  // PostgreSQL triggers cannot reference pg_temp across connections; use a uniquely named local function and trigger.
  const name = `test_booking_${randomUUID().replaceAll("-", "")}`;
  await sql.query(`CREATE FUNCTION ${name}() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic credit failure'; END $$`);
  await sql.query(`CREATE TRIGGER ${name} BEFORE UPDATE ON subscriptions FOR EACH ROW WHEN (OLD.id = '${id("sub")}') EXECUTE FUNCTION ${name}()`);
  try { await assert.rejects(cancel(b.id)); } finally {
    await sql.query(`DROP TRIGGER ${name} ON subscriptions`); await sql.query(`DROP FUNCTION ${name}()`);
  }
  assert.equal(await balance(), before); assert.equal(sent.length, mails);
  assert.equal((await db.booking.findUniqueOrThrow({ where: { id: b.id } })).status, "CONFIRMED");
});
test("fremmed coach og spiller får ikke endre en booking", async () => {
  const b = await booking(); assert.equal((await cancel(b.id, "other")).ok, false);
  await assert.rejects(cancel(b.id, "player"), /forbidden/);
  assert.equal((await db.booking.findUniqueOrThrow({ where: { id: b.id } })).status, "CONFIRMED");
});
test("ventende refusjon beholder varig jobb og viser ikke fullført refusjon", async () => {
  const b = await booking({ stripePaymentIntentId: id("pi") }); failRefund = true;
  try { assert.deepEqual(await cancel(b.id), { ok: true, refundert: false, refusjonVenter: true, klippTilbake: false }); }
  finally { failRefund = false; }
  assert.equal((await db.webhookFailure.findUniqueOrThrow({ where: { eventId: `booking-refund-${b.id}` } })).status, "PENDING");
  const previous = attempts; await cancel(b.id); assert.equal(attempts, previous);
  assert.deepEqual(sent.at(-1), [b.id, { refundIssued: false, refundPending: true, isCreditBooking: false }]);
});
test("avvisning med betalingsspor stanses; ubetalt avvisning lager nøyaktig ett utkast", async () => {
  for (const fields of [{ subscriptionId: id("sub") }, { stripePaymentIntentId: id("pi2") }]) {
    const b = await booking({ status: "PENDING", ...fields }); assert.equal((await reject(b.id)).ok, false);
    assert.equal((await db.booking.findUniqueOrThrow({ where: { id: b.id } })).status, "PENDING");
  }
  const b = await booking({ status: "PENDING" }); const mails = sent.length;
  const results = await Promise.all([reject(b.id), reject(b.id)]); assert.equal(results.filter(r => r.ok).length, 1);
  assert.equal(await db.innboksEpost.count({ where: { bookingId: b.id } }), 1); assert.equal(sent.length, mails);
});
test("utkastfeil ruller tilbake avvisningen i ekte database", async () => {
  const b = await booking({ status: "PENDING" }); const name = `test_draft_${randomUUID().replaceAll("-", "")}`;
  await sql.query(`CREATE FUNCTION ${name}() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic draft failure'; END $$`);
  await sql.query(`CREATE TRIGGER ${name} BEFORE INSERT ON innboks_epost FOR EACH ROW WHEN (NEW."bookingId" = '${b.id}') EXECUTE FUNCTION ${name}()`);
  try { await assert.rejects(reject(b.id)); } finally {
    await sql.query(`DROP TRIGGER ${name} ON innboks_epost`); await sql.query(`DROP FUNCTION ${name}()`);
  }
  assert.equal((await db.booking.findUniqueOrThrow({ where: { id: b.id } })).status, "PENDING");
  assert.equal(await db.innboksEpost.count({ where: { bookingId: b.id } }), 0);
});
test("siste klipp kan bare bookes én gang, og norsk veggklokke bevares", async () => {
  await db.subscription.update({ where: { id: id("sub") }, data: { status: "ACTIVE", creditsRemaining: 1 } });
  const create = (time: string) => as(() => calendar.opprettOktPaaTid({ spillerId: id("player"), serviceTypeId: id("service"), locationId: id("place"), startAt: time, varighetMin: 30, betaling: "KLIPP" }));
  const results = await Promise.allSettled([create("2098-02-01T09:00"), create("2098-02-01T11:00")]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1); assert.equal(await balance(), 0);
  const success = results.find(r => r.status === "fulfilled"); assert.ok(success?.status === "fulfilled");
  const saved = await db.booking.findUniqueOrThrow({ where: { id: success.value.bookingId } });
  assert.ok(["2098-02-01T09:00:00.000Z", "2098-02-01T11:00:00.000Z"].includes(saved.startAt.toISOString()));
  assert.equal(saved.paymentMethod, "KLIPP"); assert.equal(saved.priceOre, 0);
});
test("gjennomførte bookinger har egen status; fremmed coach ser ikke raden", async () => {
  const b = await booking({ status: "COMPLETED" });
  const own = await db.user.findUniqueOrThrow({ where: { id: id("coach") } });
  const other = await db.user.findUniqueOrThrow({ where: { id: id("other") } });
  assert.equal((await data.hentAG06Bookinger(own)).find(r => r.id === b.id)?.st, "Gjennomført");
  assert.equal((await data.hentAG06Bookinger(other)).some(r => r.id === b.id), false);
});


test("flytteforslag bevarer tiden til spilleren svarer; samtidige svar flytter bare én gang", async () => {
  const b = await booking();
  const proposed = await as(() => proposals.foreslaaNyBookingtid({ bookingId: b.id, dato: "2098-03-10", tid: "09:30" }));
  assert.equal(proposed.ok, true);
  const stored = await db.booking.findUniqueOrThrow({ where: { id: b.id } });
  assert.equal(+stored.startAt, +b.startAt); assert.equal(stored.proposedStartAt?.toISOString(), "2098-03-10T09:30:00.000Z");
  const results = await Promise.all([1,2].map(() => as(() => playerActions.godtaFlytteforslag(b.id), "player")));
  assert.equal(results.filter(r => r.ok).length, 1);
  const moved = await db.booking.findUniqueOrThrow({ where: { id: b.id } });
  assert.equal(moved.startAt.toISOString(), "2098-03-10T09:30:00.000Z"); assert.equal(moved.proposedStartAt, null);
});
test("ugyldig dato og fremmed coach får ikke lagre forslag", async () => {
  const b = await booking();
  assert.equal((await as(() => proposals.foreslaaNyBookingtid({ bookingId: b.id, dato: "2098-02-31", tid: "09:30" }))).ok, false);
  assert.equal((await as(() => proposals.foreslaaNyBookingtid({ bookingId: b.id, dato: "2098-03-12", tid: "09:30" }), "other")).ok, false);
  assert.equal((await db.booking.findUniqueOrThrow({ where: { id: b.id } })).proposedStartAt, null);
});
