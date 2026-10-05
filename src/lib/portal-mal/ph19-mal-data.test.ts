import test from "node:test";
import assert from "node:assert/strict";
import {
  hentKildeLabel,
  formatDatoKort,
  formatDesimal,
  beregnProsent,
  SYNTETISKE_PH19_GOALS,
} from "./ph19-mal-data";

test("hentKildeLabel gir riktig norsk benevnelse", () => {
  assert.equal(hentKildeLabel("HCP_TARGET"), "HCP-MÅL");
  assert.equal(hentKildeLabel("ROUNDS_PER_MONTH"), "RUNDER / SESONG");
  assert.equal(hentKildeLabel("SESSION_FREQUENCY"), "TRENINGSØKTER");
  assert.equal(hentKildeLabel("TEST_SCORE"), "TEST");
  assert.equal(hentKildeLabel("UKJENT"), "MÅL");
});

test("formatDatoKort formaterer til norsk datoformat", () => {
  const d = new Date(2026, 9, 31); // 31. oktober 2026
  assert.equal(formatDatoKort(d), "31.10.2026");
});

test("formatDesimal formaterer heltall og desimaler med komma", () => {
  assert.equal(formatDesimal(5), "5");
  assert.equal(formatDesimal(75.2), "75,2");
  assert.equal(formatDesimal(74.0), "74");
});

test("beregnProsent beregner måloppnåelse korrekt", () => {
  assert.equal(beregnProsent(5, 10, "PROCESS"), 50);
  assert.equal(beregnProsent(10, 10, "PROCESS"), 100);
  assert.equal(beregnProsent(0, 0, "PROCESS"), 0);
  assert.equal(beregnProsent(3.2, 2.0, "HCP_TARGET") > 0, true);
});

test("SYNTETISKE_PH19_GOALS er gyldige målsetninger", () => {
  assert.equal(SYNTETISKE_PH19_GOALS.length, 3);
  for (const g of SYNTETISKE_PH19_GOALS) {
    assert.ok(g.sentence.length > 0);
    assert.ok(g.due.length > 0);
    assert.ok(g.target > 0);
  }
});
