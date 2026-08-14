import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  periodeForDato,
  vurderKollisjon,
  sesongvindu,
  prosentAvVindu,
  dagerMellom,
  vinduMaaneder,
  datoSpenn,
  type PeriodeBlokk,
} from "@/lib/workbench/turnering-plan";

const label = (l: string) => l;

/** Skoleåret 2026/2027 slik fasiten tegner det. */
const BLOKKER: PeriodeBlokk[] = [
  { lPhase: "TURNERING", startDate: "2026-08-17", endDate: "2026-09-30" },
  { lPhase: "GRUNN", startDate: "2026-10-01", endDate: "2027-03-15" },
  { lPhase: "TESTUKE", startDate: "2026-10-19", endDate: "2026-10-25" },
  { lPhase: "SPESIAL", startDate: "2027-03-16", endDate: "2027-04-30" },
  { lPhase: "TURNERING", startDate: "2027-05-01", endDate: "2027-06-18" },
];

describe("periodeForDato", () => {
  it("finner hovedperioden en dato ligger i", () => {
    assert.equal(periodeForDato("2026-08-29", BLOKKER)?.lPhase, "TURNERING");
    assert.equal(periodeForDato("2026-11-10", BLOKKER)?.lPhase, "GRUNN");
  });
  it("hopper over TESTUKE som hovedperiode — GRUNN eier datoen", () => {
    assert.equal(periodeForDato("2026-10-21", BLOKKER)?.lPhase, "GRUNN");
  });
  it("null utenfor alle perioder", () => {
    assert.equal(periodeForDato("2027-07-15", BLOKKER), null);
  });
});

describe("vurderKollisjon", () => {
  it("ingen kollisjon i turneringsperiode", () => {
    const v = vurderKollisjon("2026-09-12", BLOKKER, label);
    assert.equal(v.ja, false);
  });
  it("kollisjon i GRUNN med periodenavn i grunnen", () => {
    const v = vurderKollisjon("2026-11-10", BLOKKER, label);
    assert.equal(v.ja, true);
    assert.match(v.ja ? v.grunn : "", /GRUNN/);
  });
  it("testuka slår gjennom selv om GRUNN også dekker datoen", () => {
    const v = vurderKollisjon("2026-10-21", BLOKKER, label);
    assert.equal(v.ja, true);
    assert.match(v.ja ? v.grunn : "", /testuka/);
  });
  it("utenfor sesongplanen er en kollisjon", () => {
    const v = vurderKollisjon("2027-07-15", BLOKKER, label);
    assert.equal(v.ja, true);
    assert.match(v.ja ? v.grunn : "", /utenfor/);
  });
  it("uten periodisering: ingen kollisjon, ingen periode (ærlig ukjent)", () => {
    const v = vurderKollisjon("2026-09-12", [], label);
    assert.equal(v.ja, false);
    assert.equal(v.periode, null);
  });
});

describe("sesongvindu + prosentAvVindu", () => {
  it("spenner fra første til siste blokk", () => {
    const v = sesongvindu(BLOKKER);
    assert.deepEqual(v, { fra: "2026-08-17", til: "2027-06-18" });
  });
  it("null uten blokker", () => {
    assert.equal(sesongvindu([]), null);
  });
  it("prosent klemmes til 0–100", () => {
    const v = sesongvindu(BLOKKER)!;
    assert.equal(prosentAvVindu("2026-08-17", v), 0);
    assert.equal(prosentAvVindu("2027-06-18", v), 100);
    assert.equal(prosentAvVindu("2020-01-01", v), 0);
    const midt = prosentAvVindu("2026-12-31", v);
    assert.ok(midt > 30 && midt < 60, `midt=${midt}`);
  });
});

describe("dagerMellom", () => {
  it("teller hele dager, også over DST-overgangen i oktober", () => {
    assert.equal(dagerMellom("2026-08-02", "2026-08-29"), 27);
    assert.equal(dagerMellom("2026-10-24", "2026-10-26"), 2);
    assert.equal(dagerMellom("2026-09-12", "2026-09-12"), 0);
  });
});

describe("vinduMaaneder", () => {
  it("én etikett per kalendermåned i vinduet", () => {
    const m = vinduMaaneder({ fra: "2026-08-17", til: "2027-06-18" });
    assert.equal(m[0], "aug");
    assert.equal(m[m.length - 1], "jun");
    assert.equal(m.length, 11);
  });
});

describe("datoSpenn", () => {
  it("én dato når fra = til", () => {
    assert.equal(datoSpenn("2026-08-29", "2026-08-29"), "29. aug");
  });
  it("spenn ellers", () => {
    assert.equal(datoSpenn("2026-08-29", "2026-08-30"), "29. aug–30. aug");
  });
});
