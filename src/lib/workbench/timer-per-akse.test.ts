import assert from "node:assert/strict";
import { test } from "node:test";
import { sumPerAkse, timerPerAksePerUke } from "./timer-per-akse";
import { tnTimerPerAkse } from "@/lib/domain/tn-manedsplan";

const GRUNN = { startDate: "2026-10-01", endDate: "2026-10-31", axisMinutes: { FYS: 120, TEK: 180 }, axisMinutesLight: { FYS: 60 } };

test("en periode med timer per akse gir tall i hver uke i måneden", () => {
  const uker = timerPerAksePerUke({ year: 2026, month: 10, perioder: [GRUNN] });
  assert.deepEqual(uker.map((u) => u.weekNumber), [40, 41, 42, 43, 44]);
  for (const u of uker) {
    assert.deepEqual(u.minutter, { FYS: 120, TEK: 180 });
    assert.equal(u.kilde, "periode");
  }
  assert.deepEqual(sumPerAkse(uker), { FYS: 600, TEK: 900 });
});

test("månedens overstyring vinner over perioden", () => {
  const uker = timerPerAksePerUke({
    year: 2026, month: 10, perioder: [GRUNN],
    overstyringer: { "2026-U42": { SLAG: 90 } },
  });
  const u42 = uker.find((u) => u.weekNumber === 42)!;
  assert.deepEqual(u42.minutter, { SLAG: 90 });
  assert.equal(u42.kilde, "maaned");
  assert.deepEqual(uker.find((u) => u.weekNumber === 43)!.minutter, { FYS: 120, TEK: 180 });
});

test("lett uke bruker periodens lette tall", () => {
  const uker = timerPerAksePerUke({ year: 2026, month: 10, perioder: [GRUNN], letteUker: new Set(["2026-U41"]) });
  const u41 = uker.find((u) => u.weekNumber === 41)!;
  assert.equal(u41.lett, true);
  assert.deepEqual(u41.minutter, { FYS: 60 });
});

test("uka hører til perioden der torsdagen ligger, og uten timer er uka ikke fordelt", () => {
  const uker = timerPerAksePerUke({
    year: 2026, month: 10,
    perioder: [
      { startDate: "2026-09-01", endDate: "2026-10-14", axisMinutes: { TEK: 60 }, axisMinutesLight: null },
      { startDate: "2026-10-15", endDate: "2026-12-31", axisMinutes: null, axisMinutesLight: null },
    ],
  });
  // Uke 42: mandag 12.10, torsdag 15.10 → andre periode, som ikke har timer.
  assert.deepEqual(uker.find((u) => u.weekNumber === 41)!.minutter, { TEK: 60 });
  const u42 = uker.find((u) => u.weekNumber === 42)!;
  assert.equal(u42.minutter, null);
  assert.equal(u42.kilde, null);
});

test("TN-månedsplanen får timer per akse fra gruppas periode", () => {
  const r = tnTimerPerAkse(2026, 10, [
    { startDate: new Date("2026-09-30T22:00:00Z"), endDate: new Date("2026-10-30T23:00:00Z"), axisMinutes: { FYS: 120, SPILL: 60 }, axisMinutesLight: null },
  ]);
  assert.equal(r.fordelt, true);
  assert.deepEqual(r.sum, { FYS: 600, SPILL: 300 });
  assert.deepEqual(r.uker[0]!.minutter, { FYS: 120, SPILL: 60 });
});

test("TN-månedsplanen viser ikke fordelt når perioden mangler timer eller har ugyldig JSON", () => {
  const r = tnTimerPerAkse(2026, 10, [
    { startDate: new Date("2026-10-01T00:00:00Z"), endDate: new Date("2026-10-31T00:00:00Z"), axisMinutes: { FYS: "mye" }, axisMinutesLight: null },
  ]);
  assert.equal(r.fordelt, false);
  assert.deepEqual(r.sum, {});
});
