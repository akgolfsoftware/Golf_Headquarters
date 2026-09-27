/**
 * Tester for WeekPlan — uken som reelt objekt i Workbench (Oppgave 2).
 *
 * Kjøres med:
 *   npx tsx --test src/lib/__tests__/domain/workbench-week-plan.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";

import { buildWeekViewModel } from "../../domain/workbench/operations";
import type { WeekPlanData, WeekType, WeekNote } from "../../domain/workbench/types";

test("buildWeekViewModel inkluderer weekPlan når oppgitt", () => {
  const weekStart = "2026-09-21";
  const dummyPlan: WeekPlanData = {
    playerId: "player-1",
    isoYear: 2026,
    weekNumber: 39,
    weekType: "UTVIKLING",
    notes: ["TEKNIKK_UKE", "TEST"],
    plannedHoursFys: 4.5,
    plannedHoursTek: 6.0,
    plannedHoursSlag: 8.0,
    plannedHoursSpill: 5.0,
    plannedHoursTurn: 0,
    repTargetDry: 200,
    repTargetLowSpeed: 150,
    repTargetFullSpeed: 300,
    repTargetPutting: 250,
    repTargetShortGame: 200,
    loadCeiling: 3500,
    customNotes: "Fokus på P3.0 og P4.0 posisjon",
  };

  const mode = { kind: "PLAYER" as const, subjectId: "player-1", sources: [] };
  const vm = buildWeekViewModel(weekStart, [], [], mode, 1440, dummyPlan);

  assert.equal(vm.weekStart, "2026-09-21");
  assert.ok(vm.weekPlan, "weekPlan skal eksistere på modellen");
  assert.equal(vm.weekPlan.weekType, "UTVIKLING");
  assert.deepEqual(vm.weekPlan.notes, ["TEKNIKK_UKE", "TEST"]);
  assert.equal(vm.weekPlan.plannedHoursFys, 4.5);
  assert.equal(vm.weekPlan.repTargetFullSpeed, 300);
  assert.equal(vm.weekPlan.loadCeiling, 3500);
});

test("buildWeekViewModel fungerer uten weekPlan (null fallback)", () => {
  const weekStart = "2026-09-21";
  const mode = { kind: "PLAYER" as const, subjectId: "player-1", sources: [] };
  const vm = buildWeekViewModel(weekStart, [], [], mode, 1440);

  assert.equal(vm.weekStart, "2026-09-21");
  assert.equal(vm.weekPlan, null);
});

test("WeekType og WeekNote støtter alle gyldige varianter", () => {
  const gyldigeUketyper: WeekType[] = ["UTVIKLING", "VEDLIKEHOLD", "TURNERING"];
  const gyldigeNotater: WeekNote[] = [
    "FERIE",
    "TEST",
    "SAMLING",
    "EVALUERING",
    "PRE_TURNERING",
    "TEKNIKK_UKE",
  ];

  assert.equal(gyldigeUketyper.length, 3);
  assert.equal(gyldigeNotater.length, 6);
});
