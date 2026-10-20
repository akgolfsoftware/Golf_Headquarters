import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggBatteri } from "./ph14-batteri-data";
import type { TestRow } from "./tester-data";

function rad(id: string, name: string, attempts: number, o: Partial<TestRow> = {}): TestRow {
  return {
    id, name, axis: "slag", rule: "", latest: attempts ? "9,8 %" : null, latestRaw: null, latestDate: null, delta: null,
    attempts, history: attempts ? [1, 2] : [], lowerIsBetter: true, verdict: "new", href: `/portal/tren/tester/${id}`,
    hubGruppe: "andre", scoringKind: "fallback", shotsCount: 0, forfallDato: null,
    latestAt: attempts ? "2026-09-28T10:00:00Z" : null, latestKontrollert: attempts ? true : null, forfallAt: null, ...o,
  };
}

describe("byggBatteri", () => {
  it("gir alltid 19 tester i Golfslag 8, Teknikk 6 og Fysisk 5", () => {
    const d = byggBatteri([]);
    assert.equal(d.totalt, 19);
    assert.deepEqual(d.deler.map((x) => [x.del, x.rader.length]), [["Golfslag", 8], ["Teknikk", 6], ["Fysisk", 5]]);
    assert.equal(d.tatt, 0);
  });

  it("Inspill Basic tatt én gang gir «1 av 2»", () => {
    const d = byggBatteri([rad("tn-v3-inspill-gutter-145", "Innspill Basis · gutter 145 m", 1)]);
    const r = d.deler[0]!.rader.find((x) => x.id === "inspill-basic")!;
    assert.equal(r.fremdrift, "1 av 2");
    assert.equal(d.prioriterte.find((p) => p.id === "inspill-basic")!.ok, false);
  });

  it("samler varianter og teller prioriterte som er nådd", () => {
    const d = byggBatteri([rad("a", "Driver basic", 1), rad("tn-v3-driver-220", "Driver basic 220", 0)]);
    assert.equal(d.prioriterteOk, 1);
    assert.equal(d.tatt, 1);
  });
});
