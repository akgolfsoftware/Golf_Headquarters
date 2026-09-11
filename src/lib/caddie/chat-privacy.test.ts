import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import type { ToolSet } from "ai";
import { createRequire } from "node:module";

let role = "ADMIN";
let failIdentity = false;
let failSave = false;
let conversationOwner = true;
let modelCalls = 0;
let providerPayload: Record<string, unknown> | null = null;
const person = { id: "synthetic-player", name: "Kari Testperson", email: "kari@example.test", phone: "99887766" };
// Disse navnene finnes ikke i registeret og treffes ikke av navne-regexen.
const unknownNames = ["ukjentper", "ukjentida", "ukjentola", "ukjentliv", "ukjentkim", "ukjentbea"];
let storedProposal: unknown;
let bookingInput: unknown;
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => ({ id: "admin", role }) } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findMany: async () => { if (failIdentity) throw new Error("Kari kari@example.test"); return [person]; } },
  caddieConversation: { findFirst: async () => conversationOwner ? { id: "conversation" } : null },
  caddieMessage: { create: async () => { if (failSave) throw new Error("Kari kari@example.test"); return {}; } },
  caddieDraft: { create: async (input: unknown) => { storedProposal = input; return {}; } },
} } });
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });
mock.module("@/lib/ai/client", { namedExports: { modelFor: () => "synthetic-model", anthropicProvider: () => () => "synthetic-provider" } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => {} } });
mock.module("@/lib/caddie/tools", { namedExports: { buildCaddieTools: () => ({ getPlayer: {
  execute: async () => ({ ...person, score: 74, sgTotal: -1.2, notes: "Privat fritekst" }),
}, getPlayerLatestSession: {
  execute: async () => ({ title: unknownNames[0], plan: { id: "plan", name: unknownNames[1] }, durationMin: 60, pyramidArea: "TEKNIKK", scheduledAt: new Date("2026-09-11T10:00:00Z") }),
}, getUpcomingBookings: {
  execute: async () => ({ serviceType: { id: "service", name: unknownNames[2], slug: `${unknownNames[2]}-60` }, location: { id: "location", name: unknownNames[3] }, facility: { name: unknownNames[4] }, priceOre: 90000 }),
}, getTournaments: {
  execute: async () => ({ name: unknownNames[0], format: unknownNames[1], course: { name: unknownNames[5], par: 72, rating: 73.2, slope: 130 } }),
}, draftBookingProposal: {
  execute: async (input: unknown) => { bookingInput = input; return { needsApproval: true, previewText: unknownNames[3] }; },
}, draftInvoiceReminder: {
  execute: async () => ({ needsApproval: true, invoiceId: "invoice", subject: unknownNames[0], body: unknownNames[1], previewText: unknownNames[2] }),
} }) } });
mock.module(createRequire(import.meta.url).resolve("ai"), { namedExports: {
  convertToModelMessages: async (messages: unknown) => messages,
  stepCountIs: () => true,
  streamText: (payload: Record<string, unknown>) => {
    modelCalls++; providerPayload = payload;
    return { toUIMessageStreamResponse: () => new Response("synthetic response") };
  },
} });
let post: typeof import("@/app/api/caddie/chat/route").POST;
before(async () => { ({ POST: post } = await import("@/app/api/caddie/chat/route")); });
beforeEach(() => { role = "ADMIN"; failIdentity = false; failSave = false; conversationOwner = true; modelCalls = 0; providerPayload = null; storedProposal = null; bookingInput = null; });
function request() {
  return new Request("https://example.test/api/caddie/chat", { method: "POST", body: JSON.stringify({ conversationId: "conversation", messages: [
    { role: "assistant", parts: [{ type: "text", text: "Kari har HCP 4.2" }, { type: "tool-getPlayer", output: person }] },
    { role: "user", parts: [{ type: "text", text: "Analyser Kari Testperson kari@example.test synthetic-player SG -1.2" }] },
  ] }) });
}
test("faktisk chat-rute anonymiserer meldinger, historikk og verktøy før provider-grensen", async () => {
  const response = await post(request());
  assert.equal(response.status, 200); assert.equal(modelCalls, 1); assert(providerPayload);
  const serialized = JSON.stringify(providerPayload);
  for (const pii of ["Kari", "Testperson", "@", "synthetic-player"]) assert(!serialized.includes(pii));
  assert(serialized.includes("SG -1.2")); assert(serialized.includes("HCP 4.2"));
  const tools = providerPayload.tools as ToolSet;
  const result = await tools.getPlayer.execute!({}, { toolCallId: "t", messages: [] });
  for (const pii of ["Kari", "Testperson", "@", "synthetic-player", "Privat fritekst"]) assert(!JSON.stringify(result).includes(pii));
  assert(JSON.stringify(result).includes('"score":74'));
});
test("COACH/PLAYER/PARENT slipper ikke gjennom den ADMIN-begrensede chat-inngangen", async () => {
  for (const denied of ["COACH", "PLAYER", "PARENT"]) {
    role = denied; assert.equal((await post(request())).status, 401);
  }
  assert.equal(modelCalls, 0);
});
test("provider-verktøy utelater ukjente enkeltnavn i DB-titler og labels, men bevarer golfkontekst og bookingreferanser", async () => {
  assert.equal((await post(request())).status, 200); assert(providerPayload);
  const tools = providerPayload.tools as ToolSet;
  const run = (name: string, input = {}) => tools[name].execute!(input, { toolCallId: "t", messages: [] });
  const session = await run("getPlayerLatestSession");
  const booking = await run("getUpcomingBookings") as { serviceType: { slug: string } };
  const tournament = await run("getTournaments");
  const invoice = await run("draftInvoiceReminder");
  const serialized = JSON.stringify([session, booking, tournament, invoice]);
  for (const name of unknownNames) assert(!serialized.includes(name), `${name} nådde modellgrensen`);
  for (const golf of ['"durationMin":60', '"pyramidArea":"TEKNIKK"', "2026-09-11T10:00:00.000Z", '"par":72', '"rating":73.2', '"slope":130', '"priceOre":90000']) assert(serialized.includes(golf));
  assert(JSON.stringify(storedProposal).includes(unknownNames[1]), "serverlagret fakturautkast skal beholdes");
  assert.match(booking.serviceType.slug, /^ref_/);
  const proposal = await run("draftBookingProposal", { serviceTypeSlug: booking.serviceType.slug });
  assert.deepEqual(bookingInput, { serviceTypeSlug: `${unknownNames[2]}-60` });
  assert(!JSON.stringify(proposal).includes(unknownNames[3]));
});
test("identitetsfeil og skrivefeil gir ingen provider-kall og ingen PII i feilsvar", async () => {
  failIdentity = true;
  const first = await post(request()); assert.equal(first.status, 503); assert(!((await first.text()).includes("Kari")));
  failIdentity = false; failSave = true;
  const second = await post(request()); assert.equal(second.status, 503); assert(!((await second.text()).includes("Kari")));
  assert.equal(modelCalls, 0);
});
test("en annen admins samtale-ID gir ikke tilgang til eller skriving i samtalen", async () => {
  conversationOwner = false;
  assert.equal((await post(request())).status, 404); assert.equal(modelCalls, 0);
});
