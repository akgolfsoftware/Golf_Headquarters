import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildDrillListWhere,
  buildFilterBarWhere,
  drillListHref,
  drillListQueryString,
  hasActiveBarFilters,
  ngfFilterIdx,
  parseDrillListFilters,
} from "@/lib/admin-drills/drill-list-filter";

describe("drill-list-filter", () => {
  it("parseDrillListFilters — tomme og komma-lister", () => {
    const f = parseDrillListFilters({
      q: "  wedge ",
      disiplin: "FYS,TEK,INVALID",
      skill: "PUTTING,PUTTING",
      env: "RANGE",
      morad: "1",
    });
    assert.equal(f.q, "wedge");
    assert.deepEqual(f.disipliner, ["FYS", "TEK"]);
    assert.deepEqual(f.skills, ["PUTTING"]);
    assert.deepEqual(f.envs, ["RANGE"]);
    assert.equal(f.morad, true);
  });

  it("ngfFilterIdx — L mappes til K-indeks", () => {
    assert.equal(ngfFilterIdx("A"), 0);
    assert.equal(ngfFilterIdx("K"), 10);
    assert.equal(ngfFilterIdx("L"), 10);
  });

  it("buildFilterBarWhere — NGF-overlapp materialiserer in-lister", () => {
    const where = buildFilterBarWhere({ minNgf: "E", maxNgf: "G" });
    assert.ok(where && "AND" in where);
    const and = (where as { AND: unknown[] }).AND;
    assert.equal(and.length, 2);
  });

  it("buildDrillListWhere — kombinerer kat og filter-bar", () => {
    const where = buildDrillListWhere(
      { q: "putt", morad: "1" },
      { skillArea: "PUTTING" },
    );
    assert.ok(where && "AND" in where);
    const and = (where as { AND: unknown[] }).AND;
    assert.equal(and.length, 2);
  });

  it("drillListQueryString — bevarer filtre ved kategori-bytt", () => {
    const qs = drillListQueryString(
      { kat: "alle", q: "chip", disiplin: "SLAG", morad: "1" },
      { kat: "putting" },
    );
    assert.match(qs, /kat=putting/);
    assert.match(qs, /q=chip/);
    assert.match(qs, /disiplin=SLAG/);
    assert.match(qs, /morad=1/);
  });

  it("drillListHref — alle uten query", () => {
    assert.equal(drillListHref({}), "/admin/drills");
  });

  it("hasActiveBarFilters", () => {
    assert.equal(hasActiveBarFilters({}), false);
    assert.equal(hasActiveBarFilters({ minNgf: "B" }), true);
    assert.equal(hasActiveBarFilters({ kat: "putting" }), false);
  });
});