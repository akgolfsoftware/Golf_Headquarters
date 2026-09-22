import { test } from "node:test";
import assert from "node:assert/strict";
import { formaterTestVerdi, formaterTestDelta, peiSomProsent } from "./format-verdi";

/*
 * Regresjonsvakt for feilen som ble rettet 22.09.2026: PEI lagres som brøk
 * (0,038) og ble vist rått, ofte med én desimal, slik at 3,8 % ble til «0,0».
 */

test("PEI-brøk vises som prosent, ikke som brøk", () => {
  assert.equal(formaterTestVerdi({ kind: "pei_average", verdi: 0.038 }), "3,80 %");
  assert.equal(formaterTestVerdi({ kind: "pei_total", verdi: 0.0426 }), "4,26 %");
});

test("PEI vises aldri som «0,0» — hele feilklassen", () => {
  for (const verdi of [0.038, 0.0426, 0.011, 0.0999]) {
    const vist = formaterTestVerdi({ kind: "pei_average", verdi });
    assert.notEqual(vist, "0,0");
    assert.notEqual(vist, "0,00 %");
    assert.ok(!vist.startsWith("0,0 "), `«${vist}» ser ut som en rå brøk`);
  }
});

test("PEI som allerede er lagret i prosent dobbelt-konverteres ikke", () => {
  // Historiske rader finnes i begge former; 5,7 er prosent og skal stå.
  assert.equal(formaterTestVerdi({ kind: "pei_average", verdi: 5.7 }), "5,70 %");
  assert.equal(peiSomProsent(0.057), 5.7);
  assert.equal(peiSomProsent(5.7), 5.7);
});

test("øvrige scoring-typer beholder sin enhet", () => {
  assert.equal(formaterTestVerdi({ kind: "count_ok", verdi: 7, shotsCount: 10 }), "7 OK av 10");
  assert.equal(formaterTestVerdi({ kind: "count_ok", verdi: 7 }), "7 OK");
  assert.equal(formaterTestVerdi({ kind: "hit_rate", verdi: 70 }), "70 %");
  assert.equal(formaterTestVerdi({ kind: "points_total", verdi: 25 }), "25 p");
  assert.equal(formaterTestVerdi({ kind: "carry_average", verdi: 120.46 }), "120,5 m");
  assert.equal(formaterTestVerdi({ kind: "time_seconds", verdi: 12.345 }), "12,35 s");
});

test("manglende måling vises som tankestrek, aldri som null eller NaN", () => {
  assert.equal(formaterTestVerdi({ kind: "pei_average", verdi: null }), "—");
  assert.equal(formaterTestVerdi({ kind: "sum", verdi: Number.NaN }), "—");
  assert.equal(formaterTestDelta({ kind: "pei_average", delta: Number.NaN }), "—");
});

test("PEI-endring oppgis i prosentpoeng med ekte minus", () => {
  assert.equal(formaterTestDelta({ kind: "pei_average", delta: -0.01 }), "−1,00 pp");
  assert.equal(formaterTestDelta({ kind: "pei_average", delta: 0.012 }), "+1,20 pp");
  // ASCII-bindestrek er feil tegn og skal ikke forekomme.
  assert.ok(!formaterTestDelta({ kind: "pei_average", delta: -0.01 }).includes("-"));
});

test("endring for andre typer bærer enheten sin", () => {
  assert.equal(formaterTestDelta({ kind: "points_total", delta: 3 }), "+3 p");
  assert.equal(formaterTestDelta({ kind: "carry_average", delta: -2.5 }), "−2,5 m");
});

test("desimalskilletegn er komma, aldri punktum", () => {
  for (const vist of [
    formaterTestVerdi({ kind: "pei_average", verdi: 0.038 }),
    formaterTestVerdi({ kind: "carry_average", verdi: 120.46 }),
    formaterTestVerdi({ kind: "time_seconds", verdi: 12.345 }),
    formaterTestDelta({ kind: "pei_average", delta: 0.012 }),
  ]) {
    assert.ok(!vist.includes("."), `«${vist}» bruker punktum som desimalskilletegn`);
  }
});
