import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { before, beforeEach, mock, test } from "node:test";
import { Prisma } from "@/generated/prisma/client";
import { MonthDetailsSchema, MonthKeySchema, emptyMonthDetails, monthEnded } from "@/lib/domain/month-plan";

let viewer = { id: "syntetisk-spiller", role: "PLAYER" };
let coachAccess = false, groupRead = false, groupEdit = false, failRead = false, race = false, capability = true;
let writes = 0, reads = 0;
let row: Record<string, unknown> | null = null;
const groupChecks: string[] = [];
const key = { owner: { kind: "player", playerId: "syntetisk-spiller" }, year: 2020, month: 9 } as const;
const change = () => ({ ...key, expectedRevision: Number(row?.revision ?? 0), requestId: randomUUID() });
const details = () => ({ ...emptyMonthDetails(), focus: "Syntetisk månedsfokus" });
function save(data: Record<string, unknown>) {
  writes++;
  row ??= { id: "syntetisk-maaned", activeRevision: 0, details: null, proposedDetails: null, playerEvaluation: null, coachEvaluation: null };
  for (const [field, value] of Object.entries(data)) row[field] = value === Prisma.DbNull ? null : value;
  return structuredClone(row);
}
const db = {
  group: { findFirst: async ({ where }: { where: { id: string } }) => { groupChecks.push(where.id); return groupRead ? { id: where.id } : null; } },
  monthlyPlan: {
    findUnique: async () => { reads++; if (failRead) throw new Error("syntetisk kildefeil"); return structuredClone(row); },
    findUniqueOrThrow: async () => { if (!row) throw new Error("missing"); return structuredClone(row); },
    create: async ({ data }: { data: Record<string, unknown> }) => save(data),
    updateMany: async ({ where, data }: { where: { revision: number }; data: Record<string, unknown> }) => {
      if (race && row) row.revision = Number(row.revision) + 1;
      if (!row || where.revision !== row.revision) return { count: 0 };
      save(data); return { count: 1 };
    },
  },
};
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachLesetilgangTilSpiller: async () => coachAccess } });
mock.module("@/lib/auth/effective-capabilities", { namedExports: { canUser: async () => capability } });
mock.module("@/lib/workbench/group-scope", { namedExports: { canEditGroup: async (_viewer: unknown, id: string) => { groupChecks.push(id); return groupEdit; } } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/prisma", { namedExports: { prisma: { ...db, $transaction: async (run: (tx: typeof db) => unknown) => run(db) } } });
let actions: typeof import("./month-plan-actions");
before(async () => { actions = await import("./month-plan-actions"); });
beforeEach(() => { viewer = { id: "syntetisk-spiller", role: "PLAYER" }; coachAccess = groupRead = groupEdit = failRead = race = false; capability = true; row = null; reads = writes = 0; groupChecks.length = 0; });

test("månedens eier er enten spiller eller gruppe og alle 19 områder er eksplisitte", () => {
  assert.equal(MonthKeySchema.safeParse({ ...key, owner: { ...key.owner, groupId: "fremmed" } }).success, false);
  assert.equal(MonthDetailsSchema.safeParse(details()).success, true);
  assert.equal(Object.keys(details().priorities).length, 19);
  assert.equal(MonthDetailsSchema.safeParse({ ...details(), priorities: {} }).success, false);
  assert.equal(MonthDetailsSchema.safeParse({ ...details(), volumeHours: { ...details().volumeHours, FYS: -1 } }).success, false);
  assert.equal(monthEnded(2020, 9, "2020-09-30"), false);
  assert.equal(monthEnded(2020, 9, "2020-10-01"), true);
});
test("ugyldig input og manglende spiller-scope gir ingen tilgang eller skriving", async () => {
  assert.equal((await actions.lagreMaanedsplan({ ...change(), details: {} })).ok, false);
  viewer = { id: "syntetisk-fremmed", role: "COACH" };
  assert.equal((await actions.hentMaanedsplan(key)).ok, false);
  assert.equal((await actions.lagreMaanedsplan({ ...change(), details: details() })).ok, false);
  assert.equal(writes, 0); assert.equal(reads, 0);
});
test("eier lagrer aktiv plan, og samme kvitteringsforespørsel kan gjentas uten dobbel lagring", async () => {
  const input = { ...change(), details: details() };
  const first = await actions.lagreMaanedsplan(input);
  assert.equal(first.ok, true); assert.equal(row?.activeRevision, 1); assert.equal(writes, 1);
  assert.equal((await actions.lagreMaanedsplan(input)).ok, true); assert.equal(writes, 1);
  assert.equal((await actions.lagreMaanedsplan({ ...input, details: { ...input.details, focus: "Endret etter kvittering" } })).ok, false);
  assert.equal(writes, 1);
});
test("coach-endring blir et forslag og godkjenning endrer den aktive planen", async () => {
  await actions.lagreMaanedsplan({ ...change(), details: details() });
  viewer = { id: "syntetisk-coach", role: "COACH" }; coachAccess = true;
  const proposed = { ...details(), focus: "Syntetisk coachforslag" };
  assert.equal((await actions.lagreMaanedsplan({ ...change(), details: proposed })).ok, true);
  assert.equal((row?.details as { focus: string }).focus, details().focus);
  assert.equal((row?.proposedDetails as { focus: string }).focus, proposed.focus);
  assert.equal((await actions.svarMaanedsplanForslag({ ...change(), accept: true })).ok, false);
  viewer = { id: key.owner.playerId, role: "PLAYER" };
  assert.equal((await actions.svarMaanedsplanForslag({ ...change(), accept: true })).ok, true);
  assert.equal((row?.details as { focus: string }).focus, proposed.focus); assert.equal(row?.proposedDetails, null);
});
test("utdatert coachforslag kan ikke overskrive spillerens nyere innhold; avslag beholder det", async () => {
  viewer = { id: "syntetisk-coach", role: "COACH" }; coachAccess = true;
  await actions.lagreMaanedsplan({ ...change(), details: details() });
  viewer = { id: key.owner.playerId, role: "PLAYER" };
  await actions.lagreMaanedsplan({ ...change(), details: { ...details(), focus: "Spillerens nyere fokus" } });
  const read = await actions.hentMaanedsplan(key);
  assert.equal(read.ok && read.data.proposalStale, true);
  assert.equal((await actions.svarMaanedsplanForslag({ ...change(), accept: true })).ok, false);
  assert.equal((await actions.svarMaanedsplanForslag({ ...change(), accept: false })).ok, true);
  assert.equal((row?.details as { focus: string }).focus, "Spillerens nyere fokus");
});
test("tilbaketrukket coach-scope og samtidig oppdatering stopper lagringen", async () => {
  await actions.lagreMaanedsplan({ ...change(), details: details() });
  const old = change();
  viewer = { id: "syntetisk-coach", role: "COACH" };
  assert.equal((await actions.lagreMaanedsplan({ ...old, details: details() })).ok, false);
  viewer = { id: key.owner.playerId, role: "PLAYER" }; race = true;
  assert.equal((await actions.lagreMaanedsplan({ ...old, details: details() })).ok, false);
  assert.equal(writes, 1);
});
test("gruppeplanen krever skriverett i eksakt gruppe og skriver aldri i en medlemsplan", async () => {
  const group = { owner: { kind: "group", groupId: "syntetisk-wang-gruppe" }, year: 2020, month: 9 };
  groupRead = true;
  assert.equal((await actions.hentMaanedsplan(group)).ok, true);
  assert.equal((await actions.lagreMaanedsplan({ ...group, expectedRevision: 0, requestId: randomUUID(), details: details() })).ok, false);
  viewer = { id: "syntetisk-gruppetrener", role: "COACH" }; groupEdit = true;
  capability = false;
  assert.equal((await actions.lagreMaanedsplan({ ...group, expectedRevision: 0, requestId: randomUUID(), details: details() })).ok, false);
  capability = true;
  assert.equal((await actions.lagreMaanedsplan({ ...group, expectedRevision: 0, requestId: randomUUID(), details: details() })).ok, true);
  assert.equal(row?.groupId, group.owner.groupId); assert.equal(row?.playerId, null);
  assert.ok(groupChecks.every(id => id === group.owner.groupId)); assert.equal(writes, 1);
});
test("spiller og coach evaluerer separat, med serverbundet forfatter og avsluttet måned", async () => {
  assert.equal((await actions.evaluerMaanedsplan({ ...change(), score: null, text: "" })).ok, false);
  assert.equal((await actions.evaluerMaanedsplan({ ...change(), year: 9998, score: 4, text: "Ikke avsluttet" })).ok, false);
  assert.equal((await actions.evaluerMaanedsplan({ ...change(), score: 4, text: "Syntetisk spillerevaluering", authorId: "fremmed" })).ok, false);
  assert.equal((await actions.evaluerMaanedsplan({ ...change(), score: 4, text: "Syntetisk spillerevaluering" })).ok, true);
  viewer = { id: "syntetisk-coach", role: "COACH" }; coachAccess = true;
  assert.equal((await actions.evaluerMaanedsplan({ ...change(), score: 3, text: "Syntetisk coachevaluering" })).ok, true);
  assert.equal((row?.playerEvaluation as { authorId: string }).authorId, key.owner.playerId);
  assert.equal((row?.coachEvaluation as { authorId: string }).authorId, viewer.id);
});
test("kilde- og innholdsfeil vises som feil, aldri som en tom bekreftet plan", async () => {
  failRead = true;
  assert.equal((await actions.hentMaanedsplan(key)).ok, false);
  failRead = false; row = { details: { focus: "Ufullstendig innhold" }, revision: 1 };
  assert.equal((await actions.hentMaanedsplan(key)).ok, false);
});
