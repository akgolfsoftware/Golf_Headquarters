import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildYardageRows,
  carryFactor,
  classifyClub,
  clubSortKey,
  adjustForConditions,
} from "@/lib/sg-hub/yardage-calc";

/** Ett HTML-rapport-slag. Feltene som ikke er satt betyr ingenting for testen. */
function slag(over: { total: number; ballSpeed?: number; clubSpeed?: number; smash?: number }) {
  return {
    shotNumber: 0,
    clubSpeed: over.clubSpeed ?? 40,
    clubPath: 0,
    faceAngle: 0,
    faceToPath: 0,
    smashFactor: over.smash ?? 1.4,
    ballSpeed: over.ballSpeed ?? 60,
    totalDistance: over.total,
  };
}

/** Én session i HTML-import-format (`type: "multi-group"`). */
function session(clubId: string, totals: number[]) {
  return {
    rawJson: {
      type: "multi-group",
      clubs: [
        {
          clubId,
          clubName: clubId,
          shots: totals.map((t) => slag({ total: t })),
        },
      ],
    },
  };
}

// ---------------------------------------------------------------- classifyClub

test("classifyClub kjenner igjen driver, wood, iron og putter", () => {
  assert.equal(classifyClub("Driver"), "driver");
  assert.equal(classifyClub("1W"), "driver");
  assert.equal(classifyClub("3W"), "wood");
  assert.equal(classifyClub("7W"), "wood");
  assert.equal(classifyClub("7i"), "iron");
  assert.equal(classifyClub("PT"), "putter");
  assert.equal(classifyClub("putter"), "putter");
});

/**
 * REGRESJON: alle fem wedge-navnene slutter på «w», så da `endsWith("w")`-
 * fallbacken sto FØR wedge-lista ble hele grenen død kode og samtlige wedger
 * klassifisert som «wood». Det ga feil carryFactor (0.93 mot 0.98) og feil
 * apex-estimat (0.17× mot 0.30×) i yardage-tabellen — tall spilleren ser.
 */
test("classifyClub: alle wedger er wedge, ikke wood", () => {
  for (const wedge of ["PW", "AW", "GW", "SW", "LW"]) {
    assert.equal(classifyClub(wedge), "wedge", `${wedge} skal være wedge`);
  }
});

test("classifyClub er ufølsom for store/små bokstaver", () => {
  assert.equal(classifyClub("driver"), "driver");
  assert.equal(classifyClub("pw"), "wedge");
  assert.equal(classifyClub("3w"), "wood");
});

test("carryFactor: wedge har høyere carry-andel enn wood", () => {
  assert.equal(carryFactor("driver"), 0.95);
  assert.equal(carryFactor("wood"), 0.93);
  assert.equal(carryFactor("iron"), 0.92);
  assert.equal(carryFactor("wedge"), 0.98);
  assert.equal(carryFactor("putter"), 1.0);
});

// ---------------------------------------------------------------- clubSortKey

test("clubSortKey sorterer driver først og putter sist", () => {
  assert.ok(clubSortKey("Driver") < clubSortKey("3W"));
  assert.ok(clubSortKey("3W") < clubSortKey("7i"));
  assert.ok(clubSortKey("7i") < clubSortKey("PW"));
  assert.ok(clubSortKey("PW") < clubSortKey("PT"));
});

test("clubSortKey gir ukjente køller siste plass", () => {
  assert.equal(clubSortKey("Hockeykølle"), 999);
});

// ------------------------------------------------------------ buildYardageRows

test("buildYardageRows returnerer tom liste for tom input", () => {
  assert.deepEqual(buildYardageRows([]), []);
});

test("buildYardageRows hopper over køller uten gyldige slag", () => {
  // totalDistance 0 = feilrad i TrackMan-eksporten, ikke et kort slag.
  const rows = buildYardageRows([session("7i", [0, 0])]);
  assert.deepEqual(rows, []);
});

test("buildYardageRows: ett slag gir σ = 0, ikke NaN", () => {
  const rows = buildYardageRows([session("7i", [150])]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].shotCount, 1);
  assert.equal(rows[0].totalAvg, 150);
  assert.equal(rows[0].totalSigma, 0, "ett datapunkt har ingen spredning");
});

test("buildYardageRows regner snitt, carry, 3/4 og soft per kølle", () => {
  const rows = buildYardageRows([session("7i", [148, 150, 152])]);
  const r = rows[0];

  assert.equal(r.club, "7i");
  assert.equal(r.family, "iron");
  assert.equal(r.shotCount, 3);
  assert.equal(r.totalAvg, 150);
  assert.equal(r.carryAvg, 138, "iron: 150 × 0.92");
  assert.equal(r.threeQuarter, 127.5, "150 × 0.85");
  assert.equal(r.soft, 117, "150 × 0.78");
  assert.equal(r.apex, 33, "iron: rund(150 × 0.22)");
});

test("buildYardageRows bruker wedge-faktoren for wedger", () => {
  const rows = buildYardageRows([session("PW", [100, 100])]);
  const r = rows[0];

  assert.equal(r.family, "wedge");
  assert.equal(r.carryAvg, 98, "wedge: 100 × 0.98");
  assert.equal(r.apex, 30, "wedge: rund(100 × 0.30)");
});

test("buildYardageRows filtrerer bort feilrader før snittet regnes", () => {
  // 0-radene skal ikke dra snittet ned.
  const rows = buildYardageRows([session("7i", [150, 0, 150, 0])]);
  assert.equal(rows[0].shotCount, 2);
  assert.equal(rows[0].totalAvg, 150);
});

test("buildYardageRows sorterer radene i kølle-rekkefølge", () => {
  const rows = buildYardageRows([
    session("PW", [100]),
    session("Driver", [230]),
    session("7i", [150]),
  ]);
  assert.deepEqual(
    rows.map((r) => r.club),
    ["Driver", "7i", "PW"],
  );
});

test("buildYardageRows slår sammen samme kølle på tvers av sessions", () => {
  const rows = buildYardageRows([session("7i", [140]), session("7i", [160])]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].shotCount, 2);
  assert.equal(rows[0].totalAvg, 150);
});

// -------------------------------------------------------- adjustForConditions

test("adjustForConditions lar baseline-forhold stå urørt", () => {
  assert.equal(adjustForConditions(150, 15, 0), 150);
});

test("adjustForConditions: varmere luft gir lengre slag", () => {
  // 25 °C → faktor 1 + 0.0008 × 10 = 1.008
  assert.ok(Math.abs(adjustForConditions(150, 25, 0) - 151.2) < 1e-9);
  assert.ok(adjustForConditions(150, 5, 0) < 150, "kaldere = kortere");
});

test("adjustForConditions: +1 m per 100 høydemeter", () => {
  assert.ok(Math.abs(adjustForConditions(150, 15, 1000) - 160) < 1e-9);
});
