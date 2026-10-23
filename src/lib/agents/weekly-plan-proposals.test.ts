import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

let usedAi: unknown = false;
let generated = 0;
let pending = false;
let fail = false;
const created: unknown[] = [];
const suggestions = [{ variant: "standard", totalSessions: 3, focusBlend: "Putting og innspill", sessions: [{ day: 1, title: "Putting", pyramidArea: "TEK", durationMin: 45 }] }];
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findMany: async () => [{ id: "synthetic-player", seasonPlans: [] }] },
  planAction: {
    findFirst: async () => pending ? { id: "pending" } : null,
    create: async (query: unknown) => { created.push(query); return { id: "synthetic-proposal" }; },
  },
} } });
mock.module("@/lib/auth/coached", { namedExports: { coachedPlayerWhere: () => ({}) } });
mock.module("@/lib/ai-plan/week-suggest", { namedExports: { generateWeekSuggestions: async () => {
  generated++;
  if (fail) throw new Error("synthetic failure");
  return { suggestions, usedAi };
} } });
mock.module("./agent-runner", { namedExports: { runAgent: async (_name: string, _id: null, work: () => Promise<unknown>) => work() } });
beforeEach(() => { usedAi = false; generated = 0; pending = false; fail = false; created.length = 0; });

test("background job never queues generic fallback even when suggestions exist", async () => {
  const { runWeeklyPlanProposals } = await import("./weekly-plan-proposals");
  for (const value of [false, undefined, "true", 1]) {
    usedAi = value;
    assert.deepEqual(await runWeeklyPlanProposals(), { spillere: 1, forslag: 0, hoppet: 1, feilet: 0 });
  }
  assert.equal(created.length, 0);
});

test("successful generation retains queue behavior without executing sessions", async () => {
  usedAi = true;
  const { runWeeklyPlanProposals } = await import("./weekly-plan-proposals");
  assert.deepEqual(await runWeeklyPlanProposals(), { spillere: 1, forslag: 1, hoppet: 0, feilet: 0 });
  assert.equal(created.length, 1);
  assert.match(JSON.stringify(created), /WEEKLY_PROPOSAL/);
});

test("existing pending proposal skips model call", async () => {
  pending = true;
  const { runWeeklyPlanProposals } = await import("./weekly-plan-proposals");
  assert.equal((await runWeeklyPlanProposals()).hoppet, 1);
  assert.equal(generated, 0); assert.equal(created.length, 0);
});

test("generator failure does not create a proposal", async () => {
  fail = true;
  const { runWeeklyPlanProposals } = await import("./weekly-plan-proposals");
  assert.equal((await runWeeklyPlanProposals()).feilet, 1);
  assert.equal(created.length, 0);
});
