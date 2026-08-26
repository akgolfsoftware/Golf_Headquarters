/**
 * Domain unit tests for Workbench operations.
 * Run with: node --test (or project's node:test runner)
 * Pure — no DB, no React.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createSession,
  createSessionSeries,
  applySeriesPatch,
  sessionsMatchingPolicy,
  moveSession,
  publishSession,
  unpublishSession,
  addDrill,
  reorderDrills,
  removeDrill,
  computeBudget,
  buildWeekViewModel,
  validateWeek,
  publishMany,
  snapToGrid,
  mondayOf,
} from "./operations";
import type { CreateSessionCommand } from "./types";

const baseCmd: CreateSessionCommand = {
  playerId: "p1",
  coachId: "c1",
  date: "2026-08-24",
  startMinute: 545, // 09:05 → snaps to 09:00
  durationMinutes: 60,
  title: "Innspill 150",
  pyramid: "TEK",
  createdBy: "COACH",
};

describe("snapToGrid", () => {
  it("snaps to 30 min", () => {
    assert.equal(snapToGrid(545), 540);
    assert.equal(snapToGrid(560), 570);
    assert.equal(snapToGrid(0), 0);
  });
});

describe("mondayOf", () => {
  it("returns Monday of the week", () => {
    assert.equal(mondayOf("2026-08-24"), "2026-08-24"); // Monday
    assert.equal(mondayOf("2026-08-26"), "2026-08-24"); // Wednesday
    assert.equal(mondayOf("2026-08-23"), "2026-08-17"); // Sunday → prev Monday
  });
});

describe("createSession", () => {
  it("creates DRAFT with snapped time", () => {
    const s = createSession(baseCmd, "2026-08-24T10:00:00Z");
    assert.equal(s.status, "DRAFT");
    assert.equal(s.startMinute, 540);
    assert.equal(s.durationMinutes, 60);
    assert.equal(s.blockType, "OEKT");
    assert.equal(s.title, "Innspill 150");
    assert.ok(s.id.startsWith("ws_"));
    assert.equal(s.publishedAt, undefined);
  });

  it("maps drills with order", () => {
    const s = createSession({
      ...baseCmd,
      drills: [
        {
          title: "Chip landing",
          durationMinutes: 20,
          akFormel: {
            pyramid: "TEK",
            area: "CHIP",
            label: "TEK · Chip",
          },
        },
      ],
    });
    assert.equal(s.drills.length, 1);
    assert.equal(s.drills[0].order, 0);
    assert.ok(s.drills[0].id.startsWith("dr_"));
  });
});

describe("moveSession", () => {
  it("moves date and time", () => {
    const s = createSession(baseCmd);
    const moved = moveSession(s, {
      sessionId: s.id,
      newDate: "2026-08-25",
      newStartMinute: 600,
    });
    assert.equal(moved.date, "2026-08-25");
    assert.equal(moved.startMinute, 600);
    assert.equal(moved.id, s.id);
  });

  it("can resize", () => {
    const s = createSession(baseCmd);
    const moved = moveSession(s, {
      sessionId: s.id,
      newDate: s.date,
      newStartMinute: s.startMinute,
      newDurationMinutes: 90,
    });
    assert.equal(moved.durationMinutes, 90);
  });
});

describe("publish / unpublish", () => {
  it("publishes DRAFT → PUBLISHED", () => {
    const s = createSession(baseCmd);
    const pub = publishSession(s, {
      sessionId: s.id,
      publishedBy: "c1",
    });
    assert.equal(pub.status, "PUBLISHED");
    assert.ok(pub.publishedAt);
    assert.equal(pub.publishedBy, "c1");
  });

  it("rejects cancelled", () => {
    const s = { ...createSession(baseCmd), status: "CANCELLED" as const };
    assert.throws(() =>
      publishSession(s, { sessionId: s.id, publishedBy: "c1" })
    );
  });

  it("unpublish returns to DRAFT", () => {
    const s = createSession(baseCmd);
    const pub = publishSession(s, { sessionId: s.id, publishedBy: "c1" });
    const back = unpublishSession(pub);
    assert.equal(back.status, "DRAFT");
    assert.equal(back.publishedAt, undefined);
  });
});

describe("drills", () => {
  it("addDrill appends and grows duration if needed", () => {
    const s = createSession(baseCmd);
    const withDrill = addDrill(s, {
      sessionId: s.id,
      drill: {
        title: "Putt 3–5",
        durationMinutes: 45,
        akFormel: { pyramid: "SLAG", area: "PUTT_3_5", label: "SLAG · Putt 3–5" },
      },
    });
    assert.equal(withDrill.drills.length, 1);
    assert.equal(withDrill.durationMinutes, 60); // still 60 because 45 < 60
  });

  it("removeDrill reindexes", () => {
    let s = createSession(baseCmd);
    s = addDrill(s, {
      sessionId: s.id,
      drill: {
        title: "A",
        durationMinutes: 15,
        akFormel: { pyramid: "TEK", area: "CHIP", label: "TEK" },
      },
    });
    s = addDrill(s, {
      sessionId: s.id,
      drill: {
        title: "B",
        durationMinutes: 15,
        akFormel: { pyramid: "TEK", area: "CHIP", label: "TEK" },
      },
    });
    const removed = removeDrill(s, s.drills[0].id);
    assert.equal(removed.drills.length, 1);
    assert.equal(removed.drills[0].order, 0);
    assert.equal(removed.drills[0].title, "B");
  });

  it("reorderDrills", () => {
    let s = createSession(baseCmd);
    s = addDrill(s, {
      sessionId: s.id,
      drill: {
        title: "A",
        durationMinutes: 10,
        akFormel: { pyramid: "TEK", area: "CHIP", label: "TEK" },
      },
    });
    s = addDrill(s, {
      sessionId: s.id,
      drill: {
        title: "B",
        durationMinutes: 10,
        akFormel: { pyramid: "TEK", area: "CHIP", label: "TEK" },
      },
    });
    const ids = [s.drills[1].id, s.drills[0].id];
    const reordered = reorderDrills(s, {
      sessionId: s.id,
      orderedDrillIds: ids,
    });
    assert.equal(reordered.drills[0].title, "B");
    assert.equal(reordered.drills[1].title, "A");
  });
});

describe("budget + week", () => {
  it("computeBudget ignores cancelled", () => {
    const a = createSession(baseCmd);
    const b = {
      ...createSession({ ...baseCmd, title: "X", pyramid: "FYS" as const }),
      status: "CANCELLED" as const,
    };
    const budget = computeBudget([a, b]);
    assert.equal(budget.plannedMinutes, 60);
    assert.equal(budget.byPyramid.TEK, 60);
    assert.equal(budget.byPyramid.FYS, 0);
  });

  it("buildWeekViewModel groups by day", () => {
    const s = createSession(baseCmd);
    const week = buildWeekViewModel(
      "2026-08-24",
      [s],
      [],
      { kind: "AGENCY", subjectId: "p1", sources: ["OEKTER"] },
      480
    );
    assert.equal(week.days.length, 7);
    assert.equal(week.days[0].date, "2026-08-24");
    assert.equal(week.days[0].sessions.length, 1);
    assert.equal(week.budget.targetMinutes, 480);
  });
});

describe("validateWeek", () => {
  it("detects overlap", () => {
    const a = createSession(baseCmd); // 09:00–10:00
    const b = createSession({
      ...baseCmd,
      title: "Overlap",
      startMinute: 570, // 09:30
    });
    const notes = validateWeek([a, b]);
    assert.equal(notes.length, 1);
    assert.equal(notes[0].level, "warn");
  });

  it("no note when sequential", () => {
    const a = createSession(baseCmd); // 09:00–10:00
    const b = createSession({
      ...baseCmd,
      title: "Next",
      startMinute: 600, // 10:00
    });
    const notes = validateWeek([a, b]);
    assert.equal(notes.length, 0);
  });
});

describe("publishMany", () => {
  it("publishes selection only", () => {
    const a = createSession(baseCmd);
    const b = createSession({ ...baseCmd, title: "Keep draft" });
    const result = publishMany([a, b], [a.id], "c1");
    assert.equal(result.find((s) => s.id === a.id)!.status, "PUBLISHED");
    assert.equal(result.find((s) => s.id === b.id)!.status, "DRAFT");
  });
});

describe("createSessionSeries", () => {
  it("weeks=1 behaves exactly like createSession — no seriesId", () => {
    const [s] = createSessionSeries(baseCmd, 1);
    assert.equal(s.seriesId, undefined);
    assert.equal(s.seriesIndex, undefined);
  });

  it("creates N weekly occurrences sharing a seriesId, one week apart", () => {
    const forekomster = createSessionSeries(baseCmd, 3);
    assert.equal(forekomster.length, 3);
    const seriesId = forekomster[0].seriesId;
    assert.ok(seriesId);
    forekomster.forEach((s, i) => {
      assert.equal(s.seriesId, seriesId);
      assert.equal(s.seriesIndex, i);
      assert.equal(s.status, "DRAFT");
    });
    assert.equal(forekomster[0].date, "2026-08-24");
    assert.equal(forekomster[1].date, "2026-08-31");
    assert.equal(forekomster[2].date, "2026-09-07");
    // Tid holdes likt per forekomst — kun dato flyttes.
    forekomster.forEach((s) => assert.equal(s.startMinute, 540));
  });
});

describe("sessionsMatchingPolicy", () => {
  const forekomster = createSessionSeries(baseCmd, 4);

  it("DENNE treffer kun gjeldende forekomst", () => {
    const treff = sessionsMatchingPolicy(forekomster, forekomster[2].id, "DENNE");
    assert.deepEqual(treff.map((s) => s.id), [forekomster[2].id]);
  });

  it("DENNE_OG_FREMOVER treffer gjeldende og alle senere", () => {
    const treff = sessionsMatchingPolicy(forekomster, forekomster[1].id, "DENNE_OG_FREMOVER");
    assert.deepEqual(
      treff.map((s) => s.id),
      [forekomster[1].id, forekomster[2].id, forekomster[3].id],
    );
  });

  it("HELE_SERIEN treffer alle forekomster uansett hvilken som er gjeldende", () => {
    const treff = sessionsMatchingPolicy(forekomster, forekomster[3].id, "HELE_SERIEN");
    assert.equal(treff.length, 4);
  });

  it("returnerer tom liste for ukjent sessionId", () => {
    assert.deepEqual(sessionsMatchingPolicy(forekomster, "finnes-ikke", "DENNE"), []);
  });
});

describe("applySeriesPatch", () => {
  it("slår sammen kun de oppgitte feltene, aldri dato/tid", () => {
    const s = createSession(baseCmd);
    const patched = applySeriesPatch(s, { title: "Nytt navn", pyramid: "SLAG" });
    assert.equal(patched.title, "Nytt navn");
    assert.equal(patched.pyramid, "SLAG");
    assert.equal(patched.date, s.date);
    assert.equal(patched.startMinute, s.startMinute);
  });
});

describe("player visibility rule", () => {
  it("DRAFT must never appear in player day filter", () => {
    const draft = createSession(baseCmd);
    const published = publishSession(draft, {
      sessionId: draft.id,
      publishedBy: "c1",
    });
    const visible = [draft, published].filter(
      (s) =>
        s.status === "PUBLISHED" ||
        s.status === "IN_PROGRESS" ||
        s.status === "COMPLETED"
    );
    assert.equal(visible.length, 1);
    assert.equal(visible[0].status, "PUBLISHED");
  });
});
