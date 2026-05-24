/**
 * Tester for hcp.ts — WHS handicap-beregning.
 *
 * Kjøres med:
 *   npx tsx --test src/lib/__tests__/domain/hcp.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  beregnHcp,
  formaterHcp,
  vurderHcpKlasse,
  type HcpRunde,
} from "../../domain/hcp.js";

// ---------------------------------------------------------------------------
// Testdata
// ---------------------------------------------------------------------------

/** Standard baneparametere: CR 72.0, Slope 125, Par 72 */
function lagRunde(score: number): HcpRunde {
  return { score, courseRating: 72.0, slope: 125, par: 72 };
}

// ---------------------------------------------------------------------------
// beregnHcp
// ---------------------------------------------------------------------------

test("0 runder → hcp null, beregnetAv 0", () => {
  const res = beregnHcp([]);
  assert.equal(res.hcp, null);
  assert.equal(res.beregnetAv, 0);
  assert.equal(res.lavBeregning, false);
});

test("< 8 runder → lavBeregning true, beregner alle", () => {
  const runder = [74, 76, 78].map(lagRunde);
  const res = beregnHcp(runder);
  assert.ok(res.lavBeregning, "skal flagge lav beregning");
  assert.equal(res.beregnetAv, 3);
  assert.ok(res.hcp !== null, "hcp skal være et tall");
});

test("> 8 runder → bruker 8 beste differensialer", () => {
  // 12 runder: 10 medium + 2 gode (lave differensialer)
  const runder: HcpRunde[] = [
    ...Array.from({ length: 10 }, () => lagRunde(82)),
    lagRunde(72),
    lagRunde(72),
  ];
  const res = beregnHcp(runder);
  assert.equal(res.lavBeregning, false);
  assert.equal(res.beregnetAv, 8);
  // HCP skal trekkes ned av de 2 gode rundene (score = par)
  const bareMedium = beregnHcp(Array.from({ length: 12 }, () => lagRunde(82)));
  assert.ok(
    (res.hcp ?? Infinity) < (bareMedium.hcp ?? Infinity),
    "gode runder skal trekke ned HCP"
  );
});

test("plus-HCP: score under CR gir negativ differensial → negativ hcp", () => {
  // Score 68 på bane med CR 72.0, slope 113 → differensial = (68-72)*113/113 = -4.0
  const runder = Array.from({ length: 8 }, () => ({
    score: 68,
    courseRating: 72.0,
    slope: 113,
    par: 72,
  }));
  const res = beregnHcp(runder);
  assert.ok(res.hcp !== null);
  assert.ok(res.hcp < 0, `HCP ${res.hcp} skal være negativ (plus-handicap)`);
});

test("eksakt WHS-beregning: 8 identiske runder", () => {
  // differensial = (80 - 72.0) * 113 / 125 = 7.232 → floor to 7.2
  const runder = Array.from({ length: 8 }, () => lagRunde(80));
  const res = beregnHcp(runder);
  assert.ok(res.hcp !== null);
  // Forventet: 8 * 7.232 / 8 = 7.232 → floor = 7.2
  assert.equal(res.hcp, 7.2);
});

// ---------------------------------------------------------------------------
// formaterHcp
// ---------------------------------------------------------------------------

test("formaterHcp: null → '—'", () => {
  assert.equal(formaterHcp(null), "—");
});

test("formaterHcp: positiv → vanlig (12,4)", () => {
  assert.equal(formaterHcp(12.4), "12,4");
});

test("formaterHcp: negativ (plus-HCP) → '+3,5'", () => {
  assert.equal(formaterHcp(-3.5), "+3,5");
});

test("formaterHcp: 0,0 → '0,0'", () => {
  assert.equal(formaterHcp(0), "0,0");
});

// ---------------------------------------------------------------------------
// vurderHcpKlasse
// ---------------------------------------------------------------------------

test("vurderHcpKlasse: null → UKJENT", () => {
  assert.equal(vurderHcpKlasse(null), "UKJENT");
});

test("vurderHcpKlasse: negativ → PROF", () => {
  assert.equal(vurderHcpKlasse(-2.5), "PROF");
});

test("vurderHcpKlasse: 0–5.4 → ELITE", () => {
  assert.equal(vurderHcpKlasse(0), "ELITE");
  assert.equal(vurderHcpKlasse(5.4), "ELITE");
});

test("vurderHcpKlasse: 5.5–18.4 → MIDS", () => {
  assert.equal(vurderHcpKlasse(5.5), "MIDS");
  assert.equal(vurderHcpKlasse(18.4), "MIDS");
});

test("vurderHcpKlasse: >= 18.5 → HOY", () => {
  assert.equal(vurderHcpKlasse(18.5), "HOY");
  assert.equal(vurderHcpKlasse(36), "HOY");
});
