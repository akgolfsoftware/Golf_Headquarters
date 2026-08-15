import { test } from "node:test";
import assert from "node:assert/strict";

import { computeSmashCurve } from "@/lib/sg-hub/smash-curve";
import type { ShotData } from "@/lib/sg-hub/extract-shots";

function slag(clubSpeed: number, smashFactor: number, shotNumber = 1): ShotData {
  return {
    shotNumber,
    clubSpeed,
    clubPath: 0,
    faceAngle: 0,
    faceToPath: 0,
    smashFactor,
    ballSpeed: clubSpeed * smashFactor,
    totalDistance: 150,
  };
}

/**
 * Punkter som ligger EKSAKT på parabelen y = -0.001x² + 0.2x - 8.5,
 * med toppunkt i x = 100. Minste kvadraters metode gjenskaper en eksakt
 * parabel uten residual, så optimum skal treffe 100.
 */
const PARABEL = [
  slag(90, 1.4, 1),
  slag(95, 1.475, 2),
  slag(100, 1.5, 3),
  slag(105, 1.475, 4),
  slag(110, 1.4, 5),
];

// ------------------------------------------------------ for lite datagrunnlag

test("tom skuddliste gir nullstilt resultat", () => {
  const r = computeSmashCurve([]);
  assert.deepEqual(r.points, []);
  assert.equal(r.optimumSpeed, 0);
  assert.deepEqual(r.curvePoints, []);
  assert.equal(r.aboveOptimumPct, 0);
});

test("under tre slag gir ingen kurve — en parabel trenger tre punkter", () => {
  const r = computeSmashCurve([slag(95, 1.4), slag(100, 1.45)]);
  assert.equal(r.points.length, 2, "punktene vises fortsatt");
  assert.equal(r.optimumSpeed, 0, "men optimum kan ikke beregnes");
  assert.deepEqual(r.curvePoints, []);
});

test("ugyldige slag filtreres bort før antallssjekken", () => {
  // Fire slag inn, men bare to har både fart og smash > 0.
  const r = computeSmashCurve([
    slag(95, 1.4),
    slag(0, 1.4),
    slag(100, 0),
    slag(105, 1.45),
  ]);
  assert.equal(r.points.length, 2);
  assert.equal(r.optimumSpeed, 0);
});

// --------------------------------------------------------------- kurvetilpass

test("optimum treffer toppunktet på en eksakt parabel", () => {
  const r = computeSmashCurve(PARABEL);
  assert.ok(
    Math.abs(r.optimumSpeed - 100) < 0.2,
    `forventet optimum ~100, fikk ${r.optimumSpeed}`,
  );
});

test("kurven har 20 punkter og spenner hele måleområdet", () => {
  const r = computeSmashCurve(PARABEL);

  assert.equal(r.curvePoints.length, 20);
  assert.equal(r.curvePoints[0].clubSpeed, 90, "starter på laveste målte fart");
  assert.equal(r.curvePoints[19].clubSpeed, 110, "slutter på høyeste");
});

test("kurven gjenskaper de målte smash-verdiene", () => {
  const r = computeSmashCurve(PARABEL);

  // Første og siste kurvepunkt faller sammen med et faktisk målt slag.
  assert.ok(Math.abs(r.curvePoints[0].smashFactor - 1.4) < 0.01);
  assert.ok(Math.abs(r.curvePoints[19].smashFactor - 1.4) < 0.01);
});

test("andel over optimum telles mot beregnet optimum", () => {
  const r = computeSmashCurve(PARABEL);
  // 105 og 110 ligger over optimum på 100 → 2 av 5.
  assert.equal(r.aboveOptimumPct, 40);
});

test("optimum klemmes inn i det målte fartsområdet", () => {
  // Monotont stigende data — toppunktet ligger langt utenfor målingene.
  const r = computeSmashCurve([
    slag(90, 1.2, 1),
    slag(95, 1.3, 2),
    slag(100, 1.4, 3),
    slag(105, 1.5, 4),
  ]);

  assert.ok(r.optimumSpeed >= 90, "aldri under laveste målte fart");
  assert.ok(r.optimumSpeed <= 105, "aldri over høyeste målte fart");
});

test("punktlista speiler de gyldige slagene", () => {
  const r = computeSmashCurve(PARABEL);

  assert.equal(r.points.length, 5);
  assert.deepEqual(
    r.points.map((p) => p.clubSpeed),
    [90, 95, 100, 105, 110],
  );
});

/**
 * REGRESJON: med null spredning i kølle-fart blir normalligningene singulære.
 * Gauss-elimineringen delte da på 0, og NaN forplantet seg til optimumSpeed og
 * alle 20 kurvepunktene — grafen viste NaN i stedet for en tom tilstand.
 */
test("alle like fartsverdier gir et tall, aldri NaN", () => {
  const r = computeSmashCurve([slag(100, 1.4, 1), slag(100, 1.45, 2), slag(100, 1.5, 3)]);

  assert.ok(Number.isFinite(r.optimumSpeed), "optimum skal være et tall");
  assert.equal(r.optimumSpeed, 100, "farten slagene faktisk ble slått i");
  assert.ok(Number.isFinite(r.aboveOptimumPct));
  assert.deepEqual(r.curvePoints, [], "ingen spredning = ingen kurve å tegne");
  assert.equal(r.points.length, 3, "slagene vises fortsatt som punkter");
});
