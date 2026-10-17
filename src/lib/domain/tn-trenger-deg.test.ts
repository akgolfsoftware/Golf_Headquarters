import { test } from "node:test";
import assert from "node:assert/strict";

import { summerTnGruppetrening, tnDenneMandag, tnUkenummer, vurderTnTrening, type TnTreningsokt } from "./tn-trenger-deg";

// Onsdag 14. oktober 2026 kl. 12 i Oslo. Mandag i uka er 12. oktober (uke 42).
const NAA = new Date("2026-10-14T10:00:00Z");
const MANDAG = tnDenneMandag(NAA);
const dag = (iso: string) => new Date(`${iso}T00:00:00Z`);
const okt = (iso: string, minutter: number, status: string, pyramid = "TEK"): TnTreningsokt => ({ dato: dag(iso), minutter, status, pyramid });

test("mandag og ukenummer regnes på Oslo-dagen", () => {
  assert.equal(MANDAG, Date.UTC(2026, 9, 12));
  assert.equal(tnUkenummer(MANDAG), 42);
  // Søndag 23:30 i Oslo er fortsatt samme uke, selv om UTC har passert midnatt.
  assert.equal(tnDenneMandag(new Date("2026-10-18T21:30:00Z")), Date.UTC(2026, 9, 12));
});

test("under 70 % begge de to siste ukene gir Trenger deg", () => {
  const r = vurderTnTrening([
    // Uke 40 (28.9–4.10): 60 av 100 min.
    okt("2026-09-29", 60, "COMPLETED", "SLAG"),
    okt("2026-10-01", 40, "PUBLISHED"),
    // Uke 41 (5.–11.10): 50 av 100 min.
    okt("2026-10-06", 50, "COMPLETED", "SLAG"),
    okt("2026-10-08", 50, "SKIPPED"),
  ], MANDAG);
  assert.deepEqual(r.uker.map((u) => u.pct), [60, 50]);
  assert.equal(r.underPlan, true);
  assert.equal(r.toUker.pct, 55);
  assert.equal(r.mestAkse, "SLAG");
});

test("én uke over terskelen, eller en uke uten plan, gir ikke Trenger deg", () => {
  const over = vurderTnTrening([okt("2026-09-29", 100, "COMPLETED"), okt("2026-10-06", 10, "COMPLETED"), okt("2026-10-07", 90, "PUBLISHED")], MANDAG);
  assert.equal(over.underPlan, false);
  const utenPlan = vurderTnTrening([okt("2026-10-06", 10, "COMPLETED"), okt("2026-10-07", 90, "PUBLISHED")], MANDAG);
  assert.equal(utenPlan.uker[0].pct, null);
  assert.equal(utenPlan.underPlan, false);
});

test("utkast er ikke plan, og inneværende uke teller ikke", () => {
  const r = vurderTnTrening([
    okt("2026-09-29", 60, "COMPLETED"),
    okt("2026-09-30", 300, "DRAFT"),
    okt("2026-10-06", 60, "COMPLETED"),
    okt("2026-10-13", 600, "PUBLISHED"),
  ], MANDAG);
  assert.deepEqual(r.uker.map((u) => u.pct), [100, 100]);
  assert.equal(r.underPlan, false);
});

test("gruppas trening summerer gjennomførte minutter per akse siste fire uker", () => {
  const a = vurderTnTrening([okt("2026-09-15", 90, "COMPLETED", "FYS"), okt("2026-09-16", 30, "PUBLISHED", "TEK"), okt("2026-09-01", 600, "COMPLETED", "TEK")], MANDAG);
  const b = vurderTnTrening([okt("2026-10-10", 30, "COMPLETED", "FYS"), okt("2026-10-11", 60, "COMPLETED", "turn")], MANDAG);
  const g = summerTnGruppetrening([a, b]);
  assert.deepEqual(g.akseTimer, { FYS: 2, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 });
  assert.equal(g.planlagtTimer, 3.5);
  assert.equal(g.gjortTimer, 3);
});
