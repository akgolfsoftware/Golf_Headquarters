/** Real local persistence and ownership queries; only request identity/cache are seams.
 * This is not browser authentication, provider integration or production evidence.
 */
import assert from "node:assert/strict";
import { before, after, mock, test } from "node:test";
import { AsyncLocalStorage } from "node:async_hooks";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";
import { assertLocalUsersDatabase, assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";

const targets = assertLocalUsersTargets(process.env);
const credentials = parse(readFileSync(resolve(".codex/environments/brukere/.env.users")));
const identity = new AsyncLocalStorage<{ id: string; role: string }>();
const invalidated = new Set<string>();
const ownIds: string[] = [];
const actors = new Map<string, { id: string; role: string }>();
const DATE = "2030-10-01";
const WEEK = "2030-09-30";
const NOW = new Date("2030-10-01T12:00:00Z");

mock.module("@/lib/auth/requirePortalUser", { namedExports: {
  requirePortalUser: async (options?: { allow?: string[] }) => {
    const viewer = identity.getStore();
    if (!viewer || (options?.allow && !options.allow.includes(viewer.role))) throw new Error("Test request identity rejected");
    return viewer;
  },
} });
mock.module("@/lib/auth/getCurrentUser", { namedExports: {
  getCurrentUser: async () => identity.getStore() ?? null,
} });
mock.module("next/cache", { namedExports: {
  revalidatePath: (path: string) => invalidated.add(path),
} });

let db: typeof import("../../src/lib/prisma").prisma;
let wb: typeof import("../../src/lib/workbench/wb-actions");
let portal: typeof import("../../src/app/portal/actions");
let live: typeof import("../../src/lib/portal-live/resolve-live-session");
let sessionId: string;

function as<T>(key: string, run: () => Promise<T>): Promise<T> {
  const actor = actors.get(key);
  assert.ok(actor, "Synthetic identity is missing");
  return identity.run(actor, run);
}
function data<T>(result: { ok: true; data: T } | { ok: false; error: string }): T {
  assert.equal(result.ok, true, result.ok ? undefined : result.error);
  if (!result.ok) throw new Error("Rejected test operation");
  return result.data;
}
async function create(owner = "P01", title = "Syntetisk koblingsøkt") {
  const created = data(await as(owner === "P03" ? "COACH_B" : "COACH_A", () => wb.createSession({
    playerId: actors.get(owner)!.id, date: DATE, startMinute: 540,
    durationMinutes: 30, title, pyramid: "SLAG",
    drills: [{ title: "Syntetisk presisjonsøvelse", durationMinutes: 15,
      akFormel: { pyramid: "SLAG", area: "TEE", label: "Syntetisk kilde" } }],
  })));
  ownIds.push(created.id);
  return created;
}

before(async () => {
  const sql = new pg.Pool({ connectionString: targets.database.toString() });
  try { await assertLocalUsersDatabase(sql); } finally { await sql.end(); }
  db = (await import("../../src/lib/prisma")).prisma;
  for (const key of ["COACH_A", "COACH_B", "P01", "P03"]) {
    const id = credentials[`LOCAL_${key}_ID`];
    assert.ok(id?.startsWith("local-users-20261001-"));
    const actor = await db.user.findUniqueOrThrow({ where: { id }, select: { id: true, role: true } });
    actors.set(key, actor);
  }
  wb = await import("../../src/lib/workbench/wb-actions");
  portal = await import("../../src/app/portal/actions");
  live = await import("../../src/lib/portal-live/resolve-live-session");
  sessionId = (await create()).id;
});
after(async () => {
  if (db) {
    // Delete only the exact IDs this run created, not other local sessions.
    await db.sessionBallLog.deleteMany({ where: { planSessionId: { in: ownIds } } });
    await db.workbenchSession.deleteMany({ where: { id: { in: ownIds } } });
    await db.$disconnect();
  }
});

test("trenerutkast lagres med samme økt- og øvelse-ID og er skjult i spillerens I dag/Plan", async () => {
  const coach = data(await as("COACH_A", () => wb.loadSession(sessionId)));
  assert.equal(coach?.status, "DRAFT");
  assert.equal(coach?.playerId, actors.get("P01")!.id);
  assert.equal(coach?.drills.length, 1);
  assert.equal(data(await as("P01", () => wb.loadPlayerSession(sessionId))), null);
  const day = data(await as("P01", () => wb.loadPlayerDay({ playerId: actors.get("P01")!.id, date: DATE })));
  assert.ok(!day.sessions.some(s => s.id === sessionId));
  const week = await as("P01", () => portal.getWeekOverview(actors.get("P01")!.id, NOW));
  assert.ok(!week.flatMap(d => d.sessions).some(s => s.id === sessionId));
});

test("fremmed trener og spiller avvises av faktiske eierskapsspørringer uten å endre raden", async () => {
  const before = await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } });
  for (const key of ["COACH_B", "P03"]) {
    assert.equal((await as(key, () => wb.moveSession({ sessionId, newDate: "2030-10-02", newStartMinute: 600 }))).ok, false);
    assert.equal((await as(key, () => wb.publishSessions([sessionId]))).ok, false);
    await assert.rejects(as(key, () => portal.getWeekOverview(actors.get("P01")!.id, NOW)), /Ingen tilgang/);
  }
  assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } }), before);
});

test("utkast kan ikke fullføres gjennom innsats-skjemaet", async () => {
  const draft = await create("P01", "Utkast som ikke kan fullføres");
  assert.equal((await as("P01", () => wb.completeSessionWithEffort({ sessionId: draft.id, actualMinutes: 20, perceivedEffort: 4 }))).ok, false);
  assert.equal((await db.workbenchSession.findUniqueOrThrow({ where: { id: draft.id } })).status, "DRAFT");
});

test("publisering med fremmed økt ruller hele utvalget tilbake", async () => {
  const own = await create();
  const other = await create("P03");
  assert.equal((await as("COACH_A", () => wb.publishSessions([own.id, other.id]))).ok, false);
  assert.equal((await db.workbenchSession.findUniqueOrThrow({ where: { id: own.id } })).status, "DRAFT");
  assert.equal((await db.workbenchSession.findUniqueOrThrow({ where: { id: other.id } })).status, "DRAFT");
});

test("publisering vises én gang med samme identitet i I dag, Plan og Live", async () => {
  const published = data(await as("COACH_A", () => wb.publishSessions([sessionId, sessionId])));
  assert.equal(published.length, 1);
  assert.equal(published[0].publishedBy, actors.get("COACH_A")!.id);
  assert.ok(published[0].publishedAt);
  const week = await as("P01", () => portal.getWeekOverview(actors.get("P01")!.id, NOW));
  const matches = week.flatMap(d => d.sessions).filter(s => s.id === sessionId);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].model, "wb");
  assert.equal(matches[0].href, `/portal/live/${sessionId}/brief`);
  assert.equal(matches[0].durationMin, 30);
  assert.equal(matches[0].startTime.toISOString(), "2030-10-01T07:00:00.000Z");
  const day = await as("P01", () => portal.getAllTodaysSessions(actors.get("P01")!.id, NOW));
  assert.equal(day.filter(s => s.id === sessionId).length, 1);
  const resolved = await live.resolveLiveSession(sessionId, actors.get("P01")!.id);
  assert.equal(resolved?.kind, "wb");
  assert.equal(resolved?.playerId, actors.get("P01")!.id);
  assert.ok(invalidated.has("/portal"));
});

test("Live lagrer teller og tid; en ny avlesning bruker samme øvelse", async () => {
  const started = data(await as("P01", () => wb.startSession(sessionId)));
  const drillId = started.drills[0].id;
  data(await as("P01", () => wb.saveWorkbenchLiveSnapshot({
    sessionId, totalSec: 420,
    drills: [{ drillId, reps: 23, elapsedSec: 420, status: "active" }],
    seriesTargets: { [drillId]: 4 },
  })));
  const reloaded = data(await as("P01", () => wb.loadWorkbenchLive({ weekStart: WEEK, playerId: actors.get("P01")!.id })));
  assert.equal(reloaded.current?.id, sessionId);
  assert.equal(reloaded.snapshot?.totalSec, 420);
  assert.equal(reloaded.snapshot?.drills[0].drillId, drillId);
  assert.equal(reloaded.snapshot?.drills[0].reps, 23);
  assert.equal(reloaded.snapshot?.seriesTargets[drillId], 4);
  const stored = await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } });
  assert.ok(stored.liveSnapshot);
  assert.equal(stored.status, "IN_PROGRESS");
});

test("Live avviser feil øvelses-ID uten å overskrive lagret status", async () => {
  const previous = await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } });
  assert.equal((await as("P01", () => wb.saveWorkbenchLiveSnapshot({
    sessionId, totalSec: 0, drills: [{ drillId: "foreign-drill", reps: 99, elapsedSec: 0, status: "active" }], seriesTargets: {},
  }))).ok, false);
  assert.deepEqual((await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } })).liveSnapshot, previous.liveSnapshot);
});

test("fullføring lagrer faktisk innsats og teller én gang i spillerens uke", async () => {
  const finished = data(await as("P01", () => wb.completeSessionWithEffort({ sessionId, actualMinutes: 27, perceivedEffort: 6 })));
  assert.equal(finished.status, "COMPLETED");
  assert.equal(finished.actualMinutes, 27);
  assert.equal(finished.perceivedEffort, 6);
  const stored = await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } });
  assert.equal(stored.liveSnapshot, null);
  const week = await as("P01", () => portal.getWeekOverview(actors.get("P01")!.id, NOW));
  assert.equal(week.flatMap(d => d.sessions).find(s => s.id === sessionId)?.status, "COMPLETED");
  const progress = await as("P01", () => portal.getWeekPlanProgress(actors.get("P01")!.id, NOW));
  assert.equal(progress.completedMin, 30); // Plan minutes, explicitly not measured effort time.
  assert.equal(progress.completedByAxis.SLAG, 30);
});

test("gjentatt fullføring bevarer lagrede verdier og oppdateringstid", async () => {
  const previous = await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } });
  const repeat = data(await as("P01", () => wb.completeSessionWithEffort({ sessionId, actualMinutes: 99, perceivedEffort: 9 })));
  assert.equal(repeat.actualMinutes, 27);
  assert.equal(repeat.perceivedEffort, 6);
  assert.equal((await db.workbenchSession.findUniqueOrThrow({ where: { id: sessionId } })).updatedAt.getTime(), previous.updatedAt.getTime());
  assert.equal((await as("P01", () => wb.startSession(sessionId))).ok, false);
});

test("tilbaketrekking fjerner økten hos spilleren uten å slette coachens utkast", async () => {
  const draft = await create();
  data(await as("COACH_A", () => wb.publishSessions([draft.id])));
  data(await as("COACH_A", () => wb.unpublishSession(draft.id)));
  assert.equal(data(await as("COACH_A", () => wb.loadSession(draft.id)))?.status, "DRAFT");
  assert.equal(data(await as("P01", () => wb.loadPlayerSession(draft.id))), null);
});

test("oppsummeringens neste økt finner bare synlig og godkjent Workbench-publisering", async () => {
  const next = await create("P01", "Neste syntetiske økt");
  data(await as("COACH_A", () => wb.moveSession({ sessionId: next.id, newDate: "2030-10-02", newStartMinute: 600 })));
  data(await as("COACH_A", () => wb.publishSessions([next.id])));
  const { loadNesteOkt } = await import("../../src/lib/portal/load-neste-okt");
  const found = await loadNesteOkt(actors.get("P01")!.id, NOW);
  assert.equal(found.href, `/portal/live/${next.id}/brief`);
  assert.equal(found.okt?.tittel, next.title);
  assert.equal(found.okt?.startTime.toISOString(), "2030-10-02T08:00:00.000Z");
  for (const patch of [{ hiddenByPlayer: true }, { needsPlayerApproval: true }, { approvalStatus: "REJECTED" }]) {
    await db.workbenchSession.update({ where: { id: next.id }, data: {
      hiddenByPlayer: false, needsPlayerApproval: false, approvalStatus: null, ...patch,
    } });
    assert.equal((await loadNesteOkt(actors.get("P01")!.id, NOW)).okt, null);
  }
  await db.workbenchSession.update({ where: { id: next.id }, data: { approvalStatus: null } });
  data(await as("COACH_A", () => wb.unpublishSession(next.id)));
  assert.equal((await loadNesteOkt(actors.get("P01")!.id, NOW)).okt, null);
});

test("uke over årsskiftet beholder Oslo-dato og ID i spillerens Plan", async () => {
  const draft = await create();
  data(await as("COACH_A", () => wb.moveSession({ sessionId: draft.id, newDate: "2030-12-31", newStartMinute: 30 })));
  data(await as("COACH_A", () => wb.publishSessions([draft.id])));
  const week = await as("P01", () => portal.getWeekOverview(actors.get("P01")!.id, new Date("2031-01-01T12:00:00Z")));
  const found = week.flatMap(d => d.sessions).find(s => s.id === draft.id);
  assert.ok(found);
  assert.equal(found.startTime.toISOString(), "2030-12-30T23:30:00.000Z");
});

test("slagteller → sluttelling → oppsummering beholder lagring uten duplikater", async () => {
  const session = await create("P01", "Syntetisk slagtellerreise");
  data(await as("COACH_A", () => wb.publishSessions([session.id])));
  data(await as("P01", () => wb.startSession(session.id)));
  const tapper = await import("../../src/app/portal/(fullscreen)/live/[sessionId]/tapper/actions");
  const counts = [{ club: "synthetic-7i", count: 12, area: "FULL_SVING", repetitionType: "FULL_SPEED" }];
  assert.equal((await as("COACH_B", () => tapper.saveTapperCounts(session.id, counts))).ok, false);
  assert.equal(await db.sessionBallLog.count({ where: { planSessionId: session.id } }), 0);
  assert.equal((await as("P01", () => tapper.saveTapperCounts(session.id, counts))).ok, true);
  assert.equal((await as("P01", () => tapper.saveTapperCounts(session.id, counts))).ok, true);
  assert.equal(await db.sessionBallLog.count({ where: { planSessionId: session.id } }), 1);
  assert.equal((await as("P01", () => tapper.finishTapperSession(session.id, [{ ...counts[0], count: 17 }]))).ok, true);
  assert.equal((await as("P01", () => tapper.finishTapperSession(session.id, [{ ...counts[0], count: 99 }]))).ok, true);
  const row = await live.loadWorkbenchForLive(session.id);
  assert.ok(row);
  assert.equal(row.status, "COMPLETED");
  const stored = await db.sessionBallLog.findMany({ where: { planSessionId: session.id }, select: { count: true } });
  const { mapWbToLiveSummary } = await import("../../src/lib/portal-live/wb-live-map");
  const summary = mapWbToLiveSummary(row, stored);
  assert.equal(summary.sessionId, session.id);
  assert.equal(summary.totalReps, 17);
  assert.equal(summary.durationSec, 0); // No measured timer was stored by this tapper path.
  assert.equal(summary.completed, true);
});
