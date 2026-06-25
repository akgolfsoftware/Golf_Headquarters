import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canAccessPortalRoute } from "./cbac";

describe("canAccessPortalRoute", () => {
  it("allows PLAYER on PLAYER-only routes", () => {
    assert.equal(canAccessPortalRoute("PLAYER", ["PLAYER"]), true);
  });

  it("allows COACH on PLAYER-only routes (dual-role)", () => {
    assert.equal(canAccessPortalRoute("COACH", ["PLAYER"]), true);
  });

  it("allows ADMIN on PLAYER-only routes (dual-role)", () => {
    assert.equal(canAccessPortalRoute("ADMIN", ["PLAYER"]), true);
  });

  it("allows COACH when PLAYER is in a mixed allow list", () => {
    assert.equal(
      canAccessPortalRoute("COACH", ["PLAYER", "PARENT"]),
      true,
    );
  });

  it("denies PARENT on PLAYER-only routes", () => {
    assert.equal(canAccessPortalRoute("PARENT", ["PLAYER"]), false);
  });

  it("denies COACH on COACH-only routes without PLAYER", () => {
    assert.equal(canAccessPortalRoute("COACH", ["COACH", "ADMIN"]), true);
    assert.equal(canAccessPortalRoute("PLAYER", ["COACH", "ADMIN"]), false);
  });
});