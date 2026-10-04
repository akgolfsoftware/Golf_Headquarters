import test from "node:test";
import assert from "node:assert/strict";
import { safeRedirectPath } from "./safe-redirect";

test("innloggingsretur beholder appens relative adresse", () => {
  assert.equal(safeRedirectPath("/portal?uke=2"), "/portal?uke=2");
  assert.equal(safeRedirectPath(null, "/auth/etter-innlogging"), "/auth/etter-innlogging");
});

test("innloggingsretur kan ikke sende brukeren til en fremmed origin", () => {
  for (const path of ["https://example.invalid", "//example.invalid", "/\\example.invalid", "/\r\nLocation: https://example.invalid"]) {
    assert.equal(safeRedirectPath(path, "/auth/etter-innlogging"), "/auth/etter-innlogging");
  }
});
