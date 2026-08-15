import { test } from "node:test";
import assert from "node:assert/strict";

import { computeDPlane, DPLANE_LABELS } from "@/lib/sg-hub/d-plane";
import type { ShotData } from "@/lib/sg-hub/extract-shots";

/**
 * Ett slag der kun kølleflate og bane betyr noe. TOLERANCE i d-plane.ts er
 * 0,5° — testene under ligger bevisst på begge sider av den grensa.
 */
function slag(faceAngle: number, clubPath: number, shotNumber = 1): ShotData {
  return {
    shotNumber,
    clubSpeed: 40,
    clubPath,
    faceAngle,
    faceToPath: faceAngle - clubPath,
    smashFactor: 1.4,
    ballSpeed: 60,
    totalDistance: 150,
  };
}

/** Klassifiseringen av ett enkelt slag. */
function klasse(faceAngle: number, clubPath: number) {
  return computeDPlane([slag(faceAngle, clubPath)]).points[0].classification;
}

// -------------------------------------------------------------- tom input

test("tom skuddliste gir STRAIGHT og 0 % konsistens", () => {
  const r = computeDPlane([]);
  assert.deepEqual(r.points, []);
  assert.equal(r.dominantClass, "STRAIGHT");
  assert.equal(r.consistencyPct, 0);
});

// --------------------------------------------------------- klassifisering

test("flate og bane innenfor toleransen er STRAIGHT", () => {
  assert.equal(klasse(0, 0), "STRAIGHT");
  assert.equal(klasse(0.3, -0.4), "STRAIGHT");
});

test("de fire kombinasjonene av flate og bane", () => {
  assert.equal(klasse(-2, -2), "PULL_HOOK", "flate venstre, bane venstre");
  assert.equal(klasse(-2, 2), "PULL_FADE", "flate venstre, bane høyre");
  assert.equal(klasse(2, -2), "PUSH_DRAW", "flate høyre, bane venstre");
  assert.equal(klasse(2, 2), "PUSH_FADE", "flate høyre, bane høyre");
});

/**
 * Grensa er inklusiv: |vinkel| <= 0,5 regnes som rett. Nøyaktig 0,5 skal
 * altså IKKE klassifiseres som utslag.
 */
test("nøyaktig på toleransegrensa regnes som rett", () => {
  assert.equal(klasse(0.5, 0.5), "STRAIGHT");
  assert.equal(klasse(-0.5, -0.5), "STRAIGHT");
});

test("så vidt utenfor toleransegrensa gir utslag", () => {
  assert.equal(klasse(0.51, 0.51), "PUSH_FADE");
  assert.equal(klasse(-0.51, -0.51), "PULL_HOOK");
});

/**
 * Er bare den ene av de to innenfor toleransen, faller slaget til «høyre»-
 * grenen for den aksen — fordi `faceLeft`/`pathLeft` krever < -TOLERANCE.
 * En rett flate med bane til venstre blir derfor PUSH_DRAW, ikke STRAIGHT.
 */
test("rett flate med bane til venstre er PUSH_DRAW", () => {
  assert.equal(klasse(0, -3), "PUSH_DRAW");
});

test("rett bane med flate til venstre er PULL_FADE", () => {
  assert.equal(klasse(-3, 0), "PULL_FADE");
});

// ------------------------------------------------- dominans og konsistens

test("dominerende klasse er den hyppigste", () => {
  const r = computeDPlane([
    slag(-2, -2, 1),
    slag(-2, -2, 2),
    slag(-2, -2, 3),
    slag(2, 2, 4),
  ]);

  assert.equal(r.dominantClass, "PULL_HOOK");
  assert.equal(r.consistencyPct, 75, "3 av 4");
});

test("alle slag i samme klasse gir 100 % konsistens", () => {
  const r = computeDPlane([slag(-2, -2, 1), slag(-3, -3, 2)]);
  assert.equal(r.dominantClass, "PULL_HOOK");
  assert.equal(r.consistencyPct, 100);
});

test("ett slag gir 100 % konsistens", () => {
  const r = computeDPlane([slag(2, 2)]);
  assert.equal(r.dominantClass, "PUSH_FADE");
  assert.equal(r.consistencyPct, 100);
});

/**
 * Ved likt antall vinner klassen som ble sett FØRST — opptellingen bruker
 * `count > maxCount`, ikke `>=`. Låser oppførselen så en refaktorering ikke
 * stille bytter hvilken klasse som vises ved uavgjort.
 */
test("uavgjort: første observerte klasse vinner", () => {
  const r = computeDPlane([slag(-2, -2, 1), slag(2, 2, 2)]);
  assert.equal(r.dominantClass, "PULL_HOOK");
  assert.equal(r.consistencyPct, 50);
});

test("punktlista beholder skuddnummer og måleverdier", () => {
  const r = computeDPlane([slag(-1.5, 2.5, 7)]);
  const p = r.points[0];

  assert.equal(p.shotNumber, 7);
  assert.equal(p.faceAngle, -1.5);
  assert.equal(p.clubPath, 2.5);
  assert.equal(p.classification, "PULL_FADE");
});

test("alle klasser har en etikett", () => {
  for (const k of ["PULL_HOOK", "PULL_FADE", "PUSH_DRAW", "PUSH_FADE", "STRAIGHT"] as const) {
    assert.ok(DPLANE_LABELS[k], `${k} mangler etikett`);
  }
});
