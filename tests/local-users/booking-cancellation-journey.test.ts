/** Separat lokal Postgres + ekte Resend-SDK mot en strengt lokal HTTP-mottaker. */
import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { once } from "node:events";
import pg from "pg";
import { assertLocalUsersTargets, assertLocalUsersDatabase } from "../../scripts/local-users-target.mjs";
const targets = assertLocalUsersTargets(process.env);
const prefix = `local-cancellation-${randomUUID()}`;
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
    const key = req.headers["idempotency-key"];
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
  template = await db.emailTemplate.findUnique({ where: { slug: "booking-avbestilt" } });
  await db.emailTemplate.upsert({ where: { slug: "booking-avbestilt" }, create: { slug: "booking-avbestilt", name: prefix, subject: "Avbestilt {{time}}", body: "Syntetisk lagret tekst {{name}}: {{refundLine}}", active: true }, update: { active: true, subject: "Avbestilt {{time}}", body: "Syntetisk lagret tekst {{name}}: {{refundLine}}" } });
  await db.serviceType.create({ data: { id: `${prefix}-service`, slug: prefix, name: "Syntetisk time", priceOre: 95050, durationMin: 60 } });
  await db.location.create({ data: { id: `${prefix}-place`, name: "Syntetisk sted", address: "Lokalt" } });
  for (const [suffix, status, start] of [["ready", "CANCELLED", "10:30"], ["confirmed", "CONFIRMED", "13:30"]] as const) {
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
  else await db.emailTemplate.deleteMany({ where: { slug: "booking-avbestilt", name: prefix } });
  await db.$disconnect();
});
test("Postgres-historikk og faktisk SDK-kall viser riktig avbestilling uten ekte betaling eller sending", async () => {
  const { sendBookingCancellation } = await import("../../src/lib/email/booking-emails");
  const id = `${prefix}-ready`;
  await db.auditLog.create({ data: { action: "booking.cancelled", target: `Booking:${id}`, createdAt: new Date("2077-11-16T08:14:00Z") } });
  await sendBookingCancellation(id, { refundPending: true });
  assert.equal(messages.length, 1); assert.match(messages[0].html, /Syntetisk lagret tekst/); assert.match(messages[0].html, /16.11.2077 kl. 09:14/);
  assert.match(messages[0].html, /10:30–11:30/); assert.match(messages[0].html, /venter på behandling/);
  assert.doesNotMatch(messages[0].html, /Refusjon er behandlet/);
  await sendBookingCancellation(id, { refundIssued: true }); assert.match(messages[1].html, /950,50 kr/);
  await db.auditLog.deleteMany({ where: { target: `Booking:${id}` } });
  await sendBookingCancellation(id); assert.match(messages[2].html, />—</); assert.doesNotMatch(messages[2].html, /09:14/);
  await sendBookingCancellation(`${prefix}-confirmed`); assert.equal(messages.length, 3);
  rejectProvider = true; await assert.rejects(() => sendBookingCancellation(id), /avviste/);
  assert.equal(messages.length, 4);
  await db.booking.update({ where: { id }, data: { guestEmail: null } });
  await sendBookingCancellation(id); assert.equal(messages.length, 4);
  await db.booking.update({ where: { id }, data: { guestEmail: recipient } });
  await db.emailTemplate.update({ where: { slug: "booking-avbestilt" }, data: { active: false } });
  await assert.rejects(() => sendBookingCancellation(id), /deaktivert/); assert.equal(messages.length, 4);
});
