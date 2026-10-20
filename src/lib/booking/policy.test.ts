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

test("gjest: bare egen booking uten konto, og 24-timersfristen gjelder", () => {
  const gjest = { ...base, userId: null, subscriptionId: null, stripePaymentIntentId: "pi_1", priceOre: 120000 };
  const actor = { kind: "guest", bookingId: "b1" } as const;
  assert.equal(cancelOutcome(gjest, actor, nowFar).refundStripe, true);
  assert.equal(cancelOutcome(gjest, actor, nowLate).refundStripe, false);
  assert.equal(rescheduleOutcome(gjest, actor, nowLate).allowed, false);
  assert.equal(rescheduleOutcome(gjest, actor, nowFar).allowed, true);
  assert.equal(cancelOutcome(gjest, { kind: "guest", bookingId: "annen" }, nowFar).allowed, false);
  assert.equal(cancelOutcome({ ...gjest, userId: "player-1" }, actor, nowFar).allowed, false);
});

test("NO_SHOW kan ikke avbestilles eller ombookes av kunden (klipp og betaling beholdes)", () => {
  const ns = { ...base, status: "NO_SHOW" as const };
  const c = cancelOutcome(ns, { kind: "player", userId: "player-1" }, nowFar);
  assert.equal(c.allowed, false);
  assert.equal(c.restoreCredit, false);
  assert.equal(c.refundStripe, false);
  assert.equal(rescheduleOutcome(ns, { kind: "player", userId: "player-1" }, nowFar).allowed, false);
});

test("gavekort: beløpet føres tilbake ved avbestilling over 24 timer før, og alltid for coach", () => {
  const gave = { ...base, subscriptionId: null, giftCardOre: 50_000 };
  assert.equal(cancelOutcome(gave, { kind: "player", userId: "player-1" }, nowFar).restoreGiftCard, true);
  assert.equal(cancelOutcome(gave, { kind: "player", userId: "player-1" }, nowLate).restoreGiftCard, false);
  assert.equal(cancelOutcome(gave, { kind: "coach", userId: "coach-1" }, nowLate).restoreGiftCard, true);
  assert.equal(cancelOutcome({ ...base, giftCardOre: 0 }, { kind: "player", userId: "player-1" }, nowFar).restoreGiftCard, false);
});
