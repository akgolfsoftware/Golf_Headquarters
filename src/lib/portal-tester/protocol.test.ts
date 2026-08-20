import test from "node:test";
import assert from "node:assert/strict";
import { parseProtocol, fallbackScorekortSpec } from "./protocol";

test("parseProtocol — ugyldig inndata", async (t) => {
  await t.test("null og undefined gir null", () => {
    assert.equal(parseProtocol(null), null);
    assert.equal(parseProtocol(undefined), null);
  });

  await t.test("ukjent form gir null", () => {
    assert.equal(parseProtocol({ noe: "helt annet" }), null);
    assert.equal(parseProtocol({ steps: [] }), null);
    assert.equal(parseProtocol({ shots: [] }), null);
  });
});

test("parseProtocol — variant A (NGF-batteri)", async (t) => {
  await t.test("shots ekspanderes til ett forsøk hver, nummerert fortløpende", () => {
    const spec = parseProtocol({
      steps: [
        { id: "s1", label: "Fra 5 m", shots: 3, inputFields: [{ key: "avstand", label: "Avstand", unit: "m" }] },
        { id: "s2", label: "Fra 10 m", shots: 2, inputFields: [{ key: "avstand", label: "Avstand", unit: "m" }] },
      ],
    });

    assert.ok(spec);
    assert.equal(spec.forsok.length, 5);
    assert.deepEqual(
      spec.forsok.map((f) => f.nr),
      [1, 2, 3, 4, 5],
    );
    assert.equal(spec.forsok[0].label, "Fra 5 m");
    assert.equal(spec.forsok[4].label, "Fra 10 m");
  });

  await t.test("target på steget arves av alle forsøk fra det steget", () => {
    const spec = parseProtocol({
      steps: [{ id: "s1", label: "Putt", shots: 2, target: "8/10", inputFields: [{ key: "traff", label: "Traff", type: "checkbox" }] }],
    });

    assert.ok(spec);
    assert.equal(spec.forsok[0].target, "8/10");
    assert.equal(spec.forsok[1].target, "8/10");
  });

  await t.test("select-felter utelates — de kan ikke representeres i scorekortet", () => {
    const spec = parseProtocol({
      steps: [
        {
          id: "s1",
          label: "Driver",
          shots: 1,
          inputFields: [
            { key: "carry", label: "Carry", unit: "m" },
            { key: "launch", label: "Launch", type: "select" },
          ],
        },
      ],
    });

    assert.ok(spec);
    assert.deepEqual(
      spec.forsok[0].felter.map((f) => f.key),
      ["carry"],
    );
  });

  await t.test("steg der alle felter er select faller tilbake til «Score»", () => {
    const spec = parseProtocol({
      steps: [{ id: "s1", label: "Kun valg", shots: 1, inputFields: [{ key: "launch", label: "Launch", type: "select" }] }],
    });

    assert.ok(spec);
    assert.deepEqual(spec.forsok[0].felter, [{ key: "score", type: "number", label: "Score" }]);
  });

  await t.test("«poeng» arves fra protokollnivå når feltet mangler egen enhet", () => {
    const spec = parseProtocol({
      unit: "poeng",
      steps: [{ id: "s1", label: "Gate", shots: 1, inputFields: [{ key: "res", label: "Resultat" }] }],
    });

    assert.ok(spec);
    assert.equal(spec.unit, "poeng");
    assert.equal(spec.forsok[0].felter[0].unit, "poeng");
    assert.equal(spec.forsok[0].felter[0].type, "poeng");
  });

  await t.test("andre protokollenheter arves IKKE — de beskriver totalen, ikke feltet", () => {
    const spec = parseProtocol({
      unit: "PEI",
      steps: [{ id: "s1", label: "Approach", shots: 1, inputFields: [{ key: "res", label: "Resultat" }] }],
    });

    assert.ok(spec);
    assert.equal(spec.unit, "PEI");
    assert.equal(spec.forsok[0].felter[0].unit, undefined);
    assert.equal(spec.forsok[0].felter[0].type, "number");
  });

  await t.test("feltets egen enhet vinner over den arvede", () => {
    const spec = parseProtocol({
      unit: "poeng",
      steps: [{ id: "s1", label: "Wedge", shots: 1, inputFields: [{ key: "avstand", label: "Avstand", unit: "m" }] }],
    });

    assert.ok(spec);
    assert.equal(spec.forsok[0].felter[0].unit, "m");
    assert.equal(spec.forsok[0].felter[0].type, "meter");
  });
});

test("parseProtocol — variant B (Team Norway)", async (t) => {
  await t.test("slag sorteres på nr og renummereres fra 1", () => {
    const spec = parseProtocol({
      shots: [
        { nr: 3, label: "Slag C" },
        { nr: 1, label: "Slag A" },
        { nr: 2, label: "Slag B" },
      ],
    });

    assert.ok(spec);
    assert.deepEqual(
      spec.forsok.map((f) => [f.nr, f.label]),
      [
        [1, "Slag A"],
        [2, "Slag B"],
        [3, "Slag C"],
      ],
    );
  });

  await t.test("numerisk target blir tekst", () => {
    const spec = parseProtocol({ shots: [{ nr: 1, label: "Slag", target: 150 }] });

    assert.ok(spec);
    assert.equal(spec.forsok[0].target, "150");
  });

  await t.test("uten inputFields brukes «Score»-fallback", () => {
    const spec = parseProtocol({ shots: [{ nr: 1, label: "Slag" }] });

    assert.ok(spec);
    assert.deepEqual(spec.forsok[0].felter, [{ key: "score", type: "number", label: "Score" }]);
    assert.equal(spec.unit, undefined);
  });

  await t.test("spec.unit avledes fra første felts enhet", () => {
    const spec = parseProtocol({
      shots: [{ nr: 1, label: "Slag" }],
      inputFields: [{ key: "carry", label: "Carry", unit: "m" }],
    });

    assert.ok(spec);
    assert.equal(spec.unit, "m");
    assert.equal(spec.forsok[0].felter[0].type, "meter");
  });

  await t.test("«ja/nei» gir checkbox uten at enheten vises", () => {
    const spec = parseProtocol({
      shots: [{ nr: 1, label: "Slag" }],
      inputFields: [{ key: "traff", label: "Traff", unit: "ja/nei" }],
    });

    assert.ok(spec);
    assert.equal(spec.forsok[0].felter[0].type, "checkbox");
    assert.equal(spec.forsok[0].felter[0].unit, undefined);
    assert.equal(spec.unit, undefined);
  });
});

test("fallbackScorekortSpec gir ett forsøk med ett tallfelt", () => {
  const spec = fallbackScorekortSpec();

  assert.equal(spec.unit, undefined);
  assert.deepEqual(spec.forsok, [
    { nr: 1, label: "Resultat", felter: [{ key: "score", type: "number", label: "Score" }] },
  ]);
});
