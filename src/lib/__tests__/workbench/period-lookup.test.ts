import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { findActivePeriod, type PeriodRange } from "@/lib/workbench/period-lookup";

function mkPeriod(id: string, lPhase: PeriodRange["lPhase"], start: string, end: string): PeriodRange {
  return { id, lPhase, startDate: new Date(start), endDate: new Date(end) };
}

describe("findActivePeriod", () => {
  it("finds the period covering the given date", () => {
    const periods = [
      mkPeriod("p1", "GRUNN", "2026-01-01", "2026-03-31"),
      mkPeriod("p2", "SPESIAL", "2026-04-01", "2026-06-30"),
      mkPeriod("p3", "TURNERING", "2026-07-01", "2026-10-31"),
    ];
    const found = findActivePeriod(periods, new Date("2026-05-15"));
    assert.equal(found?.id, "p2");
  });

  it("returns null when no period covers the date", () => {
    const periods = [mkPeriod("p1", "GRUNN", "2026-01-01", "2026-03-31")];
    assert.equal(findActivePeriod(periods, new Date("2026-06-01")), null);
  });

  it("includes boundary dates (start and end inclusive)", () => {
    const periods = [mkPeriod("p1", "GRUNN", "2026-01-01", "2026-03-31")];
    assert.equal(findActivePeriod(periods, new Date("2026-01-01"))?.id, "p1");
    assert.equal(findActivePeriod(periods, new Date("2026-03-31"))?.id, "p1");
  });

  it("returns null for an empty list", () => {
    assert.equal(findActivePeriod([], new Date("2026-01-01")), null);
  });

  it("preserves extra fields on the input type (generic passthrough)", () => {
    const periods = [
      { ...mkPeriod("p1", "GRUNN", "2026-01-01", "2026-03-31"), focus: "Putting", weeklyVolMax: 300 },
    ];
    const found = findActivePeriod(periods, new Date("2026-02-01"));
    assert.equal(found?.focus, "Putting");
    assert.equal(found?.weeklyVolMax, 300);
  });
});
