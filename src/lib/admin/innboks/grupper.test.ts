import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { grupperInnboks, innboksGruppe } from "./grupper";

const p = (at: string, x: { haster?: boolean; risiko?: boolean; lost?: boolean } = {}) =>
  ({ at, haster: !!x.haster, risiko: !!x.risiko, lost: !!x.lost });

describe("innboksGruppe", () => {
  it("haster og risiko går først", () => {
    assert.equal(innboksGruppe(p("Man 28.09 · 12:10", { haster: true })), "Haster");
    assert.equal(innboksGruppe(p("09:12", { risiko: true })), "Haster");
  });
  it("løst sak haster aldri", () => {
    assert.equal(innboksGruppe(p("09:12", { haster: true, lost: true })), "I dag");
  });
  it("bare klokkeslett er i dag, dato er tidligere, ukjent er tidligere", () => {
    assert.equal(innboksGruppe(p("09:12")), "I dag");
    assert.equal(innboksGruppe(p("Fre 25.09 · 12:10")), "Tidligere");
    assert.equal(innboksGruppe(p("—")), "Tidligere");
  });
});

describe("grupperInnboks", () => {
  it("fast rekkefølge, tomme grupper droppes, rekkefølgen inni beholdes", () => {
    const g = grupperInnboks([p("Fre 25.09 · 12:10"), p("08:00"), p("07:00"), p("—", { haster: true })]);
    assert.deepEqual(g.map((x) => x.navn), ["Haster", "I dag", "Tidligere"]);
    assert.deepEqual(g[1].poster.map((x) => x.at), ["08:00", "07:00"]);
    assert.deepEqual(grupperInnboks([p("08:00")]).map((x) => x.navn), ["I dag"]);
  });
});
