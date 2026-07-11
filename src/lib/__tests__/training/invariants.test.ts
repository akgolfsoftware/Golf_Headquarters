import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateExecutorDelta } from "@/lib/training/invariants";

describe("validateExecutorDelta", () => {
  it("blokkerer for mange nye økter", () => {
    const r = validateExecutorDelta(
      {
        sessionsToAdd: Array.from({ length: 5 }, () => ({
          title: "x",
          pyramidArea: "TEK",
          skillArea: null,
          durationMin: 60,
          scheduledAt: new Date(),
          drillExerciseIds: [],
        })),
        sessionsToRemove: [],
        sessionsToModify: [],
        summary: "test",
      },
      { planlagteOkterNesteUke: 2 },
    );
    assert.equal(r.ok, false);
  });

  it("tillater gyldig delta", () => {
    const r = validateExecutorDelta(
      {
        sessionsToAdd: [],
        sessionsToRemove: [],
        sessionsToModify: [],
        planMeta: { periodNote: "TURN" },
        summary: "periode",
      },
      { planlagteOkterNesteUke: 4 },
    );
    assert.equal(r.ok, true);
  });
});