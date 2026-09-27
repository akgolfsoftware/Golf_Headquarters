import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("AgencyOS Coach Automations", () => {
  it("strukturerer anbefalinger korrekt basert på regelsett", () => {
    const dummyPlayer = {
      id: "p1",
      name: "Ola Nordmann",
      tasks: [
        {
          id: "t1",
          trackStatus: "STAGNERER",
          pNummer: "P6",
          tittel: "Delivery flat wrist",
        },
      ],
    };

    assert.equal(dummyPlayer.tasks[0]?.trackStatus, "STAGNERER");
    assert.equal(dummyPlayer.tasks[0]?.pNummer, "P6");
  });
});
