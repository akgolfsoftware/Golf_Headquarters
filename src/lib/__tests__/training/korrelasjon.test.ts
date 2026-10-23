import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { beregnPearson, koblTreningOgSg } from "../../training/korrelasjon";
import type { SgCategory } from "@/generated/prisma/client";

describe("beregnPearson", () => {
  it("returnerer null ved for fa datapunkter", () => {
    assert.equal(beregnPearson([1], [2]), null);
    assert.equal(beregnPearson([], []), null);
  });

  it("returnerer 1.0 for perfekt positiv korrelasjon", () => {
    const r = beregnPearson([1, 2, 3, 4], [2, 4, 6, 8]);
    assert.ok(r !== null);
    assert.ok(Math.abs(r - 1.0) < 0.001);
  });

  it("returnerer -1.0 for perfekt negativ korrelasjon", () => {
    const r = beregnPearson([1, 2, 3, 4], [8, 6, 4, 2]);
    assert.ok(r !== null);
    assert.ok(Math.abs(r + 1.0) < 0.001);
  });
});

describe("koblTreningOgSg", () => {
  it("kobler treningsuke til SG-endring neste uke", () => {
    const treningUker = [
      { uke: "2026-W10", sgArea: "OTT" as SgCategory, minutter: 60 },
      { uke: "2026-W11", sgArea: "OTT" as SgCategory, minutter: 90 },
    ];
    const sgUker = [
      { uke: "2026-W10", sgArea: "OTT" as SgCategory, snittSg: -0.7 },
      { uke: "2026-W11", sgArea: "OTT" as SgCategory, snittSg: -0.2 },
      { uke: "2026-W12", sgArea: "OTT" as SgCategory, snittSg: 0.1 },
    ];
    const par = koblTreningOgSg(treningUker, sgUker);
    assert.equal(par.length, 2);
    assert.equal(par[0].minutterTreningsuke, 60);
    assert.ok(Math.abs(par[0].sgEndringNesteUke - 0.5) < 0.00001);
    assert.equal(par[1].minutterTreningsuke, 90);
    assert.ok(Math.abs(par[1].sgEndringNesteUke - 0.3) < 0.00001);
  });
});

it("mangler grunnlinje: ingen endring kan beregnes", () => {
  assert.deepEqual(koblTreningOgSg([{ uke: "2026-W10", sgArea: "APP", minutter: 90 }],
    [{ uke: "2026-W11", sgArea: "APP", snittSg: 1 }]), []);
});
it("ISO-år med 52 og 53 uker går til riktig neste uke", () => {
  for (const [fra, til] of [["2025-W52", "2026-W01"], ["2026-W53", "2027-W01"]]) {
    const par = koblTreningOgSg([{ uke: fra, sgArea: "APP", minutter: 30 }],
      [{ uke: fra, sgArea: "APP", snittSg: -2 }, { uke: til, sgArea: "APP", snittSg: -1 }]);
    assert.equal(par[0]?.sgEndringNesteUke, 1);
  }
  assert.deepEqual(koblTreningOgSg([{ uke: "2025-W53", sgArea: "APP", minutter: 30 }], []), []);
});
it("ugyldige tall kan ikke bli korrelasjon", () => {
  assert.equal(beregnPearson([1, NaN], [2, 3]), null);
  assert.equal(beregnPearson([1, Infinity], [2, 3]), null);
});
