import { test } from "node:test";
import assert from "node:assert/strict";

import {
  adjustDistance,
  adjustYardageRows,
  headwindComponent,
  DEFAULT_CONDITIONS,
  type Conditions,
} from "@/lib/sg-hub/conditions-adjust";
import type { YardageRow } from "@/lib/sg-hub/yardage-calc";

/** Forhold som avviker fra baseline kun på de feltene testen bryr seg om. */
function forhold(over: Partial<Conditions>): Conditions {
  return { ...DEFAULT_CONDITIONS, ...over };
}

function nær(faktisk: number, forventet: number, eps = 1e-9): void {
  assert.ok(
    Math.abs(faktisk - forventet) < eps,
    `forventet ~${forventet}, fikk ${faktisk}`,
  );
}

const RAD: YardageRow = {
  club: "7i",
  family: "iron",
  shotCount: 10,
  totalAvg: 150,
  totalSigma: 5,
  carryAvg: 138,
  threeQuarter: 127.5,
  soft: 117,
  apex: 33,
  ballSpeedAvg: 60,
  clubSpeedAvg: 40,
  smashAvg: 1.4,
};

// ------------------------------------------------------- headwindComponent

test("headwindComponent: 0° er full motvind, 180° full medvind", () => {
  nær(headwindComponent(0), 1);
  nær(headwindComponent(180), -1);
});

test("headwindComponent: sidevind har ingen langs-effekt", () => {
  nær(headwindComponent(90), 0, 1e-12);
  nær(headwindComponent(270), 0, 1e-12);
});

test("headwindComponent er symmetrisk om vindaksen", () => {
  nær(headwindComponent(45), headwindComponent(315), 1e-12);
});

// ---------------------------------------------------------- adjustDistance

test("baseline-forhold lar distansen stå helt urørt", () => {
  assert.equal(adjustDistance(150, 33, DEFAULT_CONDITIONS), 150);
});

test("distanse <= 0 gir 0, ikke et negativt tall", () => {
  assert.equal(adjustDistance(0, 33, DEFAULT_CONDITIONS), 0);
  assert.equal(adjustDistance(-5, 33, forhold({ windMs: 10 })), 0);
});

test("temperatur: varmere gir lengre, kaldere gir kortere", () => {
  // apex 0 isolerer temp-leddet — uten flytid får vinden ingen effekt.
  nær(adjustDistance(150, 0, forhold({ tempC: 25 })), 151.2);
  assert.ok(adjustDistance(150, 0, forhold({ tempC: 5 })) < 150);
});

test("høyde: +1 m per 100 høydemeter", () => {
  nær(adjustDistance(150, 0, forhold({ elevationM: 1000 })), 160);
});

test("motvind korter inn, medvind forlenger — like mye hver vei", () => {
  const mot = adjustDistance(150, 33, forhold({ windMs: 10, windDirectionDeg: 0 }));
  const med = adjustDistance(150, 33, forhold({ windMs: 10, windDirectionDeg: 180 }));

  assert.ok(mot < 150, "motvind skal korte inn");
  assert.ok(med > 150, "medvind skal forlenge");
  nær(150 - mot, med - 150, 1e-9);
});

test("sidevind endrer ikke lengden", () => {
  const side = adjustDistance(150, 33, forhold({ windMs: 12, windDirectionDeg: 90 }));
  nær(side, 150, 1e-9);
});

test("uten apex får vinden ingen effekt — ballen er aldri i lufta", () => {
  const utenApex = adjustDistance(150, 0, forhold({ windMs: 15, windDirectionDeg: 0 }));
  assert.equal(utenApex, 150);
});

test("høyere apex gir vinden mer å jobbe med", () => {
  const lav = adjustDistance(150, 10, forhold({ windMs: 10 }));
  const høy = adjustDistance(150, 40, forhold({ windMs: 10 }));
  assert.ok(høy < lav, "lengre flytid = større motvindstap");
});

test("sterkere vind gir større utslag", () => {
  const svak = adjustDistance(150, 33, forhold({ windMs: 3 }));
  const sterk = adjustDistance(150, 33, forhold({ windMs: 12 }));
  assert.ok(sterk < svak);
});

// ------------------------------------------------------- adjustYardageRows

test("adjustYardageRows lar alle fire distansene stå ved baseline", () => {
  const [r] = adjustYardageRows([RAD], DEFAULT_CONDITIONS);

  assert.equal(r.adjCarry, 138);
  assert.equal(r.adjTotal, 150);
  assert.equal(r.adjThree, 127.5);
  assert.equal(r.adjSoft, 117);
  assert.equal(r.delta, 0);
});

test("adjustYardageRows beholder de opprinnelige feltene", () => {
  const [r] = adjustYardageRows([RAD], forhold({ tempC: 25 }));

  assert.equal(r.club, "7i");
  assert.equal(r.family, "iron");
  assert.equal(r.shotCount, 10);
  assert.equal(r.totalAvg, 150, "ujustert verdi skal stå urørt ved siden av");
});

test("adjustYardageRows: delta er differansen mot ujustert total", () => {
  const [r] = adjustYardageRows([RAD], forhold({ elevationM: 1000 }));

  assert.equal(r.adjTotal, 160);
  assert.equal(r.delta, 10);
});

test("adjustYardageRows rapporterer negativ delta i motvind", () => {
  const [r] = adjustYardageRows([RAD], forhold({ windMs: 10, windDirectionDeg: 0 }));
  assert.ok(r.delta < 0);
  assert.ok(r.adjTotal < RAD.totalAvg);
});

test("adjustYardageRows takler tom liste", () => {
  assert.deepEqual(adjustYardageRows([], DEFAULT_CONDITIONS), []);
});
