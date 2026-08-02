import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SG_INTERPRETATION_SYSTEM,
  SG_INTERPRETATION_MASTERBRAIN_VERSJON,
} from "./sg-interpretation";

test("systemprompten inneholder Masterbrain-fasiten", () => {
  assert.match(SG_INTERPRETATION_SYSTEM, /<masterbrain-fasit>/);
  assert.match(SG_INTERPRETATION_SYSTEM, /Strokes Gained/);
});

test("hypotese-regelen er med — SG er ikke en diagnose", () => {
  assert.match(SG_INTERPRETATION_SYSTEM, /HYPOTESE/i);
  assert.match(SG_INTERPRETATION_SYSTEM, /video/i);
});

test("agenten får ikke lenger beskjed om å finne på drill-navn", () => {
  // Før: «foreslå 3-5 navngitte drills» uten at noen liste ble sendt med.
  // Modellen fant dem da på, og oppdiktede navn havnet i sammendraget.
  assert.doesNotMatch(SG_INTERPRETATION_SYSTEM, /foreslå 3-5 navngitte drills/);
  assert.match(SG_INTERPRETATION_SYSTEM, /Bruk KUN navn\s+derfra/);
  assert.match(SG_INTERPRETATION_SYSTEM, /Finn aldri på et drill-navn/);
});

test("fasit-versjonen er eksponert for logging", () => {
  assert.match(SG_INTERPRETATION_MASTERBRAIN_VERSJON, /sg-principles@/);
  assert.match(SG_INTERPRETATION_MASTERBRAIN_VERSJON, /faults@/);
});

test("posisjonskatalogen er utelatt, og det står i prompten", () => {
  // Budsjettet på 13 000 tar SG-prinsipper + svingfeil. Posisjonene (17 035)
  // ryker — agenten skriver et sammendrag, ikke en posisjonsanalyse.
  assert.doesNotMatch(SG_INTERPRETATION_MASTERBRAIN_VERSJON, /positions@/);
  assert.match(SG_INTERPRETATION_SYSTEM, /fikk ikke plass/);
  assert.match(SG_INTERPRETATION_SYSTEM, /positions\.json/);
});
