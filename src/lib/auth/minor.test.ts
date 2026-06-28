import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isAwaitingGuardianConsent, isMinor } from "./minor";

// GDPR art. 8 (S-13): isAwaitingGuardianConsent er beslutningen getCurrentUser
// håndhever sentralt. En bruker der den er true skal blokkeres fra
// data-mutasjoner (redirect til venterommet); false slipper gjennom.
describe("isAwaitingGuardianConsent (GDPR-gate)", () => {
  it("blokkerer mindreårig som trenger, men mangler, samtykke", () => {
    assert.equal(
      isAwaitingGuardianConsent({
        requiresGuardianConsent: true,
        guardianConsentGivenAt: null,
      }),
      true,
    );
  });

  it("slipper gjennom mindreårig der samtykke ER gitt", () => {
    assert.equal(
      isAwaitingGuardianConsent({
        requiresGuardianConsent: true,
        guardianConsentGivenAt: new Date("2026-01-01"),
      }),
      false,
    );
  });

  it("slipper gjennom voksen (ingen samtykke-krav)", () => {
    assert.equal(
      isAwaitingGuardianConsent({
        requiresGuardianConsent: false,
        guardianConsentGivenAt: null,
      }),
      false,
    );
  });

  it("slipper gjennom voksen selv om et samtykke-tidspunkt finnes", () => {
    assert.equal(
      isAwaitingGuardianConsent({
        requiresGuardianConsent: false,
        guardianConsentGivenAt: new Date("2026-01-01"),
      }),
      false,
    );
  });
});

describe("isMinor (16-årsgrense)", () => {
  it("er true for under 16 år", () => {
    const tiAarSiden = new Date();
    tiAarSiden.setFullYear(tiAarSiden.getFullYear() - 10);
    assert.equal(isMinor(tiAarSiden), true);
  });

  it("er false for over 16 år", () => {
    const tjueAarSiden = new Date();
    tjueAarSiden.setFullYear(tjueAarSiden.getFullYear() - 20);
    assert.equal(isMinor(tjueAarSiden), false);
  });

  it("antar voksen når fødselsdato mangler", () => {
    assert.equal(isMinor(null), false);
    assert.equal(isMinor(undefined), false);
  });
});
