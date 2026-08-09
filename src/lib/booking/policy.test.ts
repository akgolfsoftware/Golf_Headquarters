import test from "node:test";
import assert from "node:assert/strict";
import {
  cancelOutcome,
  rescheduleOutcome,
  AVBESTILLING_FRIST_TIMER,
  type BookingPolicySnapshot,
} from "./policy";

const base: BookingPolicySnapshot = {
  id: "b1",
  userId: "player-1",
  coachId: "coach-1",
  serviceCoachUserId: "coach-1",
  startAt: new Date("2030-06-01T12:00:00Z"),
  status: "CONFIRMED",
  subscriptionId: "sub-1",
  stripePaymentIntentId: null,
  priceOre: 0,
};

const nowFar = new Date("2030-05-01T12:00:00Z");
const nowLate = new Date("2030-06-01T00:00:00Z");

test("cancelOutcome: player >24h gets credit restore", () => {
  const o = cancelOutcome(base, { kind: "player", userId: "player-1" }, nowFar);
  assert.equal(o.allowed, true);
  assert.equal(o.restoreCredit, true);
  assert.equal(o.lateCancelNoRefund, false);
});

test("cancelOutcome: player <24h no credit", () => {
  const o = cancelOutcome(base, { kind: "player", userId: "player-1" }, nowLate);
  assert.equal(o.allowed, true);
  assert.equal(o.restoreCredit, false);
  assert.equal(o.lateCancelNoRefund, true);
});

test("cancelOutcome: staff always restores credit", () => {
  const o = cancelOutcome(base, { kind: "coach", userId: "coach-1" }, nowLate);
  assert.equal(o.restoreCredit, true);
});

test("cancelOutcome: other coach forbidden", () => {
  const o = cancelOutcome(base, { kind: "coach", userId: "coach-other" }, nowFar);
  assert.equal(o.allowed, false);
});

test("cancelOutcome: stripe refund only when PI and window", () => {
  const paid = {
    ...base,
    subscriptionId: null,
    stripePaymentIntentId: "pi_x",
    priceOre: 60000,
  };
  const o = cancelOutcome(paid, { kind: "player", userId: "player-1" }, nowFar);
  assert.equal(o.refundStripe, true);
  assert.equal(o.restoreCredit, false);
});

test("rescheduleOutcome: player late needs staff", () => {
  const o = rescheduleOutcome(base, { kind: "player", userId: "player-1" }, nowLate);
  assert.equal(o.allowed, false);
  assert.equal(o.requiresStaffOverride, true);
});

test("rescheduleOutcome: admin always", () => {
  const o = rescheduleOutcome(base, { kind: "admin", userId: "a1" }, nowLate);
  assert.equal(o.allowed, true);
});

test("AVBESTILLING_FRIST_TIMER is 24", () => {
  assert.equal(AVBESTILLING_FRIST_TIMER, 24);
});
