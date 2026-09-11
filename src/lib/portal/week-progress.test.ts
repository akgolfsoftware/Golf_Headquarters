import assert from "node:assert/strict";
import { test } from "node:test";
import type { TodaySession } from "@/app/portal/actions";
import { weekPlanProgress, weekSessionCounts } from "./week-progress";
import { workbenchWeekSession } from "./workbench-week";
import type { WbRow } from "@/lib/workbench/wb-map";
import { byggIDagAgenda } from "./idag-agenda";

function session(patch: Partial<TodaySession>): TodaySession {
  return { id: "v2", title: "Teknikk", startTime: new Date("2026-09-10T07:00Z"), endTime: new Date("2026-09-10T08:00Z"), status: "PLANNED", practiceType: "BLOKK", pyramidArea: "TEK", durationMin: 60, sted: "Range", maalsetning: null, drills: [], href: "/portal/live/v2", ...patch };
}

test("ukens fremdrift inkluderer Workbench med riktig pyramide og V2 fra samme uke", () => {
  const wb = workbenchWeekSession({ id: "wb", title: "Styrke", date: new Date("2026-09-10"), startMinute: 600, durationMinutes: 30, status: "COMPLETED", pyramid: "FYS", location: null, notes: null, drills: [] } as unknown as WbRow);
  const week = [{ sessions: [session({}), wb] }];
  const p = weekPlanProgress(week);
  assert.equal(p.plannedMin, 90);
  assert.equal(p.completedMin, 30);
  assert.deepEqual(p.plannedByAxis, { FYS: 30, TEK: 60, SLAG: 0, SPILL: 0, TURN: 0 });
  assert.deepEqual(p.completedByAxis, { FYS: 30, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 });
  assert.deepEqual(weekSessionCounts(week), { total: 2, completed: 1 });
});

test("avbruddsårsaken beholdes: syk/avlyst holdes utenfor, hoppet over uten årsak teller", () => {
  const week = [{ sessions: [session({ status: "CANCELLED" }), session({ status: "SKIPPED", avbruddAarsak: "SYK" }), session({ status: "SKIPPED", avbruddAarsak: null }), session({ status: "COMPLETED", durationMin: 30 })] }];
  assert.equal(weekPlanProgress(week).plannedMin, 90);
  assert.equal(weekPlanProgress(week).completedMin, 30);
  assert.deepEqual(weekSessionCounts(week), { total: 1, completed: 1 });
  assert.equal(weekPlanProgress([{ sessions: [session({ status: "CANCELLED" })] }]).plannedMin, 0);
});

test("tom uke og ugyldig varighet lager aldri NaN eller negative uketall", () => {
  assert.equal(weekPlanProgress([]).plannedMin, 0);
  assert.equal(weekPlanProgress([{ sessions: [session({ durationMin: NaN }), session({ durationMin: -30 })] }]).plannedMin, 0);
});

test("agendaen bevarer andre lag, erstatter øktdubletter og leser fullført fra status", () => {
  const agenda = byggIDagAgenda([
    { id: "okt-v2", lag: "OEKTER", dato: "2026-09-10", tittel: "Gammelt navn", startMin: 540, sluttMin: 600, heldag: false },
    { id: "skole", lag: "SKOLE", dato: "2026-09-10", tittel: "Skole", startMin: null, sluttMin: null, heldag: true, lesevisning: true },
  ], [session({ planSessionId: "plan-original", status: "COMPLETED" }), session({ id: "avlyst", status: "CANCELLED" }), session({ id: "venter", startTime: new Date("2026-09-10T05:00Z") })]);
  assert.deepEqual(agenda.map((h) => h.id), ["skole", "okt-venter", "okt-v2"]);
  assert.equal(agenda[1].fullfort, false);
  assert.equal(agenda[2].fullfort, true);
  assert.equal(agenda[2].startMin, 540);
  assert.equal(agenda[2].planSessionId, "plan-original");
  assert.equal(agenda[2].href, "/portal/live/v2");
});
