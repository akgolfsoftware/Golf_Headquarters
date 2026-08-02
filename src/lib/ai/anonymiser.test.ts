import { test } from "node:test";
import assert from "node:assert/strict";
import { byggPseudonymMap, anonymiser, deanonymiser } from "./anonymiser";

test("anonymiser fjerner alle ekte navn fra teksten", () => {
  const map = byggPseudonymMap(["Øyvind Rohjan", "Kari Nordmann"]);
  const inn = "Øyvind Rohjan har skade. Kari Nordmann er inaktiv.";
  const ut = anonymiser(inn, map);
  assert.ok(!ut.includes("Øyvind"), "fornavn skal være borte");
  assert.ok(!ut.includes("Rohjan"), "etternavn skal være borte");
  assert.ok(!ut.includes("Kari"));
  assert.ok(ut.includes("Spiller 1"));
  assert.ok(ut.includes("Spiller 2"));
});

test("round-trip: deanonymiser gjenoppretter ekte navn", () => {
  const map = byggPseudonymMap(["Øyvind Rohjan", "Kari Nordmann"]);
  const svar = "Spiller 1 bør avlastes, og Spiller 2 kontaktes.";
  const ut = deanonymiser(svar, map);
  assert.equal(ut, "Øyvind Rohjan bør avlastes, og Kari Nordmann kontaktes.");
});

test("håndterer >9 navn uten prefiks-kollisjon (Spiller 1 vs Spiller 12)", () => {
  const navn = Array.from({ length: 12 }, (_, i) => `Person_${i + 1}`);
  const map = byggPseudonymMap(navn);
  const finnNavn = (pseudo: string) =>
    [...map.entries()].find(([, p]) => p === pseudo)![0];
  const svar = "Spiller 1 og Spiller 12 nevnes.";
  const ut = deanonymiser(svar, map);
  // "Spiller 12" skal remappes fullstendig — ikke tolkes som "<navn for 1>2".
  assert.ok(ut.includes(finnNavn("Spiller 12")));
  assert.ok(ut.includes(finnNavn("Spiller 1")));
  assert.ok(!/Spiller \d/.test(ut), "ingen pseudonymer skal stå igjen");
});

test("tomme og duplikate navn hoppes over", () => {
  const map = byggPseudonymMap(["Ola", "", "  ", "Ola"]);
  assert.equal(map.size, 1);
  assert.equal(map.get("Ola"), "Spiller 1");
});

test("navn med regex-spesialtegn behandles bokstavelig", () => {
  const map = byggPseudonymMap(["A. (Test)"]);
  const ut = anonymiser("A. (Test) spiller bra", map);
  assert.equal(ut, "Spiller 1 spiller bra");
});
