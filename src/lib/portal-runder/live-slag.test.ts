import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fotTilMeter, fraLoggetHull, slagPaaHull, tilLoggetHull, type LiveSlagInn } from "./live-slag";
import { hullSchema } from "@/lib/runde-logg/schema";

const slag: LiveSlagInn[] = [
  { lie: "Tee", avstandM: 172, kolle: "6-jern", straff: true },
  { lie: "Rough", avstandM: 30, kolle: "56°" },
  { lie: "Green", avstandM: fotTilMeter(24), kolle: "Putter", putt: { breakRetning: "OPPOVER", slopeAlvorlighet: "SVAK", linjeMiss: "HOYRE", fartUtfall: "KORT" } },
  { lie: "Green", avstandM: fotTilMeter(3), kolle: "Putter", putt: { breakRetning: "OPPOVER", slopeAlvorlighet: "SVAK", fartUtfall: "HOLED" } },
];

describe("live slag til runde-loggen", () => {
  it("gjør «før slaget» om til «etter slaget», og siste slag går i hull", () => {
    const h = tilLoggetHull(7, 3, slag);
    assert.equal(h.lengdeMeter, 172);
    assert.deepEqual(h.slag[0].resultat, { iHull: false, lie: "ROUGH", avstandTilHull: 30 });
    assert.equal(h.slag[0].straffe, true);
    assert.deepEqual(h.slag[1].resultat, { iHull: false, lie: "GREEN", avstandTilHull: 7.32 });
    assert.deepEqual(h.slag[3].resultat, { iHull: true });
    assert.ok(hullSchema.safeParse(h).success, "kjeden må godtas av lagreLoggetRunde");
  });

  it("teller straffeslag og kan leses tilbake fra kladden", () => {
    assert.equal(slagPaaHull(slag), 5);
    const tilbake = fraLoggetHull(tilLoggetHull(7, 3, slag));
    assert.deepEqual(tilbake.map((s) => [s.lie, s.avstandM]), [["Tee", 172], ["Rough", 30], ["Green", 7.32], ["Green", 0.91]]);
  });
});
