import test from "node:test";
import assert from "node:assert/strict";
import { erUendretArv, type ArvbarePeriodeFelt } from "./gruppe-arv-regler";

const gruppe: ArvbarePeriodeFelt = {
  lPhase: "GRUNN",
  startDate: new Date("2026-11-01T00:00:00Z"),
  endDate: new Date("2026-12-20T00:00:00Z"),
  focus: "Teknikk",
  weeklyVolMin: 300,
  weeklyVolMax: 420,
  weeklySessionBudget: { FYS: 2 },
  axisMinutes: null,
  axisMinutesLight: null,
};

test("uendret kopi følger gruppa", () => {
  assert.equal(erUendretArv({ ...gruppe }, gruppe), true);
});

test("tom akse-JSON og null regnes som lik", () => {
  assert.equal(erUendretArv({ ...gruppe, axisMinutes: {} }, gruppe), true);
});

test("spiller som har endret fokus eller timer er Egen", () => {
  assert.equal(erUendretArv({ ...gruppe, focus: "Putting" }, gruppe), false);
  assert.equal(erUendretArv({ ...gruppe, axisMinutes: { FYS: 60 } }, gruppe), false);
  assert.equal(erUendretArv({ ...gruppe, weeklyVolMax: 450 }, gruppe), false);
});

test("flyttet dato eller endret fase er Egen", () => {
  assert.equal(erUendretArv({ ...gruppe, startDate: new Date("2026-11-02T00:00:00Z") }, gruppe), false);
  assert.equal(erUendretArv({ ...gruppe, lPhase: "SPESIAL" }, gruppe), false);
});

test("rekkefølge på nøklene i JSON spiller ingen rolle", () => {
  const a = { ...gruppe, axisMinutes: { FYS: 60, TEK: 90 } };
  const b = { ...gruppe, axisMinutes: { TEK: 90, FYS: 60 } };
  assert.equal(erUendretArv(a, b), true);
});
