import { test } from "node:test";
import assert from "node:assert/strict";
import { flettFordeling, standardFordeling, type FordelingRad } from "./periode-fordeling";
import { PERIODE_CONSTRAINTS } from "./periode-constraints";

test("periode-fordeling: flett", async (t) => {
  await t.test("ingen rader → identisk med defaults", () => {
    const eff = flettFordeling([]);
    assert.deepEqual(eff.GRUNN.minPyramide, PERIODE_CONSTRAINTS.GRUNN.minPyramide);
    assert.deepEqual(eff.TURNERING.maxPyramide, PERIODE_CONSTRAINTS.TURNERING.maxPyramide);
    // lFase/volum arves uendret fra default
    assert.deepEqual(eff.GRUNN.volumPerUke, PERIODE_CONSTRAINTS.GRUNN.volumPerUke);
  });

  await t.test("coach-satt rad overstyrer kun sin egen periode + kun pyramide", () => {
    const rad: FordelingRad = {
      periodeType: "TURNERING",
      minFys: 5, maxFys: 20,
      minTek: 25, maxTek: 30, // TEK hevet fra default (5/20)
      minSlag: 15, maxSlag: 30,
      minSpill: 20, maxSpill: 40,
      minTurn: 20, maxTurn: 45,
    };
    const eff = flettFordeling([rad]);
    assert.equal(eff.TURNERING.minPyramide.TEK, 25);
    assert.equal(eff.TURNERING.maxPyramide.TEK, 30);
    // volum/lFase i TURNERING arves fortsatt fra default
    assert.deepEqual(eff.TURNERING.volumPerUke, PERIODE_CONSTRAINTS.TURNERING.volumPerUke);
    // andre perioder er urørt
    assert.deepEqual(eff.GRUNN.minPyramide, PERIODE_CONSTRAINTS.GRUNN.minPyramide);
  });

  await t.test("ukjent periodeType ignoreres (ingen krasj)", () => {
    const rad = { periodeType: "TULL", minFys: 1, maxFys: 1, minTek: 1, maxTek: 1, minSlag: 1, maxSlag: 1, minSpill: 1, maxSpill: 1, minTurn: 1, maxTurn: 1 };
    const eff = flettFordeling([rad]);
    assert.deepEqual(eff.GRUNN.minPyramide, PERIODE_CONSTRAINTS.GRUNN.minPyramide);
  });

  await t.test("standardFordeling speiler defaultene", () => {
    const std = standardFordeling();
    assert.equal(std.GRUNN.min.TEK, PERIODE_CONSTRAINTS.GRUNN.minPyramide.TEK);
    assert.equal(std.SPESIALISERING.max.SLAG, PERIODE_CONSTRAINTS.SPESIALISERING.maxPyramide.SLAG);
  });
});
