import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { gyldigeEndShotKategorier } from "@/lib/runde-logg/end-shot-kategori";

describe("gyldigeEndShotKategorier", () => {
  it("tee-slag uten straffe gir tre miss-kategorier", () => {
    assert.deepEqual(gyldigeEndShotKategorier("DRIVE", false), [
      "IN_PLAY",
      "MINOR_MISS",
      "MAJOR_MISS",
    ]);
  });

  it("approach/chip/pitch/bunker/recovery uten straffe gir seks kategorier", () => {
    for (const shotType of ["APPROACH", "CHIP", "PITCH", "BUNKER", "RECOVERY"] as const) {
      assert.deepEqual(gyldigeEndShotKategorier(shotType, false), [
        "GREEN_HIT",
        "LETT",
        "MIDDELS",
        "VANSKELIG",
      ]);
    }
  });

  it("straffe overstyrer til kun de to penalty-kategoriene, uansett slagtype", () => {
    assert.deepEqual(gyldigeEndShotKategorier("DRIVE", true), ["PENALTY_1", "PENALTY_2"]);
    assert.deepEqual(gyldigeEndShotKategorier("APPROACH", true), ["PENALTY_1", "PENALTY_2"]);
  });

  it("PUTT og DROP har ingen gyldige end-shot-kategorier", () => {
    assert.deepEqual(gyldigeEndShotKategorier("PUTT", false), []);
    assert.deepEqual(gyldigeEndShotKategorier("DROP", false), []);
  });
});
