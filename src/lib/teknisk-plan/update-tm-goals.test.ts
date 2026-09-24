import { describe, it } from "node:test";
import assert from "node:assert/strict";

function nums(values: (number | null)[]): number[] {
  return values.filter((n): n is number => typeof n === "number" && Number.isFinite(n));
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

function stddev(values: number[]): number | null {
  if (values.length === 0) return null;
  if (values.length === 1) return 0;
  const m = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((s, n) => s + (n - m) ** 2, 0) / (values.length - 1);
  return Math.round(Math.sqrt(variance) * 100) / 100;
}

describe("TM-mål aggregat (snitt/std)", () => {
  it("mean er snitt av alle slag, ikke siste", () => {
    const smash = [1.4, 1.5, 1.3];
    assert.equal(mean(smash), 1.4);
    assert.notEqual(mean(smash), 1.3);
  });

  it("std er sample standardavvik", () => {
    assert.equal(stddev([2, 4, 6]), 2);
  });

  it("én verdi gir std 0", () => {
    assert.equal(stddev([1.45]), 0);
  });

  it("filtrerer null", () => {
    assert.equal(mean(nums([1.4, null, 1.6])), 1.5);
  });

  it("regner korrekt for svingbane (club path) og blad mot bane (face to path)", () => {
    const paths = [2.2, 1.8, 2.0];
    assert.equal(mean(paths), 2.0);

    const faceToPath = [-1.5, -0.5, -1.0];
    assert.equal(mean(faceToPath), -1.0);
  });

  it("regner korrekt for angrepsvinkel (attack angle)", () => {
    const aoa = [-3.0, -4.0, -3.5];
    assert.equal(mean(aoa), -3.5);
  });
});
