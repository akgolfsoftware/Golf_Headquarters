import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveTier, gratisForAlle } from "@/lib/feature-flags";

const FOR_BETALING = new Date("2026-06-15T12:00:00+02:00"); // før 1. august
const ETTER_BETALING = new Date("2026-08-15T12:00:00+02:00"); // etter 1. august

const ingenTilgang = {
  tier: "GRATIS" as const,
  createdAt: new Date("2026-01-01T00:00:00+02:00"), // > 30 dager gammel
  subscription: null,
  groupMembershipsCount: 0,
};

describe("gratisForAlle (lanserings-vindu)", () => {
  it("er aktivt før 1. august 2026", () => {
    assert.equal(gratisForAlle(FOR_BETALING), true);
  });
  it("er av etter 1. august 2026", () => {
    assert.equal(gratisForAlle(ETTER_BETALING), false);
  });
});

describe("resolveTier — lanserings-vindu", () => {
  it("gir ALLE PRO før betaling starter, uansett tier/pakke/gruppe", () => {
    assert.equal(resolveTier({ ...ingenTilgang, now: FOR_BETALING }), "PRO");
  });
});

describe("resolveTier — etter 1. august (reglene gjelder)", () => {
  it("betaler (tier PRO) ⇒ PRO", () => {
    assert.equal(
      resolveTier({ ...ingenTilgang, tier: "PRO", now: ETTER_BETALING }),
      "PRO",
    );
  });

  it("aktiv coaching-pakke (monthlyCredits > 0) ⇒ PRO", () => {
    assert.equal(
      resolveTier({
        ...ingenTilgang,
        subscription: { status: "ACTIVE", monthlyCredits: 2 },
        now: ETTER_BETALING,
      }),
      "PRO",
    );
  });

  it("inaktiv coaching-pakke gir IKKE gratis tilgang ⇒ GRATIS", () => {
    assert.equal(
      resolveTier({
        ...ingenTilgang,
        subscription: { status: "CANCELLED", monthlyCredits: 4 },
        now: ETTER_BETALING,
      }),
      "GRATIS",
    );
  });

  it("gruppemedlemskap ⇒ PRO", () => {
    assert.equal(
      resolveTier({ ...ingenTilgang, groupMembershipsCount: 1, now: ETTER_BETALING }),
      "PRO",
    );
  });

  it("prøveperiode (< 30 dager fra registrering) ⇒ PRO", () => {
    assert.equal(
      resolveTier({
        ...ingenTilgang,
        createdAt: new Date("2026-08-10T00:00:00+02:00"), // 5 dager før now
        now: ETTER_BETALING,
      }),
      "PRO",
    );
  });

  it("utløpt prøveperiode + ingen pakke/gruppe/betaling ⇒ GRATIS (må betale)", () => {
    assert.equal(resolveTier({ ...ingenTilgang, now: ETTER_BETALING }), "GRATIS");
  });
});
