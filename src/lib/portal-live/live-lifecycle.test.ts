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
let finishDuringLock = false;
let logsEmpty = false;
mock.module("@/lib/auth/requireConsentingUser", { namedExports: { requireConsentingUser: async () => ({ id: userId, role: "PLAYER" }) } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => false } });
mock.module("@/lib/agents/triggers", { namedExports: { triggerLiveSessionAgent: async () => {} } });
mock.module("@/lib/workbench/v2-sync", { namedExports: { GENERERT_FRA: "test" } });
mock.module("@/lib/teknisk-plan/apply-reps", { namedExports: { applyPositionTaskReps: async () => {} } });
mock.module("next/navigation", { namedExports: { redirect: () => { throw new Error("unexpected redirect"); } } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  trainingSessionV2: {
    findUnique: async () => ({ id: "s", studentId: "player", participants: [], drills: [{ id: "d1" }, { id: "d2" }], status, updatedAt: new Date(0), completedSummary: { other: "preserve" }, startTime: new Date(0), generertFra: mirrored ? "test" : null, generertFraId: "plan" }),
    update: (input: { where: { status?: string }; data: { completedSummary?: unknown; status: string } }) => ({ kind: "session", apply: () => { if (input.where.status && input.where.status !== status) throw new Error("Session changed before lock"); status = input.data.status; stored = input.data.completedSummary; } }),
  },
  drillLogV2: {
    findMany: async () => logsEmpty ? [] : [{ drillId: "d1", repsTotal: 12, loggedAt: new Date(0) }, { drillId: "d2", repsTotal: 1, loggedAt: new Date(1000) }],
    findFirst: async () => ({ id: "log", repsWithoutBall: 0, repsLowSpeed: 0, repsHit: 1 }),
    upsert: async (input: { update: { repsTotal: number } }) => { loggedTotal = input.update.repsTotal; },
  },
  trainingDrillV2: { findUnique: async () => ({ positionTaskId: null }) },
  trainingPlanSession: { updateMany: () => ({ kind: "plan", apply: () => {} }) },
  trainingPlanSessionLog: { upsert: () => ({ kind: "plan-log", apply: () => {} }) },
  $transaction: async (batch: { kind: string; apply: () => void }[] | ((tx: unknown) => Promise<unknown>)) => {
    transactionCalls++;
    if (typeof batch !== "function") writes = batch.map((op) => op.kind);
    if (failTransaction) throw new Error("synthetic transaction failure");
    if (finishDuringLock) status = "COMPLETED";
    if (typeof batch === "function") return batch({
      trainingSessionV2: { update: async ({ where }: { where: { status: string } }) => { if (where.status !== status) throw new Error("Session changed before lock"); } },
      drillLogV2: { findFirst: async () => ({ id: "log", repsWithoutBall: 0, repsLowSpeed: 0, repsHit: 1 }), upsert: async ({ update }: { update: { repsTotal: number } }) => { loggedTotal = update.repsTotal; } },
      trainingDrillV2: { findUnique: async () => ({ positionTaskId: null, actualDurationSec: null }), update: async () => {} },
    });
    for (const op of batch) op.apply();
  },
} } });
let actions: typeof import("@/app/portal/(fullscreen)/live/[sessionId]/actions");
before(async () => { actions = await import("@/app/portal/(fullscreen)/live/[sessionId]/actions"); });
beforeEach(() => { userId = "player"; status = "IN_PROGRESS"; mirrored = true; failTransaction = false; stored = null; writes = []; transactionCalls = 0; loggedTotal = null; finishDuringLock = false; logsEmpty = false; });
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
test("logg som kommer etter fullføring i en annen fane endrer ingen tall", async () => {
  finishDuringLock = true;
  await assert.rejects(actions.logDrillReps({ ...input, repsTotal: 1 }), /changed before lock/);
  assert.equal(loggedTotal, null); assert.equal(status, "COMPLETED");
});
test("planlagt klokkeslett blir ikke målt varighet uten klokke eller logger", async () => {
  mirrored = false; logsEmpty = true;
  await actions.completeSession("s");
  const summary = (stored as { liveSummary: { durationSec: number | null; startedAt: string | null } }).liveSummary;
  assert.equal(summary.durationSec, null); assert.equal(summary.startedAt, null);
});
