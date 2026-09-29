import assert from "node:assert/strict";
import { test } from "node:test";

import {
  avvisningsmelding,
  harEpostdomene,
  lesAvvisningsgrunn,
  normaliserEpost,
  vurderDomenetilgang,
} from "./domene-sperre";

test("godkjent domene slipper inn på riktig flate", () => {
  assert.deepEqual(vurderDomenetilgang({ flate: "wang", epost: "trener@wang.no", plattformRolle: "COACH" }), { ok: true, via: "domene" });
  assert.deepEqual(vurderDomenetilgang({ flate: "team-norway", epost: "trener@golfforbundet.no", plattformRolle: "COACH" }), { ok: true, via: "domene" });
});

test("feil domene avvises, også på den andre flaten", () => {
  assert.deepEqual(vurderDomenetilgang({ flate: "wang", epost: "trener@gmail.com", plattformRolle: "COACH" }), { ok: false, grunn: "domene" });
  assert.deepEqual(vurderDomenetilgang({ flate: "wang", epost: "trener@golfforbundet.no", plattformRolle: "COACH" }), { ok: false, grunn: "domene" });
  assert.deepEqual(vurderDomenetilgang({ flate: "team-norway", epost: "trener@wang.no", plattformRolle: "COACH" }), { ok: false, grunn: "domene" });
});

test("Olympiatoppen slipper ikke inn på Team Norway", () => {
  assert.equal(vurderDomenetilgang({ flate: "team-norway", epost: "fysio@olympiatoppen.no", plattformRolle: "COACH" }).ok, false);
});

test("lignende domener slipper ikke inn", () => {
  for (const epost of [
    "x@xwang.no",
    "x@wang.no.evil.com",
    "x@elev.wang.no",
    "x@wang.nox",
    "wang.no@gmail.com",
    "x@wang.no@gmail.com",
    "@wang.no",
    "x@wang-no",
    "x@ngolfforbundet.no",
    "x@golfforbundet.no.example",
  ]) {
    const flate = epost.includes("golfforbundet") ? "team-norway" : "wang";
    assert.equal(vurderDomenetilgang({ flate, epost, plattformRolle: "COACH" }).ok, false, epost);
  }
});

test("store bokstaver og mellomrom rundt adressen godtas", () => {
  assert.equal(harEpostdomene("  Trener.Navn@WANG.NO ", "wang.no"), true);
  assert.equal(harEpostdomene("Landslag@GolfForbundet.No", "golfforbundet.no"), true);
  assert.equal(normaliserEpost("  A@B.NO "), "a@b.no");
});

test("manglende e-post avvises", () => {
  assert.equal(vurderDomenetilgang({ flate: "wang", epost: null, plattformRolle: "COACH" }).ok, false);
  assert.equal(vurderDomenetilgang({ flate: "wang", epost: "   ", plattformRolle: "PLAYER" }).ok, false);
});

test("plattform-ADMIN slipper inn på begge flatene uansett domene", () => {
  assert.deepEqual(vurderDomenetilgang({ flate: "wang", epost: "anders@gmail.com", plattformRolle: "ADMIN" }), { ok: true, via: "admin" });
  assert.deepEqual(vurderDomenetilgang({ flate: "team-norway", epost: "anders@gmail.com", plattformRolle: "ADMIN" }), { ok: true, via: "admin" });
});

test("andre plattformroller får ikke admin-unntaket", () => {
  for (const rolle of ["PLAYER", "PARENT", "COACH", "GUEST"] as const) {
    assert.equal(vurderDomenetilgang({ flate: "wang", epost: "x@gmail.com", plattformRolle: rolle }).ok, false, rolle);
  }
});

test("avvisningsgrunn leses bare fra kjente verdier", () => {
  assert.equal(lesAvvisningsgrunn("domene"), "domene");
  assert.equal(lesAvvisningsgrunn(["rolle"]), "rolle");
  assert.equal(lesAvvisningsgrunn("noe-annet"), null);
  assert.equal(lesAvvisningsgrunn(undefined), null);
});

test("meldingene nevner riktig domene", () => {
  assert.match(avvisningsmelding("wang", "domene").tekst, /@wang\.no/);
  assert.match(avvisningsmelding("team-norway", "domene").tekst, /@golfforbundet\.no/);
});

test("trenerflaten krever trenerrolle i gruppen i tillegg til domenet", async () => {
  const { vurderTrenerflate } = await import("./domene-sperre");
  const ok = { flate: "wang" as const, epost: "t@wang.no", plattformRolle: "COACH" as const };
  assert.deepEqual(vurderTrenerflate({ ...ok, gruppeRolle: "COACH" }), { ok: true, via: "domene" });
  assert.deepEqual(vurderTrenerflate({ ...ok, gruppeRolle: "ASSISTANT" }), { ok: true, via: "domene" });
  assert.deepEqual(vurderTrenerflate({ ...ok, gruppeRolle: "PLAYER" }), { ok: false, grunn: "rolle" });
  assert.deepEqual(vurderTrenerflate({ ...ok, gruppeRolle: null }), { ok: false, grunn: "rolle" });
  assert.deepEqual(vurderTrenerflate({ ...ok, plattformRolle: "PLAYER", gruppeRolle: "COACH" }), { ok: false, grunn: "rolle" });
  assert.deepEqual(vurderTrenerflate({ ...ok, epost: "t@gmail.com", gruppeRolle: "COACH" }), { ok: false, grunn: "domene" });
  assert.deepEqual(vurderTrenerflate({ flate: "team-norway", epost: "a@gmail.com", plattformRolle: "ADMIN", gruppeRolle: null }), { ok: true, via: "admin" });
});
