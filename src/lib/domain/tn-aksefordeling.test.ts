import { test } from "node:test";
import assert from "node:assert/strict";

import { etterlevelse } from "./etterlevelse";
import { summerAksefordeling, tnEtterlevelseOkt, type TnAkseokt } from "./tn-aksefordeling";

// Onsdag 14. oktober 2026 kl. 12 i Oslo.
const NAA = new Date("2026-10-14T10:00:00Z");
const okt = (iso: string, pyramid: string, durationMinutes: number, status: string, startMinutt = 9 * 60): TnAkseokt => ({ dato: new Date(`${iso}T00:00:00Z`), startMinutt, pyramid, durationMinutes, status });

test("summerer gjennomført per akse i timer, og planlagt er forfalte økter", () => {
  const r = summerAksefordeling([
    okt("2026-10-13", "TEK", 90, "COMPLETED"),
    okt("2026-10-12", "TEK", 30, "COMPLETED"),
    okt("2026-10-11", "FYS", 60, "PUBLISHED"),
    okt("2026-10-10", "UKJENT", 600, "COMPLETED"),
  ], NAA);
  assert.deepEqual(r.gjennomfort, { FYS: 0, TEK: 2, SLAG: 0, SPILL: 0, TURN: 0 });
  assert.equal(r.gjennomfortTimer, 2);
  assert.equal(r.planlagtTimer, 3);
});

test("A5: fremtidige økter og økter før 28-dagersvinduet teller ikke som plan", () => {
  const r = summerAksefordeling([
    okt("2026-10-14", "SLAG", 60, "COMPLETED", 8 * 60),
    okt("2026-10-14", "SLAG", 60, "PUBLISHED", 18 * 60),
    okt("2026-10-15", "TEK", 60, "PUBLISHED"),
    okt("2026-09-10", "FYS", 120, "COMPLETED"),
  ], NAA);
  assert.equal(r.planlagtTimer, 1);
  assert.equal(r.gjennomfortTimer, 1);
});

test("A5: samme timer som PlayerHQs etterlevelse() for de samme øktene", () => {
  const rader = [okt("2026-10-13", "TEK", 90, "COMPLETED"), okt("2026-10-12", "FYS", 45, "SKIPPED"), okt("2026-10-14", "SLAG", 60, "PUBLISHED", 18 * 60)];
  const tn = summerAksefordeling(rader, NAA);
  const phq = etterlevelse(rader.map((o) => tnEtterlevelseOkt({ dato: o.dato, startMinutt: o.startMinutt, minutter: o.durationMinutes, status: o.status })), NAA);
  assert.equal(tn.planlagtTimer, Math.round((phq.planlagtMinutter / 60) * 10) / 10);
  assert.equal(tn.gjennomfortTimer, Math.round((phq.gjennomfortMinutter / 60) * 10) / 10);
});

test("tom liste gir null overalt", () => {
  const r = summerAksefordeling([], NAA);
  assert.equal(r.planlagtTimer, 0);
  assert.equal(r.gjennomfort.TURN, 0);
});
