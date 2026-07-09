import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  defaultDrillDurationMinutes,
  mapSessionDrillToV2Drill,
  type SessionDrillForV2Sync,
} from "@/lib/workbench/v2-drill-map";

function mkDrill(overrides: Partial<SessionDrillForV2Sync> = {}): SessionDrillForV2Sync {
  return {
    orderIndex: 0,
    reps: 10,
    sets: 3,
    repsSets: "3×10",
    csTarget: null,
    notes: null,
    lFase: null,
    miljo: null,
    csNivaa: null,
    prPress: null,
    pPosisjoner: [],
    repType: null,
    repAntall: null,
    repMinutter: null,
    repSett: null,
    repReps: null,
    pyramidArea: null,
    skillArea: null,
    exercise: {
      name: "Wedge 30m",
      description: "Treff target",
      durationMin: null,
      pyramidArea: "SLAG",
      skillArea: "TILNAERMING",
    },
    ...overrides,
  };
}

describe("defaultDrillDurationMinutes", () => {
  it("bruker øvelsens varighet når satt", () => {
    assert.equal(defaultDrillDurationMinutes(60, 2, 20), 20);
  });

  it("fordeler øktvarighet når øvelse mangler varighet", () => {
    assert.equal(defaultDrillDurationMinutes(60, 3, null), 20);
  });
});

describe("mapSessionDrillToV2Drill", () => {
  it("mapper navn, pyramide og repetisjoner fra SessionDrill", () => {
    const mapped = mapSessionDrillToV2Drill(mkDrill(), {
      sessionDurationMin: 60,
      drillCount: 1,
      sessionPyramid: "TEK",
    });
    assert.equal(mapped.name, "Wedge 30m");
    assert.equal(mapped.pyramide, "SLAG");
    assert.equal(mapped.repetitions, 30);
    assert.equal(mapped.sortOrder, 0);
    assert.equal(mapped.omraade, "TILNAERMING");
  });

  it("arver session-pyramide når drill og øvelse mangler område", () => {
    const mapped = mapSessionDrillToV2Drill(
      mkDrill({
        pyramidArea: null,
        exercise: {
          name: "Putting",
          description: null,
          durationMin: 15,
          pyramidArea: "TEK",
          skillArea: null,
        },
      }),
      { sessionDurationMin: 45, drillCount: 1, sessionPyramid: "SPILL" },
    );
    assert.equal(mapped.pyramide, "TEK");
    assert.equal(mapped.durationMinutes, 15);
  });
});