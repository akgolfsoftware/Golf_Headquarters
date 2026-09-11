import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

const player = { id: "synthetic-player", name: "Kari Testperson", email: "kari@example.test", phone: "99887766", hcp: 4.2,
  homeClub: "ukjentida", trainingPlans: [{ id: "synthetic-plan", name: "ukjentper", status: "ACTIVE" }] };
let fail = false;
let requestedId: unknown;
let keyRole = "ADMIN";
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: {
    findMany: async () => { if (fail) throw new Error("Kari kari@example.test"); return [player]; },
    findFirst: async ({ where }: { where: { AND?: Array<{ id?: string }> } }) => {
      requestedId = where.AND?.find((part) => part.id)?.id;
      return requestedId === player.id ? player : null;
    },
  },
  apiKey: {
    findUnique: async () => ({ id: "key", user: { id: "admin", role: keyRole }, revokedAt: null, expiresAt: null }),
    update: async () => ({}),
  },
} } });
let dispatch: typeof import("@/lib/mcp/dispatcher").dispatchMcpMethod;
let authenticate: typeof import("@/lib/mcp/auth").authenticateMcpRequest;
before(async () => {
  ({ dispatchMcpMethod: dispatch } = await import("@/lib/mcp/dispatcher"));
  ({ authenticateMcpRequest: authenticate } = await import("@/lib/mcp/auth"));
});
beforeEach(() => { fail = false; requestedId = null; keyRole = "ADMIN"; });
async function call(viewer: string, name: string, args: object, role = "ADMIN") {
  const result = await dispatch("request", "tools/call", { name, arguments: args }, false, { id: viewer, role });
  assert.equal(result.kind, "response");
  if (result.kind !== "response") throw new Error("Mangler svar");
  return result.response;
}
function data(response: unknown): { ok: boolean; data: { players: Array<{ id: string }>; id?: string; hcp?: number } } {
  const envelope = response as { result: { content: Array<{ text: string }> } };
  return JSON.parse(envelope.result.content[0].text);
}
test("MCP søk og påfølgende direkte oppslag beholder referansen kun for samme ADMIN", async () => {
  const search = await call("admin-one", "searchPlayers", { query: "Kari", limit: 10 });
  const alias = data(search).data.players[0].id;
  assert.match(alias, /^ref_/); assert(!JSON.stringify(search).includes(player.id));
  assert(!JSON.stringify(search).includes("Kari")); assert(!JSON.stringify(search).includes("@"));
  const found = await call("admin-one", "getPlayer", { id: alias });
  assert.equal(data(found).ok, true); assert.equal(requestedId, player.id); assert.equal(data(found).data.hcp, 4.2);
  assert(!JSON.stringify(found).includes("ukjentida")); assert(!JSON.stringify(found).includes("ukjentper"));
  assert(JSON.stringify(found).includes("ACTIVE"));
  const foreign = await call("admin-two", "getPlayer", { id: alias });
  assert.equal(data(foreign).ok, false); assert.notEqual(requestedId, player.id);
});
test("ADMIN-grensen gjelder både API-nøkkel og direkte dispatcher-kall", async () => {
  for (const role of ["PLAYER", "COACH", "PARENT"]) {
    keyRole = role;
    const auth = await authenticate(new Request("https://example.test/mcp", { headers: { authorization: "Bearer synthetic-key" } }));
    assert.equal(auth.ok, false);
    const result = await call("non-admin", "searchPlayers", { query: "", limit: 10 }, role);
    assert("error" in result); assert.equal(requestedId, null);
  }
});
test("MCP feil under identitetslesing gir ingen rå data eller reservekall", async () => {
  fail = true;
  const result = await call("failing-admin", "getPlayer", { id: player.id });
  assert("error" in result); assert.equal(requestedId, null);
  assert(!JSON.stringify(result).includes("Kari")); assert(!JSON.stringify(result).includes("@"));
});
test("utløpte MCP-referanser virker ikke etter at kartet er fornyet", async () => {
  const search = await call("expiring-admin", "searchPlayers", { query: "Kari", limit: 10 });
  const alias = data(search).data.players[0].id;
  const now = Date.now();
  const clock = mock.method(Date, "now", () => now + 16 * 60_000);
  try {
    const result = await call("expiring-admin", "getPlayer", { id: alias });
    assert.equal(data(result).ok, false); assert.notEqual(requestedId, player.id);
  } finally { clock.mock.restore(); }
});
