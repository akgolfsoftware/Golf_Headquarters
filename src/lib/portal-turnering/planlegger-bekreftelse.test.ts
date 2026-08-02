import { test } from "node:test";
import assert from "node:assert/strict";

/**
 * Dobbel bekreftelse: CONFIRMED krever claim først.
 * (Logikk speiler claimPaamelding / confirmPaamelding.)
 */
function canConfirm(status: string, claimedAt: Date | null): boolean {
  if (status === "CONFIRMED") return true;
  if (status === "CLAIMED_REGISTERED") return true;
  if (claimedAt) return true;
  return false;
}

test("confirm krever claim først", () => {
  assert.equal(canConfirm("PLANNED", null), false);
  assert.equal(canConfirm("CLAIMED_REGISTERED", new Date()), true);
  assert.equal(canConfirm("PLANNED", new Date()), true);
  assert.equal(canConfirm("CONFIRMED", null), true);
});
