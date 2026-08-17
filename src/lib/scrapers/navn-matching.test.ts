import { test } from "node:test";
import assert from "node:assert/strict";
import { navnLikhet, normaliserNavn } from "./navn-matching";

test("navnLikhet: identisk navn gir 1.0", () => {
  assert.equal(navnLikhet("Anna Krekling", "Anna Krekling"), 1.0);
});

test("navnLikhet: ulikt fornavn med felles etternavn gir 0", () => {
  // Forhindrer "Frithjof Rasmussen" → "Alex Rasmussen"
  const score = navnLikhet("Frithjof Rasmussen", "Alex Rasmussen");
  assert.equal(score, 0);
});

test("navnLikhet: fullt navn mot forkortet variant gir høy score", () => {
  const score = navnLikhet("Anna Cathrine Krekling", "Anna Krekling");
  assert.ok(score > 0.5, `forventet > 0.5, fikk ${score}`);
});

test("normaliserNavn: gammel norsk translitterasjon matcher ekte bokstaver", () => {
  assert.equal(normaliserNavn("Baard Olsen"), normaliserNavn("Bård Olsen"));
});
