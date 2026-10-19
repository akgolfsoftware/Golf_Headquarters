import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  beregnSgProfil, byggTourDekning, byggTrend, harApproachTall, harFordeling, harKategoriSg,
  lesApproachBoetter, type DgSgRunde,
} from "./visning";

const runde = (id: number, o: Partial<DgSgRunde> = {}): DgSgRunde => ({
  id, dato: `2026-01-${String(id).padStart(2, "0")}`, tour: "pga", arrangement: "Test", runde: 1,
  total: null, ott: null, app: null, arg: null, putt: null, ...o,
});

describe("tourregler", () => {
  it("kategori-SG bare for pga og liv, fordeling bare for pga og euro", () => {
    assert.equal(harKategoriSg("PGA"), true);
    assert.equal(harKategoriSg("liv"), true);
    assert.equal(harKategoriSg("euro"), false);
    assert.equal(harKategoriSg(null), false);
    assert.equal(harFordeling("euro"), true);
    assert.equal(harFordeling("liv"), false);
  });
});

describe("beregnSgProfil", () => {
  it("regner snitt bare over runder som har tallet, og teller dem", () => {
    const p = beregnSgProfil([
      runde(1, { total: 2, ott: 1, app: 0.5, arg: 0.2, putt: 0.3 }),
      runde(2, { total: 1 }),
      runde(3, { total: 0 }),
    ]);
    assert.equal(p.total.snitt, 1);
    assert.equal(p.total.antall, 3);
    assert.equal(p.kategorier[0].snitt, 1);
    assert.equal(p.kategorier[0].antall, 1);
    assert.equal(p.kategoriAndel, 1 / 3);
    assert.equal(p.harKategoriData, true);
  });
  it("gir null og ikke 0 når kategoriene mangler helt", () => {
    const p = beregnSgProfil([runde(1, { total: 1.5, tour: "euro" })]);
    assert.equal(p.harKategoriData, false);
    assert.ok(p.kategorier.every(k => k.snitt === null && k.antall === 0));
    assert.equal(p.kategoriAndel, 0);
  });
  it("tom liste gir ingen andel", () => {
    const p = beregnSgProfil([]);
    assert.equal(p.total.snitt, null);
    assert.equal(p.kategoriAndel, null);
  });
});

describe("byggTrend", () => {
  it("sorterer eldst først og venter med snitt til det er nok grunnlag", () => {
    const t = byggTrend([runde(3, { total: 3 }), runde(1, { total: 1 }), runde(2, { total: 2 })]);
    assert.deepEqual(t.map(p => p.verdi), [1, 2, 3]);
    assert.equal(t[0].snitt, null);
    assert.equal(t[1].snitt, null);
    assert.equal(t[2].snitt, 2);
  });
  it("beholder hull som null og bruker vindu", () => {
    const t = byggTrend([
      runde(1, { total: 4 }), runde(2, { total: null }), runde(3, { total: 2 }),
      runde(4, { total: 0 }), runde(5, { total: 0 }),
    ], 3);
    assert.equal(t[1].verdi, null);
    assert.equal(t[4].snitt, (2 + 0 + 0) / 3);
  });
});

describe("byggTourDekning", () => {
  it("sorterer etter antall runder og regner andeler", () => {
    const d = byggTourDekning([
      { tour: "euro", antallRunder: 100, medTotal: 100, medKategori: 0, fraAar: 2017, tilAar: 2026 },
      { tour: "pga", antallRunder: 200, medTotal: 200, medKategori: 142, fraAar: 2017, tilAar: 2026 },
      { tour: "kft", antallRunder: 0, medTotal: 0, medKategori: 0, fraAar: null, tilAar: null },
    ]);
    assert.deepEqual(d.map(r => r.tour), ["pga", "euro"]);
    assert.equal(d[0].kategoriAndel, 0.71);
    assert.equal(d[0].kategoriForventet, true);
    assert.equal(d[1].kategoriForventet, false);
    assert.equal(d[1].fordelingFinnes, true);
  });
});

describe("lesApproachBoetter", () => {
  it("gir tom liste for ugyldig payload", () => {
    assert.deepEqual(lesApproachBoetter(null), []);
    assert.deepEqual(lesApproachBoetter([1]), []);
  });
  it("leser seks kildebøtter, rekner fot til meter og markerer tynt grunnlag", () => {
    const b = lesApproachBoetter({
      "100_150_fw_sg_per_shot": 0.12, "100_150_fw_proximity_per_shot": 20, "100_150_fw_gir_rate": 0.8,
      "100_150_fw_shot_count": 500, "over_150_rgh_sg_per_shot": -0.1, "over_150_rgh_shot_count": 12,
    });
    assert.equal(b.length, 6);
    const fw = b.find(x => x.id === "fairway-100")!;
    assert.equal(fw.sgPerSlag, 0.12);
    assert.ok(Math.abs(fw.naerhetMeter! - 6.096) < 1e-9);
    assert.equal(fw.girPct, 80);
    assert.equal(fw.tyntGrunnlag, false);
    const rough = b.find(x => x.id === "rough-150")!;
    assert.equal(rough.tyntGrunnlag, true);
    assert.equal(b.find(x => x.id === "fairway-200")!.sgPerSlag, null);
    assert.equal(harApproachTall(b), true);
    assert.equal(harApproachTall(lesApproachBoetter({})), false);
  });
});
