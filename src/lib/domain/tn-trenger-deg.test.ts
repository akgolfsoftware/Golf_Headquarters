import { test } from "node:test";
import assert from "node:assert/strict";

import { etterlevelse } from "./etterlevelse";
import { tnEtterlevelseOkt } from "./tn-aksefordeling";
import { summerTnGruppetrening, tnDenneMandag, tnUkenummer, vurderTnTrening, type TnTreningsokt } from "./tn-trenger-deg";

// Onsdag 14. oktober 2026 kl. 12 i Oslo. Mandag i uka er 12. oktober (uke 42).
const NAA = new Date("2026-10-14T10:00:00Z");
const MANDAG = tnDenneMandag(NAA);
const dag = (iso: string) => new Date(`${iso}T00:00:00Z`);
const okt = (iso: string, minutter: number, status: string, pyramid = "TEK", startMinutt = 600): TnTreningsokt => ({ dato: dag(iso), startMinutt, minutter, status, pyramid });

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
  ], MANDAG, NAA);
  assert.deepEqual(r.uker.map((u) => u.pct), [60, 50]);
  assert.equal(r.underPlan, true);
  assert.equal(r.toUker.pct, 55);
  assert.equal(r.mestAkse, "SLAG");
});

test("én uke over terskelen, eller en uke uten plan, gir ikke Trenger deg", () => {
  const over = vurderTnTrening([okt("2026-09-29", 100, "COMPLETED"), okt("2026-10-06", 10, "COMPLETED"), okt("2026-10-07", 90, "PUBLISHED")], MANDAG, NAA);
  assert.equal(over.underPlan, false);
  const utenPlan = vurderTnTrening([okt("2026-10-06", 10, "COMPLETED"), okt("2026-10-07", 90, "PUBLISHED")], MANDAG, NAA);
  assert.equal(utenPlan.uker[0].pct, null);
  assert.equal(utenPlan.underPlan, false);
});

test("utkast er ikke plan, og inneværende uke teller ikke", () => {
  const r = vurderTnTrening([
    okt("2026-09-29", 60, "COMPLETED"),
    okt("2026-09-30", 300, "DRAFT"),
    okt("2026-10-06", 60, "COMPLETED"),
    okt("2026-10-13", 600, "PUBLISHED"),
  ], MANDAG, NAA);
  assert.deepEqual(r.uker.map((u) => u.pct), [100, 100]);
  assert.equal(r.underPlan, false);
});

test("gruppas trening summerer gjennomførte minutter per akse siste fire uker", () => {
  // Rullerende 28 dager til NAA (16.9. kl. 12 til 14.10. kl. 12); økter før vinduet teller ikke.
  const a = vurderTnTrening([okt("2026-09-20", 90, "COMPLETED", "FYS"), okt("2026-09-21", 30, "PUBLISHED", "TEK"), okt("2026-09-01", 600, "COMPLETED", "TEK")], MANDAG, NAA);
  const b = vurderTnTrening([okt("2026-10-10", 30, "COMPLETED", "FYS"), okt("2026-10-11", 60, "COMPLETED", "turn")], MANDAG, NAA);
  const g = summerTnGruppetrening([a, b]);
  assert.deepEqual(g.akseTimer, { FYS: 2, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 });
  assert.equal(g.planlagtTimer, 3.5);
  assert.equal(g.gjortTimer, 3);
});

test("A5: fire uker regnes som i PlayerHQ: bare forfalte økter, 28 dager til nå", () => {
  // I dag (14.10.) kl. 10 lokal tid er forfalt, kl. 18 er ikke; økta 15.9. ligger før vinduet.
  const r = vurderTnTrening([
    okt("2026-10-14", 60, "COMPLETED", "SLAG", 8 * 60),
    okt("2026-10-14", 60, "PUBLISHED", "SLAG", 18 * 60),
    okt("2026-10-13", 60, "SKIPPED", "TEK", 9 * 60),
    okt("2026-09-15", 600, "COMPLETED", "FYS", 9 * 60),
  ], MANDAG, NAA);
  assert.equal(r.fireUker.planlagtMin, 120);
  assert.equal(r.fireUker.gjortMin, 60);
  assert.equal(r.fireUker.akseMin.SLAG, 60);
  assert.equal(r.fireUker.akseMin.FYS, 0);
});

test("A5: samme tall som PlayerHQs etterlevelse() for de samme øktene", () => {
  const okter = [okt("2026-10-14", 60, "COMPLETED", "SLAG", 8 * 60), okt("2026-10-13", 45, "SKIPPED", "TEK", 9 * 60), okt("2026-10-08", 90, "COMPLETED", "FYS", 7 * 60), okt("2026-10-09", 30, "PUBLISHED", "SPILL", 17 * 60)];
  const tn = vurderTnTrening(okter, MANDAG, NAA).fireUker;
  const phq = etterlevelse(okter.map((o) => tnEtterlevelseOkt({ ...o })), NAA);
  assert.equal(tn.planlagtMin, phq.planlagtMinutter);
  assert.equal(tn.gjortMin, phq.gjennomfortMinutter);
});
