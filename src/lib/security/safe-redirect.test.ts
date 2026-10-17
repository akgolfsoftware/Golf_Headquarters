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

test("tab, linjeskift og mellomrom kan ikke lure fram en fremmed origin", async () => {
  const klient = (await import("./safe-redirect-client")).safeRedirectPath;
  for (const path of ["/a/..//example.invalid", "/a/%2e%2e//example.invalid", "/\t/example.invalid", "/\n/example.invalid", "/ /example.invalid", "/\u0000/example.invalid"]) {
    assert.equal(safeRedirectPath(path, "/auth/etter-innlogging"), "/auth/etter-innlogging");
    assert.equal(klient(path, "/auth/etter-innlogging"), "/auth/etter-innlogging");
  }
  assert.equal(klient("/portal/plan?uke=2#a", "/x"), "/portal/plan?uke=2#a");
});
