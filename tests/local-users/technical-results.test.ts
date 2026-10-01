/** Real local storage and ownership queries. Only request identity/cache/agent triggers are seams. */
import assert from "node:assert/strict";
import { before, after, mock, test } from "node:test";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { assertLocalUsersTargets, assertLocalUsersDatabase } from "../../scripts/local-users-target.mjs";
const targets = assertLocalUsersTargets(process.env);
const identity = new AsyncLocalStorage<{ id: string; role: string }>();
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => { const user = identity.getStore(); if (!user) throw new Error("No synthetic identity"); return user; } } });
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => identity.getStore() ?? null } });
mock.module("next/navigation", { namedExports: { redirect: () => { throw new Error("Synthetic request redirected"); } } });
mock.module("@/lib/auth/requireConsentingUser", { namedExports: { requireConsentingUser: async () => { const user = identity.getStore(); if (!user) throw new Error("No synthetic identity"); return user; } } });
mock.module("@/lib/agents/triggers", { namedExports: { triggerLiveSessionAgent: async () => {} } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
const prefix = `synthetic-results-${randomUUID()}`;
let db: typeof import("../../src/lib/prisma").prisma;
let wb: typeof import("../../src/lib/workbench/wb-actions");
let result: typeof import("../../src/lib/workbench/result-actions");
let v2: typeof import("../../src/app/portal/(fullscreen)/live/[sessionId]/actions");
const owner = { id: `${prefix}-owner`, role: "PLAYER" };
const stranger = { id: `${prefix}-stranger`, role: "PLAYER" };
let sessionId: string, taskId: string, drillId: string, fysId: string, legacyId: string, legacyDrillId: string;
const golf = { type: "golf" as const, repsWithoutBall: 2, repsLowSpeed: 3, repsAutomatic: 7, repsHit: 4, notat: "Syntetisk måling" };
function own<T>(run: () => Promise<T>) { return identity.run(owner, run); }
function ok<T>(r: { ok: true; data: T } | { ok: false; error: string }): T { if (!r.ok) throw new Error(r.error); assert.equal(r.ok, true); return r.data; }
async function save(id: string, measured: unknown, revision?: string) {
  const row = await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } });
  return own(() => result.saveWorkbenchDrillResult({ sessionId, drillId: id, expectedUpdatedAt: revision ?? row.updatedAt.toISOString(), actualDurationSec: 120, result: measured }));
}
before(async () => {
  const sql = new pg.Pool({ connectionString: targets.database.toString() });
  try { await assertLocalUsersDatabase(sql); } finally { await sql.end(); }
  db = (await import("../../src/lib/prisma")).prisma;
  await db.user.createMany({ data: [owner, stranger].map(u => ({ id: u.id, authId: randomUUID(), email: `${u.id}@example.test`, name: "Syntetisk resultatspiller", role: "PLAYER" })) });
  const plan = await db.technicalPlan.create({ data: { userId: owner.id, opprettetAvId: owner.id, navn: "Syntetisk kildeplan", status: "ACTIVE", startDato: new Date("2026-01-01"), positions: { create: { pNummer: "P1.0", navn: "Oppstilling", sortOrder: 0, tasks: { create: { tittel: "Syntetisk oppgave", pyramide: "TEK", omraade: "Tee Total", koller: [], sortOrder: 0, motorikk: "AUTO", maalMatrise: { create: { motorikk: "AUTO", belastning: "INNENDORS", maalReps: 100 } } } } } } }, include: { positions: { include: { tasks: true } } } });
  taskId = plan.positions[0].tasks[0].id;
  wb = await import("../../src/lib/workbench/wb-actions"); result = await import("../../src/lib/workbench/result-actions"); v2 = await import("../../src/app/portal/(fullscreen)/live/[sessionId]/actions");
  const created = ok(await own(() => wb.createSession({ playerId: owner.id, date: "2026-10-01", startMinute: 1, durationMinutes: 30, title: "Syntetisk blandet økt", pyramid: "TEK", drills: [
    { title: "Syntetisk teknikk", durationMinutes: 15, sourceId: taskId, techniqueFocus: "P1.0", akFormel: { pyramid: "TEK", area: "TEE", label: "Kildemåling", motorikk: "AUTO", belastning: "INNENDORS", detaljer: { mengde: { enhet: "SLAG", antall: 30 } } } },
    { title: "Syntetisk styrke", durationMinutes: 15, akFormel: { pyramid: "FYS", area: "STYRKE", label: "Styrke", detaljer: { mengde: { enhet: "SERIER", antall: 4, reps: 6, vektKg: 90, rir: 2 } } } },
  ] })));
  sessionId = created.id; drillId = created.drills[0].id; fysId = created.drills[1].id;
  ok(await own(() => wb.publishSessions([sessionId]))); ok(await own(() => wb.startSession(sessionId)));
  const legacy = await db.trainingSessionV2.create({ data: { title: "Syntetisk V2", coachId: owner.id, studentId: owner.id, startTime: new Date("2026-10-01T07:00Z"), endTime: new Date("2026-10-01T07:30Z"), status: "IN_PROGRESS", miljo: "M0", practiceType: "BLOKK", drills: { create: { name: "Syntetisk V2-øvelse", sortOrder: 0, durationMinutes: 15, pyramide: "TEK", belastning: "INNENDORS", positionTaskId: taskId } } }, include: { drills: true } });
  legacyId = legacy.id; legacyDrillId = legacy.drills[0].id;
});
after(async () => {
  if (!db) return;
  await db.workbenchPhysicalBlock.deleteMany({ where: { playerId: owner.id } });
  await db.workbenchSession.deleteMany({ where: { playerId: owner.id } });
  await db.trainingSessionV2.deleteMany({ where: { studentId: owner.id } });
  await db.technicalPlan.deleteMany({ where: { userId: owner.id } });
  await db.user.deleteMany({ where: { id: { in: [owner.id, stranger.id] } } });
  await db.$disconnect();
});
test("plan → måling bevarer øvelse, kilde, dose og alle normalhastighetsreps", async () => {
  assert.equal((await save(drillId, golf)).ok, true);
  const row = await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } });
  const { readDrillResults } = await import("../../src/lib/portal-live/training-result");
  const saved = readDrillResults(row.liveSnapshot)[0];
  assert.equal(saved.drillId, drillId); assert.equal(saved.source.sourceId, taskId); assert.ok(saved.source.sourceRevision);
  assert.equal(saved.source.akFormel?.detaljer?.mengde?.antall, 30);
  const task = await db.positionTask.findUniqueOrThrow({ where: { id: taskId } });
  assert.equal(task.repsGjortDry, 2); assert.equal(task.repsGjortLav, 3); assert.equal(task.repsGjortFull, 11);
  assert.equal((await db.positionTaskMaal.findFirstOrThrow({ where: { taskId } })).gjortReps, 11);
});
test("retry og parallelle identiske målinger øker ikke oppgaven", async () => {
  const before = await db.positionTask.findUniqueOrThrow({ where: { id: taskId } });
  assert.ok((await Promise.all([save(drillId, golf), save(drillId, golf)])).every(r => r.ok));
  assert.equal((await db.positionTask.findUniqueOrThrow({ where: { id: taskId } })).repsGjortFull, before.repsGjortFull);
});
test("korrigering nedover bevarer kilde og rekalkulerer målmatrisen", async () => {
  const before = await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } });
  const { readDrillResults } = await import("../../src/lib/portal-live/training-result");
  const source = readDrillResults(before.liveSnapshot)[0].source;
  assert.equal((await save(drillId, { ...golf, repsAutomatic: 1, repsHit: 1 })).ok, true);
  const after = await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } });
  assert.deepEqual(readDrillResults(after.liveSnapshot)[0].source, source);
  assert.equal((await db.positionTask.findUniqueOrThrow({ where: { id: taskId } })).repsGjortFull, 2);
  assert.equal((await db.positionTaskMaal.findFirstOrThrow({ where: { taskId } })).gjortReps, 2);
});
test("FYS-resultat bevarer kg/reps/RIR og avviser golf-enheter og gamle revisjoner", async () => {
  assert.equal((await save(fysId, golf)).ok, false);
  assert.equal((await save(drillId, { ...golf, repsHit: 99 }, new Date(0).toISOString())).ok, false);
  assert.equal((await save(fysId, { type: "styrke", sett: [{ vekt: 90, reps: 6, rir: 2 }], notat: "Syntetisk" })).ok, true);
  await db.workbenchDrill.update({ where: { id: fysId }, data: { title: "Endret syntetisk styrkeplan", akFormel: { pyramid: "FYS", area: "STYRKE", label: "Styrke", detaljer: { mengde: { enhet: "SERIER", antall: 5, reps: 8, vektKg: 120 } } } } });
});
test("fremmed spiller og fremmed øvelse avvises uten å endre lagringen", async () => {
  const before = await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } });
  assert.equal((await identity.run(stranger, () => result.saveWorkbenchDrillResult({ sessionId, drillId, expectedUpdatedAt: before.updatedAt.toISOString(), actualDurationSec: 1, result: golf }))).ok, false);
  assert.equal((await save("foreign", golf)).ok, false);
  assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } }), before);
});
test("lagringsfeil i teknisk teller ruller tilbake resultat og revisjon", async () => {
  const before = await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } });
  await db.positionTask.update({ where: { id: taskId }, data: { repsGjortFull: 2147483647 } });
  assert.equal((await save(drillId, { ...golf, repsHit: 30 })).ok, false);
  assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } }), before);
  await db.positionTask.update({ where: { id: taskId }, data: { repsGjortFull: 2 } });
});
test("fysisk serie: samme ID ved retry, parallell lagring og retting av vekt", async () => {
  const block = await db.workbenchPhysicalBlock.create({ data: { playerId: owner.id, coachId: owner.id, title: "Syntetisk fysisk blokk", startDate: new Date("2026-10-01"), endDate: new Date("2026-10-07"), createdBy: owner.id,
    weeks: { create: { weekIndex: 1, label: "Syntetisk uke", weekStart: new Date("2026-09-28"), sessions: { create: { playerId: owner.id, date: new Date("2026-10-01"), title: "Syntetisk styrke", type: "STYRKE", sortOrder: 0, exercises: { create: { title: "Syntetisk styrkeøvelse", sortOrder: 0 } } } } } } }, include: { weeks: { include: { sessions: { include: { exercises: true } } } } } });
  const exerciseId = block.weeks[0].sessions[0].exercises[0].id;
  const { loggFysiskSett } = await import("../../src/lib/workbench/fys-turnering-actions");
  const input = { exerciseId, setNumber: 1, reps: 6, weightKg: 90, rir: 2 };
  const saved = await own(() => Promise.all([loggFysiskSett(input), loggFysiskSett(input)]));
  assert.ok(saved.every(r => r.ok)); assert.equal(saved[0].logId, saved[1].logId);
  assert.equal(await db.workbenchPhysicalLog.count({ where: { exerciseId } }), 1);
  const { readPhysicalResultNote } = await import("../../src/lib/workbench/physical-result");
  const firstSource = readPhysicalResultNote((await db.workbenchPhysicalLog.findFirstOrThrow({ where: { exerciseId } })).note)?.source;
  assert.equal(firstSource?.id, exerciseId); assert.equal(firstSource?.pyramid, "FYS");
  await db.workbenchPhysicalExercise.update({ where: { id: exerciseId }, data: { title: "Endret syntetisk plan", weightKg: 120 } });
  const corrected = await own(() => loggFysiskSett({ ...input, weightKg: 80 }));
  assert.equal(corrected.logId, saved[0].logId);
  assert.equal((await db.workbenchPhysicalLog.findFirstOrThrow({ where: { exerciseId } })).weightKg, 80);
  assert.deepEqual(readPhysicalResultNote((await db.workbenchPhysicalLog.findFirstOrThrow({ where: { exerciseId } })).note)?.source, firstSource);
  assert.equal((await identity.run(stranger, () => loggFysiskSett(input))).ok, false);
  const historical = await db.workbenchPhysicalLog.create({ data: { playerId: owner.id, exerciseId, setNumber: 2, weightKg: 50, note: "Syntetisk eldre notat" } });
  await own(() => loggFysiskSett({ ...input, setNumber: 2 }));
  const updated = await db.workbenchPhysicalLog.findUniqueOrThrow({ where: { id: historical.id } });
  assert.equal(readPhysicalResultNote(updated.note)?.source, null);
});
test("fullføring → reload → oppsummering → analyse bruker samme ID, akse og måling", async () => {
  ok(await own(() => wb.completeSessionWithEffort({ sessionId, actualMinutes: 27, perceivedEffort: 6 })));
  const stored = await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId }, include: { drills: true } });
  const { mapWbToLiveSummary } = await import("../../src/lib/portal-live/wb-live-map");
  const summary = mapWbToLiveSummary(stored, [{ count: 99 }]);
  assert.equal(summary.totalReps, 7); assert.equal(summary.durationSec, 1620); assert.equal(summary.trainingResults?.length, 2);
  assert.equal(summary.drills.find(d => d.id === fysId)?.fysVektKg, 90);
  const { getTrainingStats } = await import("../../src/app/portal/analysere/actions");
  const stats = await own(() => getTrainingStats(owner.id, "all"));
  assert.equal(stats.recentSessions.find(s => s.id === sessionId)?.reps, 7);
  assert.equal(stats.results?.find(s => s.sessionId === sessionId)?.results[1].result.type, "styrke");
  assert.equal(stats.analyse?.faktiskeReps, 7);
  assert.equal(stats.physicalResults?.[0].weightKg, 80);
  assert.equal(stats.physicalResults?.[0].source?.title, "Syntetisk styrkeøvelse");
  assert.equal(summary.drillsCompleted, 0);
  assert.equal(summary.pyramidSummary.TEK, 7);
  const { hentTreningsHistorikk } = await import("../../src/lib/portal-analyse/trenings-historikk");
  const timeline = await hentTreningsHistorikk({ userId: owner.id, fra: new Date("2026-01-01"), til: new Date("2030-01-01") });
  const physical = timeline.find(r => r.id === fysId);
  assert.equal(physical?.pyramide, "FYS"); assert.equal(physical?.maalt, true); assert.equal(physical?.minutter, 2);
  assert.equal((await save(drillId, golf)).ok, false);
});
test("V2: parallelle målinger teller én gang, korrigering og sluttstatus er sammenhengende", async () => {
  const input = { sessionId: legacyId, drillId: legacyDrillId, repsTotal: 16, repsWithoutBall: 2, repsLowSpeed: 3, repsAutomatic: 7, repsHit: 4, actualDurationSec: 123 };
  await assert.rejects(own(() => v2.logDrillReps({ ...input, repsTotal: 99 })), /Antall må stemme/);
  await own(() => Promise.all([v2.logDrillReps(input), v2.logDrillReps(input)]));
  assert.equal(await db.drillLogV2.count({ where: { drillId: legacyDrillId } }), 1);
  assert.equal((await db.positionTask.findUniqueOrThrow({ where: { id: taskId } })).repsGjortFull, 13);
  assert.equal((await db.positionTaskMaal.findFirstOrThrow({ where: { taskId } })).gjortReps, 13);
  await own(() => v2.logDrillReps({ ...input, repsTotal: 7, repsAutomatic: 1, repsHit: 1 }));
  assert.equal((await db.positionTaskMaal.findFirstOrThrow({ where: { taskId } })).gjortReps, 4);
  assert.equal((await db.positionTask.findUniqueOrThrow({ where: { id: taskId } })).repsGjortFull, 4);
  const physicalDrill = await db.trainingDrillV2.create({ data: { sessionId: legacyId, name: "Syntetisk V2-styrke", pyramide: "FYS", sortOrder: 1, durationMinutes: 5, fysVektKg: 90, fysSett: 4, fysReps: 6 } });
  const { fysLoggState } = await import("../../src/lib/portal-live/fys-registrering");
  const state = fysLoggState({ type: "styrke", sett: [{ vekt: 90, reps: 6, rir: 2 }], notat: "" });
  await own(() => v2.logDrillReps({ sessionId: legacyId, drillId: physicalDrill.id, ...state, notes: state.logNotes }));
  await db.trainingDrillV2.update({ where: { id: physicalDrill.id }, data: { fysVektKg: 120 } });
  await own(() => v2.completeSession(legacyId, 123, [legacyDrillId]));
  const final = await db.trainingSessionV2.findUniqueOrThrow({ where: { id: legacyId } });
  const { readDrillResults } = await import("../../src/lib/portal-live/training-result");
  const measured = readDrillResults(final.completedSummary);
  assert.equal(measured[0].drillId, legacyDrillId);
  assert.deepEqual(measured[1].result, { type: "styrke", sett: [{ vekt: 90, reps: 6, rir: 2 }], notat: "" });
  const reloaded = await own(() => v2.loadLiveSession(legacyId));
  assert.equal(reloaded.ok && reloaded.data.drills.find(d => d.id === physicalDrill.id)?.fysVektKg, 90);
  assert.equal((final.completedSummary as { liveSummary: { totalReps: number } }).liveSummary.totalReps, 7);
  assert.equal((await own(() => v2.logDrillReps(input))).ok, false);
});
