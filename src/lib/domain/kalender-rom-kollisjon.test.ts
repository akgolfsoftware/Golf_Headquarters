import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { romKollidererIder, romKollisjoner, type RomBooking } from "./kalender-rom-kollisjon";

function booking(
  id: string,
  facilityId: string,
  fra: string,
  til: string,
  facilityName = facilityId,
): RomBooking {
  const min = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  return { id, facilityId, facilityName, startMin: min(fra), sluttMin: min(til), tittel: id };
}

describe("kalender-rom-kollisjon · romKollisjoner", () => {
  it("finner overlapp på samme fasilitet (kapasitet 1)", () => {
    const k = romKollisjoner(
      [booking("a", "sim2", "14:00", "15:30"), booking("b", "sim2", "14:30", "15:30")],
      { sim2: 1 },
    );
    assert.equal(k.length, 1);
    assert.equal(k[0].fraMin, 14 * 60 + 30);
    assert.equal(k[0].tilMin, 15 * 60 + 30);
    assert.equal(k[0].facilityId, "sim2");
  });

  it("teller ikke berøring som overlapp", () => {
    const k = romKollisjoner([booking("a", "sim2", "09:00", "10:00"), booking("b", "sim2", "10:00", "11:00")], {
      sim2: 1,
    });
    assert.equal(k.length, 0);
  });

  it("ulike fasiliteter kolliderer aldri", () => {
    const k = romKollisjoner([booking("a", "sim1", "14:00", "15:00"), booking("b", "sim2", "14:00", "15:00")], {
      sim1: 1,
      sim2: 1,
    });
    assert.equal(k.length, 0);
  });

  it("hopper over fasiliteter med kapasitet > 1 — delt flate er ikke en kollisjon", () => {
    const k = romKollisjoner([booking("a", "range1", "09:00", "10:00"), booking("b", "range1", "09:30", "10:30")], {
      range1: 4,
    });
    assert.equal(k.length, 0);
  });

  it("manglende kapasitetsoppslag antar kapasitet 1", () => {
    const k = romKollisjoner([booking("a", "sim2", "14:00", "15:00"), booking("b", "sim2", "14:30", "15:30")], {});
    assert.equal(k.length, 1);
  });

  it("tre overlappende bookinger gir tre par", () => {
    const k = romKollisjoner(
      [
        booking("a", "sim2", "14:00", "16:00"),
        booking("b", "sim2", "14:30", "15:30"),
        booking("c", "sim2", "15:00", "17:00"),
      ],
      { sim2: 1 },
    );
    assert.equal(k.length, 3);
  });
});

describe("kalender-rom-kollisjon · romKollidererIder", () => {
  it("samler unike id-er fra alle par", () => {
    const ider = romKollidererIder([
      { a: "x", b: "y", facilityId: "sim2", facilityName: "Sim 2", fraMin: 0, tilMin: 10 },
      { a: "y", b: "z", facilityId: "sim2", facilityName: "Sim 2", fraMin: 5, tilMin: 15 },
    ]);
    assert.deepEqual([...ider].sort(), ["x", "y", "z"]);
  });

  it("tom liste gir tom mengde", () => {
    assert.equal(romKollidererIder([]).size, 0);
  });
});
