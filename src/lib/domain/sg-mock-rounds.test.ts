import assert from "node:assert/strict";
import { test } from "node:test";
import { expectedStrokesAt } from "./shot-sg";
import { generateSgMockRounds } from "./sg-mock-rounds";

test("mocken gir eksakt 1000 slag i komplette brutto-runder på par 72", () => {
  const rounds = generateSgMockRounds();
  assert.equal(rounds.length, 13);
  assert.equal(rounds.reduce((sum, round) => sum + round.shots.length, 0), 1000);
  assert.deepEqual(rounds, generateSgMockRounds());
  for (const round of rounds) {
    assert.equal(round.par, 72);
    assert.equal(round.holeScores.length, 18);
    assert.equal(round.holeScores.reduce((sum, hole) => sum + hole.par, 0), 72);
    assert.equal(round.holeScores.reduce((sum, hole) => sum + hole.strokes, 0), round.score);
    assert.equal(round.shots.length, round.score);
    assert.ok(Math.abs(round.sg.OTT + round.sg.APP + round.sg.ARG + round.sg.PUTT - round.sg.total) < 1e-9);
    for (const hole of round.holeScores) {
      const shots = round.shots.filter((shot) => shot.holeNumber === hole.holeNumber);
      assert.equal(shots.length, hole.strokes);
      assert.deepEqual(shots.map((shot) => shot.shotNumber), Array.from({ length: hole.strokes }, (_, i) => i + 1));
      assert.equal(shots.filter((shot) => shot.shotType === "PUTT").length, hole.putts);
      const holeSg = shots.reduce((sum, shot) => sum + shot.sg, 0);
      assert.ok(Math.abs(holeSg - (expectedStrokesAt(shots[0].distanceToPin, "Tee") - hole.strokes)) < 1e-8);
    }
  }
});

test("fiktiv profil taper på innspill og vinner på putting", () => {
  const rounds = generateSgMockRounds();
  assert.ok(rounds.reduce((sum, round) => sum + round.sg.APP, 0) / rounds.length < -1);
  assert.ok(rounds.reduce((sum, round) => sum + round.sg.PUTT, 0) / rounds.length > 0.5);
});
