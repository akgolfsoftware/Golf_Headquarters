import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { matchShotAgainstPlan, type MatchPlan } from "./match-shot";

const plan: MatchPlan = {
  tasks: [
    {
      id: "pitch-7",
      koller: ["7-jern"],
      slagType: "pitch",
      sortOrder: 0,
      hovedfokus: false,
      pSortOrder: 2,
    },
    {
      id: "full-7",
      koller: ["7-jern"],
      slagType: "fullsving",
      sortOrder: 0,
      hovedfokus: true,
      pSortOrder: 0,
    },
  ],
};

describe("matchShotAgainstPlan", () => {
  it("prioriterer fullsving + hovedfokus over pitch samme kølle", () => {
    const m = matchShotAgainstPlan(plan, "7i");
    assert.equal(m.taskId, "full-7");
    assert.equal(m.matchConfidence, "high");
  });

  it("manual preferredTaskId vinner", () => {
    const m = matchShotAgainstPlan(plan, "7i", { preferredTaskId: "pitch-7" });
    assert.equal(m.taskId, "pitch-7");
    assert.equal(m.matchSource, "manual");
  });

  it("ingen match uten kølle-treff", () => {
    const m = matchShotAgainstPlan(plan, "driver");
    assert.equal(m.taskId, null);
  });
});
