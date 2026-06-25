import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dagNrToDayIndex,
  scheduleTemplateWeek,
  mergeTemplateIntoWeek,
} from "@/lib/workbench/map-template-week";

describe("map-template-week", () => {
  it("dagNrToDayIndex maps mandag=1 to 0", () => {
    assert.equal(dagNrToDayIndex(1), 0);
    assert.equal(dagNrToDayIndex(7), 6);
    assert.equal(dagNrToDayIndex(0), null);
  });

  it("scheduleTemplateWeek assigns times per day", () => {
    const rows = scheduleTemplateWeek(
      [
        { title: "A", varighetMin: 60, pyramidArea: "TEK", ukeNr: 1, dagNr: 1 },
        { title: "B", varighetMin: 45, pyramidArea: "SLAG", ukeNr: 1, dagNr: 1 },
        { title: "C", varighetMin: 90, pyramidArea: "FYS", ukeNr: 1, dagNr: 3 },
      ],
      1,
    );
    assert.equal(rows.length, 3);
    assert.equal(rows[0]!.hour, 9);
    assert.equal(rows[0]!.minute, 0);
    assert.equal(rows[1]!.hour, 10);
    assert.equal(rows[1]!.minute, 0);
    assert.equal(rows[2]!.dayKey, "ons");
  });

  it("mergeTemplateIntoWeek keeps existing sessions", () => {
    const existing = {
      man: [{ id: "x", title: "Eksisterende", dur: 30, cat: "TEK" as const, time: "08:00" }],
      tir: [],
      ons: [],
      tor: [],
      fre: [],
      lor: [],
      son: [],
    };
    const scheduled = scheduleTemplateWeek(
      [{ title: "Ny", varighetMin: 60, pyramidArea: "TEK", ukeNr: 1, dagNr: 2 }],
      1,
    );
    const merged = mergeTemplateIntoWeek(existing, scheduled, "t");
    assert.equal(merged.man.length, 1);
    assert.equal(merged.tir.length, 1);
    assert.match(merged.tir[0]!.id, /^t-/);
  });
});