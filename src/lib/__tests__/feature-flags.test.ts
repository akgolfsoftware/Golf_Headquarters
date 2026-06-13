import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { beregnEffektivTier, gratisForAlle } from "@/lib/feature-flags";

const FOR_BETALING = new Date("2026-06-15T12:00:00+02:00"); // før 1. juli
const ETTER_BETALING = new Date("2026-07-15T12:00:00+02:00"); // etter 1. juli

const ingenTilgang = {
  tier: "GRATIS" as const,
  createdAt: new Date("2026-01-01T00:00:00+02:00"), // > 30 dager gammel
  coachingMonthlyCredits: 0,
  subscriptionActive: false,
  iGruppe: false,
};

describe("gratisForAlle (lanserings-vindu)", () => {
  it("er aktivt før 1. juli 2026", () => {
    assert.equal(gratisForAlle(FOR_BETALING), true);
  });
  it("er av etter 1. juli 2026", () => {
    assert.equal(gratisForAlle(ETTER_BETALING), false);
  });
});

describe("beregnEffektivTier — lanserings-vindu", () => {
  it("gir ALLE PRO før betaling starter, uansett tier/pakke/gruppe", () => {
    assert.equal(beregnEffektivTier({ ...ingenTilgang, now: FOR_BETALING }), "PRO");
  });
});

describe("beregnEffektivTier — etter 1. juli (reglene gjelder)", () => {
  it("betaler (tier PRO) ⇒ PRO", () => {
    assert.equal(
      beregnEffektivTier({ ...ingenTilgang, tier: "PRO", now: ETTER_BETALING }),
      "PRO",
    );
  });

  it("aktiv coaching-pakke (monthlyCredits > 0) ⇒ PRO", () => {
    assert.equal(
      beregnEffektivTier({
        ...ingenTilgang,
        coachingMonthlyCredits: 2,
        subscriptionActive: true,
        now: ETTER_BETALING,
      }),
      "PRO",
    );
  });

  it("inaktiv coaching-pakke gir IKKE gratis tilgang ⇒ GRATIS", () => {
    assert.equal(
      beregnEffektivTier({
        ...ingenTilgang,
        coachingMonthlyCredits: 4,
        subscriptionActive: false,
        now: ETTER_BETALING,
      }),
      "GRATIS",
    );
  });

  it("gruppemedlemskap ⇒ PRO", () => {
    assert.equal(
      beregnEffektivTier({ ...ingenTilgang, iGruppe: true, now: ETTER_BETALING }),
      "PRO",
    );
  });

  it("prøveperiode (< 30 dager fra registrering) ⇒ PRO", () => {
    assert.equal(
      beregnEffektivTier({
        ...ingenTilgang,
        createdAt: new Date("2026-07-10T00:00:00+02:00"), // 5 dager før now
        now: ETTER_BETALING,
      }),
      "PRO",
    );
  });

  it("utløpt prøveperiode + ingen pakke/gruppe/betaling ⇒ GRATIS (må betale)", () => {
    assert.equal(beregnEffektivTier({ ...ingenTilgang, now: ETTER_BETALING }), "GRATIS");
  });
});
