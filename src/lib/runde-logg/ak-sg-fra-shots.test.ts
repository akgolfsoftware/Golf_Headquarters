import assert from "node:assert/strict";
import { test } from "node:test";
import { AK_SG_LIES, AkSgCalculator, type AkSgBaselinePoint } from "@/lib/domain/ak-sg";
import { beregnAkSgFraShots } from "./ak-sg-fra-shots";

const points: AkSgBaselinePoint[] = AK_SG_LIES.flatMap((lie) => [
  { lie, distanceM: 1, expectedStrokes: 1 },
  { lie, distanceM: 500, expectedStrokes: 5 },
]);
const model = new AkSgCalculator("own-model-v1", points);
const shot = (shotNumber: number, lie: string, distanceToPin: number, isPenalty = false) => ({
  holeNumber: 1, holePar: 4, shotNumber, lie, distanceToPin, isPenalty,
});

test("complete round telescopes to start expectation minus gross strokes", () => {
  const result = beregnAkSgFraShots(
    [shot(1, "TEE", 300), shot(2, "FAIRWAY", 100)],
    [{ holeNumber: 1, strokes: 2 }], model,
  );
  assert.ok(result);
  const startExpected = model.expectedStrokes("tee", 300)!;
  assert.ok(Math.abs(result.sg.total - Math.round((startExpected - 2) * 100) / 100) < 1e-12);
  assert.equal(result.versionId, "own-model-v1");
  assert.equal(result.gran.sgTee, result.sg.ott);
  assert.equal(result.gran.sgApp100, result.sg.app);
});

test("penalty is counted exactly once in gross score and SG", () => {
  const result = beregnAkSgFraShots(
    [shot(1, "TEE", 300, true), shot(2, "FAIRWAY", 100)],
    [{ holeNumber: 1, strokes: 3 }], model,
  );
  assert.ok(result);
  assert.equal(result.sg.total, Math.round((model.expectedStrokes("tee", 300)! - 3) * 100) / 100);
});

test("missing score, broken chain, and unsupported distance never produce partial SG", () => {
  const rows = [shot(1, "TEE", 300), shot(2, "FAIRWAY", 100)];
  assert.equal(beregnAkSgFraShots(rows, [], model), null);
  assert.equal(beregnAkSgFraShots(rows, [{ holeNumber: 1, strokes: 3 }], model), null);
  assert.equal(beregnAkSgFraShots([shot(1, "TEE", 600)], [{ holeNumber: 1, strokes: 1 }], model), null);
  assert.equal(beregnAkSgFraShots([shot(1, "WATER", 300)], [{ holeNumber: 1, strokes: 1 }], model), null);
});
