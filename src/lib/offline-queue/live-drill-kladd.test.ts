/**
 * Enhetstester for live-drill offline-kladd.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  byggLiveDrillKoRad,
  registrerMislykketLiveForsok,
  trengerManuellLiveHandling,
} from "./live-drill-kladd";

describe("live-drill-kladd", () => {
  it("bygger rad med forsokAntall 0", () => {
    const rad = byggLiveDrillKoRad(
      "s1",
      [
        {
          drillId: "d1",
          repsTotal: 10,
          repsWithoutBall: 2,
          repsLowSpeed: 3,
          repsAutomatic: 0,
          repsHit: 5,
          status: "active",
        },
      ],
      120,
      new Date("2026-07-24T12:00:00Z"),
    );
    assert.equal(rad.sessionId, "s1");
    assert.equal(rad.forsokAntall, 0);
    assert.equal(rad.drills[0].repsTotal, 10);
    assert.equal(rad.totalSec, 120);
  });

  it("teller mislykkede forsøk til manuell terskel", () => {
    let rad = byggLiveDrillKoRad("s1", [], 0, new Date("2026-07-24T12:00:00Z"));
    for (let i = 0; i < 5; i++) {
      rad = registrerMislykketLiveForsok(rad, new Date());
    }
    assert.equal(trengerManuellLiveHandling(rad), true);
  });
});
