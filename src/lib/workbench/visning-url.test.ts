import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseVisning, workbenchUrl } from "./visning-url";

describe("workbench visning-url", () => {
  it("beholder spiller-id når visning byttes", () => {
    const uke = workbenchUrl("p1", "uke", { uke: "2026-08-24" });
    const maned = workbenchUrl("p1", "maned", { maned: "2026-08" });
    const aar = workbenchUrl("p1", "aar", { aar: "2026" });
    assert.equal(uke, "/admin/workbench/p1?niva=uke&uke=2026-08-24");
    assert.equal(maned, "/admin/workbench/p1?niva=maned&maned=2026-08");
    assert.equal(aar, "/admin/workbench/p1?niva=ar&aar=2026");
    assert.ok(uke.startsWith("/admin/workbench/p1"));
    assert.ok(maned.startsWith("/admin/workbench/p1"));
    assert.ok(aar.startsWith("/admin/workbench/p1"));
  });

  it("beholder valgt periode når År åpner Periode", () => {
    const periode = workbenchUrl("p1", "periode", { aar: "2026", periode: "periode-1" });
    assert.equal(periode, "/admin/workbench/p1?niva=periode&aar=2026&periode=periode-1");
  });

  it("beholder valgt økt i Økt-visningen", () => {
    const okt = workbenchUrl("p1", "okt", { uke: "2026-09-14", okt: "okt-1" });
    assert.equal(okt, "/admin/workbench/p1?niva=okt&uke=2026-09-14&okt=okt-1");
  });

  it("beholder tidsvindu og valgt økt i Stall-visningen", () => {
    const stall = workbenchUrl("p1", "stall", { uke: "2026-09-14", okt: "okt-2" });
    assert.equal(stall, "/admin/workbench/p1?niva=stall&uke=2026-09-14&okt=okt-2");
  });

  it("beholder valgt uke i Live-visningen", () => {
    const live = workbenchUrl("p1", "live", { uke: "2026-09-14" });
    assert.equal(live, "/admin/workbench/p1?niva=live&uke=2026-09-14");
  });

  it("parseVisning faller tilbake til uke", () => {
    assert.equal(parseVisning(undefined), "uke");
    assert.equal(parseVisning("maned"), "maned");
    assert.equal(parseVisning("ar"), "aar");
    assert.equal(parseVisning("volum"), "vol");
    assert.equal(parseVisning("malsetninger"), "mal");
    assert.equal(parseVisning("xyz"), "uke");
  });

  it("lager PlayerHQ-adresser med samme nivåkontrakt", () => {
    assert.equal(
      workbenchUrl("p1", "vol", { uke: "2026-09-28" }, "player"),
      "/portal/planlegge/workbench?niva=volum&uke=2026-09-28",
    );
  });

  it("beholder hele konteksten på alle ti nivåer på begge arbeidsflater", () => {
    const referanse = { aar: "2026", periode: "p-1", maned: "2026-10", uke: "2026-09-28", okt: "o-1" };
    for (const surface of ["agency", "player"] as const) {
      for (const nivaa of ["aar", "periode", "maned", "uke", "okt", "vol", "mal", "stall", "live", "min"] as const) {
        const url = new URL(workbenchUrl("p1", nivaa, referanse, surface), "https://test.invalid");
        assert.equal(url.pathname, surface === "player" ? "/portal/planlegge/workbench" : "/admin/workbench/p1");
        assert.equal(parseVisning(url.searchParams.get("niva") ?? undefined), nivaa);
        for (const [key, value] of Object.entries(referanse)) assert.equal(url.searchParams.get(key), value);
      }
    }
  });

  it("lar eksplisitt ukebytte overstyre konteksten uten å miste andre valg", () => {
    const url = new URL(workbenchUrl("p1", "uke", { uke: "2026-10-05" }, "agency", { uke: "2026-09-28", periode: "p-1", okt: "o-1" }), "https://test.invalid");
    assert.equal(url.searchParams.get("uke"), "2026-10-05");
    assert.equal(url.searchParams.get("periode"), "p-1");
    assert.equal(url.searchParams.get("okt"), "o-1");
  });

  it("URL-koder identifikatorer i query", () => {
    const url = new URL(workbenchUrl("p1", "periode", { periode: "p & #=1", okt: "o?&=2" }), "https://test.invalid");
    assert.equal(url.searchParams.get("periode"), "p & #=1");
    assert.equal(url.searchParams.get("okt"), "o?&=2");
  });
});
