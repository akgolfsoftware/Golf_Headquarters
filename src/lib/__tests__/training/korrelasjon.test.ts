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
      { uke: "2026-W11", sgArea: "OTT" as SgCategory, snittSg: -0.2 },
      { uke: "2026-W12", sgArea: "OTT" as SgCategory, snittSg: 0.1 },
    ];
    const par = koblTreningOgSg(treningUker, sgUker);
    assert.equal(par.length, 2);
    assert.equal(par[0].minutterTreningsuke, 60);
    assert.equal(par[0].sgEndringNesteUke, -0.2);
    assert.equal(par[1].minutterTreningsuke, 90);
    assert.equal(par[1].sgEndringNesteUke, 0.1);
  });
});
