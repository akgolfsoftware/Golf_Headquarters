import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

type Row = Record<string, unknown>;
const aktivGruppe = (coachId: string): Row[] => [{
  role: "PLAYER", endedAt: null,
  group: { coachId, managedByAkGolf: true, arkivertAt: null, program: null, slug: null, members: [] },
}];
const players: Row[] = [
  { id: "own", name: "Kari Testperson", email: "kari@example.test", role: "PLAYER", deletedAt: null, enrollmentsAsPlayer: [{ endedAt: null, program: "ACADEMY", coachId: "coach-a" }], groupMemberships: aktivGruppe("coach-a"), trainingPlans: [], hcp: 4 },
  { id: "other", name: "Kari Uvedkommende", role: "PLAYER", deletedAt: null, enrollmentsAsPlayer: [{ endedAt: null, program: "ACADEMY", coachId: "coach-b" }], groupMemberships: aktivGruppe("coach-b") },
  { id: "enrollment-only", name: "Kari Programkunde", role: "PLAYER", deletedAt: null, enrollmentsAsPlayer: [{ endedAt: null, program: "AK_ACADEMY", coachId: "coach-a" }], groupMemberships: [] },
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
      if ("notIn" in filter) return !(filter.notIn as unknown[]).includes(row[key]);
      if ("not" in filter) return row[key] !== filter.not;
      if ("contains" in filter) return String(row[key] ?? "").toLowerCase().includes(String(filter.contains).toLowerCase());
      return matches((row[key] ?? {}) as Row, filter);
    }
    return row[key] === value;
  });
}
let fail = false;
let dataReads = 0;
let deler = true;
let profilKall = 0;
const selects: Row[] = [];
const user = {
  findFirst: async ({ where, select }: { where: Row; select: Row }) => { selects.push(select); if (fail) throw new Error("Kari kari@example.test"); return players.find((p) => matches(p, where)) ?? null; },
  findMany: async ({ where, select }: { where: Row; select: Row }) => { selects.push(select); if (fail) throw new Error("Kari kari@example.test"); return players.filter((p) => matches(p, where)); },
};
const read = async ({ select }: { select?: Row } = {}) => { if (select) selects.push(select); dataReads++; return []; };
const profilTx = { user,
  trainingPlanSession: { findMany: read, findFirst: async ({ select }: { select: Row }) => { selects.push(select); dataReads++; return { id: "session", pyramidArea: "TEK" }; }, count: async () => 1 },
  testResult: { count: async () => 1 },
  round: { findMany: read, aggregate: async () => ({ _avg: { score: 74 } }), findFirst: async ({ where, select }: { where: Row; select: Row }) => {
    selects.push(select); dataReads++; return matches({ id: "round-other", user: players[1] }, where) ? { score: 74 } : null;
  } }, booking: { findMany: read }, payment: { findMany: read }, subscription: { findMany: read },
};
mock.module("@/lib/prisma", { namedExports: { prisma: { ...profilTx, user: {
  findFirst() { throw Error("Profil skal leses i transaksjonen"); }, findMany() { throw Error("Profil skal leses i transaksjonen"); },
} } } });
mock.module("@/lib/deling/ak-profil-lesing", { namedExports: {
  medAkProfiler: async (viewer: { id: string; role: string }, les: (tx: typeof profilTx, scope: Row) => Promise<unknown>) => {
    profilKall++;
    if (fail) throw Error("Syntetisk låsefeil");
    if (!["ADMIN", "COACH"].includes(viewer.role)) return null;
    return les(profilTx, { id: { in: deler ? viewer.role === "ADMIN" ? ["own", "other"] : ["own"] : [] }, deletedAt: null });
  },
} });
let buildReadTools: typeof import("./read").buildReadTools;
before(async () => { ({ buildReadTools } = await import("./read")); });
beforeEach(() => { dataReads = 0; fail = false; deler = true; profilKall = 0; selects.length = 0; });
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
test("ADMIN får bare aktive AK-gruppemedlemmer; PLAYER/ukjent rolle får ingen", async () => {
  const admin = buildReadTools({ id: "admin", role: "ADMIN" });
  const result = completed(await admin.searchPlayers.execute!({ query: "Kari", limit: 10 }, options));
  assert(result.ok); assert.deepEqual(result.data.players.map((p) => p.id), ["own", "other"]);
  for (const role of ["PLAYER", "PARENT", "UNKNOWN"]) {
    const result = completed(await buildReadTools({ id: "viewer", role }).searchPlayers.execute!({ query: "", limit: 10 }, options));
    assert.equal(result.ok, false);
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

test("programtilknytning alene avvises i Caddie, også for ADMIN", async () => {
  for (const viewer of [coach, { id: "admin", role: "ADMIN" }]) {
    const tools = buildReadTools(viewer);
    assert.equal(completed(await tools.getPlayer.execute!({ id: "enrollment-only" }, options)).ok, false);
    assert.equal(completed(await tools.getPlayerSessions.execute!({ playerId: "enrollment-only", limit: 10 }, options)).ok, false);
    assert.equal(completed(await tools.getPlayerStats.execute!({ playerId: "enrollment-only", period: "30d" }, options)).ok, false);
    assert.equal(completed(await tools.getPlayerLatestSession.execute!({ playerId: "enrollment-only" }, options)).ok, false);
  }
  assert.equal(dataReads, 0);
});

test("alle seks profilverktøy sjekker ny tillatelse på hvert kall i samme samtale", async () => {
  const tools = buildReadTools({ id: "admin", role: "ADMIN" });
  assert(completed(await tools.getPlayer.execute!({ id: "own" }, options)).ok);
  deler = false;
  assert.equal(completed(await tools.getPlayer.execute!({ id: "own" }, options)).ok, false);
  assert.equal(completed(await tools.getPlayerSessions.execute!({ playerId: "own", limit: 10 }, options)).ok, false);
  assert.equal(completed(await tools.getPlayerStats.execute!({ playerId: "own", period: "30d" }, options)).ok, false);
  assert.equal(completed(await tools.getPlayerLatestSession.execute!({ playerId: "own" }, options)).ok, false);
  assert.equal(dataReads, 0);
  assert.equal(completed(await tools.getRound.execute!({ roundId: "round-other" }, options)).ok, false);
  const sok = completed(await tools.searchPlayers.execute!({ query: "Kari", limit: 10 }, options));
  assert(sok.ok); assert.equal(sok.data.count, 0);
  assert.equal(profilKall, 7);
  assert.equal(selects.some(s => "lastLoginAt" in s || "tier" in s || "createdAt" in s), false);
});

test("profilverktøy velger ikke helse, fritekstnotater eller kontostatus", async () => {
  const tools = buildReadTools({ id: "admin", role: "ADMIN" });
  await tools.searchPlayers.execute!({ query: "Kari", limit: 10 }, options);
  await tools.getPlayer.execute!({ id: "own" }, options);
  await tools.getPlayerSessions.execute!({ playerId: "own", limit: 10 }, options);
  await tools.getPlayerStats.execute!({ playerId: "own", period: "30d" }, options);
  await tools.getPlayerLatestSession.execute!({ playerId: "own" }, options);
  await tools.getRound.execute!({ roundId: "round-other" }, options);
  const felter = JSON.stringify(selects);
  for (const felt of ["notes", "coachFeedback", "rationale", "health", "wellbeing", "lastLoginAt", "tier", "email", "phone"]) {
    assert(!felter.includes(`"${felt}":`), felt);
  }
  assert.equal(profilKall, 6);
});
