import { test } from "node:test";
import assert from "node:assert/strict";
import { FysResultSchema, readDrillResults, technicalCounts } from "./training-result";
import { wbDrillPlan, mapWbToLiveSummary, type WbLiveInput } from "./wb-live-map";
import { completedWorkbenchSnapshot } from "@/lib/workbench/live";

test("FYS-dose beholdes som serier/reps/kg/RIR, og blir aldri golfslag", () => {
  const drill = { id: "strength", title: "Syntetisk styrke", description: null, durationMinutes: 10, sortOrder: 0, akFormel: { pyramid: "FYS", area: "STYRKE", label: "Styrke", detaljer: { mengde: { enhet: "SERIER", antall: 4, reps: 6, vektKg: 90, rir: 2, pauseSek: 60 } } } };
  assert.equal(wbDrillPlan(drill, "TEK").pyramide, "FYS");
  assert.equal(wbDrillPlan(drill, "TEK").plannedReps, 0);
  const row: WbLiveInput = { id: "s", title: "Syntetisk", status: "COMPLETED", pyramid: "TEK", durationMinutes: 10, date: new Date("2030-01-01"), startMinute: 600, location: null, notes: null, publishedAt: null, createdAt: new Date(0), drills: [drill] };
  const mapped = mapWbToLiveSummary(row).drills[0];
  assert.equal(mapped.fysVektKg, 90); assert.equal(mapped.fysSett, 4); assert.equal(mapped.fysReps, 6);
  assert.equal(mapped.plannedDose?.rir, 2); assert.equal(mapped.fysPauseSek, 60);
});
test("normalhastighet teller både treff og øvrige svinger, uten å telle dobbel mengde", () => {
  assert.deepEqual(technicalCounts({ type: "golf", repsWithoutBall: 2, repsLowSpeed: 3, repsAutomatic: 7, repsHit: 4, notat: "" }), { dry: 2, lav: 3, full: 11 });
});
test("ukjent resultat tolkes ikke; avslutning bevarer bare kjente resultater", () => {
  assert.deepEqual(readDrillResults({ drillResults: [{ result: { minutter: 20 } }] }), []);
  assert.throws(() => completedWorkbenchSnapshot({ drillResults: [{ result: { minutter: 20 } }] }), /Ingen resultater er slettet/);
  assert.equal(completedWorkbenchSnapshot({ totalSec: 50, drills: [] }), null);
  assert.equal(FysResultSchema.safeParse({ type: "kondisjon", minutter: 30, sone: "S9", notat: "" }).success, false);
  assert.equal(FysResultSchema.safeParse({ type: "styrke", sett: [{ vekt: 90, reps: 6, rir: 2 }], notat: "" }).success, true);
});


test("fysisk resultat beholder enheten gjennom eksisterende loggformat", async () => {
  const { fysLoggState, lesFysRegistrering } = await import("./fys-registrering");
  const values = [
    { type: "styrke", sett: [{ vekt: 82.5, reps: 6, rir: 2 }], notat: "" },
    { type: "kondisjon", minutter: 30, sone: "S3", notat: "Syntetisk" },
    { type: "hold", sekunder: 60, notat: "" },
    { type: "reps", repetisjoner: 20, notat: "" },
  ];
  for (const value of values) {
    const parsed = FysResultSchema.parse(value);
    assert.deepEqual(lesFysRegistrering(fysLoggState(parsed).logNotes), parsed);
  }
});
