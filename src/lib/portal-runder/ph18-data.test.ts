import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggPH18, metrikkVerdi, type PH18RundeInn } from "./ph18-data";

const hull = (n: number, par: number, strokes: number, o: Partial<PH18RundeInn["holeScores"][number]> = {}) => ({
  holeNumber: n,
  par,
  strokes,
  putts: 2,
  fairway: true,
  gir: false,
  ...o,
});

const atten = (strokesPer: number[]) => strokesPer.map((s, i) => hull(i + 1, 4, s));

const runde = (id: string, dato: string, hs: PH18RundeInn["holeScores"], o: Partial<PH18RundeInn> = {}): PH18RundeInn => ({
  id,
  playedAt: new Date(dato),
  score: hs.length ? hs.reduce((s, h) => s + h.strokes, 0) : (o.score ?? 72),
  courseName: "GFGK",
  coursePar: 72,
  sgTotal: null,
  sgSource: null,
  roundType: null,
  holeScores: hs,
  ...o,
});

describe("byggPH18", () => {
  it("gjetter ALDRI par eller hullantall fra baneregisteret hvis hull mangler (låser review-regel)", () => {
    const utenHull = byggPH18([runde("r-uten", "2026-09-20T10:00:00Z", [], { score: 79, coursePar: 72 })]);
    assert.equal(utenHull.runder[0].hull, null);
    assert.equal(utenHull.runder[0].par, null);
    assert.equal(utenHull.runder[0].tilPar, null);
    assert.equal(metrikkVerdi(utenHull.runder[0], "snitt"), null);
    assert.equal(utenHull.sesonger.length, 0);
  });

  it("regner par fra rundens egne hull og teller 9-hullsrunder ikke i snitt brutto", () => {
    const m = byggPH18([
      runde("a", "2026-09-20T10:00:00Z", atten(Array(18).fill(5))),
      runde("b", "2026-09-13T10:00:00Z", Array.from({ length: 9 }, (_, i) => hull(i + 1, 4, 5))),
    ]);
    assert.equal(m.runder[0].par, 72);
    assert.equal(m.runder[0].tilPar, "+18");
    assert.equal(m.runder[1].par, 36);
    assert.equal(m.runder[1].tilPar, "+9");
    assert.equal(m.runder[1].hull, 9);
    assert.equal(metrikkVerdi(m.runder[0], "snitt"), 90);
    assert.equal(metrikkVerdi(m.runder[1], "snitt"), null);
    assert.equal(metrikkVerdi(m.runder[1], "fairway"), 100);
  });

  it("bevarer SG per kategori, notater og kilde", () => {
    const m = byggPH18([
      runde("a", "2026-09-20T10:00:00Z", atten(Array(18).fill(4)), {
        sgTotal: 1.5,
        sgOtt: 0.8,
        sgApp: 0.5,
        sgArg: -0.2,
        sgPutt: 0.4,
        sgSource: "UpGame",
        notes: "Gode innspill med 7-er jern",
        status: "Fullført",
      }),
    ]);
    assert.equal(m.runder[0].sg, 1.5);
    assert.equal(m.runder[0].sgOtt, 0.8);
    assert.equal(m.runder[0].sgApp, 0.5);
    assert.equal(m.runder[0].sgArg, -0.2);
    assert.equal(m.runder[0].sgPutt, 0.4);
    assert.equal(m.runder[0].kilde, "UpGame");
    assert.equal(m.runder[0].notater, "Gode innspill med 7-er jern");
    assert.equal(m.runder[0].status, "Fullført");
  });

  it("viser årstall på kortdato når runden er fra et annet år enn nåværende", () => {
    const naaAar = new Date().getFullYear();
    const annetAar = naaAar - 1;
    const m = byggPH18([
      runde("a", `${naaAar}-09-20T10:00:00Z`, atten(Array(18).fill(4))),
      runde("b", `${annetAar}-08-15T10:00:00Z`, atten(Array(18).fill(4))),
    ]);
    assert.equal(m.runder[0].kortDato, "20.09");
    assert.equal(m.runder[1].kortDato, `15.08.${annetAar}`);
  });

  it("gir null, ikke 0, når hull mangler eller putter ikke er ført", () => {
    const m = byggPH18([runde("a", "2026-09-20T10:00:00Z", [], { score: 80 })]);
    assert.equal(m.runder[0].fairwayPct, null);
    assert.equal(m.runder[0].putter, null);
    assert.equal(m.runder[0].kort, null);
    assert.equal(m.hull, null);
    const delvis = byggPH18([runde("b", "2026-09-20T10:00:00Z", atten(Array(18).fill(4)).map((h, i) => (i === 3 ? { ...h, putts: null } : h)))]);
    assert.equal(delvis.runder[0].putter, null);
  });

  it("finner dyreste og beste hull på banen med flest runder", () => {
    const a = Array(18).fill(4); a[4] = 6;
    const b = Array(18).fill(4); b[4] = 5; b[10] = 3;
    const m = byggPH18([runde("a", "2026-09-20T10:00:00Z", atten(a)), runde("b", "2026-09-13T10:00:00Z", atten(b))]);
    assert.deepEqual(m.hull?.dyreste, { hull: 5, par: 4, snitt: 1.5, rundeMedBogey: 2 });
    assert.equal(m.hull?.beste.hull, 11);
  });

  it("samler til par per måned per sesong, april først, eldste sesong først", () => {
    const m = byggPH18([
      runde("a", "2026-09-20T10:00:00Z", atten(Array(18).fill(5))),
      runde("b", "2025-04-13T10:00:00Z", atten(Array(18).fill(4))),
    ]);
    assert.deepEqual(m.sesonger.map((s) => s.aar), [2025, 2026]);
    assert.equal(m.sesonger[0].maaneder[0], 0);
    assert.equal(m.sesonger[1].maaneder[5], 18);
    assert.equal(m.sesonger[1].maaneder[6], null);
  });
});
