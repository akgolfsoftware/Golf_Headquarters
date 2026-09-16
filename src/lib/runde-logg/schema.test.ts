import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { slagSchema } from "@/lib/runde-logg/schema";

describe("slagSchema — endShotKategori og putt", () => {
  it("godtar et slag med endShotKategori", () => {
    const parsed = slagSchema.safeParse({
      resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 120 },
      endShotKategori: "GREEN_HIT",
    });
    assert.equal(parsed.success, true);
  });

  it("godtar en holt putt uten linjeMiss", () => {
    const parsed = slagSchema.safeParse({
      resultat: { iHull: true },
      putt: { breakRetning: "OPPOVER", slopeAlvorlighet: "SVAK", fartUtfall: "HOLED" },
    });
    assert.equal(parsed.success, true);
  });

  it("avviser linjeMiss når fartUtfall er HOLED", () => {
    const parsed = slagSchema.safeParse({
      resultat: { iHull: true },
      putt: {
        breakRetning: "OPPOVER",
        slopeAlvorlighet: "SVAK",
        fartUtfall: "HOLED",
        linjeMiss: "VENSTRE",
      },
    });
    assert.equal(parsed.success, false);
  });

  it("avviser ukjent endShotKategori-verdi", () => {
    const parsed = slagSchema.safeParse({
      resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 120 },
      endShotKategori: "NOE_ANNET",
    });
    assert.equal(parsed.success, false);
  });
});
