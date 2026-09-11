import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let viewer = "admin";
let draft = { id: "draft", userId: "admin", conversationId: "conversation", toolCallId: "call", toolName: "draftPlayerNote", status: "PENDING", toolInput: { playerId: "synthetic-player", note: "Lagret golfnotat" } };
let calls: unknown[] = [];
let failExecution = false;
mock.module("@/lib/auth/canAccessMissionControl", { namedExports: { canAccessMissionControl: async () => ({ id: viewer, role: "ADMIN" }) } });
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => {} } });
mock.module("@/lib/caddie/approval-executor", { namedExports: { executeApprovedTool: async (...args: unknown[]) => {
  calls.push(args); if (failExecution) throw new Error("Kari kari@example.test");
  return { status: "completed", summary: "Syntetisk utførelse" };
} } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  caddieDraft: {
    findFirst: async ({ where }: { where: Record<string, unknown> }) => Object.entries(where).every(([key, value]) => draft[key as keyof typeof draft] === value) ? { ...draft } : null,
    updateMany: async ({ where, data }: { where: Record<string, unknown>; data: { status: string } }) => {
      if (!Object.entries(where).every(([key, value]) => draft[key as keyof typeof draft] === value)) return { count: 0 };
      draft.status = data.status; return { count: 1 };
    },
  }, caddieMessage: { create: async () => ({}) },
} } });
let post: typeof import("@/app/api/caddie/approve/route").POST;
let approveDraft: typeof import("./draft-godkjenning").godkjennOgUtforCaddieDraft;
before(async () => {
  ({ POST: post } = await import("@/app/api/caddie/approve/route"));
  ({ godkjennOgUtforCaddieDraft: approveDraft } = await import("./draft-godkjenning"));
});
beforeEach(() => {
  viewer = "admin"; calls = []; failExecution = false;
  draft = { id: "draft", userId: "admin", conversationId: "conversation", toolCallId: "call", toolName: "draftPlayerNote", status: "PENDING", toolInput: { playerId: "synthetic-player", note: "Lagret golfnotat" } };
});
function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://example.test/api/caddie/approve", { method: "POST", body: JSON.stringify({
    conversationId: "conversation", toolCallId: "call", toolName: "draftPlayerNote", approved: true,
    toolInput: { playerId: "attacker-target", note: "Overstyring fra klient" }, ...overrides,
  }) });
}
test("godkjenning bruker serverlagret intern ID og input, aldri klientens overstyring", async () => {
  assert.equal((await post(request())).status, 200);
  assert.deepEqual(calls, [["draftPlayerNote", draft.toolInput, "admin"]]);
  assert.equal(draft.status, "APPROVED");
});
test("uvedkommende, feil samtale/verktøy og allerede behandlet utkast avvises", async () => {
  viewer = "another-admin"; assert.equal((await post(request())).status, 409);
  viewer = "admin";
  for (const overrides of [{ conversationId: "another-conversation" }, { toolName: "draftBookingProposal" }, { toolCallId: "another-call" }]) assert.equal((await post(request(overrides))).status, 409);
  for (const status of ["APPROVED", "REJECTED"]) { draft.status = status; assert.equal((await post(request())).status, 409); }
  assert.equal(calls.length, 0);
});
test("avvisning og dobbeltklikk gir høyst én utførelse", async () => {
  assert.equal((await post(request({ approved: false }))).status, 200);
  assert.equal(draft.status, "REJECTED"); assert.equal(calls.length, 0);
  draft.status = "PENDING";
  const results = await Promise.all([post(request()), post(request())]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]); assert.equal(calls.length, 1);
});
test("chat og godkjenningskø deler samme engangsgrense og eierkontroll", async () => {
  assert.equal((await approveDraft("draft", "another-admin")).ok, false);
  const results = await Promise.all([post(request()), approveDraft("draft", "admin")]);
  assert.equal(calls.length, 1);
  assert(results[0] instanceof Response);
});
test("usikker utførelse gjentas ikke automatisk og rå feil sendes ikke til klienten", async () => {
  failExecution = true;
  const failed = await post(request()); assert.equal(failed.status, 500);
  const body = await failed.text(); assert(!body.includes("Kari")); assert(!body.includes("@"));
  assert.equal((await post(request())).status, 409); assert.equal(calls.length, 1);
});
