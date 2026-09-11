import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

type Row = Record<string, unknown>;
const players: Row[] = [
  { id: "own", name: "Kari Testperson", email: "kari@example.test", role: "PLAYER", deletedAt: null, enrollmentsAsPlayer: [{ endedAt: null, program: "ACADEMY", coachId: "coach-a" }], groupMemberships: [], trainingPlans: [], hcp: 4 },
  { id: "other", name: "Kari Uvedkommende", role: "PLAYER", deletedAt: null, enrollmentsAsPlayer: [{ endedAt: null, program: "ACADEMY", coachId: "coach-b" }], groupMemberships: [] },
  { id: "self", name: "Kari Selvbetjent", role: "PLAYER", deletedAt: null, enrollmentsAsPlayer: [{ endedAt: null, program: "PLATFORM_ONLY", coachId: "coach-a" }], groupMemberships: [] },
  { id: "deleted", name: "Kari Slettet", role: "PLAYER", deletedAt: new Date(), enrollmentsAsPlayer: [{ endedAt: null, program: "ACADEMY", coachId: "coach-a" }], groupMemberships: [] },
];
function matches(row: Row, where: Row): boolean {
  return Object.entries(where).every(([key, value]) => {
    if (key === "AND") return (value as Row[]).every((part) => matches(row, part));
    if (key === "OR") return (value as Row[]).some((part) => matches(row, part));
    if (value && typeof value === "object" && !(value instanceof Date)) {
      const filter = value as Row;
      if ("some" in filter) return ((row[key] ?? []) as Row[]).some((part) => matches(part, filter.some as Row));
      if ("in" in filter) return (filter.in as unknown[]).includes(row[key]);
      if ("not" in filter) return row[key] !== filter.not;
      if ("contains" in filter) return String(row[key] ?? "").toLowerCase().includes(String(filter.contains).toLowerCase());
      return matches((row[key] ?? {}) as Row, filter);
    }
    return row[key] === value;
  });
}
let fail = false;
let dataReads = 0;
const user = {
  findFirst: async ({ where }: { where: Row }) => { if (fail) throw new Error("Kari kari@example.test"); return players.find((p) => matches(p, where)) ?? null; },
  findMany: async ({ where }: { where: Row }) => { if (fail) throw new Error("Kari kari@example.test"); return players.filter((p) => matches(p, where)); },
};
const read = async () => { dataReads++; return []; };
mock.module("@/lib/prisma", { namedExports: { prisma: { user,
  trainingPlanSession: { findMany: read, findFirst: async () => { dataReads++; return { id: "session", pyramidArea: "TEK" }; }, count: async () => 1 },
  testResult: { count: async () => 1 },
  round: { findMany: read, aggregate: async () => ({ _avg: { score: 74 } }), findFirst: async ({ where }: { where: Row }) => {
    dataReads++; return matches({ id: "round-other", user: players[1] }, where) ? { score: 74 } : null;
  } }, booking: { findMany: read }, payment: { findMany: read }, subscription: { findMany: read },
} } });
let buildReadTools: typeof import("./read").buildReadTools;
before(async () => { ({ buildReadTools } = await import("./read")); });
beforeEach(() => { dataReads = 0; fail = false; });
const coach = { id: "coach-a", role: "COACH" };
const options = { toolCallId: "t", messages: [] };
function completed<T>(result: T | AsyncIterable<T>): T {
  assert(!result || typeof result !== "object" || !(Symbol.asyncIterator in result), "Disse verktøyene skal returnere ett ferdig resultat");
  return result as T;
}
test("navnesøk beholder relasjonsfilteret; uvedkommende, selvbetjente og slettede utelates", async () => {
  const result = completed(await buildReadTools(coach).searchPlayers.execute!({ query: "Kari", limit: 10 }, options));
  assert(result.ok); assert.deepEqual(result.data.players.map((p) => p.id), ["own"]);
});
test("tillatt coach kan hente sin spiller, økter og stats", async () => {
  const tools = buildReadTools(coach);
  assert(completed(await tools.getPlayer.execute!({ id: "own" }, options)).ok);
  assert(completed(await tools.getPlayerSessions.execute!({ playerId: "own", limit: 10 }, options)).ok);
  assert(completed(await tools.getPlayerStats.execute!({ playerId: "own", period: "30d" }, options)).ok);
  assert(completed(await tools.getPlayerLatestSession.execute!({ playerId: "own" }, options)).ok);
});
test("uvedkommende direkte ID-oppslag stoppes før detaljdata leses", async () => {
  const tools = buildReadTools(coach);
  assert.equal(completed(await tools.getPlayer.execute!({ id: "other" }, options)).ok, false);
  assert.equal(completed(await tools.getPlayerSessions.execute!({ playerId: "other", limit: 10 }, options)).ok, false);
  assert.equal(completed(await tools.getPlayerStats.execute!({ playerId: "other", period: "30d" }, options)).ok, false);
  assert.equal(completed(await tools.getPlayerLatestSession.execute!({ playerId: "other" }, options)).ok, false);
  assert.equal(dataReads, 0);
  assert.equal(completed(await tools.getRound.execute!({ roundId: "round-other" }, options)).ok, false);
});
test("ADMIN får alle coachede, men ikke selvbetjente; PLAYER/ukjent rolle får ingen", async () => {
  const admin = buildReadTools({ id: "admin", role: "ADMIN" });
  const result = completed(await admin.searchPlayers.execute!({ query: "Kari", limit: 10 }, options));
  assert(result.ok); assert.deepEqual(result.data.players.map((p) => p.id), ["own", "other"]);
  for (const role of ["PLAYER", "PARENT", "UNKNOWN"]) {
    const result = completed(await buildReadTools({ id: "viewer", role }).searchPlayers.execute!({ query: "", limit: 10 }, options));
    assert(result.ok); assert.equal(result.data.count, 0);
  }
});
test("globale kunde-/økonomiverktøy krever ADMIN også når de kalles direkte", async () => {
  const tools = buildReadTools(coach);
  assert.equal(completed(await tools.getUpcomingBookings.execute!({ daysAhead: 7, limit: 10 }, options)).ok, false);
  assert.equal(completed(await tools.getOutstandingInvoices.execute!({ limit: 10 }, options)).ok, false);
  assert.equal(completed(await tools.getActiveSubscriptions.execute!({ limit: 10 }, options)).ok, false);
  assert.equal(dataReads, 0);
});
test("DB-feil gir aldri åpen tilgang eller rå feilmelding med persondata", async () => {
  fail = true;
  const result = completed(await buildReadTools(coach).getPlayerStats.execute!({ playerId: "own", period: "30d" }, options));
  assert.equal(result.ok, false); assert.equal(dataReads, 0);
  assert(!JSON.stringify(result).includes("Kari")); assert(!JSON.stringify(result).includes("@"));
});
