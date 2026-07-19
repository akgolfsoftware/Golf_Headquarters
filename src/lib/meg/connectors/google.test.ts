/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/meg/connectors/google.test.ts
 *
 * Tester kun kalenderNavnMatcher — den rene match-funksjonen bak
 * kalenderAgenda()'s valgfrie kalenderNavn-filter. kalenderAgenda() selv
 * krever en aktiv Google-tilkobling + nettverk og testes derfor ikke her.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { kalenderNavnMatcher } from "./google";

test("kalenderNavnMatcher matcher eksakt navn", () => {
  assert.equal(kalenderNavnMatcher("Work - WANG Toppidrett Fredrikstad", "Work - WANG Toppidrett Fredrikstad"), true);
});

test("kalenderNavnMatcher matcher substring", () => {
  assert.equal(kalenderNavnMatcher("Work - WANG Toppidrett Fredrikstad", "WANG Toppidrett"), true);
});

test("kalenderNavnMatcher er case-insensitiv", () => {
  assert.equal(kalenderNavnMatcher("Work - WANG Toppidrett Fredrikstad", "wang toppidrett"), true);
});

test("kalenderNavnMatcher avviser ikke-matchende kalender", () => {
  assert.equal(kalenderNavnMatcher("Privat", "WANG Toppidrett"), false);
});

test("kalenderNavnMatcher returnerer true for tomt/udefinert filter (bakoverkompatibelt)", () => {
  assert.equal(kalenderNavnMatcher("Privat", ""), true);
  assert.equal(kalenderNavnMatcher("Privat", "   "), true);
});

test("kalenderNavnMatcher avviser når summary mangler men filter er satt", () => {
  assert.equal(kalenderNavnMatcher(null, "WANG"), false);
  assert.equal(kalenderNavnMatcher(undefined, "WANG"), false);
});
