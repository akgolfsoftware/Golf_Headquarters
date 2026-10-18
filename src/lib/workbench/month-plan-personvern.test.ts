import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import { Prisma } from "@/generated/prisma/client";
import { emptyMonthDetails } from "@/lib/domain/month-plan";

const userId = "syntetisk-slettet";
const content = () => ({ ...emptyMonthDetails(), focus: "Privat fokus", goals: ["Privat mål"], purpose: "Privat formål", location: "Privat sted", note: "Privat notat", volumeHours: { ...emptyMonthDetails().volumeHours, TEK: 10 }, priorities: { ...emptyMonthDetails().priorities, TEE_TOTAL: "UTVIKLE" } });
const evaluation = (authorId: string) => ({ authorId, score: 4, text: "Privat evaluering", savedAt: "2020-10-01T10:00:00.000Z" });
type Row = { id: string; playerId: string | null; groupId: string | null; year: number; month: number; details: unknown; proposedDetails: unknown; proposedBy: string | null; playerEvaluation: unknown; coachEvaluation: unknown; createdBy: string; updatedBy: string; createdAt: Date; updatedAt: Date; revision: number; activeRevision: number; lastRequestId: string; lastRequestHash: string };
const record = (id: string, override: Partial<Row> = {}): Row => ({ id, playerId: userId, groupId: null, year: 2020, month: 9, details: content(), proposedDetails: content(), proposedBy: "syntetisk-coach", playerEvaluation: evaluation(userId), coachEvaluation: evaluation("syntetisk-coach"), createdBy: userId, updatedBy: userId, createdAt: new Date(), updatedAt: new Date(), revision: 2, activeRevision: 1, lastRequestId: "privat-forespoersel", lastRequestHash: "privat-hash", ...override });
let rows: Row[] = [], writes = 0, race = false, failRead = false;
const queries: unknown[] = [];
const authored = (row: Row) => [row.createdBy, row.updatedBy, row.proposedBy].includes(userId) || [row.playerEvaluation, row.coachEvaluation].some(value => typeof value === "object" && value !== null && "authorId" in value && value.authorId === userId);
mock.module("@/lib/prisma", { namedExports: { prisma: { monthlyPlan: {
  findMany: async ({ where, select }: { where: { playerId?: string; AND?: unknown }; select: Record<string, boolean> }) => {
    queries.push(where); if (failRead) throw new Error("syntetisk kildefeil");
    const selected = where.playerId ? rows.filter(row => row.playerId === where.playerId) : where.AND ? rows.filter(row => row.playerId !== userId && authored(row)) : rows.filter(row => row.playerId === userId || authored(row));
    return selected.map(row => Object.fromEntries(Object.entries(row).filter(([field]) => select[field])));
  },
  updateMany: async ({ where, data }: { where: { id: string; revision: number }; data: Record<string, unknown> }) => {
    const row = rows.find(value => value.id === where.id);
    if (race || !row || row.revision !== where.revision) return { count: 0 };
    writes++; Object.assign(row, Object.fromEntries(Object.entries(data).map(([field, value]) => [field, value === Prisma.DbNull ? null : value]))); return { count: 1 };
  },
} } } });
let privacy: typeof import("./month-plan-personvern");
before(async () => { privacy = await import("./month-plan-personvern"); });
beforeEach(() => { rows = []; writes = 0; race = failRead = false; queries.length = 0; });

test("personlig plan vasker fritekst og forslag, men bevarer bare validerte mengder, prioriteringer og score", async () => {
  rows = [record("egen")];
  assert.equal(await privacy.anonymiserMaanedsplaner(userId), 1);
  const details = rows[0].details as ReturnType<typeof content>;
  assert.equal(details.focus, ""); assert.deepEqual(details.goals, []); assert.equal(details.note, ""); assert.equal(details.location, "");
  assert.equal(details.volumeHours.TEK, 10); assert.equal(details.priorities.TEE_TOTAL, "UTVIKLE");
  assert.equal(rows[0].proposedDetails, null); assert.equal(rows[0].proposedBy, null);
  assert.equal((rows[0].playerEvaluation as { authorId: string }).authorId, "anonymisert");
  assert.equal((rows[0].coachEvaluation as { text: string }).text, "");
  assert.equal(rows[0].createdBy, "anonymisert"); assert.equal(rows[0].updatedBy, "anonymisert"); assert.equal(rows[0].lastRequestHash, null);
  assert.equal(await privacy.anonymiserMaanedsplaner(userId), 0); assert.equal(writes, 1);
});
test("slettet coach vasker egne forslag/evalueringer uten å endre en annen spillers aktive plan", async () => {
  const active = content();
  rows = [record("annen", { playerId: "annen-spiller", details: active, createdBy: "annen-spiller", updatedBy: userId, proposedBy: userId, playerEvaluation: evaluation("annen-spiller"), coachEvaluation: evaluation(userId) })];
  await privacy.anonymiserMaanedsplaner(userId);
  assert.deepEqual(rows[0].details, active); assert.equal(rows[0].activeRevision, 1); assert.equal(rows[0].proposedDetails, null);
  assert.equal((rows[0].coachEvaluation as { text: string }).text, "");
  assert.deepEqual(rows[0].playerEvaluation, evaluation("annen-spiller"));
});
test("forfattet gruppeinnhold vaskes, uvedkommende rader bevares og konflikt stopper ferdigstilling", async () => {
  rows = [record("gruppe", { playerId: null, groupId: "gruppe", coachEvaluation: evaluation(userId) }), record("fremmed", { playerId: "fremmed", createdBy: "fremmed", updatedBy: "fremmed", proposedBy: "fremmed", playerEvaluation: null })];
  const foreign = structuredClone(rows[1]);
  assert.equal(await privacy.anonymiserMaanedsplaner(userId), 1);
  assert.equal((rows[0].details as { note: string }).note, ""); assert.deepEqual(rows[1], foreign);
  rows = [record("konflikt")]; race = true;
  await assert.rejects(() => privacy.anonymiserMaanedsplaner(userId), /endret under anonymisering/);
});
test("eksport omfatter egen plan og forfatterspor, aldri fremmed aktivt innhold eller request-hash", async () => {
  rows = [record("egen"), record("forslag", { playerId: "annen-spiller", createdBy: "annen-spiller", updatedBy: userId, proposedBy: userId, playerEvaluation: evaluation("annen-spiller"), coachEvaluation: evaluation(userId) }), record("gruppe", { playerId: null, groupId: "gruppe" })];
  const exported = await privacy.eksporterMaanedsplaner(userId);
  assert.equal(exported.egnePlaner.length, 1); assert.equal(exported.forfatterspor.length, 2);
  assert.equal("lastRequestHash" in exported.egnePlaner[0], false);
  assert.equal(exported.forfatterspor.some(value => "details" in value || "playerId" in value), false);
  assert.deepEqual(exported.forfatterspor[0].forslag, content()); assert.equal(exported.forfatterspor[0].spillerevaluering, null);
  assert.deepEqual(queries[0], { playerId: userId });
  failRead = true;
  await assert.rejects(() => privacy.eksporterMaanedsplaner(userId), /kildefeil/);
});
