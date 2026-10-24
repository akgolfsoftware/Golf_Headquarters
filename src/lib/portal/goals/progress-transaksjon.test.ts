import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";
import type { GoalForProgress } from "./progress";
mock.module("@/lib/prisma", { namedExports: { prisma: new Proxy({}, { get() { throw Error("global database forbidden"); } }) } });

test("alle målkilder bruker injisert transaksjon, også SG og kildefeil", async () => {
  const { beregnGoalProgressListe } = await import("./progress");
  const userId = "synthetic-player"; let sgReads = 0, fail = false;
  const tx = {
    round: { count: async () => 2, findMany: async () => { sgReads++; if (fail) throw Error("synthetic SG failure"); return [{ sgOtt: 0, sgApp: 0, sgArg: 0, sgPutt: 0 }]; } },
    trainingSessionV2: { findMany: async () => [{ id: "v2", generertFraId: null }] },
    workbenchSession: { findMany: async () => [{ id: "wb" }] },
    trainingPlanSessionLog: { findMany: async () => [] },
    testResult: { findFirst: async () => ({ score: 5, test: { protocol: {} } }) },
  } as unknown as Prisma.TransactionClient;
  const base: GoalForProgress = { userId, type: "FREE_TEXT", targetValue: 4, linkedPyramidArea: "TEK", linkedTestId: "synthetic-test", payload: null };
  const goals: GoalForProgress[] = [
    { ...base, type: "ROUNDS_PER_MONTH" }, { ...base, type: "SESSION_FREQUENCY" },
    { ...base, type: "TEST_SCORE", targetValue: 10 },
    { ...base, type: "SG_AREA", targetValue: 1, payload: { sgOmrade: "OTT", sgStart: -1 } },
    { ...base, type: "SG_AREA", targetValue: 1, payload: { sgOmrade: "APP", sgStart: -1 } },
  ];
  const result = await beregnGoalProgressListe(goals, { hcp: 10 }, tx);
  assert.deepEqual(result.map(v => v.pct), [50, 50, 50, 50, 50]); assert.equal(sgReads, 1);
  fail = true; await assert.rejects(beregnGoalProgressListe(goals, { hcp: 10 }, tx), /synthetic SG failure/);
});
