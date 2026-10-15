import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TM_FILTER_STANDARD, TM_PARAM, filtrerOkter, formaterTm, fraMal, gapping, kolleOppsummering, lesTmFilter,
  oktHast, oktNavn, peiProsent, sd, snitt, sorterKoller, tmFilterSok, tmParam, utstyrsEndringer, utviklingPunkter,
  type TmOkt, type TmSlag,
} from "./trackman-stats";

function slag(over: Partial<TmSlag> = {}): TmSlag {
  const tomme = Object.fromEntries(TM_PARAM.map((p) => [p.key, null])) as Record<(typeof TM_PARAM)[number]["key"], null>;
  return { ...tomme, nr: 1, kolle: "7-jern", ekstrem: false, mal: null, hast: null, sx: null, sy: null, ...over };
}
const okt = (id: string, dato: string, s: TmSlag[], over: Partial<TmOkt> = {}): TmOkt => ({ id, dato, sted: "Simulator", plan: null, slag: s, ...over });
const NAA = new Date("2026-10-05T12:20:00Z");

test("formaterTm viser «—» for manglende verdi, aldri 0", () => {
  assert.equal(formaterTm(tmParam("carry"), null), "—");
  assert.equal(formaterTm(tmParam("carry"), 156.4), "156 m");
  assert.equal(formaterTm(tmParam("smash"), 1.4712), "1,47");
  assert.equal(formaterTm(tmParam("spin"), 6820.4), "6 820 rpm");
  assert.equal(formaterTm(tmParam("ftp"), 1.24), "+1,2°");
  assert.equal(formaterTm(tmParam("aa"), -4.1), "−4,1°");
  assert.equal(formaterTm(tmParam("side"), -3.25), "V 3,3 m");
  assert.equal(formaterTm(tmParam("side"), 0.01), "0,0 m");
});

test("snitt hopper over manglende verdier, og sd krever to slag", () => {
  const u = snitt([slag({ carry: 150 }), slag({ carry: 160 }), slag({ carry: null })]);
  assert.equal(u.carry, 155);
  assert.equal(u.spin, null);
  assert.equal(sd([slag({ side: 2 })], "side"), null);
  assert.equal(sd([slag({ side: -2 }), slag({ side: 2 })], "side"), 2);
});

test("fraMal og PEI bruker carry og side mot målavstanden", () => {
  const s = slag({ mal: 100, carry: 97, side: 4 });
  assert.equal(fraMal(s), 5);
  assert.equal(peiProsent([s]), 5);
  assert.equal(fraMal(slag({ carry: 97, side: 4 })), null);
  assert.equal(peiProsent([slag({ carry: 97 })]), null);
});

test("køllene sorteres fra driver til lobwedge", () => {
  assert.deepEqual(sorterKoller(["54°", "PW", "7-jern", "Driver", "Hybrid 4", "3-tre", "50°", "5-jern"]),
    ["Driver", "3-tre", "Hybrid 4", "5-jern", "7-jern", "PW", "50°", "54°"]);
});

test("filteret leses fra og skrives til adressen", () => {
  const f = lesTmFilter({ periode: "sesong", kolle: "7-jern,54°", sted: "Simulator,Månen", hast: "Full", plan: "koblet", ekstreme: "vis" });
  assert.deepEqual(f, { periode: "sesong", kolle: ["7-jern", "54°"], sted: ["Simulator"], hast: ["Full"], plan: ["koblet"], ekstreme: true });
  assert.deepEqual(lesTmFilter(Object.fromEntries(new URLSearchParams(tmFilterSok(f).slice(1)))), f);
  assert.equal(tmFilterSok(TM_FILTER_STANDARD), "");
  assert.deepEqual(lesTmFilter({}), TM_FILTER_STANDARD);
});

test("filtrerOkter: periode, sted, teknisk plan, kølle og hastighet", () => {
  const okter = [
    okt("ny", "2026-09-28T10:00:00Z", [slag({ kolle: "7-jern", hast: "FULL" }), slag({ kolle: "54°", hast: "LAV" })], { plan: "Face to Path" }),
    okt("gammel", "2026-05-18T10:00:00Z", [slag({ kolle: "Driver" })], { sted: "Range" }),
  ];
  assert.deepEqual(filtrerOkter(okter, TM_FILTER_STANDARD, NAA).map((o) => o.id), ["ny"]);
  assert.deepEqual(filtrerOkter(okter, { ...TM_FILTER_STANDARD, periode: "sesong" }, NAA).map((o) => o.id), ["ny", "gammel"]);
  assert.deepEqual(filtrerOkter(okter, { ...TM_FILTER_STANDARD, periode: "sesong", sted: ["Range"] }, NAA).map((o) => o.id), ["gammel"]);
  assert.deepEqual(filtrerOkter(okter, { ...TM_FILTER_STANDARD, periode: "sesong", plan: ["ikke"] }, NAA).map((o) => o.id), ["gammel"]);
  const kolle = filtrerOkter(okter, { ...TM_FILTER_STANDARD, kolle: ["54°"] }, NAA);
  assert.deepEqual(kolle[0].slag.map((s) => s.kolle), ["54°"]);
  const hast = filtrerOkter(okter, { ...TM_FILTER_STANDARD, hast: ["Full"] }, NAA);
  assert.deepEqual(hast[0].slag.map((s) => s.kolle), ["7-jern"]);
});

test("ekstreme slag holdes utenfor snittet til filteret tar dem med", () => {
  const o = [okt("a", "2026-09-28T10:00:00Z", [slag({ carry: 150 }), slag({ carry: 100, ekstrem: true })])];
  assert.equal(kolleOppsummering(o, TM_FILTER_STANDARD)[0].snitt.carry, 150);
  assert.equal(kolleOppsummering(o, { ...TM_FILTER_STANDARD, ekstreme: true })[0].snitt.carry, 125);
});

test("gapping bruker ikke lav hastighet, og teller slag uten hastighet", () => {
  const o = [okt("a", "2026-09-28T10:00:00Z", [
    slag({ kolle: "7-jern", carry: 156, hast: "FULL" }), slag({ kolle: "7-jern", carry: 80, hast: "LAV" }),
    slag({ kolle: "8-jern", carry: 145 }), slag({ kolle: "Driver", carry: null }),
  ])];
  const g = gapping(o, TM_FILTER_STANDARD);
  assert.deepEqual(g.rader.map((r) => [r.kolle, r.carry, r.gapFraForrige]), [["7-jern", 156, null], ["8-jern", 145, 11]]);
  assert.equal(g.antall, 2);
  assert.equal(g.utenHast, 1);
});

test("øktnavn, hastighet og utviklingspunkter", () => {
  const o = okt("a", "2026-09-28T10:00:00Z", [slag({ kolle: "54°", hast: "LAV", cs: 40 }), slag({ kolle: "7-jern", hast: "LAV", cs: 50 })]);
  assert.equal(oktNavn(o), "7-jern og 54°");
  assert.equal(oktNavn({ ...o, plan: "Lengdekontroll" }), "Lengdekontroll");
  assert.equal(oktHast(o.slag), "LAV");
  assert.equal(oktHast([slag()]), null);
  const p = utviklingPunkter([o], TM_FILTER_STANDARD);
  assert.deepEqual(p.map((x) => [x.kolle, x.snitt.cs]), [["7-jern", 50], ["54°", 40]]);
});

test("utstyrsEndringer krever to økter med Spin Rate og viser største endring først", () => {
  const o = [
    okt("a", "2026-05-18T10:00:00Z", [slag({ kolle: "54°", spin: 9550 }), slag({ kolle: "Driver", spin: 2600 })]),
    okt("b", "2026-09-28T10:00:00Z", [slag({ kolle: "54°", spin: 8940 }), slag({ kolle: "Driver", spin: 2640 }), slag({ kolle: "7-jern", spin: 6800 })]),
  ];
  const e = utstyrsEndringer(utviklingPunkter(o, TM_FILTER_STANDARD));
  assert.deepEqual(e.map((x) => [x.kolle, x.fra, x.til]), [["54°", 9550, 8940], ["Driver", 2600, 2640]]);
});
