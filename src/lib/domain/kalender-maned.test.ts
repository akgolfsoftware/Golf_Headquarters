import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dagerIManed,
  manedEtikett,
  manedNokkel,
  manedsrutenett,
  parseManedParam,
  skiftManed,
} from "./kalender-maned";

describe("kalender-maned · parseManedParam", () => {
  it("leser YYYY-MM", () => {
    assert.deepEqual(parseManedParam("2026-08"), { aar: 2026, maaned: 8 });
  });

  it("avviser ugyldig", () => {
    assert.equal(parseManedParam("2026-13"), null);
    assert.equal(parseManedParam("august"), null);
    assert.equal(parseManedParam(undefined), null);
  });
});

describe("kalender-maned · skiftManed", () => {
  it("ruller over årsskiftet bakover og fremover", () => {
    assert.deepEqual(skiftManed(2026, 1, -1), { aar: 2025, maaned: 12 });
    assert.deepEqual(skiftManed(2026, 12, 1), { aar: 2027, maaned: 1 });
  });
});

describe("kalender-maned · manedsrutenett", () => {
  it("august 2026 starter mandag 27. juli og har 6 uker", () => {
    const r = manedsrutenett(2026, 8);
    assert.equal(r.length, 42);
    assert.equal(r.length % 7, 0);
    assert.equal(r[0]?.dato, "2026-07-27");
    assert.equal(r[0]?.iManed, false);
    assert.equal(r[5]?.dato, "2026-08-01");
    assert.equal(r[5]?.iManed, true);
    assert.equal(r[41]?.dato, "2026-09-06");
    assert.equal(r.filter((c) => c.iManed).length, 31);
  });

  it("februar i skuddår har 29 dager i rutenettet", () => {
    assert.equal(dagerIManed(2024, 2), 29);
    const r = manedsrutenett(2024, 2);
    assert.equal(r.filter((c) => c.iManed).length, 29);
    assert.equal(r.length % 7, 0);
  });
});

describe("kalender-maned · etikett", () => {
  it("norsk månedsnavn med stor forbokstav", () => {
    assert.equal(manedEtikett(2026, 8), "August 2026");
    assert.equal(manedNokkel(2026, 8), "2026-08");
  });
});
