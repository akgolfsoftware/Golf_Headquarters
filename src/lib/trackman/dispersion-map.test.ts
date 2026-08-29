/**
 * Enhetstester for dispersion-map.ts (B7 — TrackMan DispersionMap).
 * Kjør med: npx tsx --test src/lib/trackman/dispersion-map.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  ONE_SIGMA_CONFIDENCE,
  TWO_SIGMA_CONFIDENCE,
  MIN_SHOTS_FOR_ELLIPSE,
  computeTrackManDispersionMap,
  generateCaddieSentence,
  type TrackManDispersionShot,
} from "./dispersion-map";

const naer = (faktisk: number, forventet: number, avvik: number, melding: string) =>
  assert.ok(
    Math.abs(faktisk - forventet) <= avvik,
    `${melding}: fikk ${faktisk}, forventet ${forventet} ±${avvik}`,
  );

function shot(i: number, side: number | null, carry: number | null, extra: Partial<TrackManDispersionShot> = {}): TrackManDispersionShot {
  return {
    id: `s${i}`,
    shotNumber: i,
    club: "7i",
    side,
    carryDistance: carry,
    totalDistance: carry,
    smashFactor: 1.38,
    launchAngle: 16,
    ...extra,
  };
}

describe("konfidensverdier", () => {
  it("1σ i 2D er 1 − e^(−0,5) ≈ 39,35 % (IKKE 68 %, IKKE 0,95)", () => {
    naer(ONE_SIGMA_CONFIDENCE, 0.393469, 1e-5, "1σ-konfidens");
    assert.notEqual(Math.round(ONE_SIGMA_CONFIDENCE * 100), 68);
    assert.notEqual(ONE_SIGMA_CONFIDENCE, 0.95);
  });

  it("2σ i 2D er 1 − e^(−2) ≈ 86,47 %", () => {
    naer(TWO_SIGMA_CONFIDENCE, 0.864665, 1e-5, "2σ-konfidens");
  });
});

describe("MIN_SHOTS_FOR_ELLIPSE-grensen (n<8)", () => {
  it("er 8 (TM-11/TM-08g)", () => {
    assert.equal(MIN_SHOTS_FOR_ELLIPSE, 8);
  });

  it("7 slag: ingen ellipse, prikker + forsiktig caddie-setning (TM-05a)", () => {
    const shots = Array.from({ length: 7 }, (_, i) => shot(i, 3, 150 + i));
    const r = computeTrackManDispersionMap(shots);
    assert.equal(r.n, 7);
    assert.equal(r.hasEllipse, false);
    assert.equal(r.oneSigmaEllipse, null);
    assert.equal(r.twoSigmaEllipse, null);
    // Under 8 slag tegnes ingen ellipse, men en tydelig bias gir likevel en
    // forsiktig setning uten sikt-korreksjon (TM-00 TmCaddieLeak / TM-05a).
    assert.equal(r.caddieSentence, "7 slag høyre. Median står — vent med å flytte siktet.");
    // Prikkene finnes fortsatt (topp-syn uten ellipse).
    assert.equal(r.shots.length, 7);
    for (const s of r.shots) assert.equal(s.bucket, null);
  });

  it("8 slag: ellipse tegnes", () => {
    const shots = Array.from({ length: 8 }, (_, i) => shot(i, 3, 150 + i));
    const r = computeTrackManDispersionMap(shots);
    assert.equal(r.n, 8);
    assert.equal(r.hasEllipse, true);
    assert.ok(r.oneSigmaEllipse);
    assert.ok(r.twoSigmaEllipse);
  });
});

describe("bøtte-klassifisering (innenfor 1σ / 1–2σ / utenfor 2σ)", () => {
  it("et jevnt spredt sett gir flest slag i good-bøtta", () => {
    // 10 slag tett rundt senter, 2 langt unna → outliers.
    const shots: TrackManDispersionShot[] = [
      ...Array.from({ length: 10 }, (_, i) => shot(i, (i % 2 === 0 ? 1 : -1) * 1.5, 150 + (i % 3))),
      shot(10, 20, 190), // langt unna
      shot(11, -20, 110), // langt unna
    ];
    const r = computeTrackManDispersionMap(shots);
    assert.equal(r.n, 12);
    assert.ok(r.hasEllipse);
    const disasterShots = r.shots.filter((s) => s.bucket === "disaster");
    assert.ok(disasterShots.length >= 1, "minst ett åpenbart uteliggende slag havner i disaster");
    naer(r.bucketShare.good + r.bucketShare.acceptable + r.bucketShare.disaster, 1, 1e-9, "bøttene summerer til 1");
  });
});

describe("meanCarry / medianCarry / offlineBias / oneSigmaRadius", () => {
  const shots: TrackManDispersionShot[] = [
    shot(0, -3, 210),
    shot(1, 5, 220),
    shot(2, 2, 215),
    shot(3, 3, 215),
    shot(4, 4, 218),
    shot(5, 1, 212),
    shot(6, -1, 214),
    shot(7, 6, 222),
  ];

  it("meanCarry og medianCarry regnes fra carryDistance", () => {
    const r = computeTrackManDispersionMap(shots);
    const carries = shots.map((s) => s.carryDistance!).sort((a, b) => a - b);
    const expectedMean = carries.reduce((a, b) => a + b, 0) / carries.length;
    naer(r.meanCarry!, expectedMean, 1e-9, "meanCarry");
    assert.equal(r.medianCarry, (carries[3] + carries[4]) / 2);
  });

  it("offlineBias = snitt side (samme som trackmanToPoints sin lateral)", () => {
    const r = computeTrackManDispersionMap(shots);
    const expected = shots.reduce((s, x) => s + x.side!, 0) / shots.length;
    naer(r.offlineBias!, expected, 1e-9, "offlineBias");
  });

  it("oneSigmaRadius er positiv og mindre enn 2σ sine halvakser", () => {
    const r = computeTrackManDispersionMap(shots);
    assert.ok(r.oneSigmaRadius! > 0);
    assert.ok(r.oneSigmaEllipse!.semiMajor < r.twoSigmaEllipse!.semiMajor);
    assert.ok(r.oneSigmaEllipse!.semiMinor < r.twoSigmaEllipse!.semiMinor);
    // 2σ skal være nøyaktig 2× 1σ sine akser (samme kovarians, k skalerer lineært).
    naer(r.twoSigmaEllipse!.semiMajor / r.oneSigmaEllipse!.semiMajor, 2, 1e-6, "2σ/1σ semiMajor-forhold");
    naer(r.twoSigmaEllipse!.semiMinor / r.oneSigmaEllipse!.semiMinor, 2, 1e-6, "2σ/1σ semiMinor-forhold");
  });
});

describe("generateCaddieSentence", () => {
  it("under 8 slag med tydelig bias: forsiktig variant uten sikt-korreksjon (TM-00/TM-05a)", () => {
    assert.equal(generateCaddieSentence(5, 7), "7 slag høyre. Median står — vent med å flytte siktet.");
  });

  it("TM-05a: nøyaktig to slag, spelt ut 'To slag'", () => {
    assert.equal(generateCaddieSentence(3.4, 2), "To slag høyre. Median står — vent med å flytte siktet.");
  });

  it("ett slag, spelt ut 'Ett slag'", () => {
    assert.equal(generateCaddieSentence(2, 1), "Ett slag høyre. Median står — vent med å flytte siktet.");
  });

  it("under 8 slag og under 1 m bias: for lite grunnlag, ingen setning", () => {
    assert.equal(generateCaddieSentence(0.5, 5), null);
  });

  it("null bias eller ukjent: ingen setning", () => {
    assert.equal(generateCaddieSentence(null, 20), null);
  });

  it("0 slag: ingen setning", () => {
    assert.equal(generateCaddieSentence(5, 0), null);
  });

  it("under 1 m bias: sentrert-setning uten sikt-korreksjon", () => {
    const s = generateCaddieSentence(0.5, 10);
    assert.match(s!, /midt på linja/);
  });

  it("høyre bias: 'Klyngen ligger X m høyre. Sikt X m venstre, samme sving.'", () => {
    const s = generateCaddieSentence(3.7, 10);
    assert.equal(s, "Klyngen ligger 3,7 m høyre. Sikt 4 m venstre, samme sving.");
  });

  it("venstre bias: motsatt retning", () => {
    const s = generateCaddieSentence(-4.6, 10);
    assert.equal(s, "Klyngen ligger 4,6 m venstre. Sikt 5 m høyre, samme sving.");
  });
});

describe("tomt/manglende slag", () => {
  it("0 slag gir n=0, ingen ellipse, ingen setning", () => {
    const r = computeTrackManDispersionMap([]);
    assert.equal(r.n, 0);
    assert.equal(r.hasEllipse, false);
    assert.equal(r.caddieSentence, null);
    assert.equal(r.meanCarry, null);
  });

  it("slag uten side/carry filtreres bort av trackmanToPoints", () => {
    const shots = [shot(0, null, 150), shot(1, 3, null), shot(2, 3, 150)];
    const r = computeTrackManDispersionMap(shots);
    assert.equal(r.n, 1);
    assert.equal(r.shots.length, 1);
  });
});
