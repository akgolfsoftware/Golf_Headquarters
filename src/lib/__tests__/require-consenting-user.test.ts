import { test } from "node:test";
import assert from "node:assert/strict";
import { assertNotAwaitingConsent } from "../auth/requireConsentingUser";

test("assertNotAwaitingConsent: mindreårig uten samtykke → kaster", () => {
  assert.throws(
    () =>
      assertNotAwaitingConsent({
        requiresGuardianConsent: true,
        guardianConsentGivenAt: null,
      }),
    /guardian-consent-required/,
  );
});

test("assertNotAwaitingConsent: mindreårig MED samtykke → ok", () => {
  assert.doesNotThrow(() =>
    assertNotAwaitingConsent({
      requiresGuardianConsent: true,
      guardianConsentGivenAt: new Date("2026-01-01"),
    }),
  );
});

test("assertNotAwaitingConsent: voksen (ingen samtykke-krav) → ok", () => {
  assert.doesNotThrow(() =>
    assertNotAwaitingConsent({
      requiresGuardianConsent: false,
      guardianConsentGivenAt: null,
    }),
  );
});
