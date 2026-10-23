import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let role = "ADMIN";
let deleted = false;
let allowedPlayer = true;
let paymentExists = true;
let failTransaction = false;
let reads = 0;
let writes = 0;
let transactions = 0;
let scope: unknown;
const tx = {
  $queryRaw: async () => paymentExists ? [{ id: "resource" }] : [],
  user: { findFirst: async ({ where }: { where: { id?: string; role?: { in: string[] }; AND?: unknown } }) => {
    if (where.id) return !deleted && where.role?.in.includes(role) ? { id: "actor", role } : null;
    scope = where; return allowedPlayer ? { id: "player" } : null;
  }, findUnique: async () => { reads++; return { id: "player", name: "Syntetisk" }; } },
  serviceType: { findUnique: async () => ({ id: "service", name: "Golf", durationMin: 60, priceOre: 100, coachUserId: "actor" }) },
  location: { findUnique: async () => ({ id: "location", name: "Bane" }) },
  payment: { findUnique: async () => { reads++; return { id: "invoice", userId: "player", amountOre: 100, currency: "nok", status: "PENDING", user: { name: "Syntetisk" } }; } },
  notification: { create: async () => { writes++; return { id: "notification" }; } },
  booking: { create: async () => { writes++; return { id: "booking", status: "PENDING" }; } },
};
mock.module("@/lib/prisma", { namedExports: { prisma: {
  $transaction: async (run: (tx: object) => Promise<unknown>, options: { isolationLevel: string }) => {
    transactions++; assert.equal(options.isolationLevel, "Serializable");
    if (failTransaction) throw Error("syntetisk transaksjonsfeil");
    return run(tx);
  },
} } });
mock.module("@/lib/booking/kollisjonsvern", { namedExports: {
  sjekkKollisjon: async (db: unknown) => { assert.equal(db, tx); return { plassNr: 1 }; },
  erKollisjonsfeil: () => false, kollisjonsmelding: () => "Kollisjon",
} });
let gate: typeof import("./administrativ-tilgang").medCaddieAdministrasjon;
let execute: typeof import("./approval-executor").executeApprovedTool;
let build: typeof import("./tools/write").buildWriteTools;
before(async () => {
  ({ medCaddieAdministrasjon: gate } = await import("./administrativ-tilgang"));
  ({ executeApprovedTool: execute } = await import("./approval-executor"));
  ({ buildWriteTools: build } = await import("./tools/write"));
});
beforeEach(() => { role = "ADMIN"; deleted = false; allowedPlayer = true; paymentExists = true; failTransaction = false; reads = 0; writes = 0; transactions = 0; scope = null; });
const booking = { playerId: "player", startAt: "2026-10-24T10:00Z", serviceTypeSlug: "golf", locationId: "location" };
const opts = { toolCallId: "synthetic", messages: [] };

test("gammelt ADMIN-forslag gir ikke fakturainnsyn eller utførelse etter degradering", async () => {
  const tools = build({ id: "actor", role: "ADMIN" });
  for (const r of ["COACH", "PLAYER", "PARENT", "UNKNOWN"]) {
    role = r;
    assert.match(JSON.stringify(await tools.draftInvoiceReminder.execute!({ invoiceId: "invoice" }, opts)), /"ok":false/);
    await assert.rejects(execute("draftInvoiceReminder", { invoiceId: "invoice" }, "actor"), /ikke tilgang/);
  }
  assert.equal(reads, 0); assert.equal(writes, 0);
});
test("booking bruker faktisk trenerrolle og avviser annen kundescope før lesing/skriving", async () => {
  role = "COACH"; allowedPlayer = false;
  const tools = build({ id: "actor", role: "ADMIN" });
  assert.match(JSON.stringify(await tools.draftBookingProposal.execute!(booking, opts)), /"ok":false/);
  await assert.rejects(execute("draftBookingProposal", booking, "actor"), /ikke tilgang/);
  assert.match(JSON.stringify(scope), /enrollmentsAsPlayer/);
  assert.match(JSON.stringify(scope), /actor/);
  assert.equal(reads, 0); assert.equal(writes, 0);
});
test("forslag skriver ikke; godkjent booking og faktura bruker samme transaksjon", async () => {
  const tools = build({ id: "actor", role: "ADMIN" });
  for (const [name, input] of [["draftBookingProposal", booking], ["draftInvoiceReminder", { invoiceId: "invoice" }]] as const) {
    assert.match(JSON.stringify(await tools[name].execute!(input, opts)), /"needsApproval":true/);
  }
  assert.equal(writes, 0);
  role = "COACH";
  assert.equal((await execute("draftBookingProposal", booking, "actor")).status, "booking-created");
  assert.equal(writes, 2);
  role = "ADMIN";
  await execute("draftInvoiceReminder", { invoiceId: "invoice" }, "actor");
  assert.equal(writes, 3); assert.equal(transactions, 4);
});
test("manglende ID, slettet aktør, ukjent verktøy og låsefeil feiler lukket", async () => {
  for (const id of [undefined, null, "", " ", 123]) {
    await assert.rejects(Reflect.apply(gate, null, [id, { type: "faktura", id: "invoice" }, async () => writes++]), /ikke tilgang/);
    await assert.rejects(gate("actor", { type: "booking", id }, async () => writes++), /ikke tilgang/);
  }
  assert.equal(transactions, 0);
  deleted = true;
  await assert.rejects(execute("draftInvoiceReminder", { invoiceId: "invoice" }, "actor"), /ikke tilgang/);
  await assert.rejects(execute("draftBookingProposal", booking, "actor"), /ikke tilgang/);
  deleted = false; failTransaction = true;
  await assert.rejects(execute("draftBookingProposal", booking, "actor"), /transaksjonsfeil/);
  assert.match(JSON.stringify(await build({ id: "actor", role: "ADMIN" }).draftBookingProposal.execute!(booking, opts)), /"ok":false/);
  await assert.rejects(execute("unknown", booking, "actor"), /Ukjent handling/);
  assert.equal(reads, 0); assert.equal(writes, 0);
});
test("manglende fakturarad avvises før fakturalesing", async () => {
  paymentExists = false;
  await assert.rejects(execute("draftInvoiceReminder", { invoiceId: "invoice" }, "actor"), /ikke tilgang/);
  assert.equal(reads, 0); assert.equal(writes, 0);
});
