import test from "node:test";
import assert from "node:assert/strict";
import { erAltidLysFlate, erLysFlate, onsketTema } from "@/lib/v2/tema-default";

// Regelen lå tidligere duplisert i layout.tsx og shell.tsx og drev fra
// hverandre. Disse testene låser den ene kilden.

test("PlayerHQ, AgencyOS, innlogging og forelder starter lyst uten cookie", () => {
  for (const p of ["/portal", "/portal/analysere", "/admin", "/admin/agencyos/okonomi", "/admin/agencyos/live/x", "/auth", "/auth/logg-inn", "/forelder", "/forelder/bookinger"]) {
    assert.equal(onsketTema(p, undefined, false), "light", p);
    assert.equal(erLysFlate(p), true, p);
  }
});

test("bryteren vinner over defaulten, begge veier", () => {
  assert.equal(onsketTema("/portal", "light", false), "light");
  assert.equal(onsketTema("/portal", "dark", false), "dark");
  assert.equal(onsketTema("/admin", "light", false), "light");
  assert.equal(onsketTema("/auth", "dark", false), "dark");
  assert.equal(onsketTema("/forelder", "dark", false), "dark");
});

test("landingssider er alltid lyse — også med dark-cookie (ingen bryter der)", () => {
  assert.equal(onsketTema("/", "dark", true), "light");
  assert.equal(onsketTema("/priser", "dark", true), "light");
  assert.equal(onsketTema("/", undefined, true), "light");
});

test("WANG og Team Norway er alltid lyse, også med dark-cookie", () => {
  for (const p of ["/wang", "/teamnorway", "/team-wang", "/team-wang/coach", "/team-norway", "/team-norway/rangliste", "/team-norway/spiller/x"]) {
    assert.equal(erAltidLysFlate(p), true, p);
    for (const c of [undefined, "dark", "light", "tull"]) {
      assert.equal(onsketTema(p, c, false), "light", `${p} / ${c}`);
    }
  }
});

test("alltid-lys-regelen treffer ikke andre flater eller liknende navn", () => {
  for (const p of ["/portal", "/admin", "/forelder", "/stats", "/wangsomething", "/teamnorwayx"]) {
    assert.equal(erAltidLysFlate(p), false, p);
  }
  assert.equal(onsketTema("/portal", "dark", false), "dark");
});

test("øvrige flater beholder mørk default og lys via cookie (uendret fra før)", () => {
  assert.equal(onsketTema("/stats", undefined, false), "dark");
  assert.equal(onsketTema("/stats", "light", false), "light");
  assert.equal(onsketTema("/intern", undefined, false), "dark");
});

test("ukjent cookieverdi behandles som ikke satt", () => {
  assert.equal(onsketTema("/portal", "tull", false), "light");
  assert.equal(onsketTema("/auth", "tull", false), "light");
});

test("prefiks-treff krysser ikke rutegrenser feil vei", () => {
  // /administrasjon finnes ikke i dag, men regelen skal ikke overraske om den kommer.
  assert.equal(erLysFlate("/administrasjon"), false);
  assert.equal(erLysFlate("/portalen-min"), false);
  assert.equal(erLysFlate("/portal"), true);
});
