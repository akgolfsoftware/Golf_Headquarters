// Ren enhetstest for konsoliderings-hjelperen (ingen mocks).
import { test } from "node:test";
import assert from "node:assert/strict";
import { byggProseduraleMinner } from "@/lib/agents/memory-consolidation-agent";

test("prosedyriske minner krever minst 2 godkjent-uendret", () => {
  const minner = byggProseduraleMinner([
    { userId: "u1", actionType: "DRILL_SWAP", antall: 3 },
    { userId: "u1", actionType: "WEEK_SHIFT", antall: 1 },
    { userId: "u2", actionType: "INTENSITY_ADJUST", antall: 2 },
  ]);
  assert.equal(minner.length, 2);
  assert.equal(minner[0].playerId, "u1");
  assert.ok(minner[0].content.includes("DRILL_SWAP"));
  assert.ok(minner[0].content.includes("3 ganger"));
  assert.equal(minner[1].playerId, "u2");
});

test("tom input gir tom output", () => {
  assert.deepEqual(byggProseduraleMinner([]), []);
});
