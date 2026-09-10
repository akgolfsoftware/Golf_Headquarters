import { test } from "node:test";
import assert from "node:assert/strict";
import source from "./fixtures/tn-excel-v3.json";
import { TN_CATALOG, tnProtocol } from "./tn-catalog";
import { tnScore, tnValidate, tnFormat, type TnValues } from "./tn-scoring";
import { validateCompletion } from "./validate-completion";
import { scoreTest } from "./test-scoring";

for (const [id, reference] of Object.entries(source.targets)) test(`Excel-kildeparitet: ${id} (${reference.sheet}!${reference.range})`, () => {
  assert.deepEqual(tnProtocol(id)!.rows.map(r => r.target), reference.values);
});
test("alle katalog-ID-er er unike og alle rader har kilde og registreringsfelt", () => {
  assert.equal(new Set(TN_CATALOG.map(p => p.id)).size, TN_CATALOG.length);
  for (const p of TN_CATALOG) { assert.ok(p.source.includes("!")); assert.ok(p.rows.every(r => r.fields.length > 0)); }
});
test("putting registrerer slag, alle fem distansesnitt og korrekt fortegn", () => {
  const p = tnProtocol("putt-1-3m")!;
  const values = Object.fromEntries(p.rows.map((_, i) => [String(i + 1), { strokes: 1 }]));
  const first = tnScore(p, values);
  assert.equal(first.score, 25); assert.equal(first.metrics.length, 7);
  values["5"].strokes = 4;
  assert.equal(tnScore(p, values).score, 28);
  assert.ok(Math.abs(first.metrics[1].value - tnScore(p, values).metrics[1].value - 3) < 1e-10);
  values["5"].strokes = 1.5;
  assert.match(tnValidate(p, values, true)!, /Antall|antall/);
});
test("PEI bruker geometri og snitt av forholdstall; manglende side er ikke null", () => {
  const p = { ...tnProtocol("wedge-variation")!, rows: tnProtocol("wedge-variation")!.rows.slice(0, 2).map((r, i) => ({ ...r, target: i ? 100 : 10 })) };
  const values: TnValues = { "1": { carry: 9, side: 0 }, "2": { carry: 99, side: 0 } };
  assert.equal(tnScore(p, values).score, 0.055);
  p.rows[0].target = 100; values["1"] = { carry: 97, side: 4 }; values["2"] = { carry: 97, side: 4 };
  assert.equal(tnScore(p, values).score, 0.05);
  assert.equal(tnFormat({ value: 0.05, unit: "PEI" }), "5 %");
  delete values["1"].side;
  assert.throws(() => tnScore(p, values), /sideavvik/);
});
test("utkast tillater hull i rekkefølgen; fullføring avviser mangler og ekstrarader", () => {
  const p = tnProtocol("putt-1-3m")!;
  assert.equal(tnValidate(p, { "2": { strokes: 2 } }, false), null);
  assert.ok(tnValidate(p, { "2": { strokes: 2 } }, true));
  assert.ok(tnValidate(p, { "26": { strokes: 2 } }, false));
  assert.ok(tnValidate(p, { "1": { strokes: 0 } }, false));
  assert.ok(tnValidate(p, { "1": { strokes: Infinity } }, false));
  assert.ok(tnValidate(p, { "1": { score: 100 } }, false));
});
test("8-ball bruker meter og terskler uten å runde input", () => {
  const p = tnProtocol("8-ball-variation")!;
  const values = Object.fromEntries(p.rows.map((_, i) => [String(i + 1), { result: 0.1 }]));
  assert.equal(tnScore(p, values).metrics.find(m => m.label === "Totalt antall poeng")!.value, 72);
  values["1"].result = 1;
  assert.equal(tnScore(p, values).metrics.find(m => m.label === "Totalt antall poeng")!.value, 71);
});
test("ukjente gate-regler produserer ikke falsk standardscore", () => {
  const p = tnProtocol("naerspill-gate")!;
  const values = Object.fromEntries(p.rows.map((_, i) => [String(i + 1), { points: 1 }]));
  assert.equal(tnValidate(p, values, false), null);
  assert.throws(() => tnScore(p, values), /Poengskala/);
});
test("PEI Bane bruker valgt antall og faktisk hullnummer, ikke lengde som totalscore", () => {
  const p = tnProtocol("pei-test-bane", 2)!;
  assert.equal(tnScore(p, { "1": { target: 100, result: 5, hole: 4, startLie: "Rough" }, "2": { target: 50, result: 5, hole: 4, startLie: "Fairway" } }).score, 0.07500000000000001);
  assert.equal(tnProtocol("putt-1-3m", 2), null);
  assert.equal(tnProtocol("pei-test-bane", 0), null);
});
test("legacy fullføring kontrollerer felt, rekkefølge, hovedmåling og ukjent regel", () => {
  const protocol = { scoringMode: "average", primaryMetric: "measured", steps: [{ id: "s", label: "Måling", shots: 2, inputFields: [{ key: "target", label: "Mål", unit: "m" }, { key: "measured", label: "Målt", unit: "m" }] }] };
  const rs = [{ nr: 1, verdier: { target: 100, measured: 4 } }, { nr: 2, verdier: { target: 200, measured: 6 } }];
  assert.equal(validateCompletion(protocol, rs), null);
  assert.equal(scoreTest(protocol, rs).score, 5);
  assert.ok(validateCompletion(protocol, rs.slice(0, 1)));
  assert.ok(validateCompletion(protocol, [rs[0], rs[0]]));
  assert.ok(validateCompletion(null, [{ nr: 1, verdier: { score: 0 } }]));
});

test("alle brukte forventningsreferanser samsvarer celle for celle med arbeidsboken", async () => {
  const { default: refs } = await import("./fixtures/tn-excel-v3-references.json");
  const { FORVENTEDE_PUTTER_GROV, SG_ETTER_LIE } = await import("@/lib/domain/pei/broadie-sg-tabeller");
  for (const [actual, expected] of [[FORVENTEDE_PUTTER_GROV, refs.tables.puttCoarse.values], [SG_ETTER_LIE.green, refs.tables.puttFine.values], [SG_ETTER_LIE.fairway, refs.tables.fairway.values]]) {
    // Excel contains duplicate fairway lower bound 411.01; approximate lookup selects the last row.
    const lookupRows = [...new Map(expected.map(row => [row[0], row])).values()];
    assert.equal(actual.length, lookupRows.length);
    actual.forEach((row, i) => row.forEach((value, j) => assert.ok(Math.abs(value - lookupRows[i][j]) < 1e-12, `Rad ${i}, kolonne ${j}: ${value} != ${lookupRows[i][j]}`)));
  }
});
