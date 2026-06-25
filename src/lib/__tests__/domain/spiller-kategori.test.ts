import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  drillKategoriFraHcpRange,
  drillMatcherSpiller,
  ngfKategoriTilAk,
  normaliserDrillKategoriRange,
} from "@/lib/domain/spiller-kategori";

describe("spiller-kategori", () => {
  it("ngfKategoriTilAk mapper L til K", () => {
    assert.equal(ngfKategoriTilAk("L"), "K");
    assert.equal(ngfKategoriTilAk("B"), "B");
  });

  it("normaliserDrillKategoriRange swapper omvendt range", () => {
    const r = normaliserDrillKategoriRange("H", "A");
    assert.equal(r.swapped, true);
    assert.equal(r.minKategori, "A");
    assert.equal(r.maxKategori, "H");
  });

  it("drillMatcherSpiller — spiller B i drill A–D", () => {
    assert.equal(drillMatcherSpiller("A", "D", "B"), true);
    assert.equal(drillMatcherSpiller("A", "A", "B"), false);
    assert.equal(drillMatcherSpiller("C", "K", "B"), false);
  });

  it("drillKategoriFraHcpRange — elite til klubb", () => {
    const { minKategori, maxKategori } = drillKategoriFraHcpRange(-2, 12);
    assert.ok(minKategori);
    assert.ok(maxKategori);
    assert.notEqual(minKategori, maxKategori);
  });
});