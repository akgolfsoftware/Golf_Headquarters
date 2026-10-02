import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { klubbValg, anbefalt, MIN_SLAG } from "./slagvalg";
import { destinationPoint } from "./dispersion";

const tee = { lat: 59.2, lng: 10.9 };
const green = destinationPoint(tee, 0, 380);
const slag = (klubb: string | null, meter: number, side = 0) => ({ klubb, landing: destinationPoint(destinationPoint(tee, 0, meter), Math.PI / 2, side) });

describe("klubbValg", () => {
  it("grupperer per kølle og sorterer lengst carry først", () => {
    const v = klubbValg([slag("3W", 200), slag("Driver", 230), slag("Driver", 232), slag(null, 100)], tee, green, 380);
    assert.deepEqual(v.map((x) => x.klubb), ["Driver", "3W"]);
    assert.equal(v[0].n, 2);
    assert.equal(Math.round(v[0].carry), 231);
    assert.equal(Math.round(v[0].igjen), 149);
  });
  it("gir ikke spredning under minste antall slag", () => {
    const v = klubbValg([slag("Driver", 230), slag("Driver", 235)], tee, green, 380);
    assert.equal(v[0].sideSpredning, null);
    assert.equal(MIN_SLAG, 3);
  });
  it("regner to standardavvik sideveis", () => {
    const v = klubbValg([slag("Driver", 230, -10), slag("Driver", 230, 10), slag("Driver", 230, 10), slag("Driver", 230, -10)], tee, green, 380);
    assert.equal(Math.round(v[0].sideSpredning ?? 0), 20);
  });
});

describe("anbefalt", () => {
  const s = (k: string, meter: number) => [0, 1, 2].map(() => slag(k, meter));
  it("gir null uten køller med nok slag", () => {
    assert.equal(anbefalt(klubbValg([slag("Driver", 230)], tee, green, 380), 4, 380), null);
  });
  it("par 4 velger køllen som gir ca. 120 m igjen", () => {
    const v = klubbValg([...s("Driver", 280), ...s("3W", 260), ...s("5i", 170)], tee, green, 380);
    assert.equal(anbefalt(v, 4, 380), "3W");
  });
  it("par 3 velger køllen nærmest hullets lengde", () => {
    const v = klubbValg([...s("7i", 150), ...s("8i", 139), ...s("9i", 128)], tee, green, 140);
    assert.equal(anbefalt(v, 3, 140), "8i");
  });
});
