/** Separat lokal Postgres + ekte Resend-SDK mot en strengt lokal HTTP-mottaker. */
import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { once } from "node:events";
import pg from "pg";
import { assertLocalUsersTargets, assertLocalUsersDatabase } from "../../scripts/local-users-target.mjs";
const targets = assertLocalUsersTargets(process.env);
const prefix = `local-reminder-${randomUUID()}`;
const recipient = `${prefix}@akgolf.test`;
const messages: { html: string; key: string; to: string | string[] }[] = [];
let rejectProvider = false;
let db: typeof import("../../src/lib/prisma").prisma;
let template: Awaited<ReturnType<typeof db.emailTemplate.findUnique>>;
const server = createServer(async (req, res) => {
  try {
    assert.equal(req.method, "POST"); assert.equal(req.url, "/emails");
    const chunks: Buffer[] = []; let length = 0;
    for await (const chunk of req) { length += chunk.length; assert.ok(length < 100_000); chunks.push(chunk); }
    const input = JSON.parse(Buffer.concat(chunks).toString()) as { html: string; to: string | string[] };
    const recipients = Array.isArray(input.to) ? input.to : [input.to];
    assert.deepEqual(recipients, [recipient]);
    const key = req.headers["idempotency-key"]; assert.equal(typeof key, "string");
    messages.push({ ...input, key: String(key) });
    res.writeHead(rejectProvider ? 422 : 200, { "content-type": "application/json" });
    res.end(JSON.stringify(rejectProvider ? { name: "validation_error", message: "synthetic rejection" } : { id: randomUUID() }));
  } catch { res.writeHead(400).end(); }
});
before(async () => {
  const sql = new pg.Pool({ connectionString: targets.database.toString() });
  try { await assertLocalUsersDatabase(sql); } finally { await sql.end(); }
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  const address = server.address(); assert.ok(address && typeof address !== "string");
  Object.assign(process.env, { RESEND_API_KEY: "re_synthetic_local_only", RESEND_BASE_URL: `http://127.0.0.1:${address.port}` });
  db = (await import("../../src/lib/prisma")).prisma;
  assert.equal(await db.booking.count({ where: { startAt: { gte: new Date("2077-11-17T09:30:00Z"), lte: new Date("2077-11-17T11:30:00Z") }, status: "CONFIRMED" } }), 0, "Fixturevinduet må være tomt");
  template = await db.emailTemplate.findUnique({ where: { slug: "oekt-paaminnelse" } });
  await db.emailTemplate.upsert({ where: { slug: "oekt-paaminnelse" }, create: { slug: "oekt-paaminnelse", name: prefix, subject: "Lagret {{serviceTypeName}}", body: "Syntetisk lagret innledning {{name}}", active: true }, update: { active: true, subject: "Lagret {{serviceTypeName}}", body: "Syntetisk lagret innledning {{name}}" } });
  await db.serviceType.create({ data: { id: `${prefix}-service`, slug: prefix, name: "Syntetisk time", priceOre: 95050, durationMin: 60 } });
  await db.location.create({ data: { id: `${prefix}-place`, name: "Syntetisk sted", address: "Lokalt" } });
  for (const [suffix, status, start] of [["ready", "CONFIRMED", "10:30"], ["cancelled", "CANCELLED", "10:30"], ["outside", "CONFIRMED", "13:30"]] as const) {
    const startAt = new Date(`2077-11-17T${start}:00Z`);
    await db.booking.create({ data: { id: `${prefix}-${suffix}`, serviceTypeId: `${prefix}-service`, locationId: `${prefix}-place`, guestName: "Syntetisk gjest", guestEmail: recipient, startAt, endAt: new Date(startAt.getTime() + 3_600_000), status, priceOre: 95050 } });
  }
});
after(async () => {
  server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve()));
  if (!db) return;
  await db.auditLog.deleteMany({ where: { target: { startsWith: `Booking:${prefix}` } } });
  await db.errorLog.deleteMany({ where: { context: { in: ["email.booking.resend", "agents.bookingReminders.sending"] }, meta: { path: ["bookingId"], equals: `${prefix}-ready` } } });
  await db.booking.deleteMany({ where: { serviceTypeId: `${prefix}-service` } });
  await db.serviceType.deleteMany({ where: { id: `${prefix}-service` } });
  await db.location.deleteMany({ where: { id: `${prefix}-place` } });
  if (template) await db.emailTemplate.update({ where: { id: template.id }, data: { active: template.active, subject: template.subject, body: template.body } });
  else await db.emailTemplate.deleteMany({ where: { slug: "oekt-paaminnelse", name: prefix } });
  await db.$disconnect();
});
test("Postgres-utvalg, faktisk SDK-forespørsel, sendt-logg og feil uten ekte utsending", async t => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2077-11-16T09:30:00Z") });
  const { runBookingReminders } = await import("../../src/lib/agents/booking-reminders");
  const first = await runBookingReminders(); assert.deepEqual(first, { candidates: 1, sent: 1, skipped: 0, failed: 0 });
  assert.equal(messages.length, 1); assert.match(messages[0].html, /Syntetisk lagret innledning Syntetisk gjest/); assert.match(messages[0].html, /950,50 kr/); assert.match(messages[0].html, /10:30–11:30/);
  assert.equal(messages[0].key, `booking-reminder/${prefix}-ready/2077-11-17T10:30:00.000Z`);
  assert.equal(await db.auditLog.count({ where: { target: `Booking:${prefix}-ready`, action: "booking.reminder_sent" } }), 1);
  assert.equal((await runBookingReminders()).skipped, 1); assert.equal(messages.length, 1);
  await db.auditLog.deleteMany({ where: { target: `Booking:${prefix}-ready`, action: "booking.reminder_sent" } });
  rejectProvider = true; assert.equal((await runBookingReminders()).failed, 1);
  assert.equal(await db.auditLog.count({ where: { target: `Booking:${prefix}-ready`, action: "booking.reminder_sent" } }), 0);
  await db.booking.update({ where: { id: `${prefix}-ready` }, data: { guestEmail: null } });
  assert.equal((await runBookingReminders()).skipped, 1); assert.equal(messages.length, 2);
  await db.booking.update({ where: { id: `${prefix}-ready` }, data: { guestEmail: recipient } });
  await db.emailTemplate.update({ where: { slug: "oekt-paaminnelse" }, data: { active: false } });
  assert.equal((await runBookingReminders()).failed, 1); assert.equal(messages.length, 2);
});
