import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { burdeVaert, erIRute, formatTall, kurveKoordinater, tidsandel, vurderTempo } from "./maal-ny";

const D = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

describe("tidsandel", () => {
  it("regner andelen av tiden fra start til frist", () => {
    assert.ok(Math.abs((tidsandel(D("2026-01-01"), D("2026-01-11"), D("2026-01-06")) as number) - 0.5) < 0.01);
  });
  it("er null uten frist eller med frist før start", () => {
    assert.equal(tidsandel(D("2026-01-01"), null, D("2026-01-06")), null);
    assert.equal(tidsandel(D("2026-01-10"), D("2026-01-01"), D("2026-01-06")), null);
  });
  it("klemmes til 0–1", () => {
    assert.equal(tidsandel(D("2026-01-01"), D("2026-01-11"), D("2025-12-01")), 0);
    assert.equal(tidsandel(D("2026-01-01"), D("2026-01-11"), D("2026-03-01")), 1);
  });
});

describe("burdeVaert", () => {
  it("ligger på linja fra start til målsetning", () => {
    assert.ok(Math.abs((burdeVaert(-1.2, 0, 0.42) as number) + 0.696) < 0.01);
    assert.ok(Math.abs((burdeVaert(5.2, 3, 0.5) as number) - 4.1) < 0.01);
  });
  it("er null når start, målsetning eller tid mangler", () => {
    assert.equal(burdeVaert(null, 0, 0.5), null);
    assert.equal(burdeVaert(-1, null, 0.5), null);
    assert.equal(burdeVaert(-1, 0, null), null);
    assert.equal(burdeVaert(2, 2, 0.5), null);
  });
});

describe("vurderTempo", () => {
  it("uten målinger er det ingen vurdering", () => {
    assert.equal(vurderTempo({ status: "no-data", hasData: false, pst: null, burdePst: null }), "ingen-data");
  });
  it("sammenligner med tiden når «burde vært» finnes", () => {
    assert.equal(vurderTempo({ status: "behind", hasData: true, pst: 25, burdePst: 42 }), "bak");
    assert.equal(vurderTempo({ status: "on-track", hasData: true, pst: 50, burdePst: 38 }), "foran");
    assert.equal(vurderTempo({ status: "behind", hasData: true, pst: 40, burdePst: 42 }), "i-rute");
  });
  it("bruker statusen ellers", () => {
    assert.equal(vurderTempo({ status: "behind", hasData: true, pst: 30, burdePst: null }), "bak");
    assert.equal(vurderTempo({ status: "achieved", hasData: true, pst: 100, burdePst: 90 }), "nadd");
    assert.equal(erIRute("nadd"), true);
    assert.equal(erIRute("bak"), false);
  });
});

describe("formatTall", () => {
  it("skriver norsk med ekte minus", () => {
    assert.equal(formatTall(-0.9), "−0,9");
    assert.equal(formatTall(3), "3,0");
    assert.equal(formatTall(12, 0), "12");
    assert.equal(formatTall(0.35, 2, true), "+0,35");
    assert.equal(formatTall(null), null);
  });
});

describe("kurveKoordinater", () => {
  it("trenger minst to punkter", () => {
    assert.deepEqual(kurveKoordinater([1], { x0: 0, x1: 100, y0: 0, y1: 100 }), []);
  });
  it("legger høyeste verdi øverst", () => {
    const p = kurveKoordinater([0, 10], { x0: 0, x1: 100, y0: 20, y1: 120 });
    assert.deepEqual(p, [{ x: 0, y: 120 }, { x: 100, y: 20 }]);
  });
});
