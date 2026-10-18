import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const kilde = readFileSync(new URL("./ForsidePrecision.tsx", import.meta.url), "utf8");

describe("Forsiden: merke- og prisregler", () => {
  it("har ingen forbudte ord", () => {
    for (const ord of [/kartlegg/i, /morad/i, /o'grady/i, /virkedag/i, /sitat/i, /neste niv/i, /passion/i]) {
      const treff = kilde
        .split("\n")
        .filter((l) => !l.trim().startsWith("*") && !l.trim().startsWith("//"))
        .filter((l) => ord.test(l));
      assert.deepEqual(treff, [], `Forbudt ord ${ord}`);
    }
  });

  it("skriver ikke pris inn for hånd", () => {
    assert.doesNotMatch(kilde, /\b299\b|\b2 ?690\b/);
    assert.match(kilde, /PLAYERHQ_PRIS_MND_ORE/);
    assert.match(kilde, /priceOre/);
  });

  it("bruker Stats, ikke Analyse, som fanenavn", () => {
    assert.doesNotMatch(kilde, /tittel: "Analyse"/);
    assert.match(kilde, /tittel: "Stats"/);
  });

  it("har hovedknappen «Book time»", () => {
    assert.match(kilde, /Book time/);
  });
});
