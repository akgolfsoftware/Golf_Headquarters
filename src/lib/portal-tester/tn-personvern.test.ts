import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { Prisma } from "@/generated/prisma/client";
import { TN_RULES_VERSION } from "./tn-catalog";
const state = { version: TN_RULES_VERSION, protocolId: "naerspill-gate", count: 9, revision: 2, values: { "1": { points: 0 } }, notes: "Syntetisk privat notat", lastMutation: { id: "d480d84d-6cfb-453d-acb9-2c67a90fcad1", intent: "draft", baseRevision: 1 } };
const rows = [
  { id: "own", userId: "owner", testId: "tn-v3-20261002-naerspill-gate", scoringData: state },
  { id: "other", userId: "other", testId: "tn-v3-20261002-naerspill-gate", scoringData: state },
  { id: "unknown", userId: "owner", testId: "tn-v3-unknown", scoringData: { secretNote: "synthetic" } },
];
const writes: Array<{ where: { userId: string; id: string }; data: { scoringData?: unknown; notes?: null } }> = [];
mock.module("@/lib/prisma", { namedExports: { prisma: {
  testSession: {
    findMany: async ({ where }: { where: { userId: string; testId: unknown } }) => { assert.deepEqual(where.testId, { startsWith: "tn-v3-" }); return rows.filter(r => r.userId === where.userId); },
    updateMany: async (input: typeof writes[number]) => { writes.push(input); return { count: 1 }; },
  },
  testResult: {
    findMany: async ({ where }: { where: { userId: string } }) => { assert.equal(where.userId, "owner"); return [{ id: "result", testId: "tn-v3-unknown", score: 0, details: { note: "synthetic" } }]; },
    updateMany: async (input: typeof writes[number]) => { writes.push(input); return { count: 1 }; },
  },
} } });

test("anonymisering fjerner fritekst og kvittering, men bevarer validert nullverdi", async () => {
  const { tnAnonymisedSession } = await import("./tn-personvern");
  const cleaned = tnAnonymisedSession(rows[0].testId, state)!;
  assert.equal(cleaned.notes, ""); assert.equal(cleaned.values["1"].points, 0);
  assert.ok(!JSON.stringify(cleaned).includes("lastMutation"));
  assert.equal(tnAnonymisedSession(rows[0].testId, { ...state, values: { "1": { points: "personlig tekst" } } }), null);
  assert.deepEqual(tnAnonymisedSession(rows[0].testId, cleaned), cleaned);
});
test("vasken leser og skriver bare eierens TN-rader og tømmer ukjent JSON", async () => {
  const { anonymiserTnTestdata } = await import("./tn-personvern");
  await anonymiserTnTestdata("owner");
  assert.equal(writes.length, 3);
  assert.ok(writes.every(w => w.where.userId === "owner" && w.where.id !== "other"));
  assert.equal(writes.find(w => w.where.id === "unknown")!.data.scoringData, Prisma.JsonNull);
  assert.equal(writes.find(w => w.where.id === "result")!.data.notes, null);
});
