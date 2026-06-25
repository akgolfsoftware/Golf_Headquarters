import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  planSessionStartHref,
  planSessionUiStatus,
  v2SessionStartHref,
} from "./session-hrefs";

describe("session-hrefs", () => {
  it("v2 upcoming → live router", () => {
    assert.equal(v2SessionStartHref("abc", "upcoming"), "/portal/live/abc");
  });

  it("v2 now → active", () => {
    assert.equal(v2SessionStartHref("abc", "now"), "/portal/live/abc/active");
  });

  it("plan ACTIVE → tapper", () => {
    assert.equal(planSessionStartHref("xyz", "ACTIVE"), "/portal/live/xyz/tapper");
  });

  it("plan PLANNED → brief router", () => {
    assert.equal(planSessionStartHref("xyz", "PLANNED"), "/portal/live/xyz");
  });

  it("planSessionUiStatus maps ACTIVE to now", () => {
    assert.equal(planSessionUiStatus("ACTIVE"), "now");
  });
});