import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { beskrivTapteSlag, planSlagSletting } from "./scorekort-slag";

const gamle = [
  { holeNumber: 1, strokes: 4 },
  { holeNumber: 2, strokes: 5 },
  { holeNumber: 3, strokes: 3 },
];
const slag = [
  { holeNumber: 1, antall: 4 },
  { holeNumber: 2, antall: 5 },
  { holeNumber: 3, antall: 3 },
];

describe("planSlagSletting", () => {
  it("beholder alle slag når ingen slag-tall endres", () => {
    const p = planSlagSletting(gamle, gamle, slag);
    assert.deepEqual(p.slettSlagFor, []);
    assert.deepEqual(p.tapteSlag, []);
  });

  it("rører bare hullet der slag-tallet er endret", () => {
    const nye = [gamle[0], { holeNumber: 2, strokes: 6 }, gamle[2]];
    const p = planSlagSletting(gamle, nye, slag);
    assert.deepEqual(p.slettSlagFor, [2]);
    assert.deepEqual(p.tapteSlag, [{ holeNumber: 2, antall: 5 }]);
  });

  it("DI-04/26: fjernede hull med slag meldes som tap (18 til 9-tilfellet)", () => {
    const p = planSlagSletting(gamle, [gamle[0]], slag);
    assert.deepEqual(p.fjernedeHull, [2, 3]);
    assert.deepEqual(p.tapteSlag, [
      { holeNumber: 2, antall: 5 },
      { holeNumber: 3, antall: 3 },
    ]);
  });

  it("endret hull uten registrerte slag gir ingenting å bekrefte", () => {
    const nye = [{ holeNumber: 1, strokes: 9 }, gamle[1], gamle[2]];
    const p = planSlagSletting(gamle, nye, [{ holeNumber: 2, antall: 5 }]);
    assert.deepEqual(p.slettSlagFor, [1]);
    assert.deepEqual(p.tapteSlag, []);
  });

  it("nytt hull (fantes ikke før) regnes ikke som endring", () => {
    const nye = [...gamle, { holeNumber: 4, strokes: 4 }];
    const p = planSlagSletting(gamle, nye, slag);
    assert.deepEqual(p.slettSlagFor, []);
  });
});

describe("beskrivTapteSlag", () => {
  it("nevner hull og antall", () => {
    assert.match(beskrivTapteSlag([{ holeNumber: 7, antall: 5 }]), /hull 7 \(5 slag\)/);
  });
});
