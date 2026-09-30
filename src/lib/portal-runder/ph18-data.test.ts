import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggPH18, metrikkVerdi, type PH18RundeInn } from "./ph18-data";

const hull = (n: number, par: number, strokes: number, o: Partial<PH18RundeInn["holeScores"][number]> = {}) => ({ holeNumber: n, par, strokes, putts: 2, fairway: true, gir: false, ...o });
const atten = (strokesPer: number[]) => strokesPer.map((s, i) => hull(i + 1, 4, s));
const runde = (id: string, dato: string, hs: PH18RundeInn["holeScores"], o: Partial<PH18RundeInn> = {}): PH18RundeInn => ({
  id, playedAt: new Date(dato), score: hs.reduce((s, h) => s + h.strokes, 0), courseName: "GFGK", sgTotal: null, sgOtt: null, sgApp: null, sgArg: null, sgPutt: null, sgSource: null, roundType: null,
  status: null, partialSave: false, source: null, notes: null, holeScores: hs, ...o,
});

describe("byggPH18", () => {
  it("regner par fra rundens egne hull og teller 9-hullsrunder ikke i snitt brutto", () => {
    const m = byggPH18([
      runde("a", "2026-09-20T10:00:00Z", atten(Array(18).fill(5))),
      runde("b", "2026-09-13T10:00:00Z", Array.from({ length: 9 }, (_, i) => hull(i + 1, 4, 5))),
    ]);
    assert.equal(m.runder[0].par, 72);
    assert.equal(m.runder[1].par, 36);
    assert.equal(m.runder[1].hull, 9);
    assert.equal(metrikkVerdi(m.runder[0], "snitt"), 90);
    assert.equal(metrikkVerdi(m.runder[1], "snitt"), null);
    assert.equal(metrikkVerdi(m.runder[1], "fairway"), 100);
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

  it("gjetter aldri par eller hullantall: uten hullscore er til par ukjent og runden teller ikke i snitt eller sesong", () => {
    const m = byggPH18([
      runde("a", "2026-09-20T10:00:00Z", [], { score: 79 }),
      runde("b", "2026-09-13T10:00:00Z", Array.from({ length: 5 }, (_, i) => hull(i + 1, 4, 5))),
      runde("c", "2026-09-06T10:00:00Z", atten(Array(18).fill(5))),
    ]);
    for (const r of m.runder.slice(0, 2)) {
      assert.equal(r.par, null);
      assert.equal(r.hull, null);
      assert.equal(r.kort, null);
      assert.equal(metrikkVerdi(r, "snitt"), null);
    }
    assert.equal(m.sesonger.length, 1);
    assert.equal(m.sesonger[0].antall, 1);
    assert.equal(m.sesonger[0].snittBrutto, 90);
  });

  it("viser lagringsstatus, kilde og notat slik de er lagret, og årstall i kortdato", () => {
    const m = byggPH18([
      runde("a", "2026-09-20T10:00:00Z", atten(Array(18).fill(4)), { status: "komplett", source: "live", notes: " Bra putting ", sgOtt: 0.5 }),
      runde("b", "2025-08-01T10:00:00Z", atten(Array(18).fill(4)), { status: "delvis", partialSave: true }),
      runde("c", "2025-07-01T10:00:00Z", atten(Array(18).fill(4)), { status: "ukjent-verdi" }),
    ]);
    assert.equal(m.runder[0].status, "Komplett");
    assert.equal(m.runder[0].kilde, "Live føring");
    assert.equal(m.runder[0].notat, "Bra putting");
    assert.equal(m.runder[0].sgKategorier.ott, 0.5);
    assert.equal(m.runder[0].kortDato, "20.09.26");
    assert.equal(m.runder[1].status, "Delvis lagret");
    assert.equal(m.runder[2].status, null);
    assert.equal(m.runder[2].kilde, null);
  });
});
