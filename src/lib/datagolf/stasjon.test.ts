import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  STASJON_SLAG,
  byggStasjon,
  ferdigSetning,
  finnSlag,
  fmtLengde,
  sirkelAndreTak,
  type TakSnapshot,
} from "./stasjon";
import { fotTilMeter, rundMeter } from "./tak";

function takRory(): TakSnapshot {
  return {
    dgPlayerId: 10091,
    name: "Rory McIlroy",
    asOf: new Date("2026-09-07T14:03:51.000Z"),
    formLabel: "Tee og 200 m",
    drivingDistY: 21,
    drivingAcc: -0.03,
    bands: [
      { band: "innspill50", lie: "fairway", proximityMeters: fotTilMeter(17.08), sgPerShot: -0.033 },
      { band: "innspill100", lie: "fairway", proximityMeters: fotTilMeter(19.894), sgPerShot: 0.028 },
    ],
  };
}

describe("stasjon alle slag", () => {
  it("har 14 stasjoner — ikke styrke/bevegelighet/bane", () => {
    assert.equal(STASJON_SLAG.length, 14);
    assert.equal(STASJON_SLAG.some((s) => s.omraade.startsWith("STYRKE")), false);
  });

  it("innspill 100 med 50 m carry gir sirkel mot Rory", () => {
    const st = byggStasjon({
      slag: finnSlag("innspill100"),
      tak: takRory(),
      carryMeter: 50,
    });
    assert.equal(st.kind, "sirkel");
    assert.equal(st.stasjonVerdi, 50);
    assert.ok(st.maalVerdi != null);
    assert.equal(rundMeter(st.maalVerdi, 1), 2.7);
    assert.equal(st.manglerCarry, false);
    assert.equal(st.kilde, "datagolf");
  });

  it("uten carry: ærlig mangler, ingen oppdiktet sirkel", () => {
    const st = byggStasjon({
      slag: finnSlag("innspill100"),
      tak: takRory(),
      carryMeter: null,
    });
    assert.equal(st.manglerCarry, true);
    assert.equal(st.maalVerdi, null);
    assert.match(st.regel, /Mål carry/);
  });

  it("wedge-lekkasje merkes på innspill 50", () => {
    const st = byggStasjon({
      slag: finnSlag("innspill50"),
      tak: takRory(),
      carryMeter: 50,
    });
    assert.equal(st.lekkasje, true);
  });

  it("putting skalerer ikke — 10 ft er 8 ft stasjon, lag-putt i fot", () => {
    const st = byggStasjon({
      slag: finnSlag("putt5_10"),
      tak: takRory(),
      carryMeter: 50,
    });
    assert.equal(st.stasjonEnhet, "ft");
    assert.equal(st.kind, "lag_putt");
    assert.equal(st.kilde, "tour-putt");
    assert.equal(st.manglerCarry, false);
  });

  it("chip og bunker bruker tour-tabell, ikke tak-nærhet", () => {
    const chip = byggStasjon({ slag: finnSlag("chip"), tak: takRory(), carryMeter: null });
    const bunker = byggStasjon({ slag: finnSlag("bunker"), tak: takRory(), carryMeter: null });
    assert.equal(chip.kilde, "tour-arg");
    assert.equal(bunker.kilde, "tour-arg");
    assert.match(bunker.kildeTekst, /ikke Rory/);
  });

  it("tee krever carry og har ingen sirkel", () => {
    const st = byggStasjon({ slag: finnSlag("tee"), tak: takRory(), carryMeter: 140 });
    assert.equal(st.kind, "korridor");
    assert.equal(st.maalVerdi, null);
    assert.match(st.regel, /stripen/);
  });

  it("andre tak får sirkel på samme stasjon", () => {
    const scheffler: TakSnapshot = {
      ...takRory(),
      dgPlayerId: 18417,
      name: "Scottie Scheffler",
      bands: [{ band: "innspill100", lie: "fairway", proximityMeters: 5.7, sgPerShot: 0.05 }],
    };
    const rader = sirkelAndreTak({
      slag: finnSlag("innspill100"),
      carryMeter: 50,
      andre: [scheffler],
    });
    assert.equal(rader.length, 1);
    assert.ok(rader[0].sirkelMeter != null);
  });

  it("ferdig-setning uten medalje", () => {
    assert.equal(ferdigSetning(4, 10, "Rory McIlroy"), "Du slo Rory McIlroy på 4 av 10.");
    assert.equal(ferdigSetning(0, 10, "Rory McIlroy"), "Ingen inne — sirkelen mot Rory McIlroy står.");
  });

  it("fmtLengde bruker norsk komma", () => {
    assert.equal(fmtLengde(2.7, "m"), "2,7 m");
    assert.equal(fmtLengde(50, "m"), "50 m");
    assert.equal(fmtLengde(null, "m"), "mangler");
  });
});
