import { test } from "node:test";
import assert from "node:assert/strict";
import { roundScoresFromEntryRounds } from "./materialize-entry";

test("roundScoresFromEntryRounds: leser GolfBox rounds-blob", () => {
  assert.deepEqual(
    roundScoresFromEntryRounds({
      roundScores: [72, 71, null, 70],
      roundNames: ["R1", "R2", "R3", "R4"],
    }),
    [72, 71, null, 70],
  );
});

test("roundScoresFromEntryRounds: tom / ugyldig", () => {
  assert.deepEqual(roundScoresFromEntryRounds(null), []);
  assert.deepEqual(roundScoresFromEntryRounds({}), []);
  assert.deepEqual(roundScoresFromEntryRounds({ roundScores: ["x", 68] }), [
    null,
    68,
  ]);
});
