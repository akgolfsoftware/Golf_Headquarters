import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import { mapSeasonPhases, mapTournaments } from "@/components/workbench-hybrid/map-data";

const baseData = (): WorkbenchData => ({
  summary: { weekNumber: 26, sessionCount: 0, plannedHours: 0 },
});

describe("mapTournaments", () => {
  it("returns null when tournamentCalendar is empty", () => {
    assert.equal(mapTournaments(baseData()), null);
    assert.equal(mapTournaments({ ...baseData(), tournamentCalendar: [] }), null);
  });

  it("maps dated tournaments for month/gantt views", () => {
    const data: WorkbenchData = {
      ...baseData(),
      tournamentCalendar: [
        {
          title: "NM Amateur · Losby",
          startDate: "2026-08-18T08:00:00.000Z",
          daysUntil: 54,
          priority: "MAJOR",
        },
      ],
    };
    const rows = mapTournaments(data);
    assert.ok(rows);
    assert.equal(rows!.length, 1);
    assert.equal(rows![0].title, "NM Amateur · Losby");
    assert.match(rows![0].date!, /^\d{2}\.\d{2}\.2026$/);
    assert.equal(rows![0].type, "PRESTASJON");
    assert.equal(rows![0].days, 54);
  });
});

describe("mapSeasonPhases", () => {
  it("returns null without season blocks", () => {
    assert.equal(mapSeasonPhases(baseData()), null);
  });

  it("maps PeriodBlock lPhase to season phase types", () => {
    const data: WorkbenchData = {
      ...baseData(),
      seasonBlocks: [
        {
          lPhase: "GRUNN",
          startDate: "2026-01-01T00:00:00.000Z",
          endDate: "2026-03-31T00:00:00.000Z",
        },
        {
          lPhase: "SPESIAL",
          startDate: "2026-04-01T00:00:00.000Z",
          endDate: "2026-06-30T00:00:00.000Z",
        },
        {
          lPhase: "TURNERING",
          startDate: "2026-07-01T00:00:00.000Z",
          endDate: "2026-10-31T00:00:00.000Z",
        },
      ],
    };
    const phases = mapSeasonPhases(data);
    assert.ok(phases);
    assert.equal(phases!.length, 3);
    assert.deepEqual(
      phases!.map((p) => p.type),
      ["GRUNN", "SPESIALISERING", "TURNERING"],
    );
    assert.ok(phases![0].months > 0);
    assert.match(phases![0].span, /Jan/);
  });
});