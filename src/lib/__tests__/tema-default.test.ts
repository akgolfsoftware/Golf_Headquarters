import test from "node:test";
import assert from "node:assert/strict";
import { erMorkFlate, erLysFlate, onsketTema } from "@/lib/v2/tema-default";

// Regelen lå tidligere duplisert i layout.tsx og shell.tsx og drev fra
// hverandre. Disse testene låser den ene kilden.

test("mørk default: /portal og /admin uten cookie", () => {
  for (const p of ["/portal", "/portal/analysere", "/admin", "/admin/agencyos/okonomi"]) {
    assert.equal(onsketTema(p, undefined, false), "dark", p);
    assert.equal(erMorkFlate(p), true, p);
  }
});

test("lys default består der den er låst: /auth (PP-A/A4) og /forelder (uavklart)", () => {
  for (const p of ["/auth", "/auth/logg-inn", "/forelder", "/forelder/bookinger"]) {
    assert.equal(onsketTema(p, undefined, false), "light", p);
    assert.equal(erLysFlate(p), true, p);
    assert.equal(erMorkFlate(p), false, p);
  }
});

test("bryteren vinner over defaulten, begge veier", () => {
  assert.equal(onsketTema("/portal", "light", false), "light");
  assert.equal(onsketTema("/admin", "light", false), "light");
  assert.equal(onsketTema("/auth", "dark", false), "dark");
  assert.equal(onsketTema("/forelder", "dark", false), "dark");
});

test("landingssider er alltid lyse — også med dark-cookie (ingen bryter der)", () => {
  assert.equal(onsketTema("/", "dark", true), "light");
  assert.equal(onsketTema("/priser", "dark", true), "light");
  assert.equal(onsketTema("/", undefined, true), "light");
});

test("øvrige flater beholder mørk default og lys via cookie (uendret fra før)", () => {
  assert.equal(onsketTema("/stats", undefined, false), "dark");
  assert.equal(onsketTema("/stats", "light", false), "light");
  assert.equal(onsketTema("/team-wang", undefined, false), "dark");
  assert.equal(onsketTema("/intern", undefined, false), "dark");
});

test("ukjent cookieverdi behandles som ikke satt", () => {
  assert.equal(onsketTema("/portal", "tull", false), "dark");
  assert.equal(onsketTema("/auth", "tull", false), "light");
});

test("prefiks-treff krysser ikke rutegrenser feil vei", () => {
  // /administrasjon finnes ikke i dag, men regelen skal ikke overraske om den kommer.
  assert.equal(erMorkFlate("/portalen-min"), true); // startsWith er bevisst bred
  assert.equal(erLysFlate("/portal"), false);
});
