import { it } from "node:test";
import assert from "node:assert/strict";
import { summerAar } from "./kalender-aar";

it("summerAar: teller økter og minutter per akse per måned", () => {
  const { maneder, totalt } = summerAar([
    { dato: "2026-10-05", minutter: 90, akse: "tek" },
    { dato: "2026-10-06", minutter: 60, akse: null },
    { dato: "2026-01-02", minutter: 50, akse: "slag" },
    { dato: "2025-12-31", minutter: 50, akse: "slag" },
  ], 2026, "2026-10-17");
  assert.equal(totalt, 3);
  assert.equal(maneder[9].okter, 2);
  assert.equal(maneder[9].minutter.tek, 90);
  assert.equal(maneder[9].minutter.noy, 60);
  assert.equal(maneder[0].minutter.slag, 50);
});

it("summerAar: måneder etter i dag er merket framtid", () => {
  const { maneder } = summerAar([], 2026, "2026-10-17");
  assert.equal(maneder[9].framtid, false);
  assert.equal(maneder[10].framtid, true);
  assert.equal(maneder.every((m) => m.okter === 0), true);
});
