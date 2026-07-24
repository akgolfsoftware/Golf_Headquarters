/**
 * Unit tests for server-action auth asserts (KS-1).
 * Rene funksjoner — ingen DB, ingen modul-mock.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assertCoachRole,
  assertAdminRole,
  assertSpillerRole,
  assertParentRole,
} from "./action-guards-assert";

type Fake = {
  role: "PLAYER" | "COACH" | "ADMIN" | "PARENT" | "GUEST";
  requiresGuardianConsent: boolean;
  guardianConsentGivenAt: Date | null;
};

function u(partial: Partial<Fake> & Pick<Fake, "role">): Fake {
  return {
    requiresGuardianConsent: false,
    guardianConsentGivenAt: null,
    ...partial,
  };
}

describe("assertCoachRole", () => {
  it("kaster unauthenticated uten bruker", () => {
    assert.throws(() => assertCoachRole(null), /unauthenticated/);
  });

  it("kaster forbidden for PLAYER", () => {
    assert.throws(() => assertCoachRole(u({ role: "PLAYER" })), /forbidden/);
  });

  it("slipper gjennom COACH og ADMIN", () => {
    assert.equal(assertCoachRole(u({ role: "COACH" })).role, "COACH");
    assert.equal(assertCoachRole(u({ role: "ADMIN" })).role, "ADMIN");
  });
});

describe("assertAdminRole", () => {
  it("kaster forbidden for COACH", () => {
    assert.throws(() => assertAdminRole(u({ role: "COACH" })), /forbidden/);
  });

  it("slipper gjennom ADMIN", () => {
    assert.equal(assertAdminRole(u({ role: "ADMIN" })).role, "ADMIN");
  });
});

describe("assertSpillerRole", () => {
  it("kaster guardian-consent-required for mindreårig uten samtykke", () => {
    assert.throws(
      () =>
        assertSpillerRole(
          u({
            role: "PLAYER",
            requiresGuardianConsent: true,
            guardianConsentGivenAt: null,
          }),
        ),
      /guardian-consent-required/,
    );
  });

  it("slipper gjennom PLAYER med samtykke", () => {
    assert.equal(
      assertSpillerRole(
        u({
          role: "PLAYER",
          requiresGuardianConsent: true,
          guardianConsentGivenAt: new Date(),
        }),
      ).role,
      "PLAYER",
    );
  });

  it("kaster forbidden for PARENT", () => {
    assert.throws(() => assertSpillerRole(u({ role: "PARENT" })), /forbidden/);
  });

  it("slipper gjennom COACH (dual-role i portal)", () => {
    assert.equal(assertSpillerRole(u({ role: "COACH" })).role, "COACH");
  });
});

describe("assertParentRole", () => {
  it("slipper gjennom PARENT", () => {
    assert.equal(assertParentRole(u({ role: "PARENT" })).role, "PARENT");
  });

  it("kaster forbidden for PLAYER", () => {
    assert.throws(() => assertParentRole(u({ role: "PLAYER" })), /forbidden/);
  });
});
