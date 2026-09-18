import assert from "node:assert/strict";
import { test } from "node:test";
import {
  TN_ACCESS_DENIAL,
  TN_SCREEN_ROLES,
  canAccessScreen,
  type Role,
  type TnScreen,
} from "./access.ts";

const ROLES: Role[] = ["SS", "TR", "HJ", "SP", "FO", "EL"];

test("FO har ikke Live, har IUP og samtykkereise", () => {
  assert.equal(canAccessScreen("FO", "live"), false);
  assert.equal(canAccessScreen("FO", "iup"), true);
  assert.equal(canAccessScreen("FO", "samtykke"), true);
  assert.equal(canAccessScreen("FO", "samtykke-reise"), true);
  assert.equal(canAccessScreen("FO", "rangliste"), false);
});

test("SP ser spillerflaten, ikke tilgang eller IUP-kart", () => {
  assert.equal(canAccessScreen("SP", "live"), true);
  assert.equal(canAccessScreen("SP", "iup"), true);
  assert.equal(canAccessScreen("SP", "samling"), true);
  assert.equal(canAccessScreen("SP", "tilgang"), false);
  assert.equal(canAccessScreen("SP", "inviter"), false);
  assert.equal(canAccessScreen("SP", "iup-kart"), false);
  assert.equal(canAccessScreen("SP", "prosessmal"), false);
  assert.equal(canAccessScreen("SP", "spillere"), false);
});

test("bare sportssjef ser tilgang og inviter", () => {
  for (const role of ROLES) {
    assert.equal(canAccessScreen(role, "tilgang"), role === "SS", role);
    assert.equal(canAccessScreen(role, "inviter"), role === "SS", role);
  }
});

test("IUP-kart er kun SS og TR", () => {
  assert.equal(canAccessScreen("SS", "iup-kart"), true);
  assert.equal(canAccessScreen("TR", "iup-kart"), true);
  assert.equal(canAccessScreen("HJ", "iup-kart"), false);
  assert.equal(canAccessScreen("SP", "iup-kart"), false);
  assert.equal(canAccessScreen("FO", "iup-kart"), false);
});

test("EL ser aggregat, ikke Live eller IUP", () => {
  assert.equal(canAccessScreen("EL", "skoler"), true);
  assert.equal(canAccessScreen("EL", "oversikt"), true);
  assert.equal(canAccessScreen("EL", "live"), false);
  assert.equal(canAccessScreen("EL", "iup"), false);
  assert.equal(canAccessScreen("EL", "poster"), false);
});

test("hver skjerm har roller og avslagstekst", () => {
  const screens = Object.keys(TN_SCREEN_ROLES) as TnScreen[];
  assert.ok(screens.length >= 30);
  for (const id of screens) {
    assert.ok(TN_SCREEN_ROLES[id].length > 0, id);
    assert.equal(typeof TN_ACCESS_DENIAL[id], "string", id);
    assert.ok(TN_ACCESS_DENIAL[id].length > 8, id);
  }
});

test("Live-avslag nevner foresatt", () => {
  assert.match(TN_ACCESS_DENIAL.live, /Foresatt/i);
});
