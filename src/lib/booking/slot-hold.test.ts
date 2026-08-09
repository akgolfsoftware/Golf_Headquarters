import test from "node:test";
import assert from "node:assert/strict";
import {
  acquireHold,
  releaseHold,
  isBlockedByHold,
  slotHoldKey,
  clampHoldTtl,
  DEFAULT_HOLD_TTL_MS,
  MIN_HOLD_TTL_MS,
  MAX_HOLD_TTL_MS,
  __resetSlotHoldMemoryForTests,
} from "./slot-hold";

const parts = {
  serviceTypeId: "svc-1",
  coachId: "coach-1",
  startIso: "2030-06-01T10:00:00.000Z",
};

test("slotHoldKey is stable", () => {
  assert.equal(slotHoldKey(parts), slotHoldKey({ ...parts }));
  assert.notEqual(
    slotHoldKey(parts),
    slotHoldKey({ ...parts, coachId: "other" }),
  );
});

test("clampHoldTtl respects bounds", () => {
  assert.equal(clampHoldTtl(1000), MIN_HOLD_TTL_MS);
  assert.equal(clampHoldTtl(10 * 60_000), MAX_HOLD_TTL_MS);
  assert.equal(clampHoldTtl(DEFAULT_HOLD_TTL_MS), DEFAULT_HOLD_TTL_MS);
});

test("acquireHold exclusive for different holders", async () => {
  __resetSlotHoldMemoryForTests();
  const a = await acquireHold(parts, "user-a");
  assert.equal(a.ok, true);
  const b = await acquireHold(parts, "user-b");
  assert.equal(b.ok, false);
  assert.equal(await isBlockedByHold(parts, "user-b"), true);
  assert.equal(await isBlockedByHold(parts, "user-a"), false);
});

test("same holder can refresh", async () => {
  __resetSlotHoldMemoryForTests();
  const a1 = await acquireHold(parts, "user-a");
  assert.equal(a1.ok, true);
  const a2 = await acquireHold(parts, "user-a");
  assert.equal(a2.ok, true);
});

test("releaseHold frees for next holder", async () => {
  __resetSlotHoldMemoryForTests();
  await acquireHold(parts, "user-a");
  assert.equal(await releaseHold(parts, "user-a"), true);
  const b = await acquireHold(parts, "user-b");
  assert.equal(b.ok, true);
});
