import assert from "node:assert/strict";
import { test } from "node:test";
import { AxisMinutesSchema, PeriodeInputSchema, axisMinutesSum, parseAxisMinutes } from "./perioder";

const basis = { lPhase: "GRUNN", startDato: "2026-10-05", sluttDato: "2026-11-29" } as const;

test("parseAxisMinutes leser gyldig fordeling og sier null ved tomt eller ugyldig", () => {
  assert.deepEqual(parseAxisMinutes({ FYS: 60, TEK: 120 }), { FYS: 60, TEK: 120 });
  assert.equal(parseAxisMinutes(null), null);
  assert.equal(parseAxisMinutes({}), null);
  assert.equal(parseAxisMinutes({ FYS: "mye" }), null);
  assert.equal(parseAxisMinutes({ FYS: 50 }), null, "ikke et 15-minutterssteg");
});

test("axisMinutesSum summerer aksene og gir 0 uten verdi", () => {
  assert.equal(axisMinutesSum({ FYS: 60, TEK: 120, SLAG: 90, SPILL: 150, TURN: 0 }), 420);
  assert.equal(axisMinutesSum(null), 0);
});

test("periodeinput tar vanlig og lett uke, og nekter minutter som ikke går opp i 15", () => {
  const ok = PeriodeInputSchema.safeParse({ ...basis, axisMinutes: { FYS: 60 }, axisMinutesLight: { FYS: 30 } });
  assert.equal(ok.success, true);
  assert.equal(PeriodeInputSchema.safeParse({ ...basis, axisMinutes: { FYS: 61 } }).success, false);
  assert.equal(PeriodeInputSchema.safeParse({ ...basis, axisMinutes: { FYS: -15 } }).success, false);
  assert.equal(PeriodeInputSchema.safeParse({ ...basis, axisMinutes: { FYS: 3015 } }).success, false);
});

test("AxisMinutesSchema avviser ukjente akser uten å lagre dem", () => {
  const r = AxisMinutesSchema.safeParse({ FYS: 60, YOGA: 30 });
  assert.equal(r.success, true);
  assert.deepEqual(r.success && r.data, { FYS: 60 });
});
