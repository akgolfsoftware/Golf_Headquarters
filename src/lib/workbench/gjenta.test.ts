import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { beregnGjentaDatoer, MAKS_GJENTATTE, ukedag } from "./gjenta";

describe("beregnGjentaDatoer", () => {
  it("hver uke: samme ukedag til og med sluttdatoen, uten selve økta", () => {
    // Tirsdag 6. okt. til tirsdag 15. des. 2026: 10 nye tirsdager (tegningen sier 10 økter).
    const r = beregnGjentaDatoer({ fra: "2026-10-06", modus: "uke", slutt: "2026-12-15" });
    assert.equal(r.datoer.length, 10);
    assert.equal(r.datoer[0], "2026-10-13");
    assert.equal(r.datoer.at(-1), "2026-12-15");
    assert.ok(r.datoer.every((d) => ukedag(d) === 1));
  });

  it("hopper over avkryssede konkurransedager og sier hvilke", () => {
    const r = beregnGjentaDatoer({ fra: "2026-10-06", modus: "uke", slutt: "2026-12-15", hopp: new Set(["2026-11-17"]) });
    assert.equal(r.datoer.length, 9);
    assert.ok(!r.datoer.includes("2026-11-17"));
    assert.deepEqual(r.hoppet, ["2026-11-17"]);
  });

  it("annenhver uke", () => {
    const r = beregnGjentaDatoer({ fra: "2026-10-06", modus: "annenhver", slutt: "2026-11-03" });
    assert.deepEqual(r.datoer, ["2026-10-20", "2026-11-03"]);
  });

  it("valgte dager hver uke, fra dagen etter økta", () => {
    const r = beregnGjentaDatoer({ fra: "2026-10-06", modus: "dager", ukedager: [1, 3], slutt: "2026-10-15" });
    assert.deepEqual(r.datoer, ["2026-10-08", "2026-10-13", "2026-10-15"]);
  });

  it("sluttdato før eller lik økta gir ingen datoer", () => {
    assert.deepEqual(beregnGjentaDatoer({ fra: "2026-10-06", modus: "uke", slutt: "2026-10-06" }).datoer, []);
    assert.deepEqual(beregnGjentaDatoer({ fra: "2026-10-06", modus: "uke", slutt: "2026-09-01" }).datoer, []);
  });

  it("sommertid flytter ingen dag", () => {
    const r = beregnGjentaDatoer({ fra: "2026-10-20", modus: "uke", slutt: "2026-11-03" });
    assert.deepEqual(r.datoer, ["2026-10-27", "2026-11-03"]);
  });

  it("har en øvre grense", () => {
    const r = beregnGjentaDatoer({ fra: "2026-01-01", modus: "dager", ukedager: [0, 1, 2, 3, 4, 5, 6], slutt: "2027-12-31" });
    assert.equal(r.datoer.length, MAKS_GJENTATTE);
  });
});
