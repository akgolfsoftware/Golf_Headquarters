import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { GoalForProgress } from "./progress";

let reads: string[] = [];
let current = 0;
let feil = false;
mock.module("@/lib/portal/sg-omrade-snitt", { namedExports: {
  hentSgSnittPerOmrade: async (id: string) => {
    reads.push(id);
    if (feil) throw new Error("Syntetisk kildefeil");
    return { OTT: current, APP: current, ARG: current, PUTT: current };
  },
} });
mock.module("@/lib/prisma", { namedExports: { prisma: {} } });

function goal(omrade: string, userId = "syntetisk-spiller-a"): GoalForProgress {
  return { userId, type: "SG_AREA", targetValue: 1, linkedPyramidArea: null,
    linkedTestId: null, payload: { sgOmrade: omrade, sgStart: -1 } };
}
test.beforeEach(() => { reads = []; current = 0; feil = false; });

test("fire SG-mål gir samme resultat med én lesing i stedet for fire", async () => {
  const { beregnGoalProgress, beregnGoalProgressListe } = await import("./progress");
  const goals = ["OTT", "APP", "ARG", "PUTT"].map((s) => goal(s));
  const enkelt = await Promise.all(goals.map((g) => beregnGoalProgress(g, { hcp: null })));
  assert.equal(reads.length, 4);
  reads = [];
  const samlet = await beregnGoalProgressListe(goals, { hcp: null });
  assert.deepEqual(samlet, enkelt);
  assert.equal(reads.length, 1);
  assert.ok(samlet.every((p) => p.hasData && p.pct === 50));
});

test("SG-lesinger holdes adskilt per eier", async () => {
  const { beregnGoalProgressListe } = await import("./progress");
  await beregnGoalProgressListe([goal("OTT"), goal("PUTT", "syntetisk-spiller-b"), goal("APP")], { hcp: null });
  assert.deepEqual(reads, ["syntetisk-spiller-a", "syntetisk-spiller-b"]);
});

test("ny innlasting leser ferske data; ingen prosesscache eller gammel feil", async () => {
  const { beregnGoalProgressListe } = await import("./progress");
  const goals = [goal("PUTT")];
  const first = await beregnGoalProgressListe(goals, { hcp: null });
  current = 1;
  const second = await beregnGoalProgressListe(goals, { hcp: null });
  assert.equal(first[0].pct, 50);
  assert.equal(second[0].pct, 100);
  feil = true;
  await assert.rejects(() => beregnGoalProgressListe(goals, { hcp: null }));
  feil = false;
  assert.equal((await beregnGoalProgressListe(goals, { hcp: null }))[0].pct, 100);
  assert.equal(reads.length, 4);
});

test("tom liste, HCP og ugyldig SG-grunnlag gir ingen unødvendig SG-lesing", async () => {
  const { beregnGoalProgress, beregnGoalProgressListe } = await import("./progress");
  assert.deepEqual(await beregnGoalProgressListe([], { hcp: null }), []);
  const goals: GoalForProgress[] = [{ ...goal("PUTT"), payload: null }, { ...goal("OTT"), type: "HCP_TARGET" }];
  const ctx = { hcp: 10 };
  const expected = await Promise.all(goals.map((g) => beregnGoalProgress(g, ctx)));
  assert.deepEqual(await beregnGoalProgressListe(goals, ctx), expected);
  assert.equal(reads.length, 0);
});
