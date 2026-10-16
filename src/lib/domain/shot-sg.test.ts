import assert from "node:assert/strict";
import { test } from "node:test";
import { generateSgBaselineSeed, SG_LIE_TYPES } from "./sg-baseline-seed";
import { calculateShotSG, expectedStrokesAt, StrokesGainedCalculator } from "./shot-sg";

test("seed har 0–500 m i 10-meterssteg for alle seks lies og ekstra puttepunkter", () => {
  const rows = generateSgBaselineSeed();
  assert.equal(rows.length, 321);
  for (const lie of SG_LIE_TYPES) {
    for (let distance = 0; distance <= 500; distance += 10) {
      assert.equal(rows.filter((row) => row.lieType === lie && row.distanceMeters === distance).length, 1);
    }
  }
  const longPutt = rows.find((row) => row.lieType === "Green" && row.distanceMeters === 500);
  assert.equal(longPutt?.isSupported, false);
  assert.equal(longPutt?.expectedStrokes, null);
});

test("meter omregnes fra Broadies yards: 150 m gir ca. 3,00 fairway og 3,25 rough", () => {
  assert.ok(Math.abs(expectedStrokesAt(150, "Fairway") - 3.00) < 0.01);
  assert.ok(Math.abs(expectedStrokesAt(150, "Rough") - 3.25) < 0.01);
  assert.ok(Math.abs(expectedStrokesAt(10, "Green") - 2.01) < 0.01);
});

test("interpolerer mellom lagrede meterrader", () => {
  const at150 = expectedStrokesAt(150, "Fairway");
  const at160 = expectedStrokesAt(160, "Fairway");
  assert.equal(expectedStrokesAt(155, "Fairway"), (at150 + at160) / 2);
});

test("hole-out, straffeslag og additivitet følger SG-formelen", () => {
  const tee = expectedStrokesAt(350, "Tee");
  const first = calculateShotSG(350, "Tee", 150, "Fairway");
  const second = calculateShotSG(150, "Fairway", 10, "Green");
  const third = calculateShotSG(10, "Green", 0, "Green");
  assert.ok(Math.abs(first + second + third - (tee - 3)) < 1e-10);
  assert.equal(calculateShotSG(10, "Green", 0, "Green", 1), third - 1);
  assert.equal(expectedStrokesAt(0, "Green"), 0);
  assert.ok(expectedStrokesAt(0.1, "Green") >= 1);
});

test("ugyldige avstander, straffer og udokumentert langputt stoppes", () => {
  assert.throws(() => calculateShotSG(-1, "Fairway", 0, "Green"), RangeError);
  assert.throws(() => calculateShotSG(0, "Green", 0, "Green"), RangeError);
  assert.throws(() => calculateShotSG(50, "Fairway", 0, "Green", -1), RangeError);
  assert.throws(() => calculateShotSG(50, "Fairway", 0, "Green", 0.5), RangeError);
  assert.throws(() => expectedStrokesAt(31, "Green"), RangeError);
  assert.throws(() => expectedStrokesAt(Number.NaN, "Rough"), RangeError);
});

test("kalkulatoren kan bruke innlastede databaserader", () => {
  const calculator = new StrokesGainedCalculator(generateSgBaselineSeed());
  assert.equal(calculator.calculateShotSG(150, "Fairway", 10, "Green"), calculateShotSG(150, "Fairway", 10, "Green"));
  assert.throws(
    () => new StrokesGainedCalculator(generateSgBaselineSeed().filter((row) => row.lieType !== "Rough" || row.distanceMeters !== 150)),
    /Manglende SG-punkt/,
  );
});
