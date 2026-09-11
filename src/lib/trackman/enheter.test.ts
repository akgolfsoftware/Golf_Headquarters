import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  erEnhetsrad,
  lesAvstandsenhet,
  lesEnheterFraFelt,
  lesEnheterFraRapporttekst,
  lesHastighetsenhet,
} from "./enheter";

describe("TrackMan-enheter", () => {
  it("leser eksplisitt m/s og mph, aldri fra tallstørrelse", () => {
    assert.equal(lesHastighetsenhet("Club Speed (m/s)"), "mps");
    assert.equal(lesHastighetsenhet("Club Speed (mph)"), "mph");
    assert.equal(lesHastighetsenhet("Club Speed"), "unknown");
    assert.equal(lesHastighetsenhet("70"), "unknown");
  });

  it("skiller meter og yards, og gjetter ikke 330 som yards", () => {
    assert.equal(lesAvstandsenhet("Carry (m)"), "m");
    assert.equal(lesAvstandsenhet("Total (yd)"), "yd");
    assert.equal(lesAvstandsenhet("Carry"), "unknown");
    assert.equal(lesAvstandsenhet("330"), "unknown");
  });

  it("kjenner igjen TrackMan-enhetsrad", () => {
    assert.equal(erEnhetsrad(["", "mph", "mph", "", "yd", "yd"]), true);
    assert.equal(erEnhetsrad(["7 Iron", "40", "55"]), false);
  });

  it("tar enhet fra hode eller enhetsrad", () => {
    assert.equal(lesEnheterFraFelt(["Club Speed (m/s)", "Carry (m)"], null, "speed"), "mps");
    assert.equal(lesEnheterFraFelt(["Club Speed (m/s)", "Carry (m)"], null, "distance"), "m");
    assert.equal(
      lesEnheterFraFelt(["Club Speed", "Carry"], ["mph", "yd"], "distance"),
      "yd",
    );
    assert.equal(lesEnheterFraFelt(["Club Speed", "Carry"], null, "speed"), "unknown");
  });

  it("leser enhet ved feltnavn i HTML-rapporttekst", () => {
    const t = "Club Speed mph Ball Speed mph Total Distance yd Carry m";
    const u = lesEnheterFraRapporttekst(t);
    assert.equal(u.speed, "mph");
    assert.equal(u.distance, "m");
  });
});
