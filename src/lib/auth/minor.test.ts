import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  GDPR_SAMTYKKE_ALDER,
  calculateAge,
  isAwaitingGuardianConsent,
  isMinor,
  maaHaForesattSamtykke,
} from "./minor";

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
  const naa = new Date("2026-09-13T12:00:00Z");

  it("holder 16, ikke 13", () => {
    assert.equal(GDPR_SAMTYKKE_ALDER, 16);
  });

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

  it("skifter på bursdagen, ikke 365,25-døgn", () => {
    assert.equal(isMinor(new Date("2010-09-14"), naa), true);
    assert.equal(isMinor(new Date("2010-09-13"), naa), false);
    assert.equal(calculateAge(new Date("2010-09-13"), naa), 16);
  });

  it("antar voksen når fødselsdato mangler", () => {
    assert.equal(isMinor(null), false);
    assert.equal(isMinor(undefined), false);
  });
});

describe("maaHaForesattSamtykke", () => {
  const naa = new Date("2026-09-13T12:00:00Z");

  it("krever foresatt når fødselsdato er under 16 selv uten flagg", () => {
    assert.equal(
      maaHaForesattSamtykke(
        { requiresGuardianConsent: false, dateOfBirth: new Date("2012-01-01") },
        naa,
      ),
      true,
    );
  });

  it("krever foresatt når flagget er satt selv om fødselsdato sier voksen", () => {
    assert.equal(
      maaHaForesattSamtykke(
        { requiresGuardianConsent: true, dateOfBirth: new Date("1990-01-01") },
        naa,
      ),
      true,
    );
  });

  it("antar voksen når både flagg og fødselsdato mangler", () => {
    assert.equal(
      maaHaForesattSamtykke({ requiresGuardianConsent: false, dateOfBirth: null }, naa),
      false,
    );
  });
});
