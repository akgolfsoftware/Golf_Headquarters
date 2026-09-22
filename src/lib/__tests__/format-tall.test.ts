import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formaterTall,
  formaterProsent,
  formaterFortegn,
  formaterVarighet,
} from "@/lib/format-tall";

const MINUS = "−";
const NBSP = " ";

test("desimalskilletegn er komma, aldri punktum", () => {
  assert.equal(formaterTall(120.46), "120,5");
  assert.equal(formaterTall(3.8, 2, true), "3,80");
  assert.equal(formaterProsent(62.4, 1), `62,4${NBSP}%`);
  assert.equal(formaterFortegn(0.41), "+0,41");
});

test("prosent har mellomrom foran tegnet", () => {
  assert.equal(formaterProsent(73), `73${NBSP}%`);
  // Regresjon: stats-sidene viste «62.4%» — både punktum og uten mellomrom.
  assert.ok(!formaterProsent(62.4, 1).includes("4%"));
});

test("minustegnet er ekte minus, aldri ASCII-bindestrek", () => {
  for (const vist of [
    formaterTall(-3.8),
    formaterProsent(-12, 0),
    formaterFortegn(-0.05),
  ]) {
    assert.ok(vist.includes(MINUS), `«${vist}» mangler ekte minus`);
    assert.ok(!vist.includes("-"), `«${vist}» bruker ASCII-bindestrek`);
  }
});

test("fortegnstall: null får ikke fortegn", () => {
  // «+0,00» leses som en liten gevinst, og det er ikke det målingen sier.
  assert.equal(formaterFortegn(0), "0,00");
  assert.equal(formaterFortegn(0.001), "0,00");
  assert.equal(formaterFortegn(-0.001), "0,00");
});

test("manglende verdi blir tankestrek, aldri 0 eller NaN", () => {
  for (const fn of [formaterTall, formaterProsent, formaterFortegn, formaterVarighet]) {
    assert.equal(fn(null), "—");
    assert.equal(fn(undefined), "—");
    assert.equal(fn(Number.NaN), "—");
  }
});

test("tusenskille er mellomrom", () => {
  const vist = formaterTall(1240, 0);
  assert.ok(!vist.includes(","), `«${vist}» brukte komma som tusenskille`);
  assert.ok(/\s/.test(vist), `«${vist}» mangler tusenskille`);
});

test("varighet leses som klartekst", () => {
  assert.equal(formaterVarighet(45), "45 min");
  assert.equal(formaterVarighet(90), "1 t 30 min");
  assert.equal(formaterVarighet(120), "2 t");
});
