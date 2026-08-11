import { test } from "node:test";
import assert from "node:assert/strict";
import {
  beregnDistansekontroll,
  beregnPutteKpi,
  beregnSgPerAvstand,
  beregnTreffPerAvstand,
  putteBandForFot,
  type PutteHoleScore,
  type PutteShot,
} from "./putte-lab";

test("putteBandForFot — grensene følger SG-bucketene", () => {
  assert.equal(putteBandForFot(0.5), "0_3");
  assert.equal(putteBandForFot(3), "0_3");
  assert.equal(putteBandForFot(3.1), "3_5");
  assert.equal(putteBandForFot(10), "5_10");
  assert.equal(putteBandForFot(24), "15_25");
  assert.equal(putteBandForFot(80), "40plus");
});

test("beregnPutteKpi — normaliserer til 18 hull og krever komplette putt-tall", () => {
  const kpi = beregnPutteKpi([
    // 9-hulls runde, alle hull har putts: 18 putter → 36 per 18, én 3-putt → 2 per 18.
    { sgPutt: -0.5, putts: [2, 2, 2, 2, 2, 2, 2, 1, 3] },
    // Runde med hull uten putt-tall — telles for SG, ikke for putter/runde.
    { sgPutt: 0.1, putts: [2, null, 2] },
    // Runde helt uten data.
    { sgPutt: null, putts: [] },
  ]);
  assert.equal(kpi.runderMedSg, 2);
  assert.ok(Math.abs((kpi.sgPuttSnitt ?? 0) - -0.2) < 1e-9);
  assert.equal(kpi.runderMedPutter, 1);
  assert.equal(kpi.putterPer18, 36);
  assert.equal(kpi.trePuttPer18, 2);
});

test("beregnTreffPerAvstand — teller kun komplette hull, siste slag er treff", () => {
  const shots: PutteShot[] = [
    // Hull 1 (komplett, 3 slag): putt fra 2 m (≈6,6 fot, bom) + putt fra 0,5 m (treff).
    { roundId: "r1", holeNumber: 1, shotNumber: 1, shotType: "APPROACH", distanceToPin: 120, isPenalty: false },
    { roundId: "r1", holeNumber: 1, shotNumber: 2, shotType: "PUTT", distanceToPin: 2, isPenalty: false },
    { roundId: "r1", holeNumber: 1, shotNumber: 3, shotType: "PUTT", distanceToPin: 0.5, isPenalty: false },
    // Hull 2 (IKKE komplett: strokes=4, bare 2 slag registrert) — hoppes over.
    { roundId: "r1", holeNumber: 2, shotNumber: 1, shotType: "PUTT", distanceToPin: 3, isPenalty: false },
    { roundId: "r1", holeNumber: 2, shotNumber: 2, shotType: "PUTT", distanceToPin: 1, isPenalty: false },
  ];
  const scores: PutteHoleScore[] = [
    { roundId: "r1", holeNumber: 1, strokes: 3 },
    { roundId: "r1", holeNumber: 2, strokes: 4 },
  ];
  const resultat = beregnTreffPerAvstand(shots, scores);
  assert.equal(resultat.komplettHull, 1);
  assert.equal(resultat.totaltForsok, 2);
  const kort = resultat.band.find((b) => b.id === "0_3");
  const mellom = resultat.band.find((b) => b.id === "5_10");
  assert.equal(kort?.forsok, 1);
  assert.equal(kort?.treff, 1); // siste slag på komplett hull
  assert.equal(mellom?.forsok, 1);
  assert.equal(mellom?.treff, 0); // 2 m-putten gikk ikke i
});

test("beregnSgPerAvstand — snitt kun over runder med verdi i båndet", () => {
  const perBand = beregnSgPerAvstand([
    { sgPutt0_3: 0.1, sgPutt3_5: -0.2 },
    { sgPutt0_3: 0.3, sgPutt3_5: null },
  ]);
  const kort = perBand.find((b) => b.id === "0_3");
  const neste = perBand.find((b) => b.id === "3_5");
  assert.ok(Math.abs((kort?.snitt ?? 0) - 0.2) < 1e-9);
  assert.equal(kort?.n, 2);
  assert.equal(neste?.n, 1);
  assert.equal(perBand.find((b) => b.id === "40plus")?.snitt, null);
});

test("beregnDistansekontroll — fot-konvertering, 5 %-krav og andel lange", () => {
  const resultat = beregnDistansekontroll([
    {
      perSlag: [
        // 3 m ≈ 9,84 fot. Avvik 0,1 m ≈ 0,33 fot — UTENFOR 5 % (0,49 fot)? Nei: innenfor.
        { target: 3, verdier: { distanse: 0.1 } },
        // Avvik −1 m ≈ −3,28 fot — utenfor kravet, og kort (ikke lang).
        { target: 3, verdier: { distanse: -1 } },
        // Mangler tall — hoppes over.
        { target: 3, verdier: { distanse: null } },
      ],
    },
    { perSlag: [{ verdier: { distanse: 0.5 } }] }, // uten target — bidrar ikke
  ]);
  assert.equal(resultat.punkter.length, 2);
  assert.equal(resultat.okterMedData, 1);
  assert.equal(resultat.andelLange, 0.5);
  assert.equal(resultat.punkter[0].innenforKrav, true);
  assert.equal(resultat.punkter[1].innenforKrav, false);
  assert.equal(resultat.snittPerAvstand.length, 1);
  assert.equal(resultat.snittPerAvstand[0].n, 2);
});
