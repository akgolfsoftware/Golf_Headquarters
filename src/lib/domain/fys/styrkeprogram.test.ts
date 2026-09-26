import test from "node:test";
import assert from "node:assert/strict";
import {
  beregnStyrkeprogram,
  trengerNedtrapping,
  avrundVektKg,
  beregnEstimert1RM,
  beregnMalbane,
} from "./styrkeprogram";

test("avrundVektKg runder til nærmeste 2.5 kg", () => {
  assert.equal(avrundVektKg(71.2), 70);
  assert.equal(avrundVektKg(71.3), 72.5);
  assert.equal(avrundVektKg(72.5), 72.5);
  assert.equal(avrundVektKg(73.74), 72.5);
  assert.equal(avrundVektKg(73.76), 75);
});

test("trengerNedtrapping håndterer terskler og manglende data korrekt", () => {
  // Markløft terskel = 1.0
  assert.equal(trengerNedtrapping("MARKLOFT", 65, 70), true); // 65/70 = 0.93 < 1.0
  assert.equal(trengerNedtrapping("MARKLOFT", 70, 70), false); // 70/70 = 1.0 (ikke under)
  assert.equal(trengerNedtrapping("MARKLOFT", 80, 70), false); // 80/70 = 1.14

  // Benkpress terskel = 0.8
  assert.equal(trengerNedtrapping("BENKPRESS", 50, 70), true); // 50/70 = 0.71 < 0.8
  assert.equal(trengerNedtrapping("BENKPRESS", 56, 70), false); // 56/70 = 0.80 (ikke under)
  assert.equal(trengerNedtrapping("BENKPRESS", 60, 70), false);

  // Knebøy terskel = 1.0
  assert.equal(trengerNedtrapping("KNEBOY", 68, 70), true);
  assert.equal(trengerNedtrapping("KNEBOY", 75, 70), false);

  // Manglende data skal ALDRI gjette nedtrapping (TruthLayer)
  assert.equal(trengerNedtrapping("MARKLOFT", null, 70), false);
  assert.equal(trengerNedtrapping("MARKLOFT", 70, null), false);
  assert.equal(trengerNedtrapping("MARKLOFT", null, null), false);
});

test("beregnStyrkeprogram genererer 6 uker med 3 perioder", () => {
  const uker = beregnStyrkeprogram({
    loft: "MARKLOFT",
    ettRepMaksKg: 100,
    kroppsvektKg: 75, // 100/75 = 1.33 > 1.0 -> bølge
  });

  assert.equal(uker.length, 6);

  // Periode 1: uke 1-2
  assert.equal(uker[0].periode, 1);
  assert.equal(uker[0].sett.length, 3);
  assert.equal(uker[0].erNedtrapping, false);
  // Uke 1: 70%, 72.5%, 75% -> 70 kg, 72.5 kg, 75 kg
  assert.equal(uker[0].sett[0].belastningPst, 70);
  assert.equal(uker[0].sett[0].belastningKg, 70);
  assert.equal(uker[0].sett[1].belastningPst, 72.5);
  assert.equal(uker[0].sett[1].belastningKg, 72.5);
  assert.equal(uker[0].sett[2].belastningPst, 75);
  assert.equal(uker[0].sett[2].belastningKg, 75);

  // Uke 2: 72.5%, 75%, 77.5%
  assert.equal(uker[1].periode, 1);
  assert.equal(uker[1].sett[0].belastningKg, 72.5);
  assert.equal(uker[1].sett[2].belastningKg, 77.5);

  // Periode 2: uke 3-4
  assert.equal(uker[2].periode, 2);
  assert.equal(uker[3].periode, 2);

  // Periode 3: uke 5-6 (Bølge)
  assert.equal(uker[4].periode, 3);
  assert.equal(uker[4].sett.length, 6);
  assert.equal(uker[4].erNedtrapping, false);
  // Bølge 1: 80, 82.5, 85
  assert.equal(uker[4].sett[0].belastningPst, 80);
  assert.equal(uker[4].sett[2].belastningPst, 85);
  // Bølge 2: 82.5, 85, 87.5
  assert.equal(uker[4].sett[3].belastningPst, 82.5);
  assert.equal(uker[4].sett[5].belastningPst, 87.5);

  // Uke 6 bølge
  assert.equal(uker[5].sett.length, 6);
  assert.equal(uker[5].sett[5].belastningPst, 90);
  assert.equal(uker[5].sett[5].belastningKg, 90);
});

test("beregnStyrkeprogram aktiverer nedtrapping for svakere utøvere i uke 5-6", () => {
  const uker = beregnStyrkeprogram({
    loft: "MARKLOFT",
    ettRepMaksKg: 60,
    kroppsvektKg: 70, // 60/70 = 0.85 < 1.0 -> nedtrapping
  });

  assert.equal(uker[4].erNedtrapping, true);
  assert.equal(uker[4].sett.length, 3);
  assert.equal(uker[4].sett[0].belastningPst, 78);
  assert.equal(uker[4].sett[0].reps, 5);
  assert.equal(uker[4].sett[1].belastningPst, 80);
  assert.equal(uker[4].sett[2].belastningPst, 82.5);

  assert.equal(uker[5].erNedtrapping, true);
  assert.equal(uker[5].sett.length, 3);
  assert.equal(uker[5].sett[0].belastningPst, 80);
  assert.equal(uker[5].sett[2].belastningPst, 85);
});

test("beregnStyrkeprogram håndterer manglende 1RM-score pent", () => {
  const uker = beregnStyrkeprogram({
    loft: "BENKPRESS",
    ettRepMaksKg: null,
    kroppsvektKg: 70,
  });

  assert.equal(uker.length, 6);
  assert.equal(uker[0].sett[0].belastningKg, null);
  assert.equal(uker[0].sett[0].belastningPst, 70);
});

test("beregnMalbane regner gap og årlig progresjon mot VG3-mål", () => {
  const mal = beregnMalbane("MARKLOFT", 70, 100, 2);
  assert.ok(mal);
  assert.equal(mal.malRatio, 2.0);
  assert.equal(mal.malKg, 140);
  assert.equal(mal.gapKg, 40);
  assert.equal(mal.gapProsent, 29); // 40 / 140 = ~29%
  assert.equal(mal.arligFramgangKg, 20); // 40 / 2 år
});

test("beregnEstimert1RM regner ut 1RM fra submaksimale reps", () => {
  // 1 rep på 100 kg = 100 kg
  assert.equal(beregnEstimert1RM(100, 1), 100);
  // 5 reps på 85 kg: 85 * (1 + 5/30) = 85 * 1.1667 = 99.16 -> avrundet til 100 kg
  assert.equal(beregnEstimert1RM(85, 5), 100);
  // 3 reps på 90 kg: 90 * (1 + 3/30) = 90 * 1.10 = 99.0 -> avrundet til 100 kg
  assert.equal(beregnEstimert1RM(90, 3), 100);
  // 8 reps på 70 kg: 70 * (1 + 8/30) = 70 * 1.2667 = 88.66 -> avrundet til 87.5 kg
  assert.equal(beregnEstimert1RM(70, 8), 87.5);
  // 0 eller negativt håndteres trygt
  assert.equal(beregnEstimert1RM(0, 5), 0);
  assert.equal(beregnEstimert1RM(80, 0), 0);
});
