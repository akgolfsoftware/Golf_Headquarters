// Tester for plan-effectiveness-agent: hovedløp (PlanAction + Signal med
// korrekt payload) og duplikatsperre.
//
// Denne agenten er scoped på (userId, planId, agentName, status=PENDING) —
// altså strengere enn sg-analyse-ekspert/treningsdata-ekspert som kun
// scoper på (userId, agentName, status=PENDING). Duplikatsperre-testen her
// dekker derfor det normale (ikke-lekkende) tilfellet: samme plan får ikke
// en ny PENDING PlanAction så lenge én allerede er åpen.
//
// VIKTIG (samme fallgruve som i live-coach-agent.test.ts): modulen under
// test importeres KUN ÉN gang per fil — et t.mock.module()-kall etter
// første import() ville ikke blitt plukket opp. Derfor: ett oppsett med
// mutérbar mock-tilstand (existingPlanAction), to scenarioer sekvensielt
// (to ulike rader/plan-id-er, kjørt i to separate kall til agenten).
//
// Kjør med: npm test

import { test } from "node:test";
import assert from "node:assert/strict";

type Rad = {
  id: string;
  userId: string;
  planId: string;
  completionRate: number;
  sgTotalDelta: number | null;
  plan: { id: string; name: string; userId: string; isActive: boolean };
  user: { name: string };
};

type PlanActionCreateArgs = {
  data: {
    userId: string;
    coachId: string;
    planId: string;
    actionType: string;
    agentName: string;
    suggestion: {
      forklaring: string;
      signalSnapshot: { completionRate: number; sgTotalDelta: number | null };
    };
  };
};

type SignalCreateArgs = {
  data: {
    userId: string;
    kind: string;
    value: number | null;
    payload: { planId: string; completionRate: number };
  };
};

test("runPlanEffectivenessAgent — hovedløp og duplikatsperre", async (t) => {
  let rader: Rad[] = [
    {
      id: "pe-1",
      userId: "user-1",
      planId: "plan-1",
      completionRate: 0.3,
      sgTotalDelta: -0.1,
      plan: { id: "plan-1", name: "Uke 12 plan", userId: "user-1", isActive: true },
      user: { name: "Øyvind Rohjan" },
    },
  ];

  let existingPlanAction: { id: string; status: string } | null = null;
  const createCalls: PlanActionCreateArgs[] = [];
  const signalCalls: SignalCreateArgs[] = [];
  const varsleCalls: unknown[] = [];

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        planEffectiveness: {
          findMany: async () => rader,
        },
        planAction: {
          findFirst: async () => existingPlanAction,
          create: async (args: PlanActionCreateArgs) => {
            createCalls.push(args);
            return { id: `pa-${createCalls.length}` };
          },
        },
        signal: {
          create: async (args: SignalCreateArgs) => {
            signalCalls.push(args);
            return { id: `sig-${signalCalls.length}` };
          },
        },
        agentRun: {
          create: async () => ({ id: "run-1" }),
        },
      },
    },
  });

  t.mock.module("@/lib/workbench/v2-sync", {
    namedExports: {
      resolveCoachIdForPlayer: async () => "coach-1",
    },
  });

  t.mock.module("@/lib/agents/notify-plan-action", {
    namedExports: {
      varsleVedPlanAction: async (opts: unknown) => {
        varsleCalls.push(opts);
      },
    },
  });

  const { runPlanEffectivenessAgent } = await import("@/lib/agents/plan-effectiveness-agent");

  // Scenario 1: hovedløp — lav completion (30 % < 55 %-terskel), ingen
  // eksisterende PENDING PlanAction for planen.
  const result1 = await runPlanEffectivenessAgent();

  assert.equal(result1.planActionsWritten, 1);
  assert.equal(result1.signalsWritten, 1);
  assert.equal(createCalls.length, 1, "planAction.create skal kalles én gang");
  assert.equal(signalCalls.length, 1, "signal.create skal kalles én gang");

  const { data } = createCalls[0];
  assert.equal(data.userId, "user-1");
  assert.equal(data.coachId, "coach-1");
  assert.equal(data.planId, "plan-1");
  assert.equal(data.actionType, "PYRAMID_ADJUST");
  assert.equal(data.agentName, "plan-effectiveness-agent");
  assert.match(data.suggestion.forklaring, /Uke 12 plan/);
  assert.match(data.suggestion.forklaring, /30 %/);
  assert.deepEqual(data.suggestion.signalSnapshot, {
    completionRate: 0.3,
    sgTotalDelta: -0.1,
  });

  const signalData = signalCalls[0].data;
  assert.equal(signalData.userId, "user-1");
  assert.equal(signalData.kind, "PLAN_EFFECTIVENESS");
  assert.equal(signalData.value, -0.1);
  assert.deepEqual(signalData.payload, { planId: "plan-1", completionRate: 0.3 });

  assert.equal(varsleCalls.length, 1, "coach skal varsles ved nytt funn");

  // Scenario 2: duplikatsperre — samme plan, ny (usannsynlig men mulig)
  // beregningsrad, men en PENDING PlanAction finnes allerede for
  // (userId, planId, agentName). Skal hoppes over uten create/signal.
  existingPlanAction = { id: "pa-existing", status: "PENDING" };
  rader = [
    {
      id: "pe-2",
      userId: "user-1",
      planId: "plan-1",
      completionRate: 0.2,
      sgTotalDelta: -0.2,
      plan: { id: "plan-1", name: "Uke 12 plan", userId: "user-1", isActive: true },
      user: { name: "Øyvind Rohjan" },
    },
  ];

  const result2 = await runPlanEffectivenessAgent();

  assert.equal(result2.planActionsWritten, 0);
  assert.equal(result2.signalsWritten, 0);
  assert.equal(
    createCalls.length,
    1,
    "planAction.create skal IKKE kalles på nytt når PENDING allerede finnes for planen",
  );
  assert.equal(
    signalCalls.length,
    1,
    "signal.create skal IKKE kalles når raden hoppes over pga. duplikatsperre",
  );
  assert.equal(varsleCalls.length, 1, "coach skal ikke varsles på nytt");
});
