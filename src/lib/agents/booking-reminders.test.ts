import assert from "node:assert/strict";
import { mock, test } from "node:test";
let candidates: { id: string; startAt: Date }[] = [];
let filters: unknown; let sends: string[] = []; let audits: string[] = [];
let outcome: "sent" | "skipped" | "error" = "sent";
let alreadySent = false;
mock.module("@/lib/prisma", { namedExports: { prisma: {
  booking: { findMany: async (input: unknown) => { filters = input; return candidates; } },
  auditLog: { findFirst: async () => alreadySent ? { id: "synthetic-audit" } : null },
} } });
mock.module("@/lib/email/booking-emails", { namedExports: { sendBookingReminder: async (id: string) => {
  sends.push(id); if (outcome === "error") throw new Error("synthetic-rejection"); return outcome === "sent";
} } });
mock.module("@/lib/audit", { namedExports: { audit: async (input: { target: string }) => { audits.push(input.target); } } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => {} } });
mock.module("./agent-runner", { namedExports: { runAgent: async (_name: string, _actor: null, run: () => Promise<unknown>) => run() } });
test.beforeEach(() => { candidates = []; sends = []; audits = []; outcome = "sent"; alreadySent = false; });

for (const [now, min, max, valid, invalid] of [
  ["2026-10-09T08:30:00Z", "2026-10-10T09:30:00Z", "2026-10-10T11:30:00Z", "2026-10-10T10:30:00Z", "2026-10-10T12:30:00Z"],
  ["2026-03-28T08:30:00Z", "2026-03-29T09:30:00Z", "2026-03-29T11:30:00Z", "2026-03-29T10:30:00Z", "2026-03-29T12:30:00Z"],
  ["2026-10-24T08:30:00Z", "2026-10-25T08:30:00Z", "2026-10-25T10:30:00Z", "2026-10-25T09:30:00Z", "2026-10-25T11:30:00Z"],
]) test(`påminnelse bruker faktiske timer ved ${now}`, async t => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date(now) });
  candidates = [{ id: "inside", startAt: new Date(valid) }, { id: "outside", startAt: new Date(invalid) }];
  const { runBookingReminders } = await import("./booking-reminders");
  const result = await runBookingReminders();
  assert.deepEqual(filters, { where: { status: "CONFIRMED", startAt: { gte: new Date(min), lte: new Date(max) } }, select: { id: true, startAt: true } });
  assert.deepEqual(sends, ["inside"]); assert.deepEqual(audits, ["Booking:inside"]); assert.equal(result.sent, 1);
});
for (const mode of ["skipped", "error"] as const) test(`${mode} gir ingen sendt-logg`, async t => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-09T08:30:00Z") });
  candidates = [{ id: "synthetic", startAt: new Date("2026-10-10T10:30:00Z") }]; outcome = mode;
  const { runBookingReminders } = await import("./booking-reminders");
  const result = await runBookingReminders(); assert.equal(result.sent, 0); assert.deepEqual(audits, []);
  assert.equal(mode === "error" ? result.failed : result.skipped, 1);
});
test("allerede sendt påminnelse sendes ikke igjen", async t => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-09T08:30:00Z") });
  candidates = [{ id: "synthetic", startAt: new Date("2026-10-10T10:30:00Z") }]; alreadySent = true;
  const { runBookingReminders } = await import("./booking-reminders");
  const result = await runBookingReminders(); assert.equal(result.skipped, 1); assert.deepEqual(sends, []); assert.deepEqual(audits, []);
});
