import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { QUEUE_STATUS_OPTIONS } from "./status";

describe("oppfølgingskøens statusvalg", () => {
  it("gir berørings- og tastaturkontrollen alle fire målkolonner", () => {
    assert.deepEqual(
      QUEUE_STATUS_OPTIONS.map((option) => option.value),
      ["risk", "watch", "check", "ok"],
    );
  });
});
