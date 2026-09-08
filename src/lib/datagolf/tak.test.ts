import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  bandFraApproachRad,
  bandMidtMeter,
  fotTilMeter,
  rundMeter,
  slaTakSirkelMeter,
  visningsnavnFraDataGolf,
} from "./tak";
import { TAK_ROSTER, TAK_ROSTER_IDS } from "./tak-roster";

describe("tak-pakke", () => {
  it("har de seks første navnene", () => {
    assert.equal(TAK_ROSTER.length, 6);
    assert.ok(TAK_ROSTER_IDS.has(18417));
    assert.ok(TAK_ROSTER_IDS.has(10091));
    assert.ok(TAK_ROSTER_IDS.has(18841));
    assert.ok(TAK_ROSTER_IDS.has(21407));
    assert.ok(TAK_ROSTER_IDS.has(23950));
    assert.ok(TAK_ROSTER_IDS.has(19195));
  });

  it("snur DataGolf-navn til visning", () => {
    assert.equal(visningsnavnFraDataGolf("McIlroy, Rory"), "Rory McIlroy");
    assert.equal(visningsnavnFraDataGolf("Scheffler, Scottie"), "Scottie Scheffler");
    assert.equal(visningsnavnFraDataGolf("Hovland, Viktor"), "Viktor Hovland");
  });

  it("omregner fot til meter", () => {
    assert.equal(rundMeter(fotTilMeter(19.894), 1), 6.1);
  });

  it("skalerer sirkel mot båndets midtpunkt (50 m carry ≈ 2,7 m)", () => {
    const takNaerhet = fotTilMeter(19.894);
    const takSlag = bandMidtMeter(100, 150);
    const sirkel = slaTakSirkelMeter({
      takNaerhetMeter: takNaerhet,
      elevCarryMeter: 50,
      takSlagMeter: takSlag,
    });
    assert.ok(sirkel !== null);
    assert.equal(rundMeter(sirkel, 1), 2.7);
  });

  it("mapper Rory-innspill fra DataGolf-fot til meter", () => {
    const bands = bandFraApproachRad({
      dg_id: 10091,
      "100_150_fw_proximity_per_shot": 19.894,
      "100_150_fw_sg_per_shot": 0.028,
    });
    const inn100 = bands.find((b) => b.band === "innspill100" && b.lie === "fairway");
    assert.ok(inn100);
    assert.equal(rundMeter(inn100.proximityMeters ?? 0, 1), 6.1);
    assert.equal(inn100.sgPerShot, 0.028);
  });

  it("gir null uten carry", () => {
    assert.equal(
      slaTakSirkelMeter({
        takNaerhetMeter: 6.1,
        elevCarryMeter: 0,
        takSlagMeter: 114,
      }),
      null,
    );
  });
});
