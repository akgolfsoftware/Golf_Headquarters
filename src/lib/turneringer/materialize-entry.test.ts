import { test } from "node:test";
import assert from "node:assert/strict";
import {
  roundScoresFromEntryRounds,
  mapPublicStatusToEntryStatus,
} from "./materialize-entry";

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

test("mapPublicStatusToEntryStatus", () => {
  assert.equal(mapPublicStatusToEntryStatus("FINISHED"), "COMPLETED");
  assert.equal(mapPublicStatusToEntryStatus("CUT"), "DNF");
  assert.equal(mapPublicStatusToEntryStatus("WITHDREW"), "DNF");
  assert.equal(mapPublicStatusToEntryStatus("TEED_OFF"), "CONFIRMED");
  assert.equal(mapPublicStatusToEntryStatus("REGISTERED"), "PLANNED");
  assert.equal(mapPublicStatusToEntryStatus(null), "COMPLETED");
});
