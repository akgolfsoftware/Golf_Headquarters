import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parTemplate } from "./par-template";

describe("parTemplate", () => {
  it("gir 18 hull som summerer til banens totale par", () => {
    for (const par of [68, 70, 71, 72, 73, 74]) {
      const holes = parTemplate(par);
      assert.equal(holes.length, 18);
      assert.equal(holes.reduce((a, b) => a + b, 0), par);
    }
  });

  it("alle hull er innenfor 3–5 (aldri flat)", () => {
    for (const par of [68, 71, 76]) {
      for (const h of parTemplate(par)) {
        assert.ok(h >= 3 && h <= 5, `hull ${h} utenfor 3-5 for par ${par}`);
      }
    }
  });

  it("er deterministisk — samme input gir samme output", () => {
    assert.deepEqual(parTemplate(72), parTemplate(72));
  });

  it("par 72 gir fasit-miksen uendret (MIKS' egen sum)", () => {
    assert.deepEqual(parTemplate(72), [4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 4, 3, 5, 4, 4, 5, 3, 4]);
  });
});
