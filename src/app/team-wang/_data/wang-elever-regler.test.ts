import assert from "node:assert/strict";
import { test } from "node:test";

import {
  alderPaDato,
  delTurneringer,
  etterlevelse,
  flyttMaaned,
  formaterSg,
  lesMaaned,
  maanedsnavn,
  manedsrutenett,
  normaliserKlasse,
  oktErOver,
  sistePerTest,
  snittAv,
  snittscore,
  testMerke,
  timerTekst,
  wangUke,
} from "./wang-elever-regler";

// Mandag 28.09.2026 kl. 12:00 i Oslo (10:00 UTC, sommertid).
const NA = new Date(Date.UTC(2026, 8, 28, 10, 0));

test("wangUke: inneværende og forrige uke, mandag til søndag", () => {
  assert.deepEqual(wangUke(NA, 0), { uke: 40, startIso: "2026-09-28", sluttIso: "2026-10-04" });
  assert.deepEqual(wangUke(NA, -1), { uke: 39, startIso: "2026-09-21", sluttIso: "2026-09-27" });
  assert.deepEqual(wangUke(NA, 3), { uke: 43, startIso: "2026-10-19", sluttIso: "2026-10-25" });
});

test("wangUke: søndag kveld sent i UTC er fortsatt samme uke i Oslo", () => {
  // Søndag 04.10.2026 kl. 23:30 i Oslo = 21:30 UTC.
  assert.equal(wangUke(new Date(Date.UTC(2026, 9, 4, 21, 30)), 0).uke, 40);
  // Mandag 05.10.2026 kl. 00:30 i Oslo = søndag 22:30 UTC — ny uke i Oslo.
  assert.equal(wangUke(new Date(Date.UTC(2026, 9, 4, 22, 30)), 0).uke, 41);
});

test("alderPaDato: fyller år på bursdagen i Oslo, null uten dato", () => {
  assert.equal(alderPaDato(new Date(Date.UTC(2009, 8, 28)), NA), 17);
  assert.equal(alderPaDato(new Date(Date.UTC(2009, 8, 29)), NA), 16);
  assert.equal(alderPaDato(null, NA), null);
});

test("oktErOver: bare økter med passert sluttid", () => {
  assert.equal(oktErOver({ datoIso: "2026-09-27", startMinutt: 600, varighetMin: 60 }, NA), true);
  assert.equal(oktErOver({ datoIso: "2026-09-28", startMinutt: 480, varighetMin: 120 }, NA), true); // 08–10
  assert.equal(oktErOver({ datoIso: "2026-09-28", startMinutt: 660, varighetMin: 120 }, NA), false); // 11–13
  assert.equal(oktErOver({ datoIso: "2026-09-29", startMinutt: 480, varighetMin: 60 }, NA), false);
});

test("etterlevelse: gjennomført tid av planlagt tid, fremtidige og avlyste teller ikke", () => {
  const okter = [
    { datoIso: "2026-09-21", startMinutt: 480, varighetMin: 120, gjennomfort: true, avlyst: false },
    { datoIso: "2026-09-23", startMinutt: 900, varighetMin: 90, gjennomfort: false, avlyst: false },
    { datoIso: "2026-09-24", startMinutt: 420, varighetMin: 60, gjennomfort: false, avlyst: true },
    { datoIso: "2026-09-30", startMinutt: 420, varighetMin: 60, gjennomfort: false, avlyst: false },
  ];
  assert.deepEqual(etterlevelse(okter, "2026-09-21", "2026-09-27", NA), { planlagtMin: 210, gjennomfortMin: 120, prosent: 57 });
  // Uke 40 har bare en fremtidig økt: ingen forfalte, altså «—».
  assert.deepEqual(etterlevelse(okter, "2026-09-28", "2026-10-04", NA), { planlagtMin: 0, gjennomfortMin: 0, prosent: null });
});

test("snittscore: bare atten-hullsrunder teller", () => {
  assert.deepEqual(snittscore([{ score: 74, antallHull: 18 }, { score: 38, antallHull: 9 }, { score: 76, antallHull: 18 }]), { snitt: 75, antall: 2 });
  assert.deepEqual(snittscore([{ score: 38, antallHull: 9 }]), { snitt: null, antall: 0 });
});

test("snittAv: hopper over manglende verdier, null når ingen finnes", () => {
  assert.equal(snittAv([1, null, 2, undefined]), 1.5);
  assert.equal(snittAv([null, undefined]), null);
});

test("formaterSg og timerTekst: norsk komma og ekte minus", () => {
  assert.equal(formaterSg(1.24), "+1,2");
  assert.equal(formaterSg(-0.36), "−0,4");
  assert.equal(formaterSg(0.01), "0,0");
  assert.equal(formaterSg(null), "—");
  assert.equal(timerTekst(120), "2 t");
  assert.equal(timerTekst(210), "3,5 t");
});

test("testMerke: ført av trener er Kontrollert, ellers Egenført", () => {
  assert.equal(testMerke({ userId: "e", recordedById: "t" }), "Kontrollert");
  assert.equal(testMerke({ userId: "e", recordedById: "e" }), "Egenført");
  assert.equal(testMerke({ userId: "e", recordedById: null }), "Egenført");
});

test("sistePerTest: første rad per test vinner (listen er nyest først)", () => {
  const ut = sistePerTest([{ testId: "a", v: 3 }, { testId: "b", v: 2 }, { testId: "a", v: 1 }]);
  assert.deepEqual(ut, [{ testId: "a", v: 3 }, { testId: "b", v: 2 }]);
});

test("delTurneringer: i dag regnes som kommende, spilte nyest først", () => {
  const r = [
    { navn: "gammel", startDato: new Date(Date.UTC(2026, 5, 1)) },
    { navn: "i dag", startDato: new Date(Date.UTC(2026, 8, 28)) },
    { navn: "nylig", startDato: new Date(Date.UTC(2026, 8, 20)) },
    { navn: "senere", startDato: new Date(Date.UTC(2026, 9, 10)) },
  ];
  const { kommende, siste } = delTurneringer(r, NA);
  assert.deepEqual(kommende.map((x) => x.navn), ["i dag", "senere"]);
  assert.deepEqual(siste.map((x) => x.navn), ["nylig", "gammel"]);
});

test("normaliserKlasse", () => {
  assert.equal(normaliserKlasse("vg 2"), "VG2");
  assert.equal(normaliserKlasse("3"), "VG3");
  assert.equal(normaliserKlasse("10. trinn"), "10. trinn");
  assert.equal(normaliserKlasse(null), null);
  assert.equal(normaliserKlasse("  "), null);
});

test("manedsrutenett: oktober 2026 starter torsdag og fyller hele uker", () => {
  const dager = manedsrutenett("2026-10");
  assert.equal(dager.length, 35);
  assert.equal(dager[0].iso, "2026-09-28");
  assert.equal(dager[3].iso, "2026-10-01");
  assert.equal(dager[3].iMaaned, true);
  assert.equal(dager[0].iMaaned, false);
  assert.equal(dager[34].iso, "2026-11-01");
});

test("lesMaaned, flyttMaaned og maanedsnavn", () => {
  assert.equal(lesMaaned("2026-11", NA), "2026-11");
  assert.equal(lesMaaned("2026-13", NA), "2026-09");
  assert.equal(lesMaaned(undefined, NA), "2026-09");
  assert.equal(flyttMaaned("2026-12", 1), "2027-01");
  assert.equal(flyttMaaned("2026-01", -1), "2025-12");
  assert.equal(maanedsnavn("2026-10"), "Oktober 2026");
});
