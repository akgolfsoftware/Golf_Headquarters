import assert from "node:assert/strict";
import { test } from "node:test";
import {
  fordelingKvittering, minutterForUke, ukeTimerFraMinutter, ukerForPeriode,
} from "./periode-ukefordeling-regler";

test("uker som er gått røres ikke: fordeling starter i inneværende uke", () => {
  // Periode 1. sep–30. nov 2026, i dag onsdag 14. oktober (uke 42).
  const uker = ukerForPeriode("2026-09-01", "2026-11-30", "2026-10-14");
  assert.equal(uker[0].weekNumber, 42);
  assert.equal(uker[0].mandag, "2026-10-12");
  assert.ok(uker.every((u) => u.mandag >= "2026-10-12"));
});

test("alle uker i en kommende periode får fordeling", () => {
  const uker = ukerForPeriode("2026-11-02", "2026-11-29", "2026-10-14");
  assert.deepEqual(uker.map((u) => u.weekNumber), [45, 46, 47, 48]);
});

test("en uke på grensen mellom to perioder eies bare av den torsdagen ligger i", () => {
  // Grense onsdag 4. nov: uke 45 (2.–8. nov) har torsdag 5. nov.
  const a = ukerForPeriode("2026-10-05", "2026-11-04", "2026-10-01").map((u) => u.weekNumber);
  const b = ukerForPeriode("2026-11-05", "2026-12-06", "2026-10-01").map((u) => u.weekNumber);
  assert.ok(!a.includes(45));
  assert.ok(b.includes(45));
});

test("årsskifte følger ISO-ukeåret", () => {
  const uker = ukerForPeriode("2026-12-21", "2027-01-17", "2026-12-01");
  assert.deepEqual(uker.map((u) => `${u.isoYear}-${u.weekNumber}`), ["2026-52", "2026-53", "2027-1", "2027-2"]);
});

test("minutter blir timer, og akser uten tall blir ikke satt", () => {
  assert.deepEqual(ukeTimerFraMinutter({ FYS: 90, TEK: 120 }), {
    plannedHoursFys: 1.5, plannedHoursTek: 2, plannedHoursSlag: null, plannedHoursSpill: null, plannedHoursTurn: null,
  });
});

test("lett uke bruker lette tall, og mangler de røres uka ikke", () => {
  const p = { axisMinutes: { FYS: 60 }, axisMinutesLight: null };
  assert.deepEqual(minutterForUke(p, false), { FYS: 60 });
  assert.equal(minutterForUke(p, true), null);
});

test("kvittering sier hva som ble oppdatert", () => {
  assert.equal(fordelingKvittering({ antallUker: 8, fraUke: "2026-U42", tilUke: "2026-U49" }),
    "Perioden er lagret. 8 uker oppdatert fra og med inneværende uke.");
  assert.equal(fordelingKvittering({ antallUker: 0, fraUke: null, tilUke: null }), null);
  assert.match(fordelingKvittering(undefined, true) ?? "", /ikke oppdatert/);
});
