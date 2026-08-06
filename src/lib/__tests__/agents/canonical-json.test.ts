// Ren enhetstest — ingen mocks nødvendig (canonical-json har null avhengigheter).
import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalJson, isEditedSuggestion } from "@/lib/agents/canonical-json";

test("canonicalJson sorterer nøkler rekursivt", () => {
  assert.equal(
    canonicalJson({ b: 1, a: { d: 2, c: [{ f: 3, e: 4 }] } }),
    canonicalJson({ a: { c: [{ e: 4, f: 3 }], d: 2 }, b: 1 }),
  );
});

test("isEditedSuggestion er false ved kun nøkkelrekkefølge-avvik", () => {
  assert.equal(
    isEditedSuggestion({ x: 1, y: "a" }, { y: "a", x: 1 }),
    false,
  );
});

test("isEditedSuggestion er true ved reell endring", () => {
  assert.equal(isEditedSuggestion({ x: 1 }, { x: 2 }), true);
  assert.equal(isEditedSuggestion({ x: 1 }, { x: 1, y: 2 }), true);
});

test("håndterer arrays, null og primitiver", () => {
  assert.equal(isEditedSuggestion([1, 2, 3], [1, 2, 3]), false);
  assert.equal(isEditedSuggestion([1, 2, 3], [3, 2, 1]), true);
  assert.equal(isEditedSuggestion(null, null), false);
  assert.equal(isEditedSuggestion("a", "a"), false);
});
