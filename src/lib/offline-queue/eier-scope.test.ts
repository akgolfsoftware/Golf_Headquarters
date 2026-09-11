import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  byggEierNokkel,
  byggLagringsNokkel,
  erEidAv,
  filtrerEideRader,
} from "./eier-scope";

describe("lokal brukeravgrensning", () => {
  it("lager ulike nøkler for samme økt på to brukere", () => {
    assert.notEqual(
      byggEierNokkel("bruker-a", "okt-1"),
      byggEierNokkel("bruker-b", "okt-1"),
    );
  });

  it("filtrerer bort andre brukere og eldre rader uten eier", () => {
    const rader = [
      { eierId: "bruker-a", verdi: "a" },
      { eierId: "bruker-b", verdi: "b" },
      { verdi: "eldre-uavklart" },
    ];

    assert.deepEqual(filtrerEideRader(rader, "bruker-a"), [rader[0]]);
    assert.equal(erEidAv(rader[1], "bruker-a"), false);
    assert.equal(erEidAv(rader[2], "bruker-a"), false);
  });

  it("lager ingen nettlesernøkkel uten serververifisert bruker", () => {
    assert.equal(byggLagringsNokkel("sensitiv-kladd", null), null);
    assert.equal(byggLagringsNokkel("sensitiv-kladd", ""), null);
    assert.equal(
      byggLagringsNokkel("sensitiv-kladd", "bruker-a"),
      "sensitiv-kladd:bruker-a",
    );
  });
});
