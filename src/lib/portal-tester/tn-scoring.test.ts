import { test } from "node:test";
import assert from "node:assert/strict";
import source from "./fixtures/tn-excel-v3.json";
import { GATE_POENG_IDS, TN_CATALOG, TN_GODKJENT_VERSION, TN_POENG_VERSION, TN_RULES_VERSION, TN_VERSION, tnProtocol } from "./tn-catalog";
import { tnScore, tnValidate, tnFormat, tnRowPreview, type TnValues } from "./tn-scoring";
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
  assert.equal(tnFormat({ value: 0.05, unit: "PEI" }), "5 %");
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
test("lagret 8-ball fra før 14.10 regnes fortsatt med meter fra hull og gammel skala", () => {
  const p = tnProtocol("8-ball-variation", undefined, TN_VERSION)!;
  const values = Object.fromEntries(p.rows.map((_, i) => [String(i + 1), { result: 0.1 }]));
  assert.equal(tnScore(p, values).metrics.find(m => m.label === "Totalt antall poeng")!.value, 72);
  values["1"].result = 1;
  assert.equal(tnScore(p, values).metrics.find(m => m.label === "Totalt antall poeng")!.value, 71);
  assert.equal(tnScore(p, values).version, TN_VERSION);
});

const atteBall = (row: (target: number) => TnValues[string]) => {
  const p = tnProtocol("8-ball-blocked")!;
  return { p, values: Object.fromEntries(p.rows.map((r, i) => [String(i + 1), row(r.target!)])) as TnValues };
};
test("8-ball føres med carry og side: i hull 5, innenfor 1 m 3, 2 m 2, 3 m 1, lenger unna 0", () => {
  for (const [side, points] of [[0, 3], [0.999, 3], [1, 2], [1.999, 2], [2, 1], [2.999, 1], [3, 0], [12, 0]]) {
    const { p, values } = atteBall(target => ({ carry: target, side }));
    const r = tnScore(p, values);
    assert.equal(r.version, TN_GODKJENT_VERSION);
    assert.equal(r.unit, "poeng");
    assert.equal(r.score, points * 24, `side ${side} m`);
  }
  const { p, values } = atteBall(() => ({ holed: "I hull" }));
  const r = tnScore(p, values);
  assert.equal(r.score, 5 * 24);
  assert.equal(r.metrics.find(m => m.label === "Gjennomsnittlig PEI")!.value, 0);
  assert.equal(r.metrics.find(m => m.label === "Forventede putter · Excel")!.value, 0);
});
test("8-ball: 5 m til siden på riktig lengde er 5 m fra hullet, og vises rett etter slaget", () => {
  const { p, values } = atteBall(target => ({ carry: target, side: 5 }));
  const wedge40 = p.rows.findIndex(r => r.label === "Wedge40");
  values[String(wedge40 + 1)] = { carry: 40, side: -5 };
  assert.deepEqual(tnRowPreview(p, wedge40, values[String(wedge40 + 1)]), { distance: 5, pei: 0.125, points: 0 });
  assert.deepEqual(tnRowPreview(p, 0, { carry: 7, side: 4 }), { distance: 5, pei: 0.5, points: 0 });
  assert.deepEqual(tnRowPreview(p, 0, { holed: "I hull" }), { distance: 0, pei: 0, points: 5 });
  assert.equal(tnRowPreview(p, 0, { carry: 7 }), null);
  assert.equal(tnScore(p, values).metrics.find(m => m.label === "Gjennomsnittlig restavstand")!.value, 5);
});
test("8-ball krever carry og side, eller i hull, men ikke begge", () => {
  const { p, values } = atteBall(target => ({ carry: target, side: 0 }));
  values["1"] = { carry: 10 };
  assert.match(tnValidate(p, values, true)!, /sideavvik/);
  values["1"] = { carry: 10, side: 0, holed: "I hull" };
  assert.match(tnValidate(p, values, true)!, /Fjern carry og side/);
  values["1"] = { result: 2 };
  assert.match(tnValidate(p, values, true)!, /Ukjent felt/);
  values["1"] = { holed: "I hull" };
  assert.equal(tnValidate(p, values, true), null);
});
test("PEI-testene viser avstand fra hullet og PEI rett etter hvert slag", () => {
  for (const p of TN_CATALOG.filter(p => p.id.startsWith("pei-") && p.kind === "carry")) {
    const i = 0;
    const target = p.rows[i].target ?? 100;
    const row = { ...(p.rows[i].target === undefined ? { target } : {}), carry: target, side: 5 };
    assert.deepEqual(tnRowPreview(p, i, row), { distance: 5, pei: 5 / target }, p.id);
  }
});

const gate = (id: string, hits: number, version?: string): TnValues => {
  const p = tnProtocol(id, undefined, version)!;
  return Object.fromEntries(p.rows.map((_, i) => [String(i + 1), {
    ok: i < hits ? "Godkjent" : "Bom",
    ...(id === "putt-gate" ? { speedZone: "Ja", ...(i >= hits ? { miss: "Venstre" } : {}) } : {}),
  }]));
};
/** Gate med poeng: `porten` slag gjennom porten, av dem `sonen` også i sonen. */
const poeng = (id: string, porten: number, sonen: number): TnValues => Object.fromEntries(tnProtocol(id)!.rows.map((_, i) => [String(i + 1), {
  ok: i < sonen ? "I sonen" : i < porten ? "Gjennom porten" : "Bom",
}]));
for (const id of GATE_POENG_IDS) test(`${id}: 1 poeng gjennom porten, 4 i sonen, maks 36 (Anders 20.10)`, () => {
  const p = tnProtocol(id)!;
  assert.equal(p.kind, "gate");
  assert.equal(p.version, TN_POENG_VERSION);
  assert.equal(p.blocked, undefined);
  assert.equal(p.rows.length, 9);
  assert.ok(p.rows.every(r => r.fields.length === 1 && r.fields[0].key === "ok" && r.fields[0].choices!.join() === "Bom,Gjennom porten,I sonen"));
  assert.equal(tnScore(p, poeng(id, 1, 0)).score, 1);
  assert.equal(tnScore(p, poeng(id, 1, 1)).score, 4);
  const r = tnScore(p, poeng(id, 6, 2));
  assert.equal(r.score, 2 * 4 + 4 * 1);
  assert.equal(tnFormat(r.metrics[0]), "12 / 36 p");
  assert.equal(tnFormat(tnScore(p, poeng(id, 0, 0)).metrics[0]), "0 / 36 p");
  assert.equal(tnFormat(tnScore(p, poeng(id, 9, 9)).metrics[0]), "36 / 36 p");
  assert.match(tnValidate(p, { "1": { ok: "Godkjent" } }, false)!, /gyldig verdi/);
});
test("Wedge Gate bruker 40, 50 og 60 m (poengarket, Anders 20.10)", () => {
  assert.deepEqual([...new Set(tnProtocol("wedge-gate")!.rows.map(r => r.label.match(/(\d+) m/)?.[1]))], ["40", "50", "60"]);
});
test("Driver Gate og Putt Gate vises som «X / 6 OK» og «X / 10 OK»", () => {
  for (const [id, n] of [["driver-gate", 6], ["putt-gate", 10]] as const) {
    const p = tnProtocol(id)!;
    assert.equal(p.version, TN_POENG_VERSION);
    assert.equal(tnFormat(tnScore(p, gate(id, 4)).metrics[0]), `4 / ${n} OK`);
  }
});
test("ingen gate-test viser treff som resultatord", () => {
  for (const p of TN_CATALOG.filter(p => p.kind === "gate")) {
    assert.ok(p.rows.every(r => r.fields.every(f => !f.label.toLowerCase().includes("treff") && !(f.choices ?? []).includes("Ja") || f.key === "speedZone")), p.id);
    const r = tnScore(p, (GATE_POENG_IDS as readonly string[]).includes(p.id) ? poeng(p.id, 1, 0) : gate(p.id, 1));
    assert.ok(r.metrics.every(m => !`${m.label} ${m.unit}`.toLowerCase().includes("treff")), p.id);
  }
});
test("lagrede gateresultater leses med sin egen regelversjon", () => {
  // Godkjent/Bom fra 14.10 gir fortsatt «X / 9 godkjent».
  for (const id of GATE_POENG_IDS) {
    const p = tnProtocol(id, undefined, TN_GODKJENT_VERSION)!;
    assert.equal(tnFormat(tnScore(p, gate(id, 3, TN_GODKJENT_VERSION)).metrics[0]), "3 / 9 godkjent");
  }
  // Utkast og resultater ført med «Ja» før 14.10 leses fortsatt med sin egen regelversjon.
  const old = tnProtocol("naerspill-gate", undefined, TN_RULES_VERSION)!;
  assert.equal(old.kind, "points");
  assert.equal(tnValidate(old, { "1": { points: 1 } }, false), null);
});
test("ukjente gate-regler produserer ikke falsk standardscore", () => {
  const p = tnProtocol("naerspill-gate", undefined, TN_VERSION)!;
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
