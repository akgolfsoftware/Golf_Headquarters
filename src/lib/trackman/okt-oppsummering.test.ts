import { test } from "node:test";
import assert from "node:assert/strict";
import { formaterVarighet, miljoEtikett, oppsummerOkt, type OktSlag } from "./okt-oppsummering";

function slag(over: Partial<OktSlag> = {}): OktSlag {
  return {
    club: "7-jern",
    outlier: false,
    clubSpeed: null,
    ballSpeed: null,
    smashFactor: null,
    launchAngle: null,
    spinRate: null,
    clubPath: null,
    faceAngle: null,
    carryDistance: null,
    ...over,
  };
}

test("økt uten slag gir ingen kølle og bare tomme verdier", () => {
  const r = oppsummerOkt([]);
  assert.equal(r.club, null);
  assert.ok(r.rows.every(([, , v]) => v === null));
});

test("snitt regnes av målte slag, aldri av oppdiktede tall", () => {
  const r = oppsummerOkt([
    slag({ clubSpeed: 90, carryDistance: 150 }),
    slag({ clubSpeed: 100, carryDistance: null }),
  ]);
  const rad = new Map(r.rows.map(([k, , v]) => [k, v]));
  assert.equal(rad.get("Club Speed"), 95);
  assert.equal(rad.get("Carry"), 150);
  assert.equal(rad.get("Spin Rate"), null);
});

test("dominerende kølle styrer utvalget, og utliggere telles ikke", () => {
  const r = oppsummerOkt([
    slag({ club: "Driver", clubSpeed: 110 }),
    slag({ club: "7-jern", clubSpeed: 80 }),
    slag({ club: "7-jern", clubSpeed: 82 }),
    slag({ club: "7-jern", clubSpeed: 200, outlier: true }),
  ]);
  assert.equal(r.club, "7-jern");
  assert.equal(r.rows[0][2], 81);
});

test("varighet og miljø er null uten kilde", () => {
  assert.equal(formaterVarighet(null), null);
  assert.equal(formaterVarighet(65), "1:05");
  assert.equal(miljoEtikett(null), null);
  assert.equal(miljoEtikett("NET_INDOOR"), "Nett inne");
});
