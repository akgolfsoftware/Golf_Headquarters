import test from "node:test";
import assert from "node:assert/strict";
import { SG_TEST_POINTS } from "../__tests__/fixtures/sg-points";
import { beregnSgFraShots, shotsTilSgShots, type DbShotRad } from "./shots-til-sg";

const SHOTS: DbShotRad[] = [
  { holeNumber: 1, holePar: 4, shotNumber: 1, lie: "TEE", distanceToPin: 350,
    endLie: "FAIRWAY", endDistanceToPinM: 100, holed: false, penaltyStrokes: 0, isPenalty: false },
  { holeNumber: 1, holePar: 4, shotNumber: 2, lie: "FAIRWAY", distanceToPin: 100,
    endLie: "GREEN", endDistanceToPinM: 3, holed: false, penaltyStrokes: 0, isPenalty: false },
  { holeNumber: 1, holePar: 4, shotNumber: 3, lie: "GREEN", distanceToPin: 3,
    endLie: null, endDistanceToPinM: 0, holed: true, penaltyStrokes: 0, isPenalty: false },
];

test("lagrede slag gir samme fulle SG som logget kjede", () => {
  assert.equal(beregnSgFraShots(SHOTS, [{ holeNumber: 1, strokes: 3 }], SG_TEST_POINTS)?.total, 1.25);
  const mapped = shotsTilSgShots(SHOTS, [{ holeNumber: 1, strokes: 3 }]);
  assert.deepEqual(mapped?.map((s) => s.startLie), ["TEE", "FAIRWAY", "GREEN"]);
});

test("straff telles én gang når både nytt felt og legacy isPenalty er satt", () => {
  const withPenalty = [{ ...SHOTS[0], penaltyStrokes: 1, isPenalty: true }, ...SHOTS.slice(1)];
  assert.equal(shotsTilSgShots(withPenalty, [{ holeNumber: 1, strokes: 4 }])?.length, 3);
  assert.ok(Math.abs((beregnSgFraShots(withPenalty, [{ holeNumber: 1, strokes: 4 }], SG_TEST_POINTS)?.total ?? NaN) - 0.25) < 1e-10);
});

test("eldre Shot-rader kan utlede sluttposisjon fra neste rad, men må ha komplett score", () => {
  const legacy = SHOTS.map(({ holeNumber, holePar, shotNumber, lie, distanceToPin, isPenalty }) =>
    ({ holeNumber, holePar, shotNumber, lie, distanceToPin, isPenalty }));
  assert.equal(beregnSgFraShots(legacy, [{ holeNumber: 1, strokes: 3 }], SG_TEST_POINTS)?.total, 1.25);
  assert.equal(beregnSgFraShots(legacy, [{ holeNumber: 1, strokes: 4 }], SG_TEST_POINTS), null);
});

test("inkonsistent start/slutt og manglende referanse gir ikke beregning", () => {
  const broken = [{ ...SHOTS[0], endDistanceToPinM: 110 }, ...SHOTS.slice(1)];
  assert.equal(beregnSgFraShots(broken, [{ holeNumber: 1, strokes: 3 }], SG_TEST_POINTS), null);
  const unfinished = [...SHOTS.slice(0, 2), { ...SHOTS[2], holed: false, endLie: "GREEN", endDistanceToPinM: 0.5 }];
  assert.equal(beregnSgFraShots(unfinished, [{ holeNumber: 1, strokes: 3 }], SG_TEST_POINTS), null);
  assert.equal(beregnSgFraShots(SHOTS, [{ holeNumber: 1, strokes: 3 }], []), null);
});
