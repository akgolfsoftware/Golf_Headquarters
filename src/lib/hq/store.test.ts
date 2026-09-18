import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { useHq } from "./store.ts";

describe("live session", () => {
  it("marks extra shots after 12", () => {
    useHq.getState().resetLive();
    for (let i = 0; i < 13; i++) useHq.getState().addShot();
    const s = useHq.getState();
    assert.equal(s.shots, 13);
    assert.equal(s.series.d1, 12);
    assert.equal(s.sessionStatus, "delvis");
  });
});
