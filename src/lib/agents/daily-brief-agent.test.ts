import assert from "node:assert/strict";
import { mock, test } from "node:test";

let calls = 0;
const forbidden = async () => { calls++; throw Error("unexpected side effect"); };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findMany: forbidden }, trainingSessionV2: { findMany: forbidden },
  coachingSession: { findMany: forbidden }, agentRun: { create: forbidden },
} } });
mock.module("./agent-runner", { namedExports: { runAgent: forbidden } });
mock.module("./agent-notify", { namedExports: { varsleAgentFunn: forbidden } });
mock.module("@/lib/ai/client", { namedExports: {
  anthropic: { messages: { create: forbidden } }, modelFor: forbidden,
  AI_MAX_TOKENS: 100, isAiEnabled: () => true, tekstFra: forbidden,
} });

test("cron og direkte dagsbrief stopper før spillerlesing, modell, logging og varsling", async () => {
  const { runDailyBrief } = await import("./daily-brief-agent");
  const { genererDailyBrief, DAILY_BRIEF_IKKE_AKTIVERT } = await import("@/lib/ai/agents/daily-brief");
  await assert.rejects(runDailyBrief(), { message: DAILY_BRIEF_IKKE_AKTIVERT });
  await assert.rejects(genererDailyBrief({ coachId: "synthetic-coach", dato: new Date() }), { message: DAILY_BRIEF_IKKE_AKTIVERT });
  assert.equal(calls, 0);
});
