import assert from "node:assert/strict";
import { test } from "node:test";
import { kanSendeCoachMelding } from "./coach-melding-tilgang";

test("spiller kan bare sende til sin tildelte coach", () => {
  assert.equal(
    kanSendeCoachMelding({
      viewerRole: "PLAYER",
      requestedCoachId: "coach-a",
      enrolledCoachId: "coach-a",
      mottakerRolle: "COACH",
    }),
    true,
  );
});

test("annen coach, manglende tildeling og ikke-coach avvises", () => {
  assert.equal(
    kanSendeCoachMelding({
      viewerRole: "PLAYER",
      requestedCoachId: "coach-b",
      enrolledCoachId: "coach-a",
      mottakerRolle: "COACH",
    }),
    false,
  );
  assert.equal(
    kanSendeCoachMelding({
      viewerRole: "PLAYER",
      requestedCoachId: "coach-a",
      enrolledCoachId: null,
      mottakerRolle: "COACH",
    }),
    false,
  );
  assert.equal(
    kanSendeCoachMelding({
      viewerRole: "PLAYER",
      requestedCoachId: "coach-a",
      enrolledCoachId: "coach-a",
      mottakerRolle: "PLAYER",
    }),
    false,
  );
  assert.equal(
    kanSendeCoachMelding({
      viewerRole: "COACH",
      requestedCoachId: "coach-a",
      enrolledCoachId: "coach-a",
      mottakerRolle: "COACH",
    }),
    false,
  );
});
