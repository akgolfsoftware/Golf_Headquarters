import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Capability, ROLE_CAPABILITIES } from "./cbac";
import { beregnEffektive } from "./effective-capabilities-core";

describe("beregnEffektive", () => {
  it("uten overrides = rolle-defaulten", () => {
    const caps = beregnEffektive(ROLE_CAPABILITIES.COACH, []);
    assert.deepEqual(caps, new Set(ROLE_CAPABILITIES.COACH));
  });

  it("GRANT legger til en capability utenfor defaulten", () => {
    const caps = beregnEffektive(ROLE_CAPABILITIES.COACH, [
      { capability: Capability.USE_AGENTS, mode: "GRANT" },
    ]);
    assert.equal(caps.has(Capability.USE_AGENTS), true);
    // Resten av defaulten er urørt.
    assert.equal(caps.has(Capability.MANAGE_GROUPS), true);
  });

  it("REVOKE fjerner en capability fra defaulten", () => {
    const caps = beregnEffektive(ROLE_CAPABILITIES.COACH, [
      { capability: Capability.MANAGE_TESTS, mode: "REVOKE" },
    ]);
    assert.equal(caps.has(Capability.MANAGE_TESTS), false);
    assert.equal(caps.has(Capability.MANAGE_GROUPS), true);
  });

  it("GRANT og REVOKE kombineres", () => {
    const caps = beregnEffektive(ROLE_CAPABILITIES.COACH, [
      { capability: Capability.VIEW_FINANCE, mode: "GRANT" },
      { capability: Capability.MANAGE_GROUPS, mode: "REVOKE" },
    ]);
    assert.equal(caps.has(Capability.VIEW_FINANCE), true);
    assert.equal(caps.has(Capability.MANAGE_GROUPS), false);
  });

  it("ADMIN-immunitet: overrides ignoreres med immun-flagget", () => {
    const caps = beregnEffektive(
      ROLE_CAPABILITIES.ADMIN,
      [
        { capability: Capability.MANAGE_USERS, mode: "REVOKE" },
        { capability: Capability.VIEW_FINANCE, mode: "REVOKE" },
      ],
      { immun: true },
    );
    // Anders kan aldri låse seg ute — ADMIN beholder alt.
    assert.equal(caps.has(Capability.MANAGE_USERS), true);
    assert.equal(caps.has(Capability.VIEW_FINANCE), true);
  });

  it("ukjent capability-streng ignoreres stille", () => {
    const caps = beregnEffektive(ROLE_CAPABILITIES.COACH, [
      { capability: "finnes_ikke", mode: "GRANT" },
      { capability: "heller_ikke", mode: "REVOKE" },
    ]);
    assert.deepEqual(caps, new Set(ROLE_CAPABILITIES.COACH));
  });

  it("ukjent mode ignoreres stille", () => {
    const caps = beregnEffektive(ROLE_CAPABILITIES.COACH, [
      { capability: Capability.USE_AGENTS, mode: "TULL" },
    ]);
    assert.equal(caps.has(Capability.USE_AGENTS), false);
  });

  it("redundant override (matcher default) er harmløs", () => {
    const caps = beregnEffektive(ROLE_CAPABILITIES.COACH, [
      { capability: Capability.MANAGE_GROUPS, mode: "GRANT" },
    ]);
    assert.deepEqual(caps, new Set(ROLE_CAPABILITIES.COACH));
  });

  it("muterer ikke input-arrayet", () => {
    const defaults = [Capability.VIEW_OWN_PROFILE];
    beregnEffektive(defaults, [
      { capability: Capability.VIEW_OWN_PROFILE, mode: "REVOKE" },
    ]);
    assert.deepEqual(defaults, [Capability.VIEW_OWN_PROFILE]);
  });
});
