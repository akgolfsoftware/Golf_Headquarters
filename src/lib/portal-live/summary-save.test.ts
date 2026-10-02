import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

let viewer = "player";
let status = "COMPLETED";
let summary: Record<string, unknown> = {};
let mirror: unknown = null;
let failMirror = false;
let failNote = false;
let updates = 0;
// Databasegrensen simuleres her. JSON-operatoren prøves separat i PostgreSQL.
async function execute(query: Prisma.Sql) {
  assert.match(query.text, /UPDATE "training_sessions_v2"/);
  assert.match(query.text, /"status" = 'COMPLETED'/);
  assert.equal(query.values.at(-1), "session");
  if (status !== "COMPLETED") return 0;
  updates++;
  if (query.text.includes("jsonb_build_object")) {
    const field = String(query.values[0]);
    const previous = summary[field];
    summary = { ...summary, [field]: { ...(previous && typeof previous === "object" && !Array.isArray(previous) ? previous : {}), ...JSON.parse(String(query.values[3])) } };
  } else {
    const patch = JSON.parse(String(query.values[0]));
    if (failNote && patch.dineOrd) throw new Error("synthetic note error");
    summary = { ...summary, ...patch };
  }
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
beforeEach(() => { viewer = "player"; status = "COMPLETED"; failMirror = false; failNote = false; mirror = null; updates = 0; summary = { liveSummary: { durationSec: 600, completedDrillIds: ["d1"] }, coachBrief: { melding: "Bevares" } }; });
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
test("PH-07: belastning og fokus 1–10 lagres uten kvalitet, og uten planspeil", async () => {
  const res = await actions.lagreSpillerVurdering("session", { rpe: 6, fokus: 7, nesteFokus: "" });
  assert.equal(res.ok, true);
  const sv = summary.spillerVurdering as { kvalitet: number | null; fokus: number; rpe: number; sRpe: number };
  assert.equal(sv.kvalitet, undefined);
  assert.equal(sv.fokus, 7);
  assert.equal(sv.rpe, 6);
  assert.equal(sv.sRpe, 60);
  assert.equal(mirror, null);
});
test("PH-07: fokus utenfor 1–10 og tom vurdering gir ingen lagring", async () => {
  for (const fokus of [0, 11, 2.5, NaN]) assert.equal((await actions.lagreSpillerVurdering("session", { rpe: 5, fokus, nesteFokus: "" })).ok, false);
  assert.equal((await actions.lagreSpillerVurdering("session", { nesteFokus: "" })).ok, false);
  assert.equal(updates, 0);
});

test("nye felter bevarer tidligere kvalitet, følelse og neste fokus", async () => {
  await actions.lagreSpillerVurdering("session", rating);
  await actions.lagreSpillerVurdering("session", { rpe: 7, fokus: 8, notat: "Samlet notat" });
  const v = summary.spillerVurdering as Record<string, unknown>;
  assert.equal(v.kvalitet, 4); assert.equal(v.folelse, "Fokusert"); assert.equal(v.nesteFokus, "Rytme");
  assert.equal(v.rpe, 7); assert.equal(v.fokus, 8); assert.equal(v.sRpe, 70);
  assert.equal((summary.dineOrd as {tekst:string}).tekst, "Samlet notat");
});
test("notatfeil ruller tilbake vurdering og kvittering samlet", async () => {
  failNote = true; const before = structuredClone(summary);
  await assert.rejects(actions.lagreSpillerVurdering("session", { ...rating, notat: "Mine ord" }), /note error/);
  assert.deepEqual(summary, before);
});
test("lagre uten vurdering bevarer tidligere vurdering og kan tømme notatet", async () => {
  await actions.lagreSpillerVurdering("session", { ...rating, notat: "Gammelt" });
  const v = structuredClone(summary.spillerVurdering);
  assert.equal((await actions.lagreSpillerVurdering("session", { utenVurdering: true, notat: "" })).ok, true);
  assert.deepEqual(summary.spillerVurdering, v);
  assert.equal((summary.dineOrd as {tekst:string}).tekst, "");
  assert.equal((summary.etterOkt as {utenVurdering:boolean}).utenVurdering, true);
});
test("alle felter valideres før skriving, også manipulerte klientverdier", async () => {
  for (const input of [{ fokus: 11 }, { rpe: 1.5 }, { kvalitet: 4, notat: "x".repeat(2001) }, { kvalitet: 4, nesteFokus: 3 }, { utenVurdering: true, kvalitet: 4 }, null]) {
    assert.equal((await actions.lagreSpillerVurdering("session", input as never)).ok, false);
  }
  assert.equal(updates, 0);
});
test("samtidige endringer i separate vurderingsfelt bevares", async () => {
  await Promise.all([actions.lagreSpillerVurdering("session", { kvalitet: 4 }), actions.lagreSpillerVurdering("session", { rpe: 7, fokus: 8 })]);
  const v = summary.spillerVurdering as Record<string, unknown>;
  assert.equal(v.kvalitet, 4); assert.equal(v.rpe, 7); assert.equal(v.fokus, 8);
});
