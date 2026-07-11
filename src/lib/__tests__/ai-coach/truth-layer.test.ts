/**
 * Truth layer — prioritet og konfliktløsning.
 * Kjør: npx tsx --test src/lib/__tests__/ai-coach/truth-layer.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveConflictingClaims,
  trackManBeatsVideo,
  sourcePriority,
} from "../../ai-coach/truth-layer";

describe("truth-layer", () => {
  it("TrackMan vinner over video-analyse", () => {
    const tm = {
      source: "trackman" as const,
      confidence: 0.8,
      summary: "Face åpen → push",
    };
    const video = {
      source: "video-analysis" as const,
      confidence: 0.9,
      summary: "P6 åpen",
    };
    assert.equal(trackManBeatsVideo(tm, video), true);
    assert.equal(sourcePriority(tm.source) > sourcePriority(video.source), true);
  });

  it("L-fase + APP-konflikt capper confidence til 0.65", () => {
    const resolved = resolveConflictingClaims([
      {
        source: "l-phase-readiness",
        area: "FYS",
        confidence: 0.9,
        summary: "Kropp først",
      },
      {
        source: "sg-round",
        area: "APP",
        confidence: 0.85,
        summary: "APP -1.0 SG",
      },
    ]);
    assert.ok(resolved);
    assert.equal(resolved.source, "l-phase-readiness");
    assert.equal(resolved.cappedConfidence, 0.65);
  });
});