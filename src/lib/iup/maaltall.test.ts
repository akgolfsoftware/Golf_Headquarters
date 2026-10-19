import assert from "node:assert/strict";
import { test } from "node:test";
import { beregnPeriode, byggMaaltall, formaterMaaltall, MAALTALL, sesongFor, type MaaltallHull, type MaaltallRunde } from "./maaltall";

const hull = (n: number, h: Partial<MaaltallHull> = {}): MaaltallHull[] => Array.from({ length: n }, () => ({ par: 4, strokes: 4, firstPuttFt: null, putts: null, fairway: null, gir: null, ...h }));
const runde = (r: Partial<MaaltallRunde>): MaaltallRunde => ({ dato: "2026-09-10", score: 72, turnering: false, konkurranseId: null, sgTotal: null, sgOtt: null, sgApp: null, sgArg: null, sgPutt: null, hull: hull(18), ...r });

test("katalogen har 37 måltall med unike ID-er, som IUP-arket", () => {
  assert.equal(MAALTALL.length, 37);
  assert.equal(new Set(MAALTALL.map((m) => m.id)).size, 37);
});

test("skoleåret går fra august, K1 august–oktober", () => {
  const s = sesongFor("2026-10-19");
  assert.equal(s.navn, "2026/27");
  assert.deepEqual(s.kvartaler[0], ["2026-08-01", "2026-11-01"]);
  assert.deepEqual(s.kvartaler[3], ["2027-05-01", "2027-08-01"]);
  assert.equal(sesongFor("2027-03-01").navn, "2026/27");
  assert.equal(sesongFor("2026-07-31").navn, "2025/26");
});

test("score er brutto, snitt bare av 18 hull, og turnering skilles fra trening", () => {
  const t = beregnPeriode([
    runde({ score: 74, turnering: true, konkurranseId: "a" }), runde({ score: 70, turnering: true, konkurranseId: "a" }),
    runde({ score: 78, turnering: false }), runde({ score: 38, turnering: false, hull: hull(9) }),
  ], []);
  assert.equal(t["snitt-turnering"], 72);
  assert.equal(t["beste-turnering"], 70);
  assert.equal(t["verste-turnering"], 74);
  assert.equal(t["snitt-utenfor"], 78);
  assert.equal(t.konkurranser, 1);
  assert.equal(t.konkurranserunder, 2);
  assert.equal(t["treningsrunder-9"], 1);
  assert.equal(t["treningsrunder-18"], 1);
});

test("putting per lengde regnes av første putt, og manglende grunnlag er null", () => {
  const h = [...hull(2, { firstPuttFt: 2, putts: 1 }), ...hull(2, { firstPuttFt: 4, putts: 2 }), ...hull(14)];
  const t = beregnPeriode([runde({ hull: h })], []);
  assert.equal(t["putt-0-3"], 100);
  assert.equal(t["putt-3-5"], 0);
  assert.equal(t["putt-5-10"], null);
  assert.equal(t["ranking-wagr"], null);
  assert.equal(t["pei-totalt"], null);
});

test("kvartal som ikke har begynt eller mangler grunnlag er tomt, og året venter på alle fire", () => {
  const rader = byggMaaltall({ sesong: sesongFor("2026-10-19"), idag: "2026-10-19", runder: [runde({ sgTotal: -1.1 })], okter: [{ dato: "2026-09-01", fys: true, minutter: 90 }], mal: new Map([["sg-totalt", "-0,5"]]) });
  const sg = rader.find((r) => r.id === "sg-totalt")!;
  assert.deepEqual(sg.kvartaler, [-1.1, null, null, null]);
  assert.equal(sg.aar, null);
  assert.equal(sg.mal, "-0,5");
  assert.equal(rader.find((r) => r.id === "treningstid-fys")!.kvartaler[0], 1.5);
});

test("visning med norsk komma og tankestrek for manglende verdi", () => {
  assert.equal(formaterMaaltall(73.66, "slag"), "73,7");
  assert.equal(formaterMaaltall(0.2, "sg"), "+0,2");
  assert.equal(formaterMaaltall(-1.1, "sg"), "−1,1");
  assert.equal(formaterMaaltall(52.4, "prosent"), "52 %");
  assert.equal(formaterMaaltall(14.7, "timer"), "14,7 t");
  assert.equal(formaterMaaltall(null, "sg"), "—");
});
