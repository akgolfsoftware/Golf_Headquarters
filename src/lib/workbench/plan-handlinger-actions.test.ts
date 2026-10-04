import assert from "node:assert/strict";
import { before, beforeEach, after, mock, test } from "node:test";
import type { WbRow } from "./wb-map";
let viewer = { id: "syntetisk-p1", role: "PLAYER" }, tilgang = true, race = false, reads = 0;
const keyBefore = process.env.WORKBENCH_UNDO_SECRET;
const stamp = "2026-10-02T10:00:00.000Z";
function row(patch: Partial<WbRow> = {}): WbRow {
 return { id: "syntetisk-okt", playerId: "syntetisk-p1", coachId: "syntetisk-c1", groupId: null, sourceGroupSessionId: null,
 date: new Date("2026-09-28"), startMinute: 600, durationMinutes: 60, title: "Syntetisk", pyramid: "TEK", blockType: "OEKT", status: "DRAFT", environment: null, practiceType: null,
 location: "Syntetisk sted", notes: "Syntetisk notat", origin: "PLAYER", needsPlayerApproval: false, approvalStatus: null, localOverride: false, publishedAt: null, publishedBy: null, isAgentProposal: false, planActionId: null,
 createdBy: "syntetisk-p1", createdAt: new Date(stamp), updatedAt: new Date(stamp), seriesId: null, seriesIndex: null, isTemplate: false, hiddenByPlayer: false,
 planId: null, rationale: "Syntetisk formål", skillArea: null, pressureLevel: null, pPosisjoner: ["P5"], maalsetning: "Syntetisk mål", liveSnapshot: null,
 lFase: null, miljo: null, csNivaa: null, migrertFraTrainingPlanSessionId: null, perceivedEffort: null, actualMinutes: null,
 drills: [{ id: "syntetisk-drill", sessionId: "syntetisk-okt", title: "Syntetisk øvelse", description: null, durationMinutes: 60,
 akFormel: { pyramid: "TEK", area: "TEE", label: "Syntetisk", historiskUkjent: { zero: 0 } }, techniqueFocus: "P5", sourceId: "exercise:syntetisk-bank", sortOrder: 1, exerciseId: "syntetisk-bank", positionTaskId: "syntetisk-posisjon",
 repType: "BALLER_SLATT", repAntall: 0, repMinutter: null, repSett: null, repReps: null, planRepsUtenBall: 0, planRepsLavFart: null, planRepsAuto: null }], ...patch };
}
let rows: WbRow[] = [], created = 0, personalBlocks: Array<Record<string, unknown>> = [];
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => tilgang } });
mock.module("next/cache", { namedExports: { revalidatePath() {} } });
const tx = { workbenchSession: {
 findFirst: async ({ where }: { where: { id: string; playerId: string } }) => { reads++; return rows.find(r => r.id === where.id && r.playerId === where.playerId) ?? null; },
 findMany: async ({ where }: { where: { playerId: string; id: { not: string }; date: Date } }) => rows.filter(r => r.playerId === where.playerId && r.id !== where.id.not && r.date.getTime() === where.date.getTime() && r.status !== "CANCELLED"),
 updateMany: async ({ where, data }: { where: { id: string; playerId: string; updatedAt: Date; status: string }; data: Partial<WbRow> }) => {
  const r = rows.find(r => r.id === where.id && r.playerId === where.playerId && r.status === where.status && r.updatedAt.getTime() === where.updatedAt.getTime());
  if (race || !r) return { count: 0 }; Object.assign(r, data); return { count: 1 };
 },
 create: async ({ data }: { data: Record<string, unknown> }) => {
  const id = `syntetisk-kopi-${++created}`, copy = row({ ...data, id, updatedAt: new Date(Date.parse(stamp) + created), drills: [] });
  const drills = (data.drills as { create: WbRow["drills"] }).create;
  copy.drills = drills.map((d, i) => ({ ...d, id: `${id}-drill-${i}`, sessionId: id })); rows.push(copy); return { id, updatedAt: copy.updatedAt };
 },
}, playerBusyBlock: { findMany: async () => personalBlocks }, groupSchedule: { findMany: async () => [] }, workbenchTournamentPlan: { findMany: async () => [] } };
mock.module("@/lib/prisma", { namedExports: { prisma: { ...tx, $transaction: async (cb: (t: typeof tx) => Promise<unknown>) => {
 const original = structuredClone(rows); try { return await cb(tx); } catch (e) { rows = original; throw e; }
} } } });
let actions: typeof import("./plan-handlinger-actions");
before(async () => { actions = await import("./plan-handlinger-actions"); });
beforeEach(() => { viewer = { id: "syntetisk-p1", role: "PLAYER" }; tilgang = true; race = false; reads = 0; created = 0; personalBlocks = []; rows = [row()]; process.env.WORKBENCH_UNDO_SECRET = "syntetisk-ikke-ekte-signering-key-32-bytes"; });
after(() => { if (keyBefore === undefined) delete process.env.WORKBENCH_UNDO_SECRET; else process.env.WORKBENCH_UNDO_SECRET = keyBefore; });
const base = { playerId: "syntetisk-p1", sessionId: "syntetisk-okt", expectedUpdatedAt: stamp };
const move = { ...base, date: "2026-10-05", startMinute: 600, durationMinutes: 60 };
test("move/undo er eierbundet CAS og token brukes én gang", async () => {
 const original = structuredClone(rows[0]); const moved = await actions.flyttWorkbenchPlanOkt(move); assert.ok(moved.ok);
 assert.equal(rows[0].date.toISOString().slice(0, 10), "2026-10-05");
 assert.ok((await actions.angreWorkbenchPlanHandling(moved.undo)).ok);
 assert.equal(rows[0].date.toISOString(), original.date.toISOString()); assert.deepEqual(rows[0].drills, original.drills);
 assert.equal((await actions.angreWorkbenchPlanHandling(moved.undo)).ok, false);
});
test("overlapp bevares som utkast; stale/racing/startet/registrert0 flyttes aldri", async () => {
 rows[0].status = "PUBLISHED"; rows.push(row({ id: "syntetisk-overlapp", date: new Date(move.date) }));
 const result = await actions.flyttWorkbenchPlanOkt(move); assert.ok(result.ok); assert.equal(result.conflicts, 1); assert.equal(rows[0].status, "DRAFT");
 for (const status of ["IN_PROGRESS", "COMPLETED", "ABANDONED", "SKIPPED"]) { rows = [row({ status })]; assert.equal((await actions.flyttWorkbenchPlanOkt(move)).ok, false); }
 rows = [row({ actualMinutes: 0 })]; assert.equal((await actions.flyttWorkbenchPlanOkt(move)).ok, false);
 rows = [row({ liveSnapshot: { historisk: true } })]; assert.equal((await actions.flyttWorkbenchPlanOkt(move)).ok, false);
 rows = [row()]; race = true; assert.equal((await actions.flyttWorkbenchPlanOkt(move)).ok, false); assert.equal(rows[0].date.toISOString().slice(0, 10), "2026-09-28");
});
test("egne private og ukentlige opptattperioder gir kollisjon ved flytting og gjentakelse", async () => {
 personalBlocks = [{ id: "syntetisk-opptatt", title: "Privat", kind: "HELSE", isPrivate: true, recurring: "WEEKLY",
   startAt: new Date("2026-09-30T08:00:00.000Z"), endAt: new Date("2026-09-30T09:00:00.000Z") }];
 const moved = await actions.flyttWorkbenchPlanOkt({ ...move, date: "2026-10-07", startMinute: 600 });
 assert.ok(moved.ok); assert.equal(moved.conflicts, 1); assert.equal(moved.draft, true); assert.equal(rows[0].status, "DRAFT");
 rows = [row()];
 const copied = await actions.kopierWorkbenchPlanOkt({ ...base, dates: ["2026-10-07"], startMinute: 600 });
 assert.ok(copied.ok); assert.equal(copied.conflicts, 1); assert.equal(rows[1].status, "DRAFT");
});
test("kopier/gjenta har nye ID-er/rå JSON/bank/dose0, uten faktisk/logg eller overskriving av original", async () => {
 rows = [row({ status: "COMPLETED", actualMinutes: 0, perceivedEffort: 4, liveSnapshot: { privat: "Syntetisk" }, localOverride: true })];
 const original = structuredClone(rows[0]); const r = await actions.kopierWorkbenchPlanOkt({ ...base, dates: ["2026-10-05", "2026-10-12"], startMinute: 600 }); assert.ok(r.ok);
 assert.deepEqual(rows[0], original); assert.equal(rows.length, 3);
 for (const copy of rows.slice(1)) { assert.equal(copy.status, "DRAFT"); assert.equal(copy.actualMinutes, null); assert.equal(copy.liveSnapshot, null); assert.equal(copy.perceivedEffort, null); assert.notEqual(copy.id, original.id);
 assert.deepEqual(copy.drills[0].akFormel, original.drills[0].akFormel); assert.equal(copy.drills[0].repAntall, 0); assert.equal(copy.drills[0].exerciseId, "syntetisk-bank"); assert.equal(copy.drills[0].positionTaskId, "syntetisk-posisjon"); assert.notEqual(copy.drills[0].id, original.drills[0].id); }
 assert.ok((await actions.angreWorkbenchPlanHandling(r.undo)).ok); assert.deepEqual(rows[0], original); assert.equal(rows[1].status, "CANCELLED");
});
test("gruppeoriginal avvises, coach kan foreslå kopi men ikke flytte original; tilbakekalt coach/tokenfusk avvises", async () => {
 rows = [row({ groupId: "syntetisk-gruppe", id: `wb-group-${"a".repeat(64)}` })]; assert.equal((await actions.flyttWorkbenchPlanOkt({ ...move, sessionId: rows[0].id })).ok, false);
 rows = [row({ groupId: "syntetisk-gruppe", sourceGroupSessionId: "syntetisk-master", status: "PUBLISHED" })]; const moved = await actions.flyttWorkbenchPlanOkt(move); assert.ok(moved.ok); assert.equal(rows[0].localOverride, true);
 assert.equal((await actions.angreWorkbenchPlanHandling(moved.undo + "fusk")).ok, false);
 viewer = { id: "syntetisk-andre", role: "PLAYER" }; assert.equal((await actions.angreWorkbenchPlanHandling(moved.undo)).ok, false);
 viewer = { id: "syntetisk-coach", role: "COACH" }; rows = [row()]; assert.equal((await actions.flyttWorkbenchPlanOkt(move)).ok, false);
 const coachCopy = await actions.kopierWorkbenchPlanOkt({ ...base, dates: ["2026-10-05"], startMinute: 600 }); assert.ok(coachCopy.ok);
 assert.equal(rows[1].needsPlayerApproval, true); assert.equal(rows[1].approvalStatus, "PENDING"); assert.equal(rows[1].status, "DRAFT"); tilgang = false;
 assert.equal((await actions.angreWorkbenchPlanHandling(coachCopy.undo)).ok, false);
});
test("manglende/kort angre-nøkkel og PARENT/GUEST avvises før DB-lesing", async () => {
 for (const key of [undefined, "kort"]) { if (key === undefined) delete process.env.WORKBENCH_UNDO_SECRET; else process.env.WORKBENCH_UNDO_SECRET = key; assert.equal((await actions.flyttWorkbenchPlanOkt(move)).ok, false); assert.equal(reads, 0); }
 process.env.WORKBENCH_UNDO_SECRET = "syntetisk-ikke-ekte-signering-key-32-bytes";
 for (const role of ["PARENT", "GUEST"]) { viewer.role = role; assert.equal((await actions.kopierWorkbenchPlanOkt({ ...base, dates: ["2026-10-05"], startMinute: 600 })).ok, false); assert.equal(reads, 0); }
});
