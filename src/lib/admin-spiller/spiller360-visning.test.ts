import { test } from "node:test";
import assert from "node:assert/strict";
import { datagrunnlag, erWangEllerTn, sg, snittscore, tellendeRunder, tilFane, tilPar } from "./spiller360-visning";

const r = (score: number, dagerSiden: number, hull = 18) => ({ score, hull, playedAt: new Date(Date.UTC(2026, 8, 28 - dagerSiden)) });

test("nok data: under 4 runder ingen konklusjon, 4–7 foreløpig, 8+ ok", () => {
  assert.equal(datagrunnlag(0), "ingen");
  assert.equal(datagrunnlag(3), "ingen");
  assert.equal(datagrunnlag(4), "forelopig");
  assert.equal(datagrunnlag(7), "forelopig");
  assert.equal(datagrunnlag(8), "ok");
});

test("ni hull teller aldri i snittscoren, ukjent hullantall gjør", () => {
  const t = tellendeRunder([r(40, 1, 9), r(74, 2, 18), r(76, 3, 0)]);
  assert.deepEqual(t.map((x) => x.score), [74, 76]);
});

test("snittscore gir ingen kategori under 4 runder", () => {
  const s = snittscore([r(74, 1), r(75, 2), r(73, 3)]);
  assert.equal(s.grunnlag, "ingen");
  assert.equal(s.kategori, null);
  assert.equal(s.neste, null);
});

test("snittscore bruker de ti siste, og neste kategori krever snitt under båndets nedre grense", () => {
  const runder = [...Array.from({ length: 10 }, (_, i) => r(73, i)), ...Array.from({ length: 10 }, (_, i) => r(80, 20 + i))];
  const s = snittscore(runder);
  assert.equal(s.siste10, 73);
  assert.equal(s.forrige10, 80);
  assert.equal(s.kategori, "C");
  assert.deepEqual(s.neste, { kategori: "B", grense: 72, slag: 1 });
  assert.equal(s.grunnlag, "ok");
});

test("fortegn på SG og til par", () => {
  assert.equal(sg(0.44), "+0,4");
  assert.equal(sg(-1.25), "−1,3");
  assert.equal(sg(0.01), "±0,0");
  assert.equal(sg(null), "—");
  assert.equal(tilPar(3), "+3");
  assert.equal(tilPar(-1), "−1");
  assert.equal(tilPar(0), "±0");
});

test("ukjent fane faller tilbake til Plan", () => {
  assert.equal(tilFane("talent"), "talent");
  assert.equal(tilFane("analyse"), "plan");
  assert.equal(tilFane(undefined), "plan");
});

test("fireukerssjekk gjelder bare WANG- og Team Norway-grupper", () => {
  assert.equal(erWangEllerTn(["WANG_UNG"], []), true);
  assert.equal(erWangEllerTn([null], ["Team Norway · regionlag Øst"]), true);
  assert.equal(erWangEllerTn(["AK_ACADEMY", "GFGK_ELITE"], ["GFGK Elite"]), false);
});
