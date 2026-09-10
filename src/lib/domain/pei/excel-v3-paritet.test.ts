import assert from "node:assert/strict";
import { test } from "node:test";
import { hentProtokoll } from "./protokoll-definisjoner";
import { beregnSgCelle } from "./scorekort-motor";

test("PGA Tour har alle 27 mål i rekkefølgen fra PEI Tester!AG10:AG36", () => {
  const p = hentProtokoll("pei-pga27")!;
  assert.deepEqual(p.rows.map(r => r.maal), [145,60,45,110,150,135,140,215,75,165,115,155,180,230,200,160,185,170,130,125,155,100,190,120,105,90,175]);
});

test("bunkerslag starter på forsøk 27 i begge Golfslag bane-varianter", () => {
  const p = hentProtokoll("golfslag-bane")!;
  for (const rows of Object.values(p.rowsByGender!)) {
    assert.equal(rows[25].lie, undefined);
    assert.deepEqual(rows.slice(26).map(r => r.lie), ["b", "b", "b", "b"]);
  }
});

test("puttresultat følger CI = CH - CG, med positiv verdi for bedre enn referansen", () => {
  const p = hentProtokoll("putt-1-3m")!;
  const col = p.columns.find(c => c.key === "res")!;
  // Referens!A10:C10: 3 meter gir 1,61 forventede slag.
  assert.ok(Math.abs(beregnSgCelle(p, col, { maal: 3 }, { antallSlag: "1" })! - 0.61) < 1e-10);
  assert.ok(Math.abs(beregnSgCelle(p, col, { maal: 3 }, { antallSlag: "2" })! + 0.39) < 1e-10);
  assert.equal(beregnSgCelle(p, col, { maal: 3 }, {}), null);
});
