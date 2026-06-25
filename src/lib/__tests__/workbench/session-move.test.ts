import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeMoveTarget,
  dateForDayIndex,
  dayIndexFromScheduledAt,
  mondayOf,
} from "@/lib/workbench/session-move-math";

/** Onsdag 25. juni 2026 — stabil referanseuke for tester. */
const REF = new Date("2026-06-25T12:00:00.000Z");

describe("mondayOf", () => {
  it("returns Monday 00:00 for a Wednesday ref", () => {
    const mon = mondayOf(REF);
    assert.equal(mon.getDay(), 1);
    assert.equal(mon.getHours(), 0);
    assert.equal(mon.getMinutes(), 0);
  });
});

describe("dateForDayIndex", () => {
  it("maps dayIndex 0 to Monday of ref week at given time", () => {
    const d = dateForDayIndex(0, 10, 30, REF);
    assert.equal(d.getDay(), 1);
    assert.equal(d.getHours(), 10);
    assert.equal(d.getMinutes(), 30);
  });

  it("maps dayIndex 2 to Wednesday of ref week", () => {
    const d = dateForDayIndex(2, 9, 0, REF);
    assert.equal(d.getDay(), 3);
  });
});

describe("computeMoveTarget", () => {
  it("preserves clock time when changing day", () => {
    const before = dateForDayIndex(0, 14, 15, REF);
    const after = computeMoveTarget(before, 3, REF);
    assert.equal(after.getDay(), 4); // Thursday
    assert.equal(after.getHours(), 14);
    assert.equal(after.getMinutes(), 15);
  });

  it("throws on invalid day index", () => {
    assert.throws(() => computeMoveTarget(REF, 7, REF), /Ugyldig dag/);
  });
});

describe("dayIndexFromScheduledAt", () => {
  it("returns 2 for Wednesday in ref week", () => {
    const wed = dateForDayIndex(2, 8, 0, REF);
    assert.equal(dayIndexFromScheduledAt(wed, REF), 2);
  });
});