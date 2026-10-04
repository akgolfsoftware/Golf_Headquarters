import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatClock,
  formatTimerOgMinutter,
  beregnProsent,
  erPutter,
  formatDesimal,
  DEFAULT_BAG_CLUBS,
} from "./ph04-07-data";

describe("ph04-07-data hjelpefunksjoner", () => {
  it("formaterer stoppeklokke mm:ss korrekt", () => {
    assert.equal(formatClock(0), "00:00");
    assert.equal(formatClock(59), "00:59");
    assert.equal(formatClock(60), "01:00");
    assert.equal(formatClock(1452), "24:12");
    assert.equal(formatClock(-10), "00:00");
  });

  it("formaterer timer og minutter korrekt", () => {
    assert.equal(formatTimerOgMinutter(0), "0 min");
    assert.equal(formatTimerOgMinutter(45), "45 min");
    assert.equal(formatTimerOgMinutter(60), "1 t");
    assert.equal(formatTimerOgMinutter(75), "1 t 15 min");
    assert.equal(formatTimerOgMinutter(120), "2 t");
  });

  it("beregner prosent korrekt og begrenser til [0, 100]", () => {
    assert.equal(beregnProsent(0, 50), 0);
    assert.equal(beregnProsent(25, 50), 50);
    assert.equal(beregnProsent(50, 50), 100);
    assert.equal(beregnProsent(60, 50), 100);
    assert.equal(beregnProsent(-10, 50), 0);
    assert.equal(beregnProsent(10, 0), 0);
  });

  it("identifiserer putter korrekt", () => {
    assert.equal(erPutter("P"), true);
    assert.equal(erPutter("p"), true);
    assert.equal(erPutter("PT"), true);
    assert.equal(erPutter("Putter"), true);
    assert.equal(erPutter("Dr"), false);
    assert.equal(erPutter("7I"), false);
    assert.equal(erPutter("PW"), false);
  });

  it("formaterer desimaler med komma", () => {
    assert.equal(formatDesimal(152.4, 1), "152,4");
    assert.equal(formatDesimal(1.48, 2), "1,48");
    assert.equal(formatDesimal(0, 1), "0,0");
  });

  it("har 14 standardkøller i DEFAULT_BAG_CLUBS", () => {
    assert.equal(DEFAULT_BAG_CLUBS.length, 14);
    assert.equal(DEFAULT_BAG_CLUBS.includes("Dr"), true);
    assert.equal(DEFAULT_BAG_CLUBS.includes("PW"), true);
    assert.equal(DEFAULT_BAG_CLUBS.includes("P"), true);
  });
});
