import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { tiger5ForRunde } from "./tiger5-runde";

describe("tiger5ForRunde", () => {
  it("teller dobbeltbogey, tre putt og bogey på par 5 per hull", () => {
    const r = tiger5ForRunde(
      [
        { holeNumber: 1, par: 4, strokes: 6, putts: 3 },
        { holeNumber: 2, par: 5, strokes: 6, putts: 2 },
        { holeNumber: 3, par: 3, strokes: 3, putts: null },
      ],
      [],
    );
    assert.deepEqual(r.map((x) => x.antall), [1, 1, 1, null, null]);
    assert.deepEqual(r[0].hull, [1]);
    assert.deepEqual(r[2].hull, [2]);
  });

  it("bogey fra innenfor 130 m krever slag mot green i regulering, og mangler slag gir null", () => {
    const hull = [{ holeNumber: 1, par: 4, strokes: 5, putts: 2 }, { holeNumber: 2, par: 4, strokes: 5, putts: 2 }];
    const r = tiger5ForRunde(hull, [
      { holeNumber: 1, shotNumber: 2, lie: "FAIRWAY", distanceToPin: 118, isPenalty: false },
      { holeNumber: 2, shotNumber: 3, lie: "ROUGH", distanceToPin: 40, isPenalty: false },
    ]);
    assert.equal(r[3].antall, 1);
    assert.deepEqual(r[3].hull, [1]);
    assert.equal(tiger5ForRunde(hull, [])[3].antall, null);
  });

  it("uten hull er alle regler ukjente, ikke null feil", () => {
    assert.deepEqual(tiger5ForRunde([], []).map((x) => x.antall), [null, null, null, null, null]);
  });
});
