import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  byggChunkKey,
  byggChunkMeta,
  registrerMislykketChunkForsok,
  tellVentendeChunks,
  trengerManuellChunkHandling,
} from "./recording-chunk-kladd";

describe("recording-chunk-kladd", () => {
  it("byggChunkKey er stabil", () => {
    assert.equal(byggChunkKey("bruker-a", "rec1", 3), "bruker-a:rec1:3");
  });

  it("teller forsøk til manuell terskel", () => {
    let m = byggChunkMeta("bruker-a", "r", 0, new Date("2026-07-31T12:00:00Z"));
    assert.equal(trengerManuellChunkHandling(m), false);
    for (let i = 0; i < 8; i++) {
      m = registrerMislykketChunkForsok(m, new Date());
    }
    assert.equal(trengerManuellChunkHandling(m), true);
  });

  it("tellVentendeChunks filtrerer på recordingId", () => {
    const a = byggChunkMeta("bruker-a", "a", 0, new Date());
    const b = byggChunkMeta("bruker-a", "a", 1, new Date());
    const c = byggChunkMeta("bruker-a", "b", 0, new Date());
    assert.equal(tellVentendeChunks([a, b, c], "a"), 2);
  });
});
