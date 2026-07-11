// Tester for sg-analyse-ekspert: hovedløp (PlanAction med korrekt suggestion)
// og duplikatsperre.
//
// Mønster hentet fra live-coach-agent.test.ts: t.mock.module for
// "@/lib/prisma" (dekker også agent-runner.ts sitt AgentRun-kall, siden
// modulen deles), "@/lib/workbench/v2-sync" (resolveCoachIdForPlayer) og
// "@/lib/agents/notify-plan-action" (varsling er best-effort og testes ikke
// her — kun at den blir kalt/ikke kalt). aggregateSg, mapSgBandToFault og
// SG_TO_SKILL/SG_TO_PYRAMID kjører ekte (rene funksjoner/lookup-tabeller).
//
// VIKTIG (samme fallgruve som i live-coach-agent.test.ts): modulen under
// test importeres KUN ÉN gang per fil — Node re-evaluerer ikke et allerede
// lastet ES-modul ved senere import()-kall, så et nytt t.mock.module()-kall
// etter første import() ville IKKE blitt plukket opp av agentens allerede
// bundne "@/lib/prisma"-import. Derfor: ett t.mock.module-oppsett med
// mutérbar mock-tilstand (existingPlanAction), og to scenarioer kjørt
// sekvensielt i samme test.
//
// Kjør med: npm test

import { test } from "node:test";
import assert from "node:assert/strict";

type PlanActionCreateArgs = {
  data: {
    userId: string;
    coachId: string;
    planId: string | null;
    actionType: string;
    agentName: string;
    suggestion: {
      skillArea: string;
      pyramidArea: string;
      moradFaultId: string | null;
      forklaring: string;
      signalSnapshot: { kind: string; value: number; runder: number };
    };
  };
};

test("runSgAnalyseEkspert — hovedløp og duplikatsperre", async (t) => {
  // Runder der ARG er klart svakest (-0.6, under SG_TERSKEL -0.35) og
  // dermed skal velges som primary-område.
  const runder = [
    {
      score: 82,
      sgTotal: -0.4,
      sgOtt: 0.1,
      sgApp: -0.1,
      sgArg: -0.6,
      sgPutt: 0.2,
    },
  ];

  let existingPlanAction: { id: string; status: string } | null = null;
  const createCalls: PlanActionCreateArgs[] = [];
  const varsleCalls: unknown[] = [];

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        round: {
          findMany: async () => runder,
        },
        trainingPlan: {
          findFirst: async () => ({ id: "plan-1" }),
        },
        planAction: {
          findFirst: async () => existingPlanAction,
          create: async (args: PlanActionCreateArgs) => {
            createCalls.push(args);
            return { id: `pa-${createCalls.length}` };
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

  const { runSgAnalyseEkspert } = await import("@/lib/agents/sg-analyse-ekspert");

  // Scenario 1: hovedløp — ingen eksisterende PENDING PlanAction.
  const result1 = await runSgAnalyseEkspert("user-1");

  assert.equal(result1.signalsWritten, 0);
  assert.equal(result1.planActionsWritten, 1);
  assert.equal(createCalls.length, 1, "planAction.create skal kalles én gang");

  const { data } = createCalls[0];
  assert.equal(data.userId, "user-1");
  assert.equal(data.coachId, "coach-1");
  assert.equal(data.planId, "plan-1");
  assert.equal(data.actionType, "FOCUS_CHANGE");
  assert.equal(data.agentName, "sg-analyse-ekspert");

  // ARG er svakest og under terskel -> skillArea/pyramidArea skal følge ARG.
  assert.equal(data.suggestion.skillArea, "AROUND_GREEN");
  assert.equal(data.suggestion.pyramidArea, "SPILL");
  assert.equal(data.suggestion.moradFaultId, "poor_spine_alignment");
  assert.match(data.suggestion.forklaring, /SG ARG -0[.,]60/);
  assert.match(data.suggestion.forklaring, /AROUND_GREEN/);

  assert.deepEqual(data.suggestion.signalSnapshot, {
    kind: "SG_ARG",
    value: -0.6,
    runder: 1,
  });

  assert.equal(varsleCalls.length, 1, "coach skal varsles ved nytt funn");

  // Scenario 2: duplikatsperre — en PENDING PlanAction finnes allerede for
  // (userId, agentName). Ny kjøring for en ANNEN bruker, men samme mock,
  // skal ikke skrive noe nytt.
  //
  // Kjent begrensning (ikke fikset her): sperren i sg-analyse-ekspert.ts er
  // kun scoped på (userId, agentName, status=PENDING) — uten planId/område.
  // Én åpen PlanAction blokkerer dermed også nye funn på helt andre
  // SG-områder for samme spiller.
  existingPlanAction = { id: "pa-existing", status: "PENDING" };

  const result2 = await runSgAnalyseEkspert("user-2");

  assert.equal(result2.signalsWritten, 0);
  assert.equal(result2.planActionsWritten, 0);
  assert.equal(
    createCalls.length,
    1,
    "planAction.create skal IKKE kalles på nytt når PENDING allerede finnes",
  );
  assert.equal(varsleCalls.length, 1, "coach skal ikke varsles på nytt");
});
