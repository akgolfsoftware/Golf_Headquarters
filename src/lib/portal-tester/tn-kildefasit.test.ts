import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { z } from "zod";
import { TN_CATALOG } from "./tn-catalog";
import { tnScore, tnValidate, type TnValues } from "./tn-scoring";

const register = z.object({
  protocols: z.array(z.object({ id: z.string(), count: z.number().optional() })),
  acceptanceCases: z.array(z.object({
    protocolId: z.string(), inputs: z.unknown(),
    expected: z.object({ pei: z.number().optional(), points: z.number().optional(), totalStrokes: z.number().optional(), hits: z.number().optional(), meanAbsoluteResidualCm: z.number().optional() }),
  })),
}).parse(JSON.parse(readFileSync(new URL("../../../docs/planer/testbatteri-protokollregister-2026-10-02.json", import.meta.url), "utf8")));
const inputRows = z.array(z.record(z.string(), z.unknown()));

// Expected values were calculated independently from the attached workbook's
// targets, not by tnScore. Includes explicit field mapping for the verified gate and speed rules.
for (const protocol of TN_CATALOG.filter(p => !p.blocked)) {
  test(`uavhengig kildefasit: ${protocol.id}`, () => {
    const fixture = register.acceptanceCases.find(c => c.protocolId === protocol.id)!;
    assert.ok(fixture, "Protokollen må ha en egen fasit");
    const inputs = inputRows.parse(fixture.inputs);
    const values: TnValues = {};
    for (const [i, row] of protocol.rows.entries()) {
      const source = inputs[i];
      const fields: TnValues[string] = {};
      for (const field of row.fields) {
        if (field.optional) continue;
        const raw = source[field.key]
          ?? (field.key === "ok" ? source.hit ?? source.gateClear : undefined)
          ?? (field.key === "speedZone" ? source.withinSpeedZone : undefined)
          ?? (field.key === "distanceUnit" ? source.unit : undefined);
        if (typeof raw === "number" || typeof raw === "string") fields[field.key] = raw;
        else if (field.key === "hole") fields.hole = i + 1;
        else if (field.choices) fields[field.key] = field.choices[0];
        else assert.fail(`Fasit mangler ${field.key}`);
      }
      if (protocol.id === "putt-gate" && fields.ok === "Nei") fields.miss = "Venstre";
      values[String(i + 1)] = fields;
    }
    assert.equal(tnValidate(protocol, values, true), null);
    const actual = tnScore(protocol, values);
    const expected = fixture.expected;
    const expectedMain = protocol.points8Ball || protocol.kind === "points" ? expected.points
      : protocol.kind === "gate" ? expected.hits
      : protocol.kind === "speed" ? expected.meanAbsoluteResidualCm! / 30.48
      : protocol.kind === "putts" ? expected.totalStrokes : expected.pei;
    assert.equal(typeof expectedMain, "number");
    assert.ok(Math.abs(actual.score - expectedMain!) < 1e-12);
    if (expected.pei !== undefined) {
      assert.ok(Math.abs(actual.metrics.find(m => m.label === "Gjennomsnittlig PEI")!.value - expected.pei) < 1e-12);
    }
    // Removing one result must never produce Excel's full-score empty template.
    delete values["1"];
    assert.ok(tnValidate(protocol, values, true));
    assert.throws(() => tnScore(protocol, values));
  });
}

test("8-ball-grenser er nedre intervallgrenser, og verdier rundes ikke før oppslag", () => {
  const p = TN_CATALOG.find(p => p.id === "8-ball-variation")!;
  for (const [rest, points] of [[0, 4], [0.099, 4], [0.1, 3], [0.999, 3], [1, 2], [1.999, 2], [2, 1], [2.999, 1], [3, 0]]) {
    const values = Object.fromEntries(p.rows.map((_, i) => [String(i + 1), { result: rest }]));
    assert.equal(tnScore(p, values).score, points * 24);
  }
  assert.throws(() => tnScore(p, {}));
});

test("fasitregisteret forklarer hele utvalget, inkludert uavklarte protokoller", () => {
  assert.equal(register.protocols.length, 43);
  assert.equal(register.acceptanceCases.length, 38);
  for (const p of TN_CATALOG) assert.ok(register.protocols.some(r => r.id === p.id));
  assert.equal(register.protocols.find(p => p.id === "teknikktest-c")?.count, 10);
  assert.ok(register.protocols.some(p => p.id === "fys-club-speed"));
  assert.ok(!register.protocols.some(p => p.id.includes("3000")));
});
