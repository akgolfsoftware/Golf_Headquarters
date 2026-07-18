import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyTour, NO_TOUR_CUSTOMERS } from "./golfbox-customers";

describe("classifyTour — Olyo og Østlandstour", () => {
  it("Olyo Juniortour → OLYO / junior-no uansett fallback", () => {
    const c = classifyTour("Olyo Juniortour Gamle Fredrikstad GK", "amateur-no");
    assert.equal(c.sourceOrigin, "OLYO");
    assert.equal(c.tour, "junior-no");
    assert.equal(c.playerTier, "junior");
  });

  it("Østlandstour → OSTLANDS / amateur-no", () => {
    const c = classifyTour("Østlandstour 7 - International Trophy - Oslo GK", "amateur-no");
    assert.equal(c.sourceOrigin, "OSTLANDS");
    assert.equal(c.tour, "amateur-no");
  });

  it("Østlandstour med junior-signal → junior-no", () => {
    const c = classifyTour("Østlandstour Junior - Onsøy GK", "amateur-no");
    assert.equal(c.sourceOrigin, "OSTLANDS");
    assert.equal(c.tour, "junior-no");
  });

  it("Region Tour-kval (ikke Olyo) faller ikke til OLYO/OSTLANDS", () => {
    const c = classifyTour("Region Tour 1 - Kval til Garmin Norgescup 2", "junior-no");
    assert.notEqual(c.sourceOrigin, "OLYO");
    assert.notEqual(c.sourceOrigin, "OSTLANDS");
  });
});

describe("NO_TOUR_CUSTOMERS — Olyo-regioner + Østlandstour koblet", () => {
  it("alle 6 Olyo-regioner (873–878) er med, hver med region + onlyMatching", () => {
    const olyo = NO_TOUR_CUSTOMERS.filter((c) => c.region);
    assert.equal(olyo.length, 6);
    for (const c of olyo) {
      assert.ok(c.region, `${c.label} mangler region`);
      assert.ok(c.onlyMatching instanceof RegExp, `${c.label} mangler onlyMatching`);
      assert.ok(c.onlyMatching!.test("Olyo Juniortour Mørk GK"));
    }
    const ids = olyo.map((c) => c.customerId).sort((a, b) => a - b);
    assert.deepEqual(ids, [873, 874, 875, 876, 877, 878]);
  });

  it("Region Øst = customer 878", () => {
    const ost = NO_TOUR_CUSTOMERS.find((c) => c.region === "Øst");
    assert.equal(ost?.customerId, 878);
  });

  it("Østlandstour (895) er med, uten onlyMatching", () => {
    const t = NO_TOUR_CUSTOMERS.find((c) => c.customerId === 895);
    assert.ok(t);
    assert.equal(t!.region, undefined);
    assert.equal(t!.onlyMatching, undefined);
  });
});
