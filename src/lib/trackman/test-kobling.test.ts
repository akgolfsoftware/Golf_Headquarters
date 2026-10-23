import assert from "node:assert/strict";
import { test } from "node:test";

import { clubSpeedFraTrackMan, foreslaKobling, passerIkke, type TmSlag } from "./test-kobling";

const slag = (n: number, club: string | null, carry: number, side: number, clubSpeed: number | null = null): TmSlag => ({ id: `tm-${n}`, shotNumber: n, club, carryDistance: carry, side, clubSpeed });

test("carry og side kommer fra slaget, i rekkefølge", () => {
  const r = foreslaKobling("wedge-variation", [{ indeks: 0, target: 40 }, { indeks: 1, target: 70 }], [slag(2, "PW", 67.8, 3.4), slag(1, "52°", 39.2, -1.1)]);
  assert.equal(r.forslag[0]?.slag?.id, "tm-1");
  assert.equal(r.forslag[0]?.slag?.carryDistance, 39.2);
  assert.equal(r.forslag[0]?.slag?.side, -1.1);
  assert.equal(r.forslag[1]?.slag?.id, "tm-2");
  assert.equal(r.mangler, 0);
});

test("Driver Basic: et slag 31 m fra målet merkes, 29 m gjør det ikke", () => {
  const r = foreslaKobling("driver-220", [{ indeks: 0, target: 220 }, { indeks: 1, target: 220 }], [slag(1, "Driver", 189, 0), slag(2, "Driver", 220, 29)]);
  assert.equal(r.forslag[0]?.passerIkke, true);
  assert.equal(r.forslag[1]?.passerIkke, false);
});

test("wedge og inspill: grensen er 15 m", () => {
  assert.equal(passerIkke("wedge-variation", 70, { carryDistance: 44, side: 0 }), true);
  assert.equal(passerIkke("inspill-gutter-145", 145, { carryDistance: 131, side: 0 }), false);
  assert.equal(passerIkke("inspill-gutter-145", 145, { carryDistance: 129, side: 0 }), true);
});

test("driverslag i en wedgetest hoppes over, og neste wedgeslag foreslås", () => {
  const r = foreslaKobling("wedge-variation", [{ indeks: 0, target: 55 }], [slag(9, "Driver", 231.4, 0), slag(10, "56°", 54, 1)]);
  assert.equal(r.forslag[0]?.slag?.id, "tm-10");
  assert.equal(r.feilKolle[0]?.id, "tm-9");
});

test("for få slag: resten føres for hånd", () => {
  const r = foreslaKobling("wedge-variation", [{ indeks: 0, target: 40 }, { indeks: 1, target: 50 }, { indeks: 2, target: 60 }], [slag(1, "PW", 40, 0)]);
  assert.equal(r.mangler, 2);
  assert.equal(r.forslag[2]?.slag, null);
});

test("Club Speed: beste av de fem første driverslagene, slag nummer seks teller ikke", () => {
  const tm = [
    slag(1, "7-jern", 150, 0, 120),
    slag(21, "Driver", 230, 0, 110.8), slag(22, "Driver", 230, 0, 111.9), slag(23, "Driver", 230, 0, 112.4),
    slag(24, "Driver", 230, 0, 109.6), slag(25, "Driver", 230, 0, 111.2), slag(26, "Driver", 230, 0, 118.0),
  ];
  const c = clubSpeedFraTrackMan(tm);
  assert.equal(c.beste, 112.4);
  assert.equal(c.besteId, "tm-23");
  assert.equal(c.slag.length, 5);
});
