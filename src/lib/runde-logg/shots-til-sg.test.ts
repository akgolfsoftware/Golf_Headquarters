import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { beregnSg, type SgShot } from "@/lib/domain/sg";
import {
  beregnSgFraShots,
  shotsTilSgShots,
  type DbHoleScoreRad,
  type DbShotRad,
} from "@/lib/runde-logg/shots-til-sg";

function slag(
  holeNumber: number,
  shotNumber: number,
  lie: string,
  distanceToPin: number | null,
  isPenalty = false,
  holePar = 4,
): DbShotRad {
  return { holeNumber, holePar, shotNumber, lie, distanceToPin, isPenalty };
}

describe("shotsTilSgShots", () => {
  // Kjent kjede fra beregnSg-eksempelet i domain/sg.ts: drive 350→100 (FAIRWAY),
  // approach 100→3 (GREEN), putt 3 → HOLED.
  const kjede: DbShotRad[] = [
    slag(1, 1, "TEE", 350),
    slag(1, 2, "FAIRWAY", 100),
    slag(1, 3, "GREEN", 3),
  ];
  const score: DbHoleScoreRad[] = [{ holeNumber: 1, strokes: 3 }];

  it("gir samme tall som SG-motorens referanse-eksempel", () => {
    const fasit: SgShot[] = [
      { category: "OTT", distance: 350, outcome: "FAIRWAY", distanceAfter: 100 },
      { category: "APP", distance: 100, outcome: "GREEN", distanceAfter: 3 },
      { category: "PUTT", distance: 3, outcome: "HOLED", distanceAfter: null },
    ];
    const resultat = beregnSgFraShots(kjede, score);
    assert.ok(resultat);
    assert.deepEqual(resultat, beregnSg(fasit));
  });

  it("mapper outcome fra NESTE slags lie og kjeder avstander", () => {
    const ut = shotsTilSgShots(kjede, score);
    assert.ok(ut);
    assert.equal(ut.length, 3);
    assert.deepEqual(ut[0], { category: "OTT", distance: 350, outcome: "FAIRWAY", distanceAfter: 100 });
    assert.deepEqual(ut[2], { category: "PUTT", distance: 3, outcome: "HOLED", distanceAfter: null });
  });

  it("par 3 starter i APP (Broadie-konvensjon)", () => {
    const par3 = [slag(1, 1, "TEE", 150, false, 3), slag(1, 2, "GREEN", 4, false, 3)];
    const ut = shotsTilSgShots(par3, [{ holeNumber: 1, strokes: 2 }]);
    assert.ok(ut);
    assert.equal(ut[0].category, "APP");
  });

  it("straffeslag gir syntetisk −1-rad (scorekortet teller straffen)", () => {
    const medStraffe = [
      slag(1, 1, "TEE", 350, true), // drive i vann → straffe
      slag(1, 2, "FAIRWAY", 100),
      slag(1, 3, "GREEN", 3),
    ];
    const ut = shotsTilSgShots(medStraffe, [{ holeNumber: 1, strokes: 4 }]);
    assert.ok(ut);
    assert.equal(ut.length, 4);
    const straffeRad = ut[0];
    assert.equal(straffeRad.distance, straffeRad.distanceAfter);
  });

  it("returnerer null når et slag mangler distanceToPin (aldri delvise tall)", () => {
    const hull = [slag(1, 1, "TEE", 350), slag(1, 2, "FAIRWAY", null), slag(1, 3, "GREEN", 3)];
    assert.equal(shotsTilSgShots(hull, score), null);
  });

  it("returnerer null når scorekortet ikke bekrefter hole-out (strokes ≠ slag)", () => {
    assert.equal(shotsTilSgShots(kjede, [{ holeNumber: 1, strokes: 5 }]), null);
  });

  it("returnerer null når et scoret hull mangler slag eller omvendt", () => {
    assert.equal(shotsTilSgShots(kjede, [...score, { holeNumber: 2, strokes: 4 }]), null);
    assert.equal(shotsTilSgShots([...kjede, slag(2, 1, "TEE", 300)], score), null);
  });

  it("returnerer null uten scorekort", () => {
    assert.equal(shotsTilSgShots(kjede, []), null);
  });
});
