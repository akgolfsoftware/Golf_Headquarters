import assert from "node:assert/strict";
import { test } from "node:test";
import { briefAction } from "./brief-state";

test("en fullført eller avsluttet økt foreslås aldri startet på nytt", () => {
  assert.equal(briefAction("COMPLETED", true, null).kind, "summary");
  for (const status of ["CANCELLED", "SKIPPED", "ABANDONED", "DRAFT"]) assert.equal(briefAction(status, true, null).kind, "blocked");
});
test("pågående økter fortsetter og coach får ingen oppgraderingsoppfordring", () => {
  for (const status of ["IN_PROGRESS", "ACTIVE", "PAUSED"]) assert.equal(briefAction(status, true, null).kind, "continue");
  const coach = briefAction("PLANNED", false, "coach");
  assert.equal(coach.kind, "blocked");
  assert.equal(coach.message, "Bare spilleren kan starte denne økta.");
  assert.equal(briefAction("PLANNED", false, "tier").label, "Se abonnement");
});
test("et forslag må besvares før start, mens en godkjent plan kan startes", () => {
  assert.equal(briefAction("PLANNED", false, "approval").kind, "blocked");
  assert.equal(briefAction("PLANNED", true, null).kind, "start");
});
