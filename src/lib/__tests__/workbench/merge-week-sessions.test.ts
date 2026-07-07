import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mergeWeekSessions,
  type V2WeekSessionInput,
  type WeekSessionRow,
} from "@/lib/workbench/merge-week-sessions";

function mkV2(id: string, generertFraId: string | null): V2WeekSessionInput {
  const start = new Date("2026-06-25T10:00:00");
  const end = new Date("2026-06-25T11:00:00");
  return {
    id,
    title: `V2 ${id}`,
    startTime: start,
    endTime: end,
    generertFraId,
    drills: [{ pyramide: "TEK" }],
    practiceType: "BLOKK",
    status: "PLANNED",
  };
}

describe("mergeWeekSessions", () => {
  it("includes all 9 V2 rows when V1 is empty and all V2 have generertFraId", () => {
    const v1: WeekSessionRow[] = [];
    const v2Rows = Array.from({ length: 9 }, (_, i) => mkV2(`v2-${i}`, `plan-session-${i}`));
    const merged = mergeWeekSessions(v1, v2Rows);
    assert.equal(merged.length, 9);
    assert.deepEqual(
      merged.map((s) => s.id),
      v2Rows.map((s) => s.id),
    );
  });

  it("dedupes V2 when generertFraId matches an existing V1 id", () => {
    const v1Id = "v1-session-id";
    const v1: WeekSessionRow[] = [
      {
        id: v1Id,
        scheduledAt: new Date("2026-06-25T09:00:00"),
        durationMin: 60,
        title: "V1 økt",
        pyramidArea: "TEK",
        environment: "RANGE",
        status: "PLANNED",
        _count: { drills: 2 },
      },
    ];
    // V2 speiler V1-økten: egen uavhengig id (cuid), men generertFraId peker tilbake til V1.
    const v2: V2WeekSessionInput[] = [mkV2("v2-independent-cuid", v1Id)];
    const merged = mergeWeekSessions(v1, v2);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].title, "V1 økt");
  });

  it("keeps V2 when its own id happens to equal a V1 id but generertFraId points elsewhere", () => {
    const sharedId = "shared-id";
    const v1: WeekSessionRow[] = [
      {
        id: sharedId,
        scheduledAt: new Date("2026-06-25T09:00:00"),
        durationMin: 60,
        title: "V1 økt",
        pyramidArea: "TEK",
        environment: "RANGE",
        status: "PLANNED",
        _count: { drills: 2 },
      },
    ];
    // V2s EGEN id er lik V1-øktens id (skjer ikke i praksis, cuid er uavhengig) — men
    // generertFraId er null, så dette er en ukoblet V2-økt og skal IKKE dedupes bort.
    const v2: V2WeekSessionInput[] = [mkV2(sharedId, null)];
    const merged = mergeWeekSessions(v1, v2);
    assert.equal(merged.length, 2);
  });

  it("merges V1 and non-overlapping V2 sorted by scheduledAt", () => {
    const v1: WeekSessionRow[] = [
      {
        id: "v1-a",
        scheduledAt: new Date("2026-06-26T14:00:00"),
        durationMin: 45,
        title: "Sen V1",
        pyramidArea: "SLAG",
        environment: null,
        status: "PLANNED",
        _count: { drills: 0 },
      },
    ];
    const v2: V2WeekSessionInput[] = [mkV2("v2-b", "link-1")];
    v2[0].startTime = new Date("2026-06-25T08:00:00");
    v2[0].endTime = new Date("2026-06-25T09:00:00");
    const merged = mergeWeekSessions(v1, v2);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].id, "v2-b");
    assert.equal(merged[1].id, "v1-a");
  });
});