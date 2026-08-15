import { test } from "node:test";
import assert from "node:assert/strict";

import { computeTempo, TEMPO_OPTIMAL_RATIO } from "@/lib/sg-hub/tempo";
import type { ShotData } from "@/lib/sg-hub/extract-shots";

/**
 * Ett slag med gitt tempo-ratio. Downswing holdes fast på 0,25 s, så
 * backswing bærer hele forholdet — ratio = backswing / downswing.
 */
function slag(ratio: number | null, shotNumber = 1): ShotData {
  const base: ShotData = {
    shotNumber,
    clubSpeed: 40,
    clubPath: 0,
    faceAngle: 0,
    faceToPath: 0,
    smashFactor: 1.4,
    ballSpeed: 60,
    totalDistance: 150,
  };
  if (ratio === null) return base;
  return { ...base, backswingTime: ratio * 0.25, downswingTime: 0.25 };
}

// -------------------------------------------------------------- manglende data

test("uten tempo-data er hasData false", () => {
  const r = computeTempo([slag(null, 1), slag(null, 2)]);

  assert.equal(r.hasData, false);
  assert.deepEqual(r.points, []);
  assert.equal(r.avgRatio, 0);
  assert.equal(r.sigmaRatio, 0);
  assert.equal(r.variancePct, 0);
  assert.equal(r.consistencyPct, 0);
});

test("tom skuddliste gir hasData false", () => {
  assert.equal(computeTempo([]).hasData, false);
});

test("slag med 0 i svingtid regnes som manglende data", () => {
  const r = computeTempo([
    { ...slag(3, 1), backswingTime: 0 },
    { ...slag(3, 2), downswingTime: 0 },
  ]);
  assert.equal(r.hasData, false);
});

test("slag uten tempo filtreres bort, resten beholdes", () => {
  const r = computeTempo([slag(3, 1), slag(null, 2), slag(3, 3)]);

  assert.equal(r.hasData, true);
  assert.equal(r.points.length, 2, "kun de to med tempo-data");
});

// ------------------------------------------------------------------- beregning

test("identiske svinger gir null spredning og 100 % konsistens", () => {
  const r = computeTempo([slag(3, 1), slag(3, 2), slag(3, 3)]);

  assert.equal(r.hasData, true);
  assert.equal(r.avgRatio, 3);
  assert.equal(r.sigmaRatio, 0);
  assert.equal(r.variancePct, 0);
  assert.equal(r.consistencyPct, 100);
});

test("ett slag gir 100 % konsistens og ingen spredning", () => {
  const r = computeTempo([slag(3.2)]);

  assert.equal(r.avgRatio, 3.2);
  assert.equal(r.sigmaRatio, 0);
  assert.equal(r.consistencyPct, 100);
});

test("avgRatio er snittet av de faktiske forholdstallene", () => {
  const r = computeTempo([slag(2.8, 1), slag(3.2, 2)]);
  assert.equal(r.avgRatio, 3);
});

test("ratio rapporteres per slag, avrundet til to desimaler", () => {
  const r = computeTempo([slag(3, 1), slag(3.6, 2)]);
  assert.deepEqual(
    r.points.map((p) => p.ratio),
    [3, 3.6],
  );
});

test("punktene beholder skuddnummer og smash", () => {
  const r = computeTempo([slag(3, 42)]);
  assert.equal(r.points[0].shotNumber, 42);
  assert.equal(r.points[0].smashFactor, 1.4);
});

// ----------------------------------------------------------------------- soner

/**
 * Sonene måles som avvik fra spillerens EGET snitt, ikke fra 3:1 — under 5 %
 * er grønt, under 10 % gult, ellers rødt. Med snitt 3,15 ligger 3,0 på 4,8 %
 * (grønn) og 3,6 på 14,3 % (rød).
 */
test("soner klassifiseres mot snittet, ikke mot idealet", () => {
  const r = computeTempo([slag(3, 1), slag(3, 2), slag(3, 3), slag(3.6, 4)]);

  assert.equal(r.avgRatio, 3.15);
  assert.deepEqual(
    r.points.map((p) => p.zone),
    ["GREEN", "GREEN", "GREEN", "RED"],
  );
  assert.equal(r.consistencyPct, 75, "3 av 4 grønne");
});

test("jevn, men ikke ideell tempo gir likevel 100 % konsistens", () => {
  // Alle slag på 2:1 — langt fra idealet 3:1, men helt konsistent.
  const r = computeTempo([slag(2, 1), slag(2, 2), slag(2, 3)]);

  assert.equal(r.avgRatio, 2);
  assert.equal(r.consistencyPct, 100);
  assert.notEqual(r.avgRatio, TEMPO_OPTIMAL_RATIO);
});

test("stor spredning gir høy variansprosent og lav konsistens", () => {
  const r = computeTempo([slag(2, 1), slag(4, 2)]);

  assert.equal(r.avgRatio, 3);
  assert.ok(r.variancePct > 10, `forventet stor varians, fikk ${r.variancePct}`);
  assert.equal(r.consistencyPct, 0);
});

test("variancePct er sigma i prosent av snittet", () => {
  const r = computeTempo([slag(2, 1), slag(4, 2)]);
  // σ = 1 (populasjon), snitt = 3 → 33,3 %
  assert.equal(r.sigmaRatio, 1);
  assert.equal(r.variancePct, 33.3);
});
