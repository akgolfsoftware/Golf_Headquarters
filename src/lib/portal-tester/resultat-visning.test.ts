import { test } from "node:test";
import assert from "node:assert/strict";
import { formaterTestMetrikk, formaterTestVerdi } from "./format-verdi";
import { formaterLagretTestResultat, sammenlignLagredeTestresultater } from "./resultat-visning";
import { tnProtocol } from "./tn-catalog";
import { tnScore } from "./tn-scoring";
import { tnComparableResult } from "./tn-integration";

test("PEI har eksplisitt brøkskala også over 1,5 og bevarer prosentpresisjon", () => {
  for (const [raw, expected] of [[0, "0 %"], [0.032, "3,2 %"], [0.0325, "3,25 %"], [1, "100 %"], [1.6, "160 %"]] as const) {
    assert.equal(formaterTestMetrikk(raw, "PEI"), expected);
    assert.equal(formaterLagretTestResultat({ testId: "legacy", score: raw, details: { version: 2, scoring: "pei_average" }, protocol: null }), expected);
  }
  assert.equal(formaterTestMetrikk(null, "PEI"), "—");
  assert.equal(formaterTestMetrikk(NaN, "PEI"), "—");
});

test("manuelle halve poeng rundes ikke til hele poeng", () => {
  assert.equal(formaterTestVerdi({ kind: "points_total", verdi: 12.5 }), "12,5 p");
  assert.equal(formaterTestVerdi({ kind: "sum", verdi: 0.5 }), "0,5 p");
});

test("TN-resultatet vises likt fra lagret protokollstub og validerte rådata", () => {
  const p = tnProtocol("pei-test-bane", 1)!;
  const details = tnScore(p, { "1": { target: 100, result: 3.2, hole: 1, startLie: "Fairway" } });
  const stored = { testId: "tn-v3-pei-test-bane", score: details.score, details, protocol: { version: details.version, protocolId: p.id } };
  assert.equal(formaterLagretTestResultat(stored), "3,2 %");
  assert.equal(tnComparableResult(stored.testId, stored.score, details)?.direction, "lower");
  assert.equal(formaterLagretTestResultat({ ...stored, details: null }), "Resultatet må kontrolleres");
  assert.equal(formaterLagretTestResultat({ ...stored, details: { ...details, unit: "m" } }), "Resultatet må kontrolleres");
  assert.equal(tnComparableResult(stored.testId, 123, { ...details, score: 123 }), null);
  const spoofed = { ...details, metrics: [{ label: "Feil", value: 400, unit: "PEI", lowerIsBetter: false }] };
  assert.equal(tnComparableResult(stored.testId, stored.score, spoofed)?.metrics[0].value, 0.032);
});

test("eldre PEI uten eksplisitt skala beholder dokumentert leseregel", () => {
  const protocol = { scoring: "pei_average", shots: [{ nr: 1, target: 100 }] };
  assert.equal(formaterLagretTestResultat({ testId: "old", score: 5.7, details: null, protocol }), "5,70 %");
});

test("beregnet resultat er et øyeblikksbilde selv om scorekortet endres videre", () => {
  const p = tnProtocol("putt-1-3m")!;
  const values = Object.fromEntries(p.rows.map((_, i) => [String(i + 1), { strokes: 1 }]));
  const first = tnScore(p, values);
  values["1"].strokes = 2;
  assert.equal(first.values["1"].strokes, 1);
  assert.equal(tnComparableResult("tn-v3-putt-1-3m", first.score, first)?.score, 25);
  assert.equal(tnScore(p, values).score, 26);
});

test("trend viser prosentpoeng og sammenligner aldri ulike testlengder", () => {
  const p = tnProtocol("pei-test-bane", 1)!;
  const make = (result: number) => {
    const details = tnScore(p, { "1": { target: 100, result, hole: 1, startLie: "Fairway" } });
    return { testId: "tn-v3-pei-test-bane", score: details.score, details, protocol: null };
  };
  const newer = make(3.2);
  const older = make(5);
  const comparison = sammenlignLagredeTestresultater(newer, older)!;
  assert.equal(comparison.tekst, "−1,8 pp");
  assert.equal(comparison.lavereErBedre, true);
  assert.equal(sammenlignLagredeTestresultater(newer, { ...older, testId: "other" }), null);
  const q = tnProtocol("pei-test-bane", 2)!;
  const details = tnScore(q, { ...older.details.values, "2": older.details.values["1"] });
  assert.equal(sammenlignLagredeTestresultater(newer, { ...older, details }), null);
});
