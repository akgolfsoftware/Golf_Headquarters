import { test } from "node:test";
import assert from "node:assert/strict";
import {
  eldning, isoUke, lagForslag, merkelapp, plassFraSnitt, poeng, sjanser, simulerSesong, stadiumFor, tierFra, ukeIAar,
  type Felt, type Poengkurve, type Vurdering, type WagrModell,
} from "./wagr-modell";

// Fasit regnet med ak-golf-pipelines pipelines/turneringsplan/modell.py (datafila 19.10.2026).
const FASIT = {"sigma": 3.034, "form": 0.5, "theta": -2.399, "poengkurve": {"plasser": [1, 2, 3, 5, 10, 15, 20, 30, 40, 60, 80, 120], "a": [1.0325, 0.7419, 0.585, 0.352, 0.0982, -0.0765, -0.2079, -0.4544, -0.6265, -0.9633, -1.2296, -2.0872], "b": [0.2786, 0.2858, 0.2882, 0.2972, 0.3052, 0.3153, 0.3238, 0.3399, 0.3491, 0.3667, 0.3822, 0.4981]}, "sjanser": [{"felt": {"q": [-3.21, -2.66, -2.45, -2.21, -2.07, -1.91, -1.74, -1.52, -1.33, -1.2, -1.12, -1.04, -0.99, -0.84, -0.73, -0.49, -0.27, -0.08, 0.33, 0.42, 0.65, 0.9, 0.92, 1.12, 1.8], "n": 89, "r": 3}, "p1": 0.029608, "p10": 0.268818, "ep": 26.4419}, {"felt": {"q": [-3.36, -2.71, -2.37, -1.63, -1.0, -0.52, -0.28, 0.02, 0.44, 0.53, 0.7, 0.9, 0.93, 1.0, 1.06, 1.12, 1.14, 1.18, 1.27, 1.34, 1.38, 1.43, 1.55, 1.9, 2.8], "n": 142, "r": 4}, "p1": 0.026818, "p10": 0.320461, "ep": 22.8458}, {"felt": {"q": [0.76, 1.89, 2.6, 3.0, 3.33, 3.62, 3.73, 3.79, 4.22, 4.75, 4.81, 4.82, 4.84, 4.86, 4.94, 5.02, 5.14, 5.23, 5.25, 5.34, 5.64, 5.92, 6.19, 6.39, 6.5], "n": 14, "r": 3}, "p1": 0.888501, "p10": 0.999995, "ep": 1.1416}], "poeng": [[30, 1, 7.243276], [180, 5, 6.654856], [500, 12, 6.990603], [90, 150, 0.969671]]} as {
  sigma: number; form: number; theta: number; poengkurve: Poengkurve;
  sjanser: { felt: Felt; p1: number; p10: number; ep: number }[]; poeng: [number, number, number][];
};

const MODELL: WagrModell = {
  sigma: FASIT.sigma, form: FASIT.form, pointsCurve: FASIT.poengkurve, powerEdges: [0, 20, 30, 45, 65, 90, 125, 175, 250, 350, 500, 700, 1000, 100000],
  fieldProfiles: Object.fromEntries(Array.from({ length: 13 }, (_, i) => ["M" + i, FASIT.sjanser[1].felt])),
  rankingCurves: { M: [[1, 2000], [10, 1500], [100, 900], [1000, 300], [5000, 50]] },
};

test("sjanser treffer Python-modellen", () => {
  for (const f of FASIT.sjanser) {
    const s = sjanser(MODELL, FASIT.theta, f.felt);
    assert.ok(Math.abs(s.p1 - f.p1) < 1e-4, `p1 ${s.p1} mot ${f.p1}`);
    assert.ok(Math.abs(s.p10 - f.p10) < 1e-4, `p10 ${s.p10} mot ${f.p10}`);
    assert.ok(Math.abs(s.ep - f.ep) < 1e-3, `plass ${s.ep} mot ${f.ep}`);
  }
});

test("WAGR-poeng treffer Python-kurven, og null Power gir null poeng", () => {
  for (const [power, plass, fasit] of FASIT.poeng) assert.ok(Math.abs(poeng(MODELL.pointsCurve, power, plass) - fasit) < 1e-6);
  assert.equal(poeng(MODELL.pointsCurve, null, 1), 0);
});

test("eldning følger WAGRs regel: fullt i 51 uker, borte ved 104", () => {
  assert.equal(eldning(51), 1);
  assert.ok(Math.abs(eldning(60) - 44 / 53) < 1e-12);
  assert.equal(eldning(104), 0);
});

test("merkelapp: 15 % seier gir Kan vinne, 40 % topp 10 gir Topp 10", () => {
  assert.equal(merkelapp(0.15, 0.2), "PRESTASJON");
  assert.equal(merkelapp(0.1, 0.4), "UTVIKLING");
  assert.equal(merkelapp(0.1, 0.39), "TRENING");
});

test("plass fra snitt interpolerer i rankingkurven", () => {
  assert.equal(plassFraSnitt(MODELL, 2500, "M"), 1);
  assert.equal(plassFraSnitt(MODELL, 600, "M"), 550);
  assert.equal(plassFraSnitt(MODELL, 10, "M"), 5001);
});

test("ukene: 1. januar 2027 er uke 53 i ISO, men uke 1 i sesongen", () => {
  assert.equal(isoUke("2027-01-01"), 53);
  assert.equal(ukeIAar("2027-01-01"), 1);
  assert.equal(ukeIAar("2027-07-14"), 28);
});

test("prioritet: Power 600+ er A, liten norsk turnering er C", () => {
  assert.equal(tierFra({ power: 650, country: "Spain" }), "A");
  assert.equal(tierFra({ power: 30, country: "Norway" }), "C");
  assert.equal(tierFra({ power: 30, country: "Sweden" }), "B");
});

test("forslaget har én turnering per uke og høyst tre uker på rad", () => {
  const v = (merke: Vurdering["merke"], p: number): Vurdering => ({ p1: 0, p10: 0, ep: 5, poeng: p, merke, anslattFelt: false });
  const kand = Array.from({ length: 30 }, (_, i) => ({
    ev: { id: "e" + i, d: `2027-05-${String(1 + (i % 28)).padStart(2, "0")}`, power: 100, country: "Sweden", eventType: "Junior" },
    v: v(i % 3 === 0 ? "PRESTASJON" : i % 3 === 1 ? "UTVIKLING" : "TRENING", 30 - i),
  }));
  const forslag = lagForslag(kand, stadiumFor(MODELL, FASIT.theta, "M"));
  const uker = forslag.map((f) => ukeIAar(f.ev.d)).sort((a, b) => a - b);
  assert.equal(new Set(uker).size, uker.length);
  let rekke = 1, lengst = 1;
  for (let i = 1; i < uker.length; i++) { rekke = uker[i] === uker[i - 1] + 1 ? rekke + 1 : 1; lengst = Math.max(lengst, rekke); }
  assert.ok(lengst <= 3);
});

test("sesongen: flere sterke turneringer gir bedre WAGR-plass, og samme input gir samme tall", () => {
  const spiller = { seed: 41993, theta: FASIT.theta, kj: "M" as const, tellende: [[8, "2026-10-04", 1]] as [number, string, number][] };
  const ev = (d: string) => ({ d, field: FASIT.sjanser[0].felt, power: 180 });
  const en = simulerSesong(MODELL, spiller, [ev("2027-05-02")], "2027-12-26")!;
  const fem = simulerSesong(MODELL, spiller, ["2027-05-02", "2027-06-06", "2027-07-04", "2027-08-01", "2027-09-05"].map(ev), "2027-12-26")!;
  assert.ok(fem.p50 < en.p50, `${fem.p50} skal være bedre enn ${en.p50}`);
  assert.deepEqual(simulerSesong(MODELL, spiller, [ev("2027-05-02")], "2027-12-26"), en);
  assert.equal(simulerSesong(MODELL, spiller, [], "2027-12-26"), null);
});
