import assert from "node:assert/strict";
import { test } from "node:test";
import { TN_VERSION, TN_RULES_VERSION, tnProtocol, tnVersion } from "./tn-catalog";
import { tnScore, tnValidate, tnFormat, tnSameScore, tnSameValues, type TnValues } from "./tn-scoring";
import { tnDefinitionId, tnFromDefinitionId, tnComparableResult } from "./tn-integration";
import { TnSessionSchema } from "./tn-session";

function gate(id: string, hits: number): TnValues {
  const p = tnProtocol(id)!;
  return Object.fromEntries(p.rows.map((_, i) => [String(i + 1), {
    ok: i < hits ? "Ja" : "Nei",
    ...(id === "putt-gate" ? { speedZone: "Ja", ...(i >= hits ? { miss: "Venstre" } : {}) } : {}),
  }]));
}

for (const [id, hits, count] of [["driver-gate", 3, 6], ["wedge-gate", 6, 9], ["putt-gate", 5, 10]] as const) {
  test(`${id}: teller bare godkjente forsøk, også ved null treff`, () => {
    const p = tnProtocol(id)!;
    assert.equal(p.rows.length, count);
    const r = tnScore(p, gate(id, hits));
    assert.equal(r.score, hits);
    assert.equal(r.unit, "treff");
    assert.equal(r.version, TN_RULES_VERSION);
    assert.equal(tnFormat(r.metrics[1]), `${(100 * hits / count).toLocaleString("nb-NO", { maximumFractionDigits: 2 })} %`);
    assert.equal(tnScore(p, gate(id, 0)).score, 0);
    assert.equal(tnScore(p, gate(id, count)).score, count);
    assert.throws(() => tnScore(p, {}));
  });
}

test("rett putt utenfor lengdesonen er et gyldig, mislykket forsøk uten sidebom", () => {
  const p = tnProtocol("putt-gate")!;
  const values = gate(p.id, 10);
  values["1"] = { ok: "Ja", speedZone: "Nei" };
  assert.equal(tnValidate(p, values, true), null);
  assert.equal(tnScore(p, values).score, 9);
  values["1"].miss = "Venstre";
  assert.match(tnValidate(p, values, true)!, /Fjern bomretning/);
  values["1"] = { ok: "Nei", speedZone: "Ja" };
  assert.match(tnValidate(p, values, true)!, /bomretning/);
});

test("Putt Speed omregner blandede enheter uten å nulle kort mot lang", () => {
  const p = tnProtocol("putt-speed-1x5")!;
  const values: TnValues = {
    "1": { distance: 30.48, distanceUnit: "cm", longShort: "Kort" },
    "2": { distance: 0.3048, distanceUnit: "m", longShort: "Lang" },
    "3": { distance: 1, distanceUnit: "fot", longShort: "Lang" },
    "4": { distance: 0, distanceUnit: "cm", longShort: "På mål" },
    "5": { distance: 2, distanceUnit: "fot", longShort: "Kort" },
  };
  assert.ok(Math.abs(tnScore(p, values).score - 1) < 1e-12);
  assert.equal(tnFormat(tnScore(p, values).metrics[0]), "1 fot");
  values["1"].distance = -1;
  assert.ok(tnValidate(p, values, false));
  values["1"].distance = 0;
  assert.match(tnValidate(p, values, true)!, /på mål/);
  values["1"] = { distance: 1, distanceUnit: "cm", longShort: "På mål" };
  assert.match(tnValidate(p, values, true)!, /kort eller lang/);
});

test("ny regelidentitet bevarer gamle gateutkast og skiller historikken", () => {
  const current = tnProtocol("wedge-gate")!;
  const legacy = tnProtocol("wedge-gate", undefined, TN_VERSION)!;
  assert.ok(legacy.blocked);
  assert.equal(legacy.kind, "points");
  assert.equal(current.kind, "gate");
  assert.equal(tnVersion(legacy), TN_VERSION);
  assert.equal(tnFromDefinitionId(tnDefinitionId(legacy)), legacy);
  assert.equal(tnFromDefinitionId(tnDefinitionId(current)), current);
  const result = tnScore(current, gate(current.id, 6));
  assert.ok(tnComparableResult(tnDefinitionId(current), 6, result));
  assert.equal(tnComparableResult(tnDefinitionId(legacy), 6, result), null);
  assert.equal(tnComparableResult(tnDefinitionId(current), 6, { ...result, version: TN_VERSION }), null);
  assert.equal(tnProtocol("wedge-gate", undefined, "unknown"), null);
  assert.equal(tnProtocol("putt-1-3m", undefined, TN_RULES_VERSION), null);
  assert.ok(TnSessionSchema.safeParse({ version: TN_VERSION, protocolId: legacy.id, count: 9, revision: 1, values: { "1": { points: 2.5 } } }).success);
  assert.equal(tnValidate(legacy, { "1": { points: 2.5 } }, false), null);
});


test("JSONB-feltrekkefølge og minimal flyttallstøy endrer ikke et lagret resultat", () => {
  assert.ok(tnSameValues({ "1": { carry: 4, side: 1 } }, { "1": { side: 1, carry: 4 } }));
  assert.ok(!tnSameValues({ "1": { carry: 4 } }, { "1": { carry: 4, side: null } }));
  assert.ok(!tnSameValues({ "1": { carry: 4 } }, { "1": { carry: 5 } }));
  assert.ok(tnSameScore(0.0161410033903111, 0.016141003390311135));
  assert.ok(!tnSameScore(0.032, 0.0320001));
  assert.ok(!tnSameScore(Infinity, Infinity));
});


test("teknikk C har fem pluss fem i ny utgave og bevarer gamle 15-radersutkast", () => {
  assert.equal(tnProtocol("teknikktest-c")!.rows.length, 10);
  assert.equal(tnProtocol("teknikktest-c", undefined, TN_VERSION)!.rows.length, 15);
  assert.ok(tnProtocol("teknikktest-c")!.blocked);
});
