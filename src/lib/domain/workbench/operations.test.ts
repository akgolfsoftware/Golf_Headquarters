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
  buildMonthViewModel,
  buildYearViewModel,
  buildPeriodViewModel,
  monthStartOf,
  lastDayOfMonth,
  addMonths,
  isoWeekNumber,
  dominantPyramid,
  validateWeek,
  publishMany,
  resolvePlayerApproval,
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

describe("valgt øktvarighet", () => {
  for (const durationMinutes of [15, 45, 75]) {
    it(`beholder ${durationMinutes} minutter ved oppretting og flytting`, () => {
      const session = createSession({ ...baseCmd, durationMinutes });
      assert.equal(session.durationMinutes, durationMinutes);
      const moved = moveSession(createSession(baseCmd), {
        sessionId: session.id, newDate: session.date,
        newStartMinute: 545, newDurationMinutes: durationMinutes,
      });
      assert.equal(moved.durationMinutes, durationMinutes);
      assert.equal(moved.startMinute, 540);
    });
  }
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
  for (const status of ["IN_PROGRESS", "COMPLETED", "SKIPPED"] as const) {
    it(`publisering overskriver ikke ${status}`, () => {
      const s = { ...createSession(baseCmd), status };
      assert.throws(() => publishSession(s, { sessionId: s.id, publishedBy: "c1" }));
      assert.equal(s.status, status);
    });
  }

  it("planlagt økt kan publiseres og gjentatt publisering beholder tidspunktet", () => {
    const s = { ...createSession(baseCmd), status: "SCHEDULED" as const };
    const cmd = { sessionId: s.id, publishedBy: "c1" };
    const pub = publishSession(s, cmd, "2026-09-10T09:00:00Z");
    assert.equal(pub.status, "PUBLISHED");
    assert.equal(publishSession(pub, cmd, "2026-09-10T10:00:00Z"), pub);
  });

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

describe("måned og år", () => {
  const mode = { kind: "AGENCY" as const, subjectId: "p1", sources: ["OEKTER" as const] };

  it("monthStartOf og lastDayOfMonth", () => {
    assert.equal(monthStartOf("2026-08-19"), "2026-08-01");
    assert.equal(lastDayOfMonth("2026-08-01"), "2026-08-31");
    assert.equal(lastDayOfMonth("2026-02-01"), "2026-02-28");
    assert.equal(addMonths("2026-12-01", 1), "2027-01-01");
    assert.equal(addMonths("2026-01-01", -1), "2025-12-01");
  });

  it("isoWeekNumber følger ISO (mandag-start)", () => {
    assert.equal(isoWeekNumber("2026-08-24"), 35);
  });

  it("buildMonthViewModel: maks tre linjer og +N mer", () => {
    const dager = [0, 1, 2, 3].map((i) =>
      createSession({
        ...baseCmd,
        date: "2026-08-05",
        title: `Økt ${i}`,
        startMinute: 8 * 60 + i * 60,
      }),
    );
    const month = buildMonthViewModel("2026-08-01", dager, mode, 0, "August 2026");
    const celle = month.weeks.flatMap((w) => w.days).find((c) => c.date === "2026-08-05");
    assert.ok(celle);
    assert.equal(celle.lines.length, 3);
    assert.equal(celle.restCount, 1);
    assert.equal(month.empty, false);
  });

  it("buildMonthViewModel: dager utenfor måneden er merket, klikkbar uke starter mandag", () => {
    const month = buildMonthViewModel("2026-08-01", [], mode, 0, "August 2026");
    assert.equal(month.weeks[0].weekStart, "2026-07-27");
    assert.equal(month.weeks[0].days[0].inMonth, false);
    assert.equal(month.weeks[0].days[0].date, "2026-07-27");
    const forste = month.weeks.flatMap((w) => w.days).find((c) => c.date === "2026-08-01");
    assert.equal(forste?.inMonth, true);
    assert.equal(month.empty, true);
  });

  it("buildMonthViewModel: gjennomført mot plan hittil summeres uten fremtidige økter", () => {
    const completed = {
      ...createSession({ ...baseCmd, date: "2026-09-02", durationMinutes: 90, pyramid: "TEK" }),
      status: "COMPLETED" as const,
    };
    const planned = createSession({ ...baseCmd, date: "2026-09-10", durationMinutes: 60, pyramid: "SLAG" });
    const future = createSession({ ...baseCmd, date: "2026-09-25", durationMinutes: 120, pyramid: "SPILL" });
    const month = buildMonthViewModel("2026-09-01", [completed, planned, future], mode, 0, "September 2026", "2026-09-15");
    assert.equal(month.plannedToDateMinutes, 150);
    assert.equal(month.completedMinutes, 90);
    assert.equal(month.completedByPyramid.TEK, 90);
    assert.equal(month.completedByPyramid.SPILL, 0);
    assert.equal(month.budget.plannedMinutes, 270);
  });

  it("buildMonthViewModel: ukesammendrag teller ikke dager utenfor måneden", () => {
    const september = createSession({ ...baseCmd, date: "2026-09-29", durationMinutes: 60 });
    const oktober = createSession({ ...baseCmd, date: "2026-10-03", durationMinutes: 120 });
    const month = buildMonthViewModel("2026-10-01", [september, oktober], mode, 0, "Oktober 2026");
    assert.equal(month.sessionCount, 1);
    assert.equal(month.weekSummaries[0].sessionCount, 1);
    assert.equal(month.weekSummaries[0].minutes, 120);
    assert.equal(month.weeks[0].days[1].inMonth, false);
    assert.equal(month.weeks[0].days[1].lines.length, 1);
  });

  it("cancelled økter telles ikke i dominant pyramide eller år-timer", () => {
    const tek = createSession({ ...baseCmd, date: "2026-03-10", pyramid: "TEK" });
    const fys = {
      ...createSession({ ...baseCmd, date: "2026-03-10", pyramid: "FYS" as const, durationMinutes: 180 }),
      status: "CANCELLED" as const,
    };
    assert.equal(dominantPyramid([tek, fys]), "TEK");
    const year = buildYearViewModel(2026, [tek, fys], mode);
    assert.equal(year.months.length, 12);
    assert.equal(year.months[2].minutes, 60);
    assert.equal(year.months[2].dominantPyramid, "TEK");
    assert.equal(year.months[0].sessionCount, 0);
  });

  it("buildYearViewModel: periodebånd, balanse og turnering·test-kolonne (WB-06)", () => {
    const tekMars = {
      ...createSession({
        ...baseCmd,
        date: "2026-03-10",
        pyramid: "TEK",
        durationMinutes: 120,
      }),
      status: "COMPLETED" as const,
    };
    const slagJuli = createSession({
      ...baseCmd,
      date: "2026-07-15",
      pyramid: "SLAG",
      durationMinutes: 180,
    });
    const year = buildYearViewModel(
      2026,
      [tekMars, slagJuli],
      mode,
      0,
      [
        { id: "grunn", type: "GRUNN", startDate: "2026-01-01", endDate: "2026-06-30", focus: null },
        {
          id: "turn",
          type: "TURNERING",
          startDate: "2026-07-01",
          endDate: "2026-09-30",
          focus: "Feltet",
        },
      ],
      [{ navn: "Sommertour Moss", dato: "2026-07-15" }],
      [{ navn: "Vintertest", dato: "2026-01-24" }],
      "2026-08-01",
    );

    assert.equal(year.periods.length, 2);
    const [grunn, turn] = year.periods;
    // Halvparten av årets ~365 dager, ±rundingsfeil.
    assert.ok(grunn.widthPct > 48 && grunn.widthPct < 51);
    assert.equal(grunn.aktiv, false); // idag = august, utenfor grunn-perioden
    assert.equal(turn.aktiv, true);
    assert.equal(grunn.balanseTimer.TEK, 2); // 120 min = 2t, i mars → grunn
    assert.equal(turn.balanseTimer.SLAG, 3); // 180 min = 3t, i juli → turnering
    assert.equal(year.plannedToDateMinutes, 300);
    assert.equal(year.completedMinutes, 120);
    assert.equal(year.completedByPyramid.TEK, 120);
    assert.equal(grunn.plannedMinutes, 120);
    assert.equal(grunn.completedMinutes, 120);
    assert.equal(turn.plannedMinutes, 180);
    assert.equal(turn.completedMinutes, 0);
    assert.equal(turn.turneringer.length, 1);
    assert.equal(turn.turneringer[0].navn, "Sommertour Moss");
    assert.equal(grunn.turneringer.length, 0); // turneringen er i juli, ikke i grunn-vinduet

    // Månedskolonnen slår sammen turnering + test, kronologisk.
    assert.deepEqual(year.months[0].eventLabels, ["Vintertest 24.01"]);
    assert.deepEqual(year.months[6].eventLabels, ["Sommertour Moss 15.07"]);
    assert.deepEqual(year.months[1].eventLabels, []);
  });

  it("buildPeriodViewModel: velger aktiv periode og summerer plan mot gjennomført", () => {
    const completed = {
      ...createSession({ ...baseCmd, date: "2026-08-25", durationMinutes: 90, pyramid: "TEK" }),
      status: "COMPLETED" as const,
    };
    const planned = createSession({ ...baseCmd, date: "2026-09-01", durationMinutes: 60, pyramid: "FYS" });
    const cancelled = {
      ...createSession({ ...baseCmd, date: "2026-08-26", durationMinutes: 180, pyramid: "SLAG" }),
      status: "CANCELLED" as const,
    };
    const outside = createSession({ ...baseCmd, date: "2026-10-01", durationMinutes: 240, pyramid: "TURN" });
    const perioder = [
      {
        id: "grunn",
        type: "GRUNN" as const,
        startDate: "2026-08-24",
        endDate: "2026-09-06",
        focus: "Stabil treningsrytme",
        widthPct: 4,
        aktiv: true,
        balanseTimer: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0, PERS: 0 },
        plannedMinutes: 0,
        plannedToDateMinutes: 0,
        completedMinutes: 0,
        turneringer: [],
      },
    ];

    const periode = buildPeriodViewModel(
      2026,
      perioder,
      null,
      [completed, planned, cancelled, outside],
      mode,
      "2026-08-28",
    );

    assert.equal(periode.period?.id, "grunn");
    assert.equal(periode.sessions.length, 2);
    assert.equal(periode.plannedMinutes, 150);
    assert.equal(periode.plannedToDateMinutes, 90);
    assert.equal(periode.completedMinutes, 90);
    assert.equal(periode.weeks.length, 2);
    assert.equal(periode.weeks[0].weekNumber, 35);
    assert.equal(periode.weeks[0].minutes, 90);
    assert.equal(periode.weeks[1].minutes, 60);
    assert.equal(periode.distribution.find((row) => row.pyramid === "TEK")?.sharePct, 60);
    assert.equal(periode.distribution.find((row) => row.pyramid === "FYS")?.sharePct, 40);
    assert.equal(periode.distribution.find((row) => row.pyramid === "SLAG")?.plannedMinutes, 0);
  });

  it("buildPeriodViewModel: tom når årsplanen ikke har perioder", () => {
    const periode = buildPeriodViewModel(2026, [], null, [createSession(baseCmd)], mode, "2026-08-24");
    assert.equal(periode.period, null);
    assert.deepEqual(periode.sessions, []);
    assert.deepEqual(periode.weeks, []);
    assert.deepEqual(periode.distribution, []);
    assert.equal(periode.plannedMinutes, 0);
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

describe("resolvePlayerApproval", () => {
  function forslagFraCoach() {
    const s = createSession({ ...baseCmd, createdBy: "COACH" });
    return {
      ...s,
      status: "PUBLISHED" as const,
      origin: "COACH" as const,
      needsPlayerApproval: true,
      approvalStatus: "PENDING" as const,
    };
  }

  it("ACCEPTED rydder flaggene, beholder alt annet urørt", () => {
    const forslag = forslagFraCoach();
    const godtatt = resolvePlayerApproval(forslag, "ACCEPTED");
    assert.equal(godtatt.approvalStatus, "ACCEPTED");
    assert.equal(godtatt.needsPlayerApproval, false);
    assert.equal(godtatt.hiddenByPlayer, undefined);
    assert.equal(godtatt.title, forslag.title);
    assert.equal(godtatt.date, forslag.date);
    assert.equal(godtatt.startMinute, forslag.startMinute);
    assert.equal(godtatt.status, "PUBLISHED");
  });

  it("REJECTED skjuler økten (hiddenByPlayer), aldri sletter", () => {
    const forslag = forslagFraCoach();
    const avvist = resolvePlayerApproval(forslag, "REJECTED");
    assert.equal(avvist.approvalStatus, "REJECTED");
    assert.equal(avvist.needsPlayerApproval, false);
    assert.equal(avvist.hiddenByPlayer, true);
    // Innhold/eierskap/tid er urørt — kun flaggene endres.
    assert.equal(avvist.title, forslag.title);
    assert.equal(avvist.playerId, forslag.playerId);
    assert.equal(avvist.date, forslag.date);
    assert.equal(avvist.status, "PUBLISHED");
  });

  it("REJECTED på en allerede skjult økt endrer ikke tilstanden videre", () => {
    const forslag = { ...forslagFraCoach(), hiddenByPlayer: true };
    const avvist = resolvePlayerApproval(forslag, "REJECTED");
    assert.equal(avvist.hiddenByPlayer, true);
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
