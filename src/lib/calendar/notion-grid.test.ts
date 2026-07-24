import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  GRID_END_HOUR,
  GRID_START_HOUR,
  GRID_SLOT_MIN,
  foreslaGridTid,
  gridHours,
  gridTimeSlots,
  tilStartParam,
  timeToPx,
  minutesToPx,
  durationToPx,
  PIXEL_PER_HOUR,
} from "./notion-grid";

describe("notion-grid fasit", () => {
  it("spenner 05–23 inkl.", () => {
    assert.equal(GRID_START_HOUR, 5);
    assert.equal(GRID_END_HOUR, 23);
    assert.equal(GRID_SLOT_MIN, 30);
    const hours = gridHours();
    assert.equal(hours[0], 5);
    assert.equal(hours[hours.length - 1], 23);
  });

  it("har 30-min slots", () => {
    const slots = gridTimeSlots();
    assert.ok(slots.includes("05:00"));
    assert.ok(slots.includes("05:30"));
    assert.ok(slots.includes("09:00"));
    assert.ok(slots.includes("23:00"));
    assert.ok(!slots.includes("23:30"));
  });

  it("foreslår tid innen grid", () => {
    assert.equal(foreslaGridTid(undefined), "09:00");
    assert.equal(foreslaGridTid("08:00", 60), "09:00");
    assert.equal(foreslaGridTid("22:00", 60), "23:00");
  });

  it("bygger start-param for øktplanlegger", () => {
    assert.equal(tilStartParam("2026-07-23", "09:30"), "2026-07-23T09:30");
  });

  it("regner px for tid og varighet", () => {
    assert.equal(timeToPx(5, 0), 0);
    assert.equal(timeToPx(6, 0), PIXEL_PER_HOUR);
    assert.equal(minutesToPx(5 * 60), 0);
    assert.equal(minutesToPx(6 * 60), PIXEL_PER_HOUR);
    assert.equal(durationToPx(60), PIXEL_PER_HOUR);
    assert.ok(durationToPx(15) >= 20);
  });
});
