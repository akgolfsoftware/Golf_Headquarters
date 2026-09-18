import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canAdmin, canPortal } from "./nav.ts";
import { ADMIN_SCREENS, PORTAL_SCREENS } from "./types.ts";

describe("hq screen registry", () => {
  it("has 46 admin screens", () => {
    assert.equal(ADMIN_SCREENS.length, 46);
    assert.equal(new Set(ADMIN_SCREENS).size, 46);
  });

  it("has 33 portal screens", () => {
    assert.equal(PORTAL_SCREENS.length, 33);
    assert.equal(new Set(PORTAL_SCREENS).size, 33);
  });
});

describe("admin access", () => {
  it("coach cannot open ops restore", () => {
    assert.equal(canAdmin("COACH", "ops-restore"), false);
    assert.equal(canAdmin("ADMIN", "ops-restore"), true);
  });

  it("coach can open hjem and workbench", () => {
    assert.equal(canAdmin("COACH", "hjem"), true);
    assert.equal(canAdmin("COACH", "workbench"), true);
  });
});

describe("portal access", () => {
  it("foresatt cannot open live", () => {
    assert.equal(canPortal("FO", "live-slag"), false);
    assert.equal(canPortal("SP", "live-slag"), true);
  });

  it("gratis cannot open coachkontakt", () => {
    assert.equal(canPortal("GRATIS", "coachkontakt"), false);
    assert.equal(canPortal("SP", "coachkontakt"), true);
  });
});
