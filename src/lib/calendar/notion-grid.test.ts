import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  GRID_END_HOUR,
  GRID_START_HOUR,
  GRID_SLOT_MIN,
  foreslaGridTid,
  gridHours,
  gridTicks,
  gridTimeSlots,
  tilStartParam,
  timeToPx,
  minutesToPx,
  durationToPx,
  PIXEL_PER_HOUR,
} from "./notion-grid";

describe("notion-grid fasit", () => {
  // Paper-fasit (agencyos-kalender.html + workbench-desktop.html):
  // T_START = 5*60, T_SLUTT = 23*60, SLOT = 30, SLOT_H = 22.
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
    assert.ok(!slots.includes("04:40"));
    assert.ok(!slots.includes("09:20"));
    assert.ok(!slots.includes("23:30"));
  });

  it("gir 22px per slot (SLOT_H)", () => {
    assert.equal(PIXEL_PER_HOUR / (60 / GRID_SLOT_MIN), 22);
  });

  it("merker aksen per slot, uten slutt-timen", () => {
    const merker = gridTicks();
    assert.equal(merker[0], 5 * 60);
    assert.equal(merker[1], 5 * 60 + 30);
    // Siste merke er 22:30 — 23:00 ville falt på underkanten av grid-kroppen.
    assert.equal(merker[merker.length - 1], 22 * 60 + 30);
    assert.equal(merker.length, ((23 - 5) * 60) / 30);
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
