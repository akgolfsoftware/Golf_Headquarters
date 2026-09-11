import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let userId = "player";
let status = "IN_PROGRESS";
let mirrored = true;
let failTransaction = false;
let stored: unknown = null;
let writes: string[] = [];
let transactionCalls = 0;
let loggedTotal: number | null = null;
mock.module("@/lib/auth/requireConsentingUser", { namedExports: { requireConsentingUser: async () => ({ id: userId, role: "PLAYER" }) } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => false } });
mock.module("@/lib/agents/triggers", { namedExports: { triggerLiveSessionAgent: async () => {} } });
mock.module("@/lib/workbench/v2-sync", { namedExports: { GENERERT_FRA: "test" } });
mock.module("@/lib/teknisk-plan/apply-reps", { namedExports: { applyPositionTaskReps: async () => {} } });
mock.module("next/navigation", { namedExports: { redirect: () => { throw new Error("unexpected redirect"); } } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  trainingSessionV2: {
    findUnique: async () => ({ id: "s", studentId: "player", participants: [], drills: [{ id: "d1" }, { id: "d2" }], status, completedSummary: { other: "preserve" }, startTime: new Date(0), generertFra: mirrored ? "test" : null, generertFraId: "plan" }),
    update: (input: { data: { completedSummary?: unknown; status: string } }) => ({ kind: "session", apply: () => { status = input.data.status; stored = input.data.completedSummary; } }),
  },
  drillLogV2: {
    findMany: async () => [{ drillId: "d1", repsTotal: 12, loggedAt: new Date(0) }, { drillId: "d2", repsTotal: 1, loggedAt: new Date(1000) }],
    findFirst: async () => ({ id: "log", repsWithoutBall: 0, repsLowSpeed: 0, repsHit: 1 }),
    upsert: async (input: { update: { repsTotal: number } }) => { loggedTotal = input.update.repsTotal; },
  },
  trainingDrillV2: { findUnique: async () => ({ positionTaskId: null }) },
  trainingPlanSession: { updateMany: () => ({ kind: "plan", apply: () => {} }) },
  trainingPlanSessionLog: { upsert: () => ({ kind: "plan-log", apply: () => {} }) },
  $transaction: async (batch: { kind: string; apply: () => void }[]) => {
    transactionCalls++; writes = batch.map((op) => op.kind);
    if (failTransaction) throw new Error("synthetic transaction failure");
    for (const op of batch) op.apply();
  },
} } });
let actions: typeof import("@/app/portal/(fullscreen)/live/[sessionId]/actions");
before(async () => { actions = await import("@/app/portal/(fullscreen)/live/[sessionId]/actions"); });
beforeEach(() => { userId = "player"; status = "IN_PROGRESS"; mirrored = true; failTransaction = false; stored = null; writes = []; transactionCalls = 0; loggedTotal = null; });
const input = { sessionId: "s", drillId: "d1", repsTotal: 0, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 0, repsHit: 0 };
test("sluttstatus, planspeil og planlogg sendes i én transaksjon", async () => {
  assert.deepEqual(await actions.completeSession("s", 123, ["d1"]), { href: "/portal/live/s/summary" });
  assert.deepEqual(writes, ["session", "plan", "plan-log"]);
  assert.equal(transactionCalls, 1); assert.equal(status, "COMPLETED");
  assert.equal((stored as { other: string }).other, "preserve");
  const summary = (stored as { liveSummary: { drillsCompleted: number; completedDrillIds: string[]; durationSec: number; totalReps: number } }).liveSummary;
  assert.deepEqual(summary.completedDrillIds, ["d1"]); assert.equal(summary.drillsCompleted, 1);
  assert.equal(summary.totalReps, 13); assert.equal(summary.durationSec, 123);
});
test("mislykket transaksjon returnerer ingen vellykket fullføring", async () => {
  failTransaction = true;
  await assert.rejects(actions.completeSession("s", 12, []), /transaction failure/);
  assert.equal(status, "IN_PROGRESS"); assert.equal(stored, null);
  assert.deepEqual(writes, ["session", "plan", "plan-log"]);
});
test("tapt svar kan prøves på nytt uten å endre fullført resultat", async () => {
  await actions.completeSession("s", 123, ["d1"]);
  const result = stored;
  await actions.completeSession("s", 1, []);
  assert.equal(transactionCalls, 1); assert.equal(stored, result);
  assert.deepEqual(await actions.logDrillReps(input), { ok: false });
});
test("nulltall kan korrigeres mens økta pågår; annen øvelses id avvises", async () => {
  assert.deepEqual(await actions.logDrillReps(input), { ok: true }); assert.equal(loggedTotal, 0);
  loggedTotal = null;
  await assert.rejects(actions.logDrillReps({ ...input, drillId: "other-session-drill" }), /tilhører ikke/);
  await assert.rejects(actions.logDrillReps({ ...input, repsHit: -1 }), /antall/);
  assert.equal(loggedTotal, null);
});
test("fremmede, ugyldige statuser, varigheter og ferdigmarkeringer avvises", async () => {
  userId = "stranger"; await assert.rejects(actions.completeSession("s", 1, []), /forbidden/);
  userId = "player";
  for (const value of ["PLANNED", "CANCELLED", "SKIPPED"]) { status = value; await assert.rejects(actions.completeSession("s", 1, []), /ikke pågående/); }
  status = "IN_PROGRESS";
  await assert.rejects(actions.completeSession("s", -1, []), /varighet/);
  await assert.rejects(actions.completeSession("s", 1, ["other"]), /Ugyldig øvelse/);
  assert.equal(transactionCalls, 0);
});
test("tom ferdigliste er null ferdige, ikke antall autosendte logger", async () => {
  mirrored = false; await actions.completeSession("s", 0, []);
  assert.deepEqual(writes, ["session"]);
  assert.equal((stored as { liveSummary: { drillsCompleted: number } }).liveSummary.drillsCompleted, 0);
});
