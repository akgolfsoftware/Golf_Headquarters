import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let found = true;
let sessionStatus = "DRAFT";
let sessionDate = "2099-01-01";
let already = false;
let adds = 0;
let sourceAllowed = true;
let query: Record<string, unknown> | null = null;
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: "synthetic-player", role: "PLAYER" }) } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/workbench/wb-actions", { namedExports: { addDrillFromSource: async (input: { sessionId: string; sourceId: string }) => {
  assert.equal(input.sourceId, "drill:synthetic-exercise");
  adds += 1;
  return sourceAllowed ? { ok: true, data: {} } : { ok: false, error: "Ingen tilgang til kilden." };
} } });
mock.module("@/lib/prisma", { namedExports: { prisma: { workbenchSession: {
  findFirst: async (args: Record<string, unknown>) => {
    query = args;
    return found ? { id: "synthetic-session", date: new Date(`${sessionDate}T00:00:00Z`), startMinute: 960, status: sessionStatus, blockType: "OEKT", drills: already ? [{ exerciseId: "synthetic-exercise" }] : [] } : null;
  },
  findMany: async (args: Record<string, unknown>) => { query = args; return []; },
} } } });
let legg: typeof import("./session-actions").leggBankOvelseIOkt;
let load: typeof import("./session-actions").hentBankOktutkast;
before(async () => { const m = await import("./session-actions"); legg = m.leggBankOvelseIOkt; load = m.hentBankOktutkast; });
beforeEach(() => { found = true; sessionStatus = "DRAFT"; sessionDate = "2099-01-01"; already = false; adds = 0; sourceAllowed = true; query = null; });
const input = { sessionId: "synthetic-session", exerciseId: "synthetic-exercise" };
test("bankvalg avvises før oppslag når input er ugyldig", async () => {
  assert.equal((await legg({ sessionId: "", exerciseId: 4 })).ok, false); assert.equal(query, null); assert.equal(adds, 0);
});
test("banken søker bare eget selvstyrt øktutkast, uten gruppekopier", async () => {
  found = false; assert.equal((await legg(input)).ok, false);
  assert.deepEqual(query?.where, { id: input.sessionId, playerId: "synthetic-player", coachId: "synthetic-player", sourceGroupSessionId: null, isTemplate: false });
  assert.equal(adds, 0);
});
test("publisert og tidligere økt kan ikke endres fra banken", async () => {
  sessionStatus = "PUBLISHED"; assert.equal((await legg(input)).ok, false);
  sessionStatus = "DRAFT"; sessionDate = "2000-01-01"; assert.equal((await legg(input)).ok, false); assert.equal(adds, 0);
});
test("retry på en allerede lagt øvelse er idempotent", async () => {
  already = true; assert.deepEqual(await legg(input), { ok: true, alreadyAdded: true }); assert.equal(adds, 0);
});
test("gyldig valg bruker eksisterende kildevakt og bare bekrefter vellykket lagring", async () => {
  sourceAllowed = false; assert.deepEqual(await legg(input), { ok: false, error: "Ingen tilgang til kilden." });
  sourceAllowed = true; assert.deepEqual(await legg(input), { ok: true, alreadyAdded: false }); assert.equal(adds, 2);
});
test("øktvelgeren inneholder bare innlogget spiller sine selvstyrte utkast", async () => {
  assert.deepEqual(await load(), []);
  const where = query?.where as Record<string, unknown>;
  assert.equal(where.playerId, "synthetic-player"); assert.equal(where.coachId, "synthetic-player"); assert.equal(where.status, "DRAFT"); assert.equal(where.sourceGroupSessionId, null);
});
