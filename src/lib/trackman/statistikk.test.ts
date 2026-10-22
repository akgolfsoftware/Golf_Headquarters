import assert from "node:assert/strict";
import { test } from "node:test";

import { andelIVindu, gapping, gjeldendeVindu, parameterstat, standardvindu, type StatSlag } from "./statistikk";

const slag = (verdier: number[], p: keyof StatSlag = "faceToPath", club = "7-jern"): StatSlag[] =>
  verdier.map((v, i) => ({ id: `s${i + 1}`, club, [p]: v }) as StatSlag);

test("snitt, median, min, maks og spredning per parameter", () => {
  const st = parameterstat(slag([-1, 0, 1, 2, 3]), "faceToPath");
  assert.equal(st.n, 5);
  assert.equal(st.forFaa, false);
  assert.equal(st.snitt, 1);
  assert.equal(st.median, 1);
  assert.deepEqual(st.min, { verdi: -1, slagId: "s1" });
  assert.deepEqual(st.maks, { verdi: 3, slagId: "s5" });
  assert.equal(Math.round(st.spredning! * 1000) / 1000, 1.581);
});

test("under 5 slag: for få slag, ingen spredning og ingen andel i målvindu", () => {
  const s = slag([0, 1, 2, 3]);
  const st = parameterstat(s, "faceToPath");
  assert.equal(st.forFaa, true);
  assert.equal(st.spredning, null);
  assert.equal(st.snitt, 1.5);
  assert.equal(andelIVindu(s, "faceToPath", standardvindu("faceToPath", "jern")), null);
});

test("standardvinduene fra Anders 22.10", () => {
  assert.deepEqual(standardvindu("faceToPath", "jern"), { min: -2, max: 2, kilde: "standard" });
  assert.deepEqual(standardvindu("clubPath", "driver"), { min: -2, max: 2, kilde: "standard" });
  assert.deepEqual(standardvindu("faceAngle", "jern"), { min: -2, max: 2, kilde: "standard" });
  assert.equal(standardvindu("smashFactor", "jern")?.min, 1.35);
  assert.equal(standardvindu("smashFactor", "driver")?.min, 1.45);
  assert.deepEqual([standardvindu("attackAngle", "jern")?.min, standardvindu("attackAngle", "jern")?.max], [-5, -3]);
  assert.deepEqual([standardvindu("attackAngle", "driver")?.min, standardvindu("attackAngle", "driver")?.max], [0, 4]);
  assert.deepEqual([standardvindu("carryDistance", "jern")?.max, standardvindu("carryDistance", "driver")?.max], [5, 15]);
  assert.deepEqual([standardvindu("side", "jern")?.max, standardvindu("side", "driver")?.max], [5, 15]);
  assert.equal(standardvindu("spinRate", "jern"), null);
});

test("andel i målvindu: Face to Path ±2°", () => {
  const s = slag([-3, -2, 0, 1.9, 2.5]);
  assert.equal(andelIVindu(s, "faceToPath", standardvindu("faceToPath", "jern")), 3 / 5);
});

test("Carry måles mot målet, og uten mål blir det ingen andel", () => {
  const s = slag([146, 148, 150, 152, 158], "carryDistance");
  assert.equal(andelIVindu(s, "carryDistance", standardvindu("carryDistance", "jern"), 150), 4 / 5);
  assert.equal(andelIVindu(s, "carryDistance", standardvindu("carryDistance", "jern")), null);
});

test("eget vindu gjelder i stedet for standarden", () => {
  const v = gjeldendeVindu("clubPath", "jern", { parameter: "clubPath", maal: 1, vinduMin: -0.5, vinduMax: 2.5 });
  assert.deepEqual(v, { min: -0.5, max: 2.5, kilde: "eget" });
  assert.equal(gjeldendeVindu("clubPath", "jern", null)?.kilde, "standard");
});

test("gapping: gap bare mellom køller med minst 5 slag", () => {
  const g = gapping([...slag([230, 232, 228, 231, 229], "carryDistance", "Driver"), ...slag([150, 148, 149, 151, 152], "carryDistance", "7-jern"), ...slag([100, 102], "carryDistance", "PW")]);
  assert.equal(g[0]?.kolle, "Driver");
  assert.equal(g[0]?.gap, 80);
  assert.equal(g.find((r) => r.kolle === "PW")?.gap, null);
});
