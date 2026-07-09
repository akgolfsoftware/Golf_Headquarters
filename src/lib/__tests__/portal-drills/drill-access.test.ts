import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { userCanAccessDrillRow } from "@/lib/portal-drills/drill-access";

describe("userCanAccessDrillRow", () => {
  it("tillater SYSTEM-drills for alle", () => {
    assert.equal(
      userCanAccessDrillRow("player-1", [], {
        source: "SYSTEM",
        visibility: "PRIVATE",
        createdBy: null,
      }),
      true,
    );
  });

  it("tillater COACH-drill kun for enrollert coach", () => {
    assert.equal(
      userCanAccessDrillRow("player-1", ["coach-a"], {
        source: "COACH",
        visibility: "COACH_PLAYERS",
        createdBy: "coach-a",
      }),
      true,
    );
    assert.equal(
      userCanAccessDrillRow("player-1", ["coach-b"], {
        source: "COACH",
        visibility: "COACH_PLAYERS",
        createdBy: "coach-a",
      }),
      false,
    );
  });

  it("tillater PLAYER-drill kun for eier", () => {
    assert.equal(
      userCanAccessDrillRow("player-1", [], {
        source: "PLAYER",
        visibility: "PRIVATE",
        createdBy: "player-1",
      }),
      true,
    );
    assert.equal(
      userCanAccessDrillRow("player-2", [], {
        source: "PLAYER",
        visibility: "PRIVATE",
        createdBy: "player-1",
      }),
      false,
    );
  });
});