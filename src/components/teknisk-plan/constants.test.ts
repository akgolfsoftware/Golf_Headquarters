import { test } from "node:test";
import assert from "node:assert/strict";
import {
  P_POSITIONS,
  erHovedP,
  hovedP,
  mellomposisjonerFor,
  pNavn,
  sammenlignPNummer,
} from "./constants";

test("P1–P10 har fasitens navn (morad-posisjonssystem.md)", () => {
  assert.equal(P_POSITIONS.length, 10);
  assert.equal(pNavn("P5.0"), "Halvveis ned (venstre arm parallell, maks lag)");
  assert.equal(pNavn("P6.0"), "Kølle parallell ned (lag-release starter)");
  assert.equal(pNavn("P8.0"), "Kølle parallell på utgang");
  assert.equal(pNavn("P9.0"), "Venstre arm parallell på follow-through");
});

test("mellomposisjoner hører under sin hoved-P og har navn", () => {
  assert.equal(hovedP("P4.1"), "P4.0");
  assert.equal(hovedP("P10.0"), "P10.0");
  assert.equal(erHovedP("P4.0"), true);
  assert.equal(erHovedP("P4.1"), false);
  assert.equal(pNavn("P4.1"), "Overgang topp til ned");
  assert.equal(pNavn("P6.9"), "Siste øyeblikk før impact");
  assert.equal(pNavn("P2.3"), "Mellom P2 og P3");
  assert.equal(mellomposisjonerFor("P4.0").length, 9);
  assert.equal(mellomposisjonerFor("P10.0").length, 0);
  assert.equal(pNavn("tull"), "tull");
});

test("sortering er numerisk, ikke alfabetisk", () => {
  const inn = ["P10.0", "P2.0", "P1.1", "P1.0", "P6.9", "P6.0", "ukjent"];
  const ut = [...inn].sort(sammenlignPNummer);
  assert.deepEqual(ut, ["P1.0", "P1.1", "P2.0", "P6.0", "P6.9", "P10.0", "ukjent"]);
});
