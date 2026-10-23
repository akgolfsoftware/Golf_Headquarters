import assert from "node:assert/strict";
import { mock, test } from "node:test";

let calls = 0;
const forbidden = async () => { calls++; throw Error("unexpected side effect"); };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findMany: forbidden }, planAction: { findFirst: forbidden, create: forbidden },
} } });
mock.module("@/lib/ai-plan/week-suggest", { namedExports: {
  generateWeekSuggestions: forbidden, generateWeekSuggestionsFromContext: forbidden,
} });
mock.module("./agent-runner", { namedExports: { runAgent: forbidden } });

test("unqualified cron cannot read players, call a model, write proposals or report success", async () => {
  const { runWeeklyPlanProposals } = await import("./weekly-plan-proposals");
  await assert.rejects(runWeeklyPlanProposals(), /ikke aktivert/);
  assert.equal(calls, 0);
});
