import test from "node:test";
import assert from "node:assert/strict";
import { stallStatus, type StallStatusInput } from "./stall-status";

const rolig: StallStatusInput = {
  userStatus: "AKTIV",
  etterlevelsePct: 90,
  eldsteUbesvartTimer: null,
};

test("ingen signaler: følger planen", () => {
  assert.equal(stallStatus(rolig).status, "aktiv");
});

test("signal etterlevelse: under 50 % siste fire uker er «Bak plan», 50 % er det ikke", () => {
  assert.equal(stallStatus({ ...rolig, etterlevelsePct: 49 }).status, "bak");
  assert.equal(stallStatus({ ...rolig, etterlevelsePct: 50 }).status, "aktiv");
});

test("signal ubesvart: forespørsel over 24 t er rødt, under 24 t er det ikke", () => {
  assert.equal(stallStatus({ ...rolig, eldsteUbesvartTimer: 24 }).status, "veil");
  assert.equal(stallStatus({ ...rolig, eldsteUbesvartTimer: 23 }).status, "aktiv");
});

test("signal risiko: kontoen er satt til INAKTIV", () => {
  assert.equal(stallStatus({ ...rolig, userStatus: "INAKTIV" }).status, "inaktiv");
});

test("mangler data: ingen forfalte økter teller ikke som rødt, og sies ærlig", () => {
  const r = stallStatus({ ...rolig, etterlevelsePct: null });
  assert.equal(r.status, "aktiv");
  assert.equal(r.label, "Ingen plandata");
});

test("avtalt pause går foran alle signaler", () => {
  const r = stallStatus({ ...rolig, userStatus: "SKADET", etterlevelsePct: 0, eldsteUbesvartTimer: 100 });
  assert.equal(r.status, "hviler");
  assert.equal(stallStatus({ ...rolig, userStatus: "PERMISJON" }).status, "hviler");
});
