import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeMoveTarget,
  dateForDayIndex,
  dayIndexFromScheduledAt,
  mondayOf,
  weekRefDate,
  parseWeekOffset,
  WEEK_OFFSET_MIN,
  WEEK_OFFSET_MAX,
} from "@/lib/workbench/session-move-math";

/** Onsdag 25. juni 2026 — stabil referanseuke for tester. */
const REF = new Date("2026-06-25T12:00:00.000Z");
/** Mandag i REF-uka (22. juni 2026), lokal midnatt. */
const REF_MONDAY = mondayOf(REF);

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

describe("weekRefDate", () => {
  it("returns the Monday of the current week for offset 0", () => {
    const r = weekRefDate(0, REF);
    assert.equal(r.getTime(), REF_MONDAY.getTime());
  });

  it("returns next Monday for offset +1 and prev Monday for offset -1", () => {
    const next = weekRefDate(1, REF);
    const prev = weekRefDate(-1, REF);
    assert.equal(next.getTime() - REF_MONDAY.getTime(), 7 * 86_400_000);
    assert.equal(REF_MONDAY.getTime() - prev.getTime(), 7 * 86_400_000);
  });

  it("anchors a move to the offset week — Wednesday of week +1", () => {
    // En økt i inneværende uke som flyttes til onsdag i uke +1.
    const before = dateForDayIndex(0, 14, 15, REF);
    const moved = computeMoveTarget(before, 2, weekRefDate(1, REF));
    assert.equal(moved.getDay(), 3); // onsdag
    assert.equal(moved.getHours(), 14);
    assert.equal(moved.getMinutes(), 15);
    // Sju dager etter onsdag i inneværende uke.
    const wedThisWeek = dateForDayIndex(2, 14, 15, REF);
    assert.equal(moved.getTime() - wedThisWeek.getTime(), 7 * 86_400_000);
  });

  it("truncates fractional offsets (defensive)", () => {
    assert.equal(weekRefDate(1.9, REF).getTime(), weekRefDate(1, REF).getTime());
  });
});

describe("Oslo-korrekt uke rundt midnatt (gotcha 2026-07-19)", () => {
  // Instanter der UTC-dagen og Oslo-dagen er ULIKE — rå getDay() på en
  // UTC-server ga her forrige uke. Assertions leser lokale getters, som per
  // naiv-veggklokke-konvensjonen gir norsk kalenderdag uansett server-TZ.

  it("vinter: søndag 23:30 UTC = mandag 00:30 Oslo → mandag i NY uke", () => {
    const instant = new Date("2026-01-04T23:30:00.000Z"); // man 5. jan 00:30 Oslo
    const mon = mondayOf(instant);
    assert.equal(mon.getFullYear(), 2026);
    assert.equal(mon.getMonth(), 0);
    assert.equal(mon.getDate(), 5);
    assert.equal(mon.getDay(), 1);
    assert.equal(mon.getHours(), 0);
  });

  it("sommer: søndag 22:30 UTC = mandag 00:30 Oslo → mandag i NY uke", () => {
    const instant = new Date("2026-06-28T22:30:00.000Z"); // man 29. jun 00:30 Oslo
    const mon = mondayOf(instant);
    assert.equal(mon.getMonth(), 5);
    assert.equal(mon.getDate(), 29);
    assert.equal(mon.getDay(), 1);
  });

  it("weekRefDate krysser sommertidsskiftet uten å miste mandagen", () => {
    // Uka man 23. mars 2026; +1 uke krysser DST-start (søn 29. mars).
    const ref = new Date(2026, 2, 25, 12, 0); // ons 25. mars, lokal
    const next = weekRefDate(1, ref);
    assert.equal(next.getDate(), 30);
    assert.equal(next.getMonth(), 2);
    assert.equal(next.getDay(), 1);
    assert.equal(next.getHours(), 0);
  });

  it("dateForDayIndex treffer søndagen i DST-uka med riktig klokkeslett", () => {
    const ref = new Date(2026, 2, 25, 12, 0);
    const sun = dateForDayIndex(6, 18, 0, ref); // søn 29. mars = DST-dagen
    assert.equal(sun.getDate(), 29);
    assert.equal(sun.getDay(), 0);
    assert.equal(sun.getHours(), 18);
  });

  it("dayIndexFromScheduledAt gir 6 for søndagen i DST-uka", () => {
    const ref = new Date(2026, 2, 25, 12, 0);
    const sun = new Date(2026, 2, 29, 18, 0);
    assert.equal(dayIndexFromScheduledAt(sun, ref), 6);
  });
});

describe("parseWeekOffset", () => {
  it("returns 0 for missing/empty/invalid", () => {
    assert.equal(parseWeekOffset(undefined), 0);
    assert.equal(parseWeekOffset(null), 0);
    assert.equal(parseWeekOffset(""), 0);
    assert.equal(parseWeekOffset("abc"), 0);
  });

  it("parses integers and truncates fractions", () => {
    assert.equal(parseWeekOffset("3"), 3);
    assert.equal(parseWeekOffset("-2"), -2);
    assert.equal(parseWeekOffset("2.9"), 2);
  });

  it("uses the first value of an array param", () => {
    assert.equal(parseWeekOffset(["4", "9"]), 4);
  });

  it("clamps to the allowed range", () => {
    assert.equal(parseWeekOffset("999"), WEEK_OFFSET_MAX);
    assert.equal(parseWeekOffset("-999"), WEEK_OFFSET_MIN);
  });
});