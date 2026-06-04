import { describe, it, expect } from "vitest";
import { beregnPearson, koblTreningOgSg } from "../../training/korrelasjon";
import type { SgCategory } from "@/generated/prisma/client";

describe("beregnPearson", () => {
  it("returnerer null ved for fa datapunkter", () => {
    expect(beregnPearson([1], [2])).toBeNull();
    expect(beregnPearson([], [])).toBeNull();
  });

  it("returnerer 1.0 for perfekt positiv korrelasjon", () => {
    const r = beregnPearson([1, 2, 3, 4], [2, 4, 6, 8]);
    expect(r).not.toBeNull();
    expect(Math.abs(r! - 1.0)).toBeLessThan(0.001);
  });

  it("returnerer -1.0 for perfekt negativ korrelasjon", () => {
    const r = beregnPearson([1, 2, 3, 4], [8, 6, 4, 2]);
    expect(r).not.toBeNull();
    expect(Math.abs(r! + 1.0)).toBeLessThan(0.001);
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
    expect(par.length).toBe(2);
    expect(par[0].minutterTreningsuke).toBe(60);
    expect(par[0].sgEndringNesteUke).toBe(-0.2);
    expect(par[1].minutterTreningsuke).toBe(90);
    expect(par[1].sgEndringNesteUke).toBe(0.1);
  });
});
