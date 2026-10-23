import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

const player = { id: "synthetic-player", name: "Kari Testperson", email: "kari@example.test", phone: "99887766", hcp: 4.2,
  homeClub: "ukjentida", trainingPlans: [{ id: "synthetic-plan", name: "ukjentper", status: "ACTIVE" }] };
let fail = false;
let deler = true;
let profilKall = 0;
let requestedId: unknown;
let keyRole = "ADMIN";
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: {
    findUnique: async ({ where }: { where: { id: string } }) => where.id === player.id ? player : null,
    findMany: async () => { if (fail) throw new Error("Kari kari@example.test"); return [player]; },
    findFirst: async ({ where }: { where: { AND?: Array<{ id?: string }> } }) => {
      requestedId = where.AND?.find((part) => typeof part.id === "string")?.id;
      return requestedId === player.id ? player : null;
    },
  },
  apiKey: {
    findUnique: async () => ({ id: "key", user: { id: "admin", role: keyRole }, revokedAt: null, expiresAt: null }),
    update: async () => ({}),
  },
} } });
// Autorisasjonsmotoren prøves med faktisk SQL i ak-profildeling.test.ts.
// Her prøves grensen mellom fersk leserett og MCPs gjenbrukbare referanser.
mock.module("@/lib/deling/ak-profil-lesing", { namedExports: {
  medAkProfiler: async (_viewer: unknown, les: (tx: object, scope: object) => Promise<unknown>) => {
    profilKall++;
    if (!deler) return null;
    const { prisma } = await import("@/lib/prisma");
    return les(prisma, { id: { in: [player.id] } });
  },
} });
let dispatch: typeof import("@/lib/mcp/dispatcher").dispatchMcpMethod;
let authenticate: typeof import("@/lib/mcp/auth").authenticateMcpRequest;
before(async () => {
  ({ dispatchMcpMethod: dispatch } = await import("@/lib/mcp/dispatcher"));
  ({ authenticateMcpRequest: authenticate } = await import("@/lib/mcp/auth"));
});
beforeEach(() => { fail = false; deler = true; profilKall = 0; requestedId = null; keyRole = "ADMIN"; });
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

test("lagret MCP-referanse gir ikke tilgang etter at profildeling er trukket", async () => {
  const search = await call("withdraw-admin", "searchPlayers", { query: "Kari", limit: 10 });
  const alias = data(search).data.players[0].id;
  deler = false;
  const result = await call("withdraw-admin", "getPlayer", { id: alias });
  assert.equal(data(result).ok, false);
  assert.equal(requestedId, null);
  assert.equal(profilKall, 2);
  assert(!JSON.stringify(result).includes("Kari"));
});

test("MCP lager anonymisert coachingforslag, men samme referanse stoppes etter trekk", async () => {
  const search = await call("proposal-admin", "searchPlayers", { query: "Kari", limit: 10 });
  const alias = data(search).data.players[0].id;
  const input = { playerId: alias, note: "Syntetisk golfnotat" };
  const draft = await call("proposal-admin", "draftPlayerNote", input);
  assert.match(JSON.stringify(data(draft)), /"needsApproval":true/);
  for (const pii of ["Kari", "Testperson", "@", "synthetic-player"]) assert(!JSON.stringify(draft).includes(pii));
  deler = false;
  const denied = await call("proposal-admin", "draftPlayerNote", input);
  assert.equal(data(denied).ok, false);
  assert.equal(profilKall, 3);
});
