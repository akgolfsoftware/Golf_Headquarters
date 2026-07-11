// Tester for treningsdata-ekspert: hovedløp (PlanAction med korrekt
// suggestion) og duplikatsperre.
//
// NB (2026-07-11): skillArea kommer nå fra negativ.sgArea direkte — den
// separate "laveste SG"-beregningen som fantes tidligere er fjernet. Testen
// under verifiserer nettopp dette: suggestion.skillArea skal følge
// SG_TO_SKILL[negativ.sgArea], ikke et eget snitt.
//
// beregnKorrelasjon (fra @/lib/training/korrelasjon) mockes direkte i stedet
// for å bygge opp ekte TrainingLog/Round-data for volum-korrelasjonen — det
// er en ren beregningsfunksjon med egen dynamisk import av prisma internt,
// og agenten selv bryr seg kun om resultat-arrayen den returnerer.
//
// VIKTIG (samme fallgruve som i live-coach-agent.test.ts): modulen under
// test importeres KUN ÉN gang per fil — et t.mock.module()-kall etter
// første import() ville ikke blitt plukket opp. Derfor: ett oppsett med
// mutérbar mock-tilstand (existingPlanAction), to scenarioer sekvensielt.
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
      forklaring: string;
      signalSnapshot: { kind: string; sgArea: string; r: number | null };
    };
  };
};

test("runTreningsdataEkspert — hovedløp og duplikatsperre", async (t) => {
  // Minst 3 runder kreves for å komme forbi den første sjekken.
  const runder = [{ id: "r1" }, { id: "r2" }, { id: "r3" }];

  const korrelasjon = [
    { sgArea: "PUTT", r: -0.5, datapunkter: 5, tolkning: "negativ" as const },
    { sgArea: "OTT", r: 0.4, datapunkter: 5, tolkning: "positiv" as const },
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

  t.mock.module("@/lib/training/korrelasjon", {
    namedExports: {
      beregnKorrelasjon: async () => korrelasjon,
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

  const { runTreningsdataEkspert } = await import("@/lib/agents/treningsdata-ekspert");

  // Scenario 1: hovedløp — ingen eksisterende PENDING PlanAction.
  const result1 = await runTreningsdataEkspert("user-1");

  assert.equal(result1.signalsWritten, 0);
  assert.equal(result1.planActionsWritten, 1);
  assert.equal(createCalls.length, 1, "planAction.create skal kalles én gang");

  const { data } = createCalls[0];
  assert.equal(data.userId, "user-1");
  assert.equal(data.coachId, "coach-1");
  assert.equal(data.planId, "plan-1");
  assert.equal(data.actionType, "FOCUS_CHANGE");
  assert.equal(data.agentName, "treningsdata-ekspert");

  // Første negative treff (PUTT, r=-0.5) skal styre skillArea — direkte fra
  // sgArea, ikke en separat laveste-SG-beregning.
  assert.equal(data.suggestion.skillArea, "PUTTING");
  assert.match(data.suggestion.forklaring, /PUTT/);
  assert.match(data.suggestion.forklaring, /-0[.,]50/);
  assert.deepEqual(data.suggestion.signalSnapshot, {
    kind: "KORRELASJON",
    sgArea: "PUTT",
    r: -0.5,
  });

  assert.equal(varsleCalls.length, 1, "coach skal varsles ved nytt funn");

  // Scenario 2: duplikatsperre.
  //
  // Kjent begrensning (ikke fikset her): sperren i treningsdata-ekspert.ts
  // er kun scoped på (userId, agentName, status=PENDING) — uten
  // planId/område. Én åpen PlanAction blokkerer dermed også nye funn på
  // helt andre SG-områder for samme spiller.
  existingPlanAction = { id: "pa-existing", status: "PENDING" };

  const result2 = await runTreningsdataEkspert("user-2");

  assert.equal(result2.signalsWritten, 0);
  assert.equal(result2.planActionsWritten, 0);
  assert.equal(
    createCalls.length,
    1,
    "planAction.create skal IKKE kalles på nytt når PENDING allerede finnes",
  );
  assert.equal(varsleCalls.length, 1, "coach skal ikke varsles på nytt");
});
