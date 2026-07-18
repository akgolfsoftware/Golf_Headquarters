import { test } from "node:test";
import assert from "node:assert/strict";
import {
  lFaseTilSteg,
  stegTilLFase,
  faseLabel,
  pressTilNivaa,
  nivaaTilPress,
  pressLabel,
} from "./ak-formel-visning";

test("lFaseTilSteg grupperer de 5 L-fasene til 3 steg", () => {
  assert.equal(lFaseTilSteg("L_KROPP"), "UTEN_BALL");
  assert.equal(lFaseTilSteg("L_ARM"), "UTEN_BALL");
  assert.equal(lFaseTilSteg("L_KOLLE"), "LAV_HASTIGHET");
  assert.equal(lFaseTilSteg("L_BALL"), "LAV_HASTIGHET");
  assert.equal(lFaseTilSteg("L_AUTO"), "AUTO");
  assert.equal(lFaseTilSteg(null), null);
});

test("faseLabel gir klarspråk-gruppen", () => {
  assert.equal(faseLabel("L_KROPP"), "Uten ball");
  assert.equal(faseLabel("L_KOLLE"), "Lav hastighet");
  assert.equal(faseLabel("L_AUTO"), "Auto");
  assert.equal(faseLabel(null), "Ikke satt");
});

test("stegTilLFase bevarer finkornet verdi når den alt ligger i gruppen", () => {
  // Motor-satt L_KROPP + coach velger «Uten ball» → behold L_KROPP.
  assert.equal(stegTilLFase("UTEN_BALL", "L_KROPP"), "L_KROPP");
  // Motor-satt L_BALL + coach velger «Lav hastighet» → behold L_BALL.
  assert.equal(stegTilLFase("LAV_HASTIGHET", "L_BALL"), "L_BALL");
});

test("stegTilLFase skriver representant når gruppen byttes eller er tom", () => {
  assert.equal(stegTilLFase("UTEN_BALL", null), "L_ARM");
  assert.equal(stegTilLFase("LAV_HASTIGHET", null), "L_BALL");
  assert.equal(stegTilLFase("AUTO", null), "L_AUTO");
  // Bytt gruppe: L_AUTO → «Uten ball» gir representant, ikke L_AUTO.
  assert.equal(stegTilLFase("UTEN_BALL", "L_AUTO"), "L_ARM");
  assert.equal(stegTilLFase(null), null);
});

test("pressTilNivaa grupperer PR1–PR5 til 4 nivåer", () => {
  assert.equal(pressTilNivaa("PR1"), "FRI");
  assert.equal(pressTilNivaa("PR2"), "KRAV");
  assert.equal(pressTilNivaa("PR3"), "UTFORDRING");
  assert.equal(pressTilNivaa("PR4"), "KONKURRANSE");
  assert.equal(pressTilNivaa("PR5"), "KONKURRANSE");
  assert.equal(pressTilNivaa(null), null);
});

test("pressLabel gir klarspråk-nivået", () => {
  assert.equal(pressLabel("PR1"), "Fri");
  assert.equal(pressLabel("PR3"), "Utfordring");
  assert.equal(pressLabel("PR5"), "Konkurranse");
  assert.equal(pressLabel(null), "Ikke satt");
});

test("nivaaTilPress bevarer PR5 under Konkurranse, ellers representant", () => {
  assert.equal(nivaaTilPress("KONKURRANSE", "PR5"), "PR5");
  assert.equal(nivaaTilPress("KONKURRANSE", "PR4"), "PR4");
  assert.equal(nivaaTilPress("KONKURRANSE", null), "PR4");
  assert.equal(nivaaTilPress("FRI", null), "PR1");
  // Bytt gruppe: PR5 → «Fri» gir representant PR1.
  assert.equal(nivaaTilPress("FRI", "PR5"), "PR1");
  assert.equal(nivaaTilPress(null), null);
});
