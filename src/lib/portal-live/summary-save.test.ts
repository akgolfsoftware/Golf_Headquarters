import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

let viewer = "player";
let status = "COMPLETED";
let summary: Record<string, unknown> = {};
let mirror: unknown = null;
let failMirror = false;
let updates = 0;
// Databasegrensen simuleres her. JSON-operatoren prøves separat i PostgreSQL.
async function execute(query: Prisma.Sql) {
  assert.match(query.text, /UPDATE "training_sessions_v2"/);
  assert.match(query.text, /\|\| \$1::jsonb/);
  assert.match(query.text, /"status" = 'COMPLETED'/);
  assert.equal(query.values[1], "session");
  if (status !== "COMPLETED") return 0;
  updates++;
  summary = { ...summary, ...JSON.parse(String(query.values[0])) };
  return 1;
}
mock.module("@/lib/auth/requireConsentingUser", { namedExports: { requireConsentingUser: async () => ({ id: viewer, role: "PLAYER" }) } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => false } });
mock.module("@/lib/agents/triggers", { namedExports: { triggerLiveSessionAgent: async () => {} } });
mock.module("@/lib/workbench/v2-sync", { namedExports: { GENERERT_FRA: "test" } });
mock.module("@/lib/teknisk-plan/apply-reps", { namedExports: { applyPositionTaskReps: async () => {} } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  trainingSessionV2: { findUnique: async () => ({ id: "session", studentId: "player", coachId: "coach", participants: [], drills: [], status, completedSummary: structuredClone(summary), generertFra: "test", generertFraId: "plan" }) },
  $executeRaw: execute,
  $transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
    const previous = structuredClone(summary);
    try { return await callback({ $executeRaw: execute, trainingPlanSessionLog: { upsert: async (input: unknown) => {
      if (failMirror) throw new Error("synthetic mirror error");
      mirror = input;
    } } }); } catch (error) { summary = previous; throw error; }
  },
} } });
let actions: typeof import("@/app/portal/(fullscreen)/live/[sessionId]/actions");
before(async () => { actions = await import("@/app/portal/(fullscreen)/live/[sessionId]/actions"); });
beforeEach(() => { viewer = "player"; status = "COMPLETED"; failMirror = false; mirror = null; updates = 0; summary = { liveSummary: { durationSec: 600, completedDrillIds: ["d1"] }, coachBrief: { melding: "Bevares" } }; });
const rating = { kvalitet: 4, rpe: 6, nesteFokus: "Rytme", folelse: "Fokusert" };

test("samtidige notat- og vurderingshandlinger beholder separate felt og planspeil", async () => {
  const results = await Promise.all([actions.lagreDineOrd("session", "Mine ord"), actions.lagreSpillerVurdering("session", rating)]);
  assert(results.every((result) => result.ok));
  assert.equal((summary.dineOrd as { tekst: string }).tekst, "Mine ord");
  assert.equal((summary.spillerVurdering as { sRpe: number }).sRpe, 60);
  assert.deepEqual(summary.liveSummary, { durationSec: 600, completedDrillIds: ["d1"] });
  assert.deepEqual(summary.coachBrief, { melding: "Bevares" });
  assert(mirror);
});
test("notat lagret etter vurdering endrer ikke neste fokus eller vurdering", async () => {
  await actions.lagreSpillerVurdering("session", rating);
  const saved = structuredClone(summary.spillerVurdering);
  await actions.lagreDineOrd("session", "Nye ord");
  assert.deepEqual(summary.spillerVurdering, saved);
});
test("feil i planspeil ruller tilbake vurderingen", async () => {
  failMirror = true;
  const previous = structuredClone(summary);
  await assert.rejects(actions.lagreSpillerVurdering("session", rating), /mirror error/);
  assert.deepEqual(summary, previous);
});
test("uvedkommende kan ikke lagre notat eller vurdering", async () => {
  viewer = "stranger";
  await assert.rejects(actions.lagreDineOrd("session", "Mine ord"), /forbidden/);
  await assert.rejects(actions.lagreSpillerVurdering("session", rating), /forbidden/);
  assert.equal(updates, 0);
});
test("uferdig økt og ugyldige eller for lange verdier gir ingen lagring", async () => {
  status = "IN_PROGRESS";
  assert.equal((await actions.lagreDineOrd("session", "Mine ord")).ok, false);
  assert.equal((await actions.lagreSpillerVurdering("session", rating)).ok, false);
  status = "COMPLETED";
  assert.equal((await actions.lagreDineOrd("session", "x".repeat(2001))).ok, false);
  for (const kvalitet of [NaN, 1.5, 0, 6]) assert.equal((await actions.lagreSpillerVurdering("session", { ...rating, kvalitet })).ok, false);
  assert.equal(updates, 0);
});
