// Tester for beregnGoalProgress (delt fremdriftsberegning for PlayerHQ-mål).
//
// Mønster fra src/lib/__tests__/agents/sg-analyse-ekspert.test.ts: t.mock.module
// for "@/lib/prisma" med mutérbar mock-tilstand, ETT t.mock.module-oppsett og
// dynamisk import() ETTER mock-oppsettet — modulen under test importeres kun
// én gang per fil, så alle scenarioer kjøres sekvensielt i samme test().
//
// Kjør med: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import type { GoalForProgress } from "./progress";

function lagMal(overrides: Partial<GoalForProgress> & { type: string }): GoalForProgress {
  return {
    userId: "user-1",
    targetValue: null,
    linkedPyramidArea: null,
    linkedTestId: null,
    payload: null,
    ...overrides,
  };
}

test("beregnGoalProgress — HCP_TARGET, ROUNDS_PER_MONTH, SESSION_FREQUENCY, TEST_SCORE", async (t) => {
  let roundsCountInWindow = 0;
  let roundsEverExists = false;
  let sessionCountInWindow = 0;
  let sessionEverExists = false;
  let latestTestResult: { score: number } | null = null;
  let sgRounds: { sgOtt: number | null; sgApp: number | null; sgArg: number | null; sgPutt: number | null }[] = [];

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        round: {
          count: async () => roundsCountInWindow,
          findFirst: async () => (roundsEverExists ? { id: "r1" } : null),
          findMany: async () => sgRounds,
        },
        trainingPlanSessionLog: {
          count: async () => sessionCountInWindow,
          findFirst: async () => (sessionEverExists ? { id: "log-1" } : null),
        },
        testResult: {
          findFirst: async () => latestTestResult,
        },
      },
    },
  });

  const { beregnGoalProgress } = await import("./progress");

  // ── HCP_TARGET ──────────────────────────────────────────────────────
  {
    const mal = lagMal({ type: "HCP_TARGET", targetValue: 8 });

    const ingenData = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(ingenData.hasData, false, "ingen registrert HCP -> ingen data");
    assert.equal(ingenData.status, "no-data");

    // start=54, mål=8, range=46. hcp=31 -> reise=23 -> 23/46=50 %.
    const underveis = await beregnGoalProgress(mal, { hcp: 31 });
    assert.equal(underveis.hasData, true);
    assert.equal(underveis.pct, 50);
    assert.equal(underveis.status, "on-track");
    assert.equal(underveis.value, 31);

    // hcp under målverdien -> forbi 100 %, klippes til 100 og markeres oppnådd.
    const oppnadd = await beregnGoalProgress(mal, { hcp: 6 });
    assert.equal(oppnadd.pct, 100);
    assert.equal(oppnadd.status, "achieved");
  }

  // ── ROUNDS_PER_MONTH ────────────────────────────────────────────────
  {
    const mal = lagMal({ type: "ROUNDS_PER_MONTH", targetValue: 4 });

    roundsCountInWindow = 0;
    roundsEverExists = false;
    const ingenData = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(ingenData.hasData, false, "aldri spilt runde -> ingen data, ikke fabrikkert 0 %");

    roundsCountInWindow = 1;
    roundsEverExists = true;
    const bakPlan = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(bakPlan.hasData, true);
    assert.equal(bakPlan.pct, 25);
    assert.equal(bakPlan.status, "behind");
    assert.equal(bakPlan.value, 1);

    roundsCountInWindow = 3;
    const paaSporet = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(paaSporet.pct, 75);
    assert.equal(paaSporet.status, "on-track");

    roundsCountInWindow = 4;
    const oppnadd = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(oppnadd.pct, 100);
    assert.equal(oppnadd.status, "achieved");
  }

  // ── SESSION_FREQUENCY ───────────────────────────────────────────────
  {
    const mal = lagMal({ type: "SESSION_FREQUENCY", targetValue: 3, linkedPyramidArea: "SLAG" });

    const ingenKategoriValgt = await beregnGoalProgress(
      lagMal({ type: "SESSION_FREQUENCY", targetValue: 3 }),
      { hcp: null },
    );
    assert.equal(ingenKategoriValgt.hasData, false, "ingen treningskategori valgt -> ingen data");

    sessionCountInWindow = 0;
    sessionEverExists = false;
    const ingenData = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(ingenData.hasData, false, "aldri logget økt i kategorien -> ingen data");

    sessionCountInWindow = 1;
    sessionEverExists = true;
    const bakPlan = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(bakPlan.hasData, true);
    assert.equal(bakPlan.pct, 33);
    assert.equal(bakPlan.status, "behind");

    sessionCountInWindow = 2;
    const paaSporet = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(paaSporet.pct, 67);
    assert.equal(paaSporet.status, "on-track");

    sessionCountInWindow = 3;
    const oppnadd = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(oppnadd.pct, 100);
    assert.equal(oppnadd.status, "achieved");
  }

  // ── TEST_SCORE ──────────────────────────────────────────────────────
  {
    const mal = lagMal({ type: "TEST_SCORE", targetValue: 8, linkedTestId: "test-1" });

    const ingenTestValgt = await beregnGoalProgress(
      lagMal({ type: "TEST_SCORE", targetValue: 8 }),
      { hcp: null },
    );
    assert.equal(ingenTestValgt.hasData, false, "ingen test valgt -> ingen data");

    latestTestResult = null;
    const ingenData = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(ingenData.hasData, false, "ingen testresultat registrert -> ingen data");

    latestTestResult = { score: 2 };
    const bakPlan = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(bakPlan.hasData, true);
    assert.equal(bakPlan.pct, 25);
    assert.equal(bakPlan.status, "behind");
    assert.equal(bakPlan.value, 2);

    latestTestResult = { score: 6 };
    const paaSporet = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(paaSporet.pct, 75);
    assert.equal(paaSporet.status, "on-track");

    latestTestResult = { score: 8 };
    const oppnadd = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(oppnadd.pct, 100);
    assert.equal(oppnadd.status, "achieved");

    latestTestResult = { score: 10 };
    const overMaal = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(overMaal.pct, 100, "over mål klippes til 100 %, ikke over");
    assert.equal(overMaal.status, "achieved");
  }

  // ── SG_AREA ─────────────────────────────────────────────────────────
  {
    const ingenOmradeValgt = await beregnGoalProgress(lagMal({ type: "SG_AREA", targetValue: 0.5 }), {
      hcp: null,
    });
    assert.equal(ingenOmradeValgt.hasData, false, "ingen område valgt -> ingen data");

    const ingenBaseline = await beregnGoalProgress(
      lagMal({ type: "SG_AREA", targetValue: 0.5, payload: { sgOmrade: "PUTT" } }),
      { hcp: null },
    );
    assert.equal(ingenBaseline.hasData, false, "område valgt men ingen baseline ennå -> ingen data");

    const mal = lagMal({
      type: "SG_AREA",
      targetValue: 0.5,
      payload: { sgOmrade: "PUTT", sgStart: -0.5 },
    });

    sgRounds = [];
    const ingenRunder = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(ingenRunder.hasData, false, "baseline finnes, men ingen runder å regne snitt fra -> ingen data");

    // Baseline −0,5 → mål +0,5 er en reise på 1,0. Snitt-SG PUTT nå 0,0 = halvveis.
    sgRounds = [{ sgOtt: null, sgApp: null, sgArg: null, sgPutt: 0 }];
    const halvveis = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(halvveis.hasData, true);
    assert.equal(halvveis.pct, 50);
    assert.equal(halvveis.status, "on-track");
    assert.equal(halvveis.value, 0);

    // Nådd målverdi -> 100 % og oppnådd.
    sgRounds = [{ sgOtt: null, sgApp: null, sgArg: null, sgPutt: 0.7 }];
    const oppnaddSg = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(oppnaddSg.pct, 100);
    assert.equal(oppnaddSg.status, "achieved");

    // Tilbakegang under baseline klemmes til 0, aldri negativ.
    sgRounds = [{ sgOtt: null, sgApp: null, sgArg: null, sgPutt: -1.2 }];
    const bakPlanSg = await beregnGoalProgress(mal, { hcp: null });
    assert.equal(bakPlanSg.pct, 0);
    assert.equal(bakPlanSg.status, "behind");
  }

  // ── FREE_TEXT — ingen automatisk beregning bygget ────────────────────
  {
    const fritekst = lagMal({ type: "FREE_TEXT" });
    const ft = await beregnGoalProgress(fritekst, { hcp: null });
    assert.equal(ft.hasData, false);
    assert.equal(ft.status, "no-data");
  }
});
