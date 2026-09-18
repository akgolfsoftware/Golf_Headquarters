import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createSessionSeries,
  kategoriFraSnittscore,
  PERIOD_TYPES,
  rirSuggestion,
} from "./planning.ts";

describe("A–K uten alder", () => {
  it("85 is H, 72 is C, 100 is K", () => {
    assert.equal(kategoriFraSnittscore(85).kategori, "H");
    assert.equal(kategoriFraSnittscore(72).kategori, "C");
    assert.equal(kategoriFraSnittscore(100).kategori, "K");
    assert.equal(kategoriFraSnittscore(67).kategori, "A");
  });
});

describe("period types", () => {
  it("has eight labels", () => {
    assert.equal(PERIOD_TYPES.length, 8);
  });
});

describe("Apple series", () => {
  it("man/ons/fre × 8 weeks is 24 slots", () => {
    const slots = createSessionSeries("2026-09-14", [0, 2, 4], 8);
    assert.equal(slots.length, 24);
    assert.equal(slots[0].date, "2026-09-14");
    assert.equal(slots[1].date, "2026-09-16");
    assert.equal(slots[23].date, "2026-11-06");
  });
});

describe("RIR", () => {
  it("suggests +5 kg when RIR is 4", () => {
    assert.equal(rirSuggestion(100, 4), 105);
  });
});
