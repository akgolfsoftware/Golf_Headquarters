import assert from "node:assert/strict";
import { test } from "node:test";
import type { YearPeriodBand } from "@/lib/domain/workbench/types";
import { periodeForUke } from "./uke-periode";

const band = (id: string, type: YearPeriodBand["type"], startDate: string, endDate: string, axisMinutes: YearPeriodBand["axisMinutes"] = null): YearPeriodBand => ({
  id, type, startDate, endDate, focus: null, axisMinutes, widthPct: 0, aktiv: false,
  balanseTimer: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 }, plannedMinutes: 0, plannedToDateMinutes: 0, completedMinutes: 0, turneringer: [],
});

test("uke 41 i Grunnperiode 1 (uke 39–46) er uke 3 av 8", () => {
  const p = periodeForUke([band("a", "GRUNN", "2026-09-21", "2026-11-15", { FYS: 90, TEK: 180 }), band("b", "GRUNN", "2027-01-04", "2027-03-07")], "2026-10-05");
  assert.deepEqual(p, { navn: "Grunnperiode 1", ukeIPerioden: 3, antallUker: 8, slutt: "2026-11-15", fordelt: { FYS: 90, TEK: 180 } });
});

test("en testuke inne i perioden tar ikke over perioden", () => {
  const p = periodeForUke([band("a", "GRUNN", "2026-09-21", "2026-11-15"), band("t", "TESTUKE", "2026-10-19", "2026-10-25")], "2026-10-19");
  assert.equal(p?.navn, "Grunnperiode");
  assert.equal(p?.fordelt, null);
});

test("uke uten periode gir null, og bare en testuke gir testuka", () => {
  assert.equal(periodeForUke([], "2026-10-05"), null);
  assert.equal(periodeForUke([band("t", "TESTUKE", "2026-10-19", "2026-10-25")], "2026-10-19")?.navn, "Testuke");
});
