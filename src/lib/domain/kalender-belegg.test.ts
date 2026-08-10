import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  beleggForDag,
  beleggForDager,
  formaterTid,
  kollisjoner,
  utenEier,
  type BeleggOkt,
} from "./kalender-belegg";

const AK = "coach-ak";
const MP = "coach-mp";

function okt(
  id: string,
  fra: string,
  til: string,
  slag: BeleggOkt["slag"] = "coaching",
  coachId: string | null = AK,
): BeleggOkt {
  const min = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  return { id, startMin: min(fra), sluttMin: min(til), slag, coachId };
}

describe("kalender-belegg · kollisjoner", () => {
  it("finner overlapp for samme coach", () => {
    const k = kollisjoner([okt("a", "16:00", "17:30"), okt("b", "16:30", "17:30")]);
    assert.equal(k.length, 1);
    assert.equal(k[0].fraMin, 16 * 60 + 30);
    assert.equal(k[0].tilMin, 17 * 60 + 30);
  });

  it("teller ikke berøring som overlapp", () => {
    // Fasitens `a1 < b2 && b1 < a2` — 09:00–10:00 og 10:00–11:00 kolliderer ikke.
    assert.equal(kollisjoner([okt("a", "09:00", "10:00"), okt("b", "10:00", "11:00")]).length, 0);
  });

  it("er ikke kollisjon når coachene er forskjellige", () => {
    // Avvik fra fasiten, med vilje: appen er multi-coach.
    const k = kollisjoner([
      okt("a", "16:00", "17:30", "coaching", AK),
      okt("b", "16:30", "17:30", "coaching", MP),
    ]);
    assert.equal(k.length, 0);
  });

  it("holder økter uten kjent eier utenfor, og teller dem", () => {
    const okter = [
      okt("a", "16:00", "17:30", "coaching", null),
      okt("b", "16:30", "17:30", "coaching", null),
    ];
    assert.equal(kollisjoner(okter).length, 0);
    assert.equal(utenEier(okter), 2);
  });

  it("ser bort fra sperret tid og informasjonsrader", () => {
    const k = kollisjoner([
      okt("a", "12:00", "13:00", "sperret"),
      okt("b", "12:00", "13:00", "ingen"),
      okt("c", "12:00", "13:00", "coaching"),
    ]);
    assert.equal(k.length, 0);
  });
});

describe("kalender-belegg · belegg", () => {
  it("regner fasitens torsdag", () => {
    // agencyos-kalender.html, dag 3: 08–09 + 09–10:30 coaching, 11–12 holdt,
    // 12–13 sperret, 16–17:30 + 16:30–17:30 coaching (overlapper).
    // Booket uten dobbelttelling: 60 + 90 + 60 + 90 = 300 min.
    const okter = [
      okt("e1", "08:00", "09:00"),
      okt("e2", "09:00", "10:30"),
      okt("e3", "11:00", "12:00"),
      okt("e4", "12:00", "13:00", "sperret"),
      okt("e5", "16:00", "17:30"),
      okt("e6", "16:30", "17:30"),
    ];
    const b = beleggForDag(okter, 18 * 60, "tidsakse");
    assert.equal(b.booketMin, 300);
    assert.equal(b.sperretMin, 60);
    assert.equal(b.tilgjengeligMin, 18 * 60 - 60);
    assert.equal(b.prosent, Math.round((300 / (18 * 60 - 60)) * 100));
  });

  it("dobbelttelller ikke overlappende avtaler", () => {
    // To 60-min avtaler som deler 30 min opptar 90 min, ikke 120.
    const b = beleggForDag(
      [okt("a", "10:00", "11:00"), okt("b", "10:30", "11:30")],
      6 * 60,
      "tilgjengelighet",
    );
    assert.equal(b.booketMin, 90);
  });

  it("teller to coacher hver for seg", () => {
    const b = beleggForDag(
      [
        okt("a", "10:00", "11:00", "coaching", AK),
        okt("b", "10:00", "11:00", "coaching", MP),
      ],
      10 * 60,
      "tilgjengelighet",
    );
    assert.equal(b.booketMin, 120);
  });

  it("gir null prosent når det ikke finnes tilgjengelig tid", () => {
    // Ingen nevner ⇒ tallet finnes ikke. Aldri 0 %, som ville lest som «tomt».
    const b = beleggForDag([], 0, "tilgjengelighet");
    assert.equal(b.prosent, null);
    assert.equal(b.ledigMin, 0);
  });

  it("lar sperret tid krympe nevneren, ikke fylle telleren", () => {
    const b = beleggForDag([okt("s", "12:00", "16:00", "sperret")], 8 * 60, "tilgjengelighet");
    assert.equal(b.booketMin, 0);
    assert.equal(b.tilgjengeligMin, 4 * 60);
    assert.equal(b.prosent, 0);
  });

  it("klemmer ledig kapasitet til minst 0 ved overbooking", () => {
    const b = beleggForDag([okt("a", "08:00", "18:00")], 4 * 60, "tilgjengelighet");
    assert.equal(b.ledigMin, 0);
    assert.ok((b.prosent ?? 0) > 100);
  });
});

describe("kalender-belegg · uke", () => {
  it("regner av summene, ikke som snitt av dagsprosentene", () => {
    // Dag 1: 1 av 2 timer booket. Dag 2: 0 av 8. Sum = 1/10 = 10 %.
    const uke = beleggForDager(
      [
        { okter: [okt("a", "09:00", "10:00")], basisMin: 2 * 60 },
        { okter: [], basisMin: 8 * 60 },
      ],
      "tilgjengelighet",
    );
    assert.equal(uke.prosent, 10);
    assert.notEqual(uke.prosent, 25);
    assert.equal(uke.ledigMin, 9 * 60);
  });
});

describe("kalender-belegg · formaterTid", () => {
  it("følger fasitens tid()", () => {
    assert.equal(formaterTid(360), "6 t");
    assert.equal(formaterTid(90), "1 t 30 min");
    assert.equal(formaterTid(45), "45 min");
    assert.equal(formaterTid(0), "0 min");
  });
});
