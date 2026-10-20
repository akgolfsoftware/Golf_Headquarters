import assert from "node:assert/strict";
import { test } from "node:test";
import { BATTERI_DELER, PRIORITERTE, TESTBATTERI, batteritestFor, fremdrift, trenerKanFore } from "./testbatteri";
import { TN_CATALOG, tnProtocol } from "./tn-catalog";
import { tnDefinitionId } from "./tn-integration";

test("batteriet har 19 tester i fast rekkefølge: Golfslag 8 · Teknikk 6 · Fysisk 5", () => {
  assert.equal(TESTBATTERI.length, 19);
  assert.deepEqual(BATTERI_DELER.map((d) => TESTBATTERI.filter((t) => t.del === d).length), [8, 6, 5]);
  assert.deepEqual(TESTBATTERI.map((t) => t.navn), [
    "Driver Basic", "Inspill Basic", "Wedge Variation", "8-balls variation", "Putt 1–3 m", "Golfslag på banen", "18 hulls inspill", "9 hull lengde",
    "Driver Gate", "Wedge Gate", "Putt Gate", "Nærspill Gate", "VISA Express", "Putt Speed 1 × 5",
    "Benkpress", "Markløft trapbar", "Lengdehopp", "Rotasjonskast", "Club Speed",
  ]);
  assert.equal(new Set(TESTBATTERI.map((t) => t.id)).size, 19);
});

test("fem prioriterte med minsteantall 1 · 2 · 2 · 2 · 4", () => {
  assert.deepEqual(PRIORITERTE.map((t) => [t.navn, t.minst]), [["Driver Basic", 1], ["Inspill Basic", 2], ["Wedge Variation", 2], ["8-balls variation", 2], ["Putt 1–3 m", 4]]);
});

test("Inspill Basic tatt én gang gir «1 av 2», og fremdriften stopper på minstekravet", () => {
  const inspill = TESTBATTERI.find((t) => t.id === "inspill-basic")!;
  assert.equal(fremdrift(inspill, 1), "1 av 2");
  assert.equal(fremdrift(inspill, 5), "2 av 2");
  assert.equal(fremdrift(TESTBATTERI.find((t) => t.id === "driver-gate")!, 3), null);
});

test("alle TN-protokollene i batteriet finnes i katalogen", () => {
  const ider = new Set(TN_CATALOG.map((p) => p.id));
  for (const t of TESTBATTERI) for (const p of t.protokoller) assert.ok(ider.has(p), `${t.navn}: ${p}`);
});

test("varianter teller som samme test; tester utenfor batteriet gir null", () => {
  const def = (id: string) => { const p = tnProtocol(id)!; return { id: tnDefinitionId(p), name: p.name }; };
  assert.equal(batteritestFor(def("driver-270"))?.id, "driver-basic");
  assert.equal(batteritestFor(def("inspill-jenter-125"))?.id, "inspill-basic");
  assert.equal(batteritestFor(def("naerspill-gate"))?.id, "naerspill-gate");
  assert.equal(batteritestFor(def("8-ball-blocked")), null);
  assert.equal(batteritestFor(def("standard-sving")), null);
  assert.equal(batteritestFor({ id: "x1", name: "Trapbar Deadlift" })?.id, "markloft-trapbar");
  assert.equal(batteritestFor({ id: "x2", name: "Clubhead Speed (CHS)" })?.id, "club-speed");
  assert.equal(batteritestFor({ id: "x3", name: "Min egen test" }), null);
});

test("trener og coach fører bare Teknikk og PEI-tester, aldri Putt 1–3 m", () => {
  assert.equal(trenerKanFore({ batteriId: "putt-1-3m" }), false);
  assert.equal(trenerKanFore({ protokollId: "putt-1-3m" }), false);
  assert.equal(trenerKanFore({ batteriId: "9-hull-lengde" }), false);
  assert.equal(trenerKanFore({ batteriId: "benkpress" }), false);
  assert.equal(trenerKanFore({ batteriId: "golfslag-bane" }), false);
  for (const id of ["driver-gate", "wedge-gate", "putt-gate", "naerspill-gate", "visa-express", "putt-speed-1x5"]) assert.ok(trenerKanFore({ batteriId: id }), id);
  for (const id of ["driver-basic", "inspill-basic", "wedge-variation", "8-ball-variation"]) assert.ok(trenerKanFore({ batteriId: id }), id);
  assert.ok(trenerKanFore({ protokollId: "pei-wedge-variation" }));
  assert.ok(trenerKanFore({ protokollId: "driver-220" }));
  assert.equal(trenerKanFore({}), false);
});
