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
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => ({ id: "admin", role }) } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findMany: async () => { if (failIdentity) throw new Error("Kari kari@example.test"); return [person]; } },
  caddieConversation: { findFirst: async () => conversationOwner ? { id: "conversation" } : null },
  caddieMessage: { create: async () => { if (failSave) throw new Error("Kari kari@example.test"); return {}; } },
} } });
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });
mock.module("@/lib/ai/client", { namedExports: { modelFor: () => "synthetic-model", anthropicProvider: () => () => "synthetic-provider" } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => {} } });
mock.module("@/lib/caddie/tools", { namedExports: { buildCaddieTools: () => ({ getPlayer: {
  execute: async () => ({ ...person, score: 74, sgTotal: -1.2, notes: "Privat fritekst" }),
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
beforeEach(() => { role = "ADMIN"; failIdentity = false; failSave = false; conversationOwner = true; modelCalls = 0; providerPayload = null; });
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
