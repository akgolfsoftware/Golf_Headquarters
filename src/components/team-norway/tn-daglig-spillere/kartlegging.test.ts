/** Kartlegging: periode og sortering. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { halvarNavn, iPerioden, lesPeriode, periodeStart, sorterElever, type KartleggingElev } from "./kartlegging";

const NAA = new Date("2026-09-26T10:00:00.000Z");
const r = (testId: string, dato: string, score: number, lavereErBedre = false) => ({ testId, dato: new Date(dato), score, formatert: String(score), lavereErBedre });
const elev = (id: string, navn: string, resultater: KartleggingElev["resultater"]): KartleggingElev => ({ id, navn, skole: null, klasse: null, resultater });

test("halvår følger skoleåret: høst fra august", () => {
  assert.equal(halvarNavn(2026, 9), "Høst 2026");
  assert.equal(halvarNavn(2026, 3), "Vår 2026");
  assert.equal(periodeStart("halvar", 2026, 9, NAA)?.toISOString(), "2026-07-31T22:00:00.000Z");
  assert.equal(periodeStart("alle", 2026, 9, NAA), null);
});

test("ukjent periode blir inneværende halvår", () => {
  assert.equal(lesPeriode("tull"), "halvar");
  assert.equal(lesPeriode("12mnd"), "12mnd");
});

test("iPerioden filtrerer på dato og test", () => {
  const e = elev("a", "A", [r("t1", "2026-09-01", 5), r("t1", "2026-03-01", 4), r("t2", "2026-09-02", 7)]);
  const fra = periodeStart("halvar", 2026, 9, NAA);
  assert.equal(iPerioden(e, fra, null).length, 2);
  assert.equal(iPerioden(e, fra, "t1").length, 1);
});

test("med valgt test sorteres beste først i testens retning, uten resultat sist", () => {
  const fra = null;
  const hoy = sorterElever([elev("a", "Anne", [r("t", "2026-09-01", 5)]), elev("b", "Bjørn", []), elev("c", "Cato", [r("t", "2026-09-01", 9)])], fra, "t");
  assert.deepEqual(hoy.map((e) => e.id), ["c", "a", "b"]);
  const lav = sorterElever([elev("a", "Anne", [r("t", "2026-09-01", 5, true)]), elev("c", "Cato", [r("t", "2026-09-01", 9, true)])], fra, "t");
  assert.deepEqual(lav.map((e) => e.id), ["a", "c"]);
});

test("uten valgt test: de som har levert først, så navn", () => {
  const s = sorterElever([elev("b", "Bjørn", []), elev("a", "Anne", []), elev("c", "Cato", [r("t", "2026-09-01", 1)])], null, null);
  assert.deepEqual(s.map((e) => e.id), ["c", "a", "b"]);
});
