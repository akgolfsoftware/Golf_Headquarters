import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  Capability,
  CAPABILITY_BESKRIVELSER,
  can,
  canAccessPortalRoute,
} from "./cbac";

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

describe("ROLE_CAPABILITIES-defaults (G6)", () => {
  it("COACH-defaulten dekker det trenere gjør i dag", () => {
    for (const cap of [
      Capability.VIEW_GROUP_PLANS,
      Capability.EDIT_GROUP_PLANS,
      Capability.MANAGE_GROUPS,
      Capability.VIEW_PLAYER_DATA,
      Capability.MANAGE_TESTS,
      Capability.MANAGE_BOOKINGS,
      Capability.VIEW_REPORTS,
    ]) {
      assert.equal(can("COACH", cap), true, `COACH mangler ${cap}`);
    }
  });

  it("COACH har IKKE de per-trener-gatede capabilities som default", () => {
    for (const cap of [
      Capability.VIEW_FINANCE,
      Capability.MANAGE_USERS,
      Capability.USE_AGENTS,
      Capability.INVITE_USERS,
    ]) {
      assert.equal(can("COACH", cap), false, `COACH skal ikke ha ${cap}`);
    }
  });

  it("ADMIN har alle capabilities", () => {
    for (const cap of Object.values(Capability)) {
      assert.equal(can("ADMIN", cap), true, `ADMIN mangler ${cap}`);
    }
  });

  it("alle capabilities har norsk beskrivelse for admin-UI", () => {
    for (const cap of Object.values(Capability)) {
      assert.equal(
        typeof CAPABILITY_BESKRIVELSER[cap] === "string" &&
          CAPABILITY_BESKRIVELSER[cap].length > 0,
        true,
        `mangler beskrivelse for ${cap}`,
      );
    }
  });
});