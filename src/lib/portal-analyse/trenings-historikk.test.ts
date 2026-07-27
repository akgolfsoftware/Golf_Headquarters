import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { filtrerRader, oppsummer, type TreningsRad } from "./trenings-historikk";

function rad(over: Partial<TreningsRad> = {}): TreningsRad {
  return {
    id: "r1",
    dato: new Date(2026, 7, 6),
    kilde: "GOLF",
    oktId: "o1",
    oktTittel: "Økt",
    navn: "Drill",
    minutter: 30,
    maalt: false,
    pyramide: "TEK",
    omraade: null,
    miljo: "M2",
    miljoGruppe: "RANGE",
    csNivaa: null,
    lFase: null,
    ...over,
  };
}

describe("filtrerRader", () => {
  const rader = [
    rad({ id: "a", pyramide: "TEK", miljoGruppe: "RANGE", minutter: 60 }),
    rad({ id: "b", pyramide: "TEK", miljoGruppe: "BANE", minutter: 40 }),
    rad({ id: "c", pyramide: "SLAG", miljoGruppe: "RANGE", minutter: 20 }),
    rad({ id: "d", kilde: "FYS", pyramide: "FYS", miljoGruppe: null, miljo: null, minutter: 45 }),
  ];

  test("uten filtre returneres alt", () => {
    assert.equal(filtrerRader(rader).length, 4);
    assert.equal(filtrerRader(rader, {}).length, 4);
  });

  test("teknikk på range vs teknikk på bane — kjernespørsmålet", () => {
    const range = filtrerRader(rader, { pyramide: ["TEK"], miljoGrupper: ["RANGE"] });
    const bane = filtrerRader(rader, { pyramide: ["TEK"], miljoGrupper: ["BANE"] });
    assert.deepEqual(range.map((r) => r.id), ["a"]);
    assert.deepEqual(bane.map((r) => r.id), ["b"]);
  });

  test("kilde-toggle skiller golf og fysisk", () => {
    assert.equal(filtrerRader(rader, { kilde: "GOLF" }).length, 3);
    assert.equal(filtrerRader(rader, { kilde: "FYS" }).length, 1);
    assert.equal(filtrerRader(rader, { kilde: "ALLE" }).length, 4);
  });

  test("fys-rader faller ut av et miljøfilter (de har ikke miljø)", () => {
    const kunBane = filtrerRader(rader, { miljoGrupper: ["BANE"] });
    assert.ok(!kunBane.some((r) => r.kilde === "FYS"));
  });

  test("filtre kombineres med OG", () => {
    const treff = filtrerRader(rader, {
      pyramide: ["TEK", "SLAG"],
      miljoGrupper: ["RANGE"],
    });
    assert.deepEqual(treff.map((r) => r.id).sort(), ["a", "c"]);
  });

  test("område-filter krever at raden har området", () => {
    const medOmraade = [rad({ id: "x", omraade: "putting" }), rad({ id: "y", omraade: null })];
    const treff = filtrerRader(medOmraade, { omraade: ["putting"] });
    assert.deepEqual(treff.map((r) => r.id), ["x"]);
  });
});

describe("oppsummer", () => {
  test("tom historikk gir nuller, ikke deling på null", () => {
    const o = oppsummer([]);
    assert.equal(o.totaltMinutter, 0);
    assert.equal(o.antallOkter, 0);
    assert.equal(o.andelMaalt, 0);
    assert.deepEqual(o.perPyramide, []);
  });

  test("summerer minutter og teller unike økter", () => {
    const o = oppsummer([
      rad({ id: "a", oktId: "o1", minutter: 30 }),
      rad({ id: "b", oktId: "o1", minutter: 20 }),
      rad({ id: "c", oktId: "o2", minutter: 50 }),
    ]);
    assert.equal(o.totaltMinutter, 100);
    assert.equal(o.antallRader, 3);
    assert.equal(o.antallOkter, 2);
  });

  test("andel målt skiller ekte tid fra planlagt", () => {
    const o = oppsummer([
      rad({ id: "a", minutter: 75, maalt: true }),
      rad({ id: "b", minutter: 25, maalt: false }),
    ]);
    assert.equal(o.andelMaalt, 0.75);
  });

  test("fordeling per akse er sortert og summerer til 1", () => {
    const o = oppsummer([
      rad({ id: "a", pyramide: "TEK", minutter: 60 }),
      rad({ id: "b", pyramide: "SLAG", minutter: 30 }),
      rad({ id: "c", pyramide: "TEK", minutter: 10 }),
    ]);
    assert.equal(o.perPyramide[0].akse, "TEK", "størst først");
    assert.equal(o.perPyramide[0].minutter, 70);
    const sum = o.perPyramide.reduce((s, p) => s + p.andel, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9);
  });

  test("miljøfordeling hopper over rader uten miljø", () => {
    const o = oppsummer([
      rad({ id: "a", miljoGruppe: "RANGE", minutter: 60 }),
      rad({ id: "b", kilde: "FYS", miljoGruppe: null, minutter: 40 }),
    ]);
    assert.equal(o.perMiljoGruppe.length, 1);
    assert.equal(o.perMiljoGruppe[0].gruppe, "RANGE");
    // Andelen regnes av TOTALEN, så fys-tiden teller i nevneren.
    assert.equal(o.perMiljoGruppe[0].andel, 0.6);
  });
});
