import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseVisning, workbenchUrl } from "./visning-url";

describe("workbench visning-url", () => {
  it("beholder spiller-id når visning byttes", () => {
    const uke = workbenchUrl("p1", "uke", { uke: "2026-08-24" });
    const maned = workbenchUrl("p1", "maned", { maned: "2026-08" });
    const aar = workbenchUrl("p1", "aar", { aar: "2026" });
    assert.equal(uke, "/admin/workbench/p1?uke=2026-08-24");
    assert.equal(maned, "/admin/workbench/p1?vis=maned&maned=2026-08");
    assert.equal(aar, "/admin/workbench/p1?vis=aar&aar=2026");
    assert.ok(uke.startsWith("/admin/workbench/p1"));
    assert.ok(maned.startsWith("/admin/workbench/p1"));
    assert.ok(aar.startsWith("/admin/workbench/p1"));
  });

  it("parseVisning faller tilbake til uke", () => {
    assert.equal(parseVisning(undefined), "uke");
    assert.equal(parseVisning("maned"), "maned");
    assert.equal(parseVisning("xyz"), "uke");
  });
});
