import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  antallUker, dmyTilIso, ettAarSenere, isoTilDmy, manederIn, omraadeAv, periodeEtikett, plassering, skjemaFraPeriode,
  skjemaTilInput, sorter, timerTekst, tomtSkjema, ukenr,
} from "./arsplan-view";

describe("datoer", () => {
  it("dd.mm.åååå til ISO og tilbake", () => {
    assert.equal(dmyTilIso("03.08.2026"), "2026-08-03");
    assert.equal(isoTilDmy("2026-08-03"), "03.08.2026");
  });
  it("avviser ugyldige datoer", () => {
    assert.equal(dmyTilIso("31.02.2026"), null);
    assert.equal(dmyTilIso("2026-08-03"), null);
    assert.equal(dmyTilIso("3.8.2026"), null);
  });
  it("uke 40 i 2026 starter 28.09", () => {
    assert.equal(ukenr("2026-09-30"), 40);
    assert.equal(ukenr("2026-01-01"), 1);
  });
  it("ett år senere klemmer 29. februar", () => {
    assert.equal(ettAarSenere("2027-08-03"), "2028-08-03");
    assert.equal(ettAarSenere("2028-02-29"), "2029-02-28");
    assert.equal(ettAarSenere("2027-12-31"), "2028-12-31");
  });
});

describe("timer og uker", () => {
  it("manglende verdi vises som strek", () => {
    assert.equal(timerTekst(null), "—");
    assert.equal(timerTekst(0), "—");
    assert.equal(timerTekst(390), "6,5 t");
  });
  it("teller torsdager", () => {
    assert.equal(antallUker("2026-09-28", "2026-10-04"), 1);
    assert.equal(antallUker("2026-09-28", "2026-10-11"), 2);
    assert.equal(antallUker("2026-09-29", "2026-09-29"), 1);
  });
});

describe("skjema", () => {
  const gyldig = () => ({ ...tomtSkjema(), type: "TURNERING" as const, fra: "03.08.2026", til: "04.10.2026", fokus: " Scoring ", volMin: "6", volMax: "7,5" });
  it("gyldig skjema gir input med minutter", () => {
    const r = skjemaTilInput({ ...gyldig(), okter: { FYS: "2", TEK: "", SLAG: "4", SPILL: "", TURN: "0" } });
    assert.ok(r.ok);
    if (r.ok) {
      assert.equal(r.input.startDato, "2026-08-03");
      assert.equal(r.input.ukevolumMin, 360);
      assert.equal(r.input.ukevolumMax, 450);
      assert.equal(r.input.fokus, "Scoring");
      assert.deepEqual(r.input.budsjett, { FYS: 2, SLAG: 4, TURN: 0 });
    }
  });
  it("slutt før start avvises", () => {
    const r = skjemaTilInput({ ...gyldig(), til: "01.08.2026" });
    assert.ok(!r.ok);
    if (!r.ok) assert.match(r.feil.til ?? "", /før start/);
  });
  it("ugyldig dato, timer og økter gir feil per felt", () => {
    const r = skjemaTilInput({ ...gyldig(), fra: "i går", volMin: "mye", okter: { FYS: "22", TEK: "", SLAG: "", SPILL: "", TURN: "" } });
    assert.ok(!r.ok);
    if (!r.ok) {
      assert.ok(r.feil.fra);
      assert.ok(r.feil.volMin);
      assert.ok(r.feil.okter);
    }
  });
  it("høyeste volum under laveste avvises", () => {
    const r = skjemaTilInput({ ...gyldig(), volMin: "8", volMax: "6" });
    assert.ok(!r.ok);
  });
  it("tomt volum og tomme økter gir null", () => {
    const r = skjemaTilInput({ ...gyldig(), volMin: "", volMax: "" });
    assert.ok(r.ok);
    if (r.ok) { assert.equal(r.input.ukevolumMin, null); assert.equal(r.input.budsjett, null); }
  });
  it("skjema fra periode og tilbake er uendret", () => {
    const s = skjemaFraPeriode({ id: "a", type: "GRUNN", startDate: "2026-11-16", endDate: "2027-01-31", focus: "Styrke", ukevolumMin: 390, ukevolumMax: null, budsjett: { FYS: 3 } });
    assert.equal(s.fra, "16.11.2026");
    assert.equal(s.volMin, "6,5");
    const r = skjemaTilInput(s);
    assert.ok(r.ok);
    if (r.ok) { assert.equal(r.input.ukevolumMin, 390); assert.deepEqual(r.input.budsjett, { FYS: 3 }); }
  });
});

describe("tidslinje", () => {
  it("måneder over årsskiftet", () => {
    const m = manederIn("2026-08-03", "2027-06-27");
    assert.equal(m.length, 11);
    assert.equal(m[0].nokkel, "2026-08");
    assert.equal(m[10].nokkel, "2027-06");
  });
  it("plassering i prosent", () => {
    const p = plassering("2026-01-01", "2026-12-31", "2026-01-01", "2026-12-31");
    assert.equal(p.l, 0);
    assert.equal(p.r, 100);
    const halv = plassering("2026-01-01", "2026-12-31", "2026-07-02", "2026-12-31");
    assert.ok(halv.l > 49 && halv.l < 51);
  });
  it("område av perioder", () => {
    assert.equal(omraadeAv([]), null);
    assert.deepEqual(omraadeAv([{ startDate: "2026-11-01T00:00:00.000Z", endDate: "2027-01-31" }, { startDate: "2026-08-03", endDate: "2026-10-04" }]), { fra: "2026-08-03", til: "2027-01-31" });
  });
  it("sorterer på start, så spor", () => {
    const r = sorter([{ startDate: "2026-10-06", type: "TRENINGSSAMLING" }, { startDate: "2026-10-06", type: "EVALUERING" }, { startDate: "2026-08-03", type: "TURNERING" }]);
    assert.deepEqual(r.map((x) => x.type), ["TURNERING", "EVALUERING", "TRENINGSSAMLING"]);
  });
  it("etikett bruker ikke typenavnet to ganger", () => {
    assert.equal(periodeEtikett({ type: "GRUNN", focus: null }), "Grunnperiode");
    assert.equal(periodeEtikett({ type: "GRUNN", focus: "Styrke" }), "Grunnperiode · Styrke");
    assert.equal(periodeEtikett({ type: "GRUNN", focus: "Grunnperiode uke 46" }), "Grunnperiode uke 46");
  });
});
