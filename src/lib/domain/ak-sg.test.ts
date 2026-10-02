import assert from "node:assert/strict";
import { test } from "node:test";
import { AK_SG_LIES, AkSgCalculator, type AkSgBaselinePoint } from "./ak-sg";

function calculator(): AkSgCalculator {
  const points: AkSgBaselinePoint[] = AK_SG_LIES.flatMap((lie): AkSgBaselinePoint[] =>
    lie === "green"
      ? [{ lie, distanceM: 1, expectedStrokes: 1.1 },
         { lie, distanceM: 5, expectedStrokes: 1.5 }]
      : [{ lie, distanceM: 100, expectedStrokes: 3 },
         { lie, distanceM: 150, expectedStrokes: 3.2 }],
  );
  return new AkSgCalculator("synthetic-v1", points);
}

test("interpolates within one active curve and calculates a shot without early rounding", () => {
  const model = calculator();
  assert.equal(model.expectedStrokes("fairway", 125), 3.1);
  assert.equal(model.calculateShot({
    startLie: "fairway", startDistanceM: 125,
    end: { holed: false, lie: "green", distanceM: 3 },
  }), 3.1 - 1.3 - 1);
  assert.equal(model.versionId, "synthetic-v1");
});

test("a holed end is zero and a penalty is charged once", () => {
  const model = calculator();
  const shot = { startLie: "green" as const, startDistanceM: 1, end: { holed: true as const } };
  assert.ok(Math.abs(model.calculateShot(shot)! - 0.1) < 1e-12);
  assert.ok(Math.abs(model.calculateShot({ ...shot, penaltyStrokes: 1 })! + 0.9) < 1e-12);
});

test("does not use the nearest endpoint outside measured coverage", () => {
  const model = calculator();
  assert.equal(model.expectedStrokes("fairway", 99), null);
  assert.equal(model.expectedStrokes("green", 5.01), null);
  assert.equal(model.calculateShot({
    startLie: "fairway", startDistanceM: 125,
    end: { holed: false, lie: "green", distanceM: 6 },
  }), null);
});

test("rejects invalid inputs and incomplete or backward curves", () => {
  const model = calculator();
  assert.throws(() => model.expectedStrokes("green", 0), RangeError);
  assert.throws(() => model.expectedStrokes("green", Number.NaN), RangeError);
  assert.throws(() => model.calculateShot({
    startLie: "green", startDistanceM: 1, end: { holed: true }, penaltyStrokes: -1,
  }), RangeError);
  assert.throws(() => new AkSgCalculator("v2", [
    { lie: "green", distanceM: 1, expectedStrokes: 1.5 },
    { lie: "green", distanceM: 2, expectedStrokes: 1.4 },
  ]));
});
