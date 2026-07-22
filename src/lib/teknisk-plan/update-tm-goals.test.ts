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
});
