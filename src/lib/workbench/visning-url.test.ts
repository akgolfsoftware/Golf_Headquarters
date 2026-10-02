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

  it("kobler alle sju hovednivåer til eksakt skjermadresse", () => {
    const referanse = { aar: "2026", periode: "p-1", maned: "2026-10", uke: "2026-09-28", okt: "o-1" };
    assert.deepEqual(
      (["aar", "periode", "maned", "uke", "okt", "vol", "mal"] as const).map((nivaa) => workbenchUrl("p1", nivaa, referanse, "player")),
      [
        "/portal/planlegge/workbench?niva=ar&aar=2026",
        "/portal/planlegge/workbench?niva=periode&aar=2026&periode=p-1",
        "/portal/planlegge/workbench?niva=maned&maned=2026-10",
        "/portal/planlegge/workbench?niva=uke&uke=2026-09-28",
        "/portal/planlegge/workbench?niva=okt&uke=2026-09-28&okt=o-1",
        "/portal/planlegge/workbench?niva=volum&uke=2026-09-28",
        "/portal/planlegge/workbench?niva=malsetninger&uke=2026-09-28",
      ],
    );
  });
});
