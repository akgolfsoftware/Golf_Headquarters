import assert from "node:assert/strict";
import { test } from "node:test";
import { planWeekSession, type PlanWeekRow } from "./plan-week";
import { weekPlanProgress } from "./week-progress";

function row(patch: Partial<PlanWeekRow> = {}): PlanWeekRow {
  return { id: "eldre-plan", title: "Mobilitet", scheduledAt: new Date("2026-09-10T07:00Z"),
    durationMin: 40, status: "PLANNED", pyramidArea: "FYS", location: "Treningsrom", miljo: "M0", maalsetning: "Bevegelighet",
    drills: [{ id: "drill-1", repMinutter: 15, exercise: { name: "Rotasjon", durationMin: 10 } }], ...patch };
}

test("eldre plan bevarer identitet, faktiske felt, drillrekkefølge og redigeringskobling", () => {
  const s = planWeekSession(row())!;
  assert.equal(s.id, "eldre-plan"); assert.equal(s.model, "plan"); assert.equal(s.planSessionId, s.id);
  assert.equal(s.pyramidArea, "FYS"); assert.equal(s.practiceType, "BLOKK");
  assert.equal(s.sted, "Treningsrom"); assert.equal(s.maalsetning, "Bevegelighet");
  assert.equal(s.startTime.toISOString(), "2026-09-10T07:00:00.000Z");
  assert.equal(s.endTime.toISOString(), "2026-09-10T07:40:00.000Z");
  assert.deepEqual(s.drills, [{ id: "drill-1", name: "Rotasjon", durationMinutes: 15 }]);
});

test("eldre status styrer fortsett/oppsummering og teller aldri avlyst som gjennomført", () => {
  for (const [status, mapped, suffix] of [
    ["PLANNED", "PLANNED", "/brief"], ["ACTIVE", "IN_PROGRESS", "/tapper"],
    ["PAUSED", "IN_PROGRESS", "/tapper"], ["COMPLETED", "COMPLETED", "/summary"],
  ] as const) {
    const s = planWeekSession(row({ status }))!;
    assert.equal(s.status, mapped); assert.equal(s.href, `/portal/live/eldre-plan${suffix}`);
  }
  assert.equal(planWeekSession(row({ status: "ABANDONED" })), null);
  for (const status of ["CANCELLED", "SKIPPED"] as const) {
    const s = planWeekSession(row({ status }))!;
    assert.equal(s.status, status); assert.equal(s.href, "/portal/planlegge/workbench");
  }
  const week = [{ sessions: ["COMPLETED", "PLANNED", "CANCELLED", "SKIPPED"].map((status) => planWeekSession(row({ status: status as PlanWeekRow["status"] }))!) }];
  const progress = weekPlanProgress(week);
  assert.equal(progress.plannedMin, 120); assert.equal(progress.completedMin, 40);
  assert.equal(progress.plannedByAxis.FYS, 120); assert.equal(progress.completedByAxis.FYS, 40);
});

test("manglende drilltid oppfinnes ikke og ukjente steds-/målfelt forblir tomme", () => {
  const s = planWeekSession(row({ location: null, miljo: null, maalsetning: null, drills: [
    { id: "null", repMinutter: null, exercise: { name: "Ukjent tid", durationMin: null } },
    { id: "default", repMinutter: null, exercise: { name: "Bibliotektid", durationMin: 12 } },
    { id: "zero", repMinutter: 0, exercise: { name: "Null", durationMin: 12 } },
  ] }))!;
  assert.equal(s.sted, null); assert.equal(s.maalsetning, null);
  assert.deepEqual(s.drills.map((d) => d.durationMinutes), [0, 12, 0]);
  for (const durationMin of [-10, NaN]) {
    const invalid = planWeekSession(row({ durationMin }))!;
    assert.equal(invalid.durationMin, 0); assert.equal(invalid.endTime.getTime(), invalid.startTime.getTime());
  }
});

test("pyramideaksen følger eldre økt selv når øvingsmetoden er felles", () => {
  for (const [pyramidArea, practiceType] of [["FYS", "BLOKK"], ["TEK", "BLOKK"], ["SLAG", "RANDOM"], ["SPILL", "SPILL_TEST"], ["TURN", "KONKURRANSE"]] as const) {
    const s = planWeekSession(row({ pyramidArea }))!;
    assert.equal(s.pyramidArea, pyramidArea); assert.equal(s.practiceType, practiceType);
  }
});
