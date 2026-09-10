import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import { tnProtocol } from "./tn-catalog";

type Row = { id: string; userId: string; testId: string; status: string; scoringData: object; testResultId?: string };
let sessions: Record<string, Row> = {};
let results: object[] = [];
let viewer = "player-a";
let failResult = false;
let loseRace = false;
let assignmentOpen = false;
let completions = 0;
let notices = 0;
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: viewer }) } });
mock.module("@/lib/talent/test-sync", { namedExports: { syncTalentEtterTest: async () => {} } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/prisma", { namedExports: { prisma: { $transaction: async (run: (tx: object) => Promise<unknown>) => {
  const next = structuredClone(sessions); const records = [...results];
  const out = await run({
    testAssignment: { findFirst: async () => assignmentOpen ? { id: "assignment-a", coachId: "coach-a" } : null, updateMany: async () => { assignmentOpen = false; completions++; return { count: 1 }; } },
    notification: { create: async () => { notices++; } },
    testDefinition: { upsert: async () => ({}) },
    testSession: {
      findUnique: async ({ where }: { where: { id: string } }) => next[where.id] ?? null,
      create: async ({ data }: { data: Row }) => { next[data.id] = { ...data, status: "IN_PROGRESS" }; return next[data.id]; },
      updateMany: async ({ where, data }: { where: { id: string }; data: object }) => { if (loseRace) return { count: 0 }; Object.assign(next[where.id], data); return { count: 1 }; },
      update: async ({ where, data }: { where: { id: string }; data: object }) => Object.assign(next[where.id], data),
    },
    testResult: { create: async ({ data }: { data: object }) => { if (failResult) throw new Error("database failure"); records.push(data); return { id: `result-${records.length}` }; } },
  });
  sessions = next; results = records; return out;
} } } });
let save: typeof import("@/app/portal/tren/tester/team-norway/actions").saveTnTest;
before(async () => { save = (await import("@/app/portal/tren/tester/team-norway/actions")).saveTnTest; });
beforeEach(() => { sessions = {}; results = []; viewer = "player-a"; failResult = false; loseRace = false; assignmentOpen = false; completions = 0; notices = 0; });
const sessionId = "b7f0d4a8-70d6-4d7a-8a73-682ed75ac000";
const input = () => ({ sessionId, protocolId: "putt-1-3m", count: 25, revision: 0, intent: "complete", values: Object.fromEntries(tnProtocol("putt-1-3m")!.rows.map((_, i) => [String(i + 1), { strokes: 1 }])) });
test("serveren beregner og lagrer fullføring én gang ved retry", async () => {
  const data = input();
  assert.equal((await save(data)).ok, true);
  assert.equal((await save(data)).ok, true);
  assert.equal(results.length, 1); assert.equal(sessions[sessionId].status, "COMPLETED");
  assert.equal((results[0] as { score: number }).score, 25);
  data.values["1"].strokes = 2;
  assert.equal((await save(data)).ok, false);
  assert.equal(results.length, 1);
});
test("ufullstendig og manipulert antall lagres ikke som resultat", async () => {
  const data = input(); delete data.values["25"];
  assert.equal((await save(data)).ok, false);
  assert.equal((await save({ ...input(), count: 24 })).ok, false);
  assert.equal(results.length, 0); assert.equal(Object.keys(sessions).length, 0);
});
test("eierskap og eldre revisjon beskytter utkastet", async () => {
  const data = { ...input(), intent: "draft" };
  assert.equal((await save(data)).ok, true);
  viewer = "player-b";
  assert.equal((await save({ ...data, revision: 1 })).ok, false);
  viewer = "player-a";
  assert.equal((await save(data)).ok, false);
  assert.equal((await save({ ...data, revision: 1, intent: "abort" })).ok, true);
  assert.equal(results.length, 0); assert.equal(sessions[sessionId].status, "ABORTED");
  assert.equal((await save({ ...data, revision: 2 })).ok, false);
});
test("resultatfeil ruller fullføring tilbake; samtidighetskonflikt overskriver ikke", async () => {
  await save({ ...input(), intent: "draft" });
  failResult = true;
  assert.equal((await save({ ...input(), revision: 1 })).ok, false);
  assert.equal(results.length, 0); assert.equal(sessions[sessionId].status, "IN_PROGRESS");
  failResult = false; loseRace = true;
  assert.equal((await save({ ...input(), revision: 1 })).ok, false);
  assert.equal(results.length, 0);
});

test("fullføring kobler én tildeling og ett internt varsel; retry dobler ikke", async () => {
  assignmentOpen = true;
  assert.equal((await save(input())).ok, true);
  assert.equal((await save(input())).ok, true);
  assert.equal(completions, 1); assert.equal(notices, 1);
});
