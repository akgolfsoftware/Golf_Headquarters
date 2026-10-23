import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let deler = true;
let profilKall = 0;
let bookingKall = 0;
let lokaleLesinger = 0;
let failLock = false;
const selectFields: unknown[] = [];
const tx = { user: { findUnique: async (query: { select: unknown }) => {
  selectFields.push(query.select); return { id: "synthetic-player", name: "Syntetisk spiller" };
} } };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findUnique: async () => { lokaleLesinger++; return { id: "synthetic-player", name: "Syntetisk" }; } },
  serviceType: { findUnique: async () => ({ id: "service", name: "Golf" }) },
  location: { findUnique: async () => ({ id: "location", name: "Bane" }) },
  payment: { findUnique: async () => ({ id: "invoice", amountOre: 100, currency: "nok", user: { name: "Syntetisk" } }) },
} } });
mock.module("@/lib/auth/coached", { namedExports: {
  harCoachTilgangTilSpiller: async () => { bookingKall++; return true; },
} });
mock.module("@/lib/deling/ak-profil-handling", { namedExports: {
  medAkProfilHandling: async (_viewer: unknown, _id: unknown, run: (tx: object) => Promise<unknown>) => {
    profilKall++; if (!deler || failLock) throw Error("Syntetisk avslag med privat informasjon"); return run(tx);
  },
} });
let build: typeof import("./write").buildWriteTools;
let shape: typeof import("./write").WRITE_TOOLS;
before(async () => { ({ buildWriteTools: build, WRITE_TOOLS: shape } = await import("./write")); });
beforeEach(() => { deler = true; failLock = false; profilKall = 0; bookingKall = 0; lokaleLesinger = 0; selectFields.length = 0; });
const opts = { toolCallId: "syntetisk", messages: [] };
const inputs = [
  ["draftPlayerMessage", { playerId: "synthetic-player", subject: "Golf", body: "Golføkt" }],
  ["draftPlayerNote", { playerId: "synthetic-player", note: "Golfnotat" }],
  ["draftPlanAdjustment", { playerId: "synthetic-player", change: "Golfplan" }],
] as const;
test("tre coachingforslag krever fersk deling, bruker tx og henter ikke kontaktinformasjon", async () => {
  const tools = build({ id: "admin", role: "ADMIN" });
  for (const [name, input] of inputs) {
    const result = await tools[name].execute!(input, opts);
    assert.match(JSON.stringify(result), /"needsApproval":true/);
  }
  assert.equal(profilKall, 3); assert.equal(lokaleLesinger, 0);
  assert(!JSON.stringify(selectFields).includes("email"));
  deler = false;
  for (const [name, input] of inputs) {
    const result = await tools[name].execute!(input, opts);
    assert.match(JSON.stringify(result), /"ok":false/);
    assert(!JSON.stringify(result).includes("privat informasjon"));
  }
  assert.equal(profilKall, 6); assert.equal(selectFields.length, 3);
});
test("rå metadataeksport og feil roller kan ikke eksekvere et forslag", async () => {
  for (const tools of [shape, ...["PLAYER", "PARENT", "UNKNOWN"].map(role => build({ id: "x", role }))]) {
    for (const [name, input] of inputs) assert.match(JSON.stringify(await tools[name].execute!(input, opts)), /"ok":false/);
  }
  assert.equal(profilKall, 0); assert.equal(lokaleLesinger, 0);
});
test("ugyldig input og låsefeil får ingen ubegrenset reservevei", async () => {
  const tools = build({ id: "admin", role: "ADMIN" });
  assert.match(JSON.stringify(await tools.draftPlayerMessage.execute!({ playerId: "synthetic-player" }, opts)), /"ok":false/);
  assert.equal(profilKall, 0);
  failLock = true;
  assert.match(JSON.stringify(await tools.draftPlayerNote.execute!(inputs[1][1], opts)), /"ok":false/);
  assert.equal(lokaleLesinger, 0); assert.equal(selectFields.length, 0);
});
test("booking og faktura bruker separate porter, ikke coachingprofildeling", async () => {
  deler = false;
  const tools = build({ id: "admin", role: "ADMIN" });
  assert.match(JSON.stringify(await tools.draftBookingProposal.execute!({ playerId: "synthetic-player", startAt: "2026-10-24T10:00Z", serviceTypeSlug: "golf", locationId: "location" }, opts)), /"needsApproval":true/);
  assert.match(JSON.stringify(await tools.draftInvoiceReminder.execute!({ invoiceId: "invoice" }, opts)), /"needsApproval":true/);
  const coach = build({ id: "coach", role: "COACH" });
  assert.match(JSON.stringify(await coach.draftInvoiceReminder.execute!({ invoiceId: "invoice" }, opts)), /"ok":false/);
  assert.equal(bookingKall, 1); assert.equal(profilKall, 0);
});
