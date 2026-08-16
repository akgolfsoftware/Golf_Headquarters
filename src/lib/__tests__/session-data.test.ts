/**
 * TestSession.scoringData — (de)serialisering og steg-indeks (T5).
 * Ren logikk: parseSessionScoring (zod, tolerant), mergeSteg,
 * beregnCurrentStepIndex og tilScorekortState — pluss protokoll→steg-mapping
 * (parseProtocol) sett gjennom sesjonslinsa: forsøk i spec-en og forsøk i
 * scoringData skal pare 1:1 på nr.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  beregnCurrentStepIndex,
  mergeSteg,
  parseSessionScoring,
  tilScorekortState,
  type SessionScoring,
} from "../portal-tester/session-data";
import { parseProtocol } from "../portal-tester/protocol";

/* ── parseSessionScoring ─────────────────────────────────────────────────── */

test("parseSessionScoring: gyldig data leses tilbake uendret", () => {
  const data = { forsok: { "1": { ok: true }, "3": { carry: 212.5, side: null } } };
  assert.deepEqual(parseSessionScoring(data), data);
});

test("parseSessionScoring: ugyldig/tom JSON → tom scoringData (aldri kast)", () => {
  assert.deepEqual(parseSessionScoring(null), { forsok: {} });
  assert.deepEqual(parseSessionScoring({}), { forsok: {} });
  assert.deepEqual(parseSessionScoring([1, 2]), { forsok: {} });
  // Streng-verdi er ikke lov (tall/boolean/null) → hele lesingen faller tilbake.
  assert.deepEqual(parseSessionScoring({ forsok: { "1": { ok: "ja" } } }), { forsok: {} });
  // Nøkkel må være 1-basert forsøksnummer.
  assert.deepEqual(parseSessionScoring({ forsok: { "0": { ok: true } } }), { forsok: {} });
});

/* ── mergeSteg ───────────────────────────────────────────────────────────── */

test("mergeSteg: stegIndex er 0-basert mot forsøksnummer 1-basert", () => {
  const ut = mergeSteg({ forsok: {} }, 0, { ok: true });
  assert.deepEqual(ut, { forsok: { "1": { ok: true } } });
});

test("mergeSteg: overskriver eksisterende steg og lar andre stå", () => {
  const inn: SessionScoring = { forsok: { "1": { ok: true }, "2": { ok: false } } };
  const ut = mergeSteg(inn, 1, { ok: true });
  assert.deepEqual(ut, { forsok: { "1": { ok: true }, "2": { ok: true } } });
  // Immutabelt — input røres ikke.
  assert.deepEqual(inn.forsok["2"], { ok: false });
});

test("mergeSteg: kun null-verdier avregistrerer steget", () => {
  const inn: SessionScoring = { forsok: { "1": { ok: true }, "2": { ok: false } } };
  const ut = mergeSteg(inn, 1, { ok: null });
  assert.deepEqual(ut, { forsok: { "1": { ok: true } } });
});

/* ── beregnCurrentStepIndex ──────────────────────────────────────────────── */

test("beregnCurrentStepIndex: neste steg = antall sammenhengende førte fra forsøk 1", () => {
  assert.equal(beregnCurrentStepIndex({ forsok: {} }), 0);
  assert.equal(
    beregnCurrentStepIndex({ forsok: { "1": { ok: true }, "2": { ok: false }, "3": { ok: true } } }),
    3,
  );
});

test("beregnCurrentStepIndex: hull i rekka stopper tellingen", () => {
  assert.equal(beregnCurrentStepIndex({ forsok: { "1": { ok: true }, "3": { ok: true } } }), 1);
  // Kun null-verdier teller ikke som ført.
  assert.equal(beregnCurrentStepIndex({ forsok: { "1": { carry: null } } }), 0);
});

/* ── tilScorekortState ───────────────────────────────────────────────────── */

test("tilScorekortState: tall → norsk streng, boolean beholdes, null utelates", () => {
  const ut = tilScorekortState({
    forsok: { "1": { ok: true }, "2": { carry: 212.5, side: null }, "3": { carry: null } },
  });
  assert.deepEqual(ut, { 1: { ok: true }, 2: { carry: "212,5" } });
});

/* ── Protokoll→steg-mapping mot sesjonsdata ──────────────────────────────── */

const VARIANT_A = {
  unit: "poeng",
  scoringMode: "sum",
  steps: [
    { id: "s1", label: "Putt 3m", shots: 2, inputFields: [{ key: "poeng", label: "Poeng", unit: "poeng" }] },
    { id: "s2", label: "Putt 6m", shots: 1, target: "2", inputFields: [{ key: "poeng", label: "Poeng", unit: "poeng" }] },
  ],
};

const VARIANT_B = {
  shots: [
    { nr: 2, label: "Gate #2" },
    { nr: 1, label: "Gate #1" },
  ],
  inputFields: [{ key: "ok", label: "OK", unit: "ja/nei" }],
  scoring: "count_ok",
};

test("variant A: steps×shots → fortløpende forsøksnummer som parer mot scoringData", () => {
  const spec = parseProtocol(VARIANT_A);
  assert.ok(spec);
  assert.deepEqual(
    spec.forsok.map((f) => [f.nr, f.label]),
    [[1, "Putt 3m"], [2, "Putt 3m"], [3, "Putt 6m"]],
  );
  assert.equal(spec.forsok[2].target, "2");

  // Fører spilleren de to første forsøkene, står økta på steg 2 (0-indeksert).
  let data: SessionScoring = { forsok: {} };
  for (const f of spec.forsok.slice(0, 2)) {
    data = mergeSteg(data, f.nr - 1, { poeng: 3 });
  }
  assert.equal(beregnCurrentStepIndex(data), 2);
});

test("variant B: shots sorteres på nr og renummereres 1..n (samme paring som motoren)", () => {
  const spec = parseProtocol(VARIANT_B);
  assert.ok(spec);
  assert.deepEqual(
    spec.forsok.map((f) => [f.nr, f.label]),
    [[1, "Gate #1"], [2, "Gate #2"]],
  );
  assert.equal(spec.forsok[0].felter[0].type, "checkbox");

  // Roundtrip: klient-state ↔ scoringData for checkbox-forsøk.
  const data = mergeSteg(mergeSteg({ forsok: {} }, 0, { ok: true }), 1, { ok: false });
  assert.deepEqual(tilScorekortState(data), { 1: { ok: true }, 2: { ok: false } });
  assert.equal(beregnCurrentStepIndex(data), 2);
});
