/**
 * npx tsx --conditions=react-server --test src/lib/agencyos/precision-portert.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { erPortert, passerMonster, PORTERT } from "./precision-portert";

describe("porterte AgencyOS-sider", () => {
  it("hakeparentes er nøyaktig ett ledd", () => {
    assert.ok(passerMonster("/admin/spillere/abc", "/admin/spillere/[id]"));
    assert.ok(!passerMonster("/admin/spillere/abc/plan", "/admin/spillere/[id]"));
    assert.ok(!passerMonster("/admin/spillere", "/admin/spillere/[id]"));
    assert.ok(passerMonster("/admin/spillere/", "/admin/spillere"));
  });
  it("bare oppførte sider regnes som portert", () => {
    assert.ok(erPortert("/admin/tester", ["/admin/tester"]));
    assert.ok(!erPortert("/admin/tester/benchmarks", ["/admin/tester"]));
  });
  it("hvert mønster er en /admin-adresse uten dubletter", () => {
    for (const m of PORTERT) assert.match(m, /^\/admin\//);
    assert.equal(new Set(PORTERT).size, PORTERT.length);
  });
});
