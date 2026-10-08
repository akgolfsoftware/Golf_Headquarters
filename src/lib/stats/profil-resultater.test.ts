import { test } from "node:test";
import assert from "node:assert/strict";

import { erNettoKlasse, parseRunder, ryddProfilResultater, type ProfilEntry } from "./profil-resultater";

function entry(id: string, kilde: string, dato: string, felt: Partial<ProfilEntry> = {}): ProfilEntry {
  return {
    id,
    status: "FINISHED",
    position: null,
    scoreToPar: null,
    totalScore: null,
    klasseNavn: null,
    rounds: null,
    ...felt,
    tournament: { sourceOrigin: kilde, startDate: new Date(`${dato}T00:00:00Z`) },
  };
}

const golfboxRunder = (scores: number[]) => ({ version: 2, source: "GOLFBOX", roundScores: scores });
const ngfRunder = (scores: number[]) => scores.map((score, i) => ({ n: i + 1, score }));

test("nettoklasser gjenkjennes som i pipeline-regelen", () => {
  for (const k of ["Herrer Netto", "Damer netto", "G15 Netto", "G19N", "G15 (N)", "H-N"]) {
    assert.equal(erNettoKlasse(k), true, k);
  }
  for (const k of ["Herrer brutto", "A-klassen", "Gutter U15", "G15-klassen", "Gutter 13-15 år", null, ""]) {
    assert.equal(erNettoKlasse(k), false, String(k));
  }
});

test("rundescorer leses fra både NGF-liste og GolfBox v2", () => {
  assert.deepEqual(parseRunder(ngfRunder([76, 80])), [{ n: 1, score: 76 }, { n: 2, score: 80 }]);
  assert.deepEqual(parseRunder(golfboxRunder([75, 79, null as unknown as number])), [
    { n: 1, score: 75 },
    { n: 2, score: 79 },
  ]);
  assert.deepEqual(parseRunder(null), []);
});

test("DataGolf-resultater vises aldri", () => {
  const ut = ryddProfilResultater([entry("dg", "DATAGOLF", "2026-04-10"), entry("ok", "NORGESCUP", "2026-05-02")]);
  assert.deepEqual(ut.map((e) => e.id), ["ok"]);
});

test("NGF- og GolfBox-kopi av samme turnering blir én rad med NGF sin plassering", () => {
  // Srixon Tour 1 2024, Karl Ludvig: GolfBox mangler plassering, NGF har 7.
  const ut = ryddProfilResultater([
    entry("ngf", "NGF", "2024-05-11", { position: 7, totalScore: 156, rounds: ngfRunder([76, 80]) }),
    entry("gb", "SRIXON", "2024-05-11", { totalScore: 156, klasseNavn: "Gutter U15", rounds: golfboxRunder([76, 80]) }),
  ]);
  assert.equal(ut.length, 1);
  assert.equal(ut[0].id, "gb");
  assert.equal(ut[0].position, 7);
  assert.equal(ut[0].klasseNavn, "Gutter U15");
});

test("GolfBox uten totalscore får total fra rundene", () => {
  // Srixon Future Camp #1 2026: GolfBox har bare runder 73-74.
  const [rad] = ryddProfilResultater([
    entry("gb", "SRIXON", "2026-04-25", { position: 2, rounds: golfboxRunder([73, 74]) }),
    entry("ngf", "NGF", "2026-04-25", { position: 2, totalScore: 147, rounds: ngfRunder([73, 74]) }),
  ]);
  assert.equal(rad.totalScore, 147);
});

test("NGF-kopi med nettoscore overstyres av GolfBox-brutto, og nettoplasseringen brukes ikke", () => {
  // International Trophy: NGF 74-69-69 (netto), GolfBox 82-77-77 (brutto).
  const [rad] = ryddProfilResultater([
    entry("ngf", "NGF", "2023-06-01", { position: 3, totalScore: 212, rounds: ngfRunder([74, 69, 69]) }),
    entry("gb", "GOLFBOX", "2023-06-01", { totalScore: 236, klasseNavn: "Herrer Brutto", rounds: golfboxRunder([82, 77, 77]) }),
  ]);
  assert.equal(rad.totalScore, 236);
  assert.equal(rad.position, null);
  assert.deepEqual(parseRunder(rad.rounds).map((r) => r.score), [82, 77, 77]);
});

test("nettoklasse fjerner både GolfBox-raden og NGF-kopien med nettoscore", () => {
  const ut = ryddProfilResultater([
    entry("ngf", "NGF", "2024-06-01", { position: 11, totalScore: 180 }),
    entry("gb", "OSTLANDS", "2024-06-01", { totalScore: 202, klasseNavn: "Herrer Netto" }),
    entry("olyo", "OLYO", "2025-04-26", { totalScore: 72, klasseNavn: "G15 Netto" }),
  ]);
  assert.deepEqual(ut, []);
});

test("NGF-rad uten partner beholdes, og rekkefølgen er uendret", () => {
  const ut = ryddProfilResultater([
    entry("c", "SRIXON", "2025-09-27", { totalScore: 218 }),
    entry("b", "NGF", "2025-09-20", { totalScore: 150 }),
    entry("a", "NGF", "2025-09-27", { totalScore: 218, position: 2 }),
  ]);
  assert.deepEqual(ut.map((e) => [e.id, e.position]), [["c", 2], ["b", null]]);
});
