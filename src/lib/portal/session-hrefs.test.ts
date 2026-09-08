import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  oktArkLiveHref,
  planSessionStartHref,
  planSessionUiStatus,
  v2DbSessionHref,
  v2SessionStartHref,
  wbStatusTilPlanStatus,
} from "./session-hrefs";

describe("session-hrefs", () => {
  it("v2 upcoming → live router", () => {
    assert.equal(v2SessionStartHref("abc", "upcoming"), "/portal/live/abc");
  });

  it("v2 now → active", () => {
    assert.equal(v2SessionStartHref("abc", "now"), "/portal/live/abc/active");
  });

  it("v2 done → recap", () => {
    assert.equal(v2SessionStartHref("abc", "done"), "/portal/live/abc/summary");
  });

  it("plan ACTIVE → tapper", () => {
    assert.equal(planSessionStartHref("xyz", "ACTIVE"), "/portal/live/xyz/tapper");
  });

  it("plan PLANNED → live-router, ikke read-only gjennomføring", () => {
    const href = planSessionStartHref("xyz", "PLANNED");
    assert.equal(href, "/portal/live/xyz");
    assert.equal(href.includes("/portal/tren"), false);
    assert.equal(href.includes("/gjennomfore"), false);
  });

  it("plan COMPLETED → recap", () => {
    assert.equal(
      planSessionStartHref("xyz", "COMPLETED"),
      "/portal/live/xyz/summary",
    );
  });

  it("planSessionUiStatus maps ACTIVE to now", () => {
    assert.equal(planSessionUiStatus("ACTIVE"), "now");
  });

  it("v2DbSessionHref maps IN_PROGRESS to active", () => {
    assert.equal(
      v2DbSessionHref("s1", "IN_PROGRESS"),
      "/portal/live/s1/active",
    );
  });

  it("v2DbSessionHref maps COMPLETED to recap", () => {
    assert.equal(v2DbSessionHref("s1", "COMPLETED"), "/portal/live/s1/summary");
  });

  it("wbStatusTilPlanStatus: PUBLISHED/SCHEDULED → PLANNED, IN_PROGRESS → ACTIVE", () => {
    assert.equal(wbStatusTilPlanStatus("PUBLISHED"), "PLANNED");
    assert.equal(wbStatusTilPlanStatus("SCHEDULED"), "PLANNED");
    assert.equal(wbStatusTilPlanStatus("IN_PROGRESS"), "ACTIVE");
    assert.equal(wbStatusTilPlanStatus("COMPLETED"), "COMPLETED");
  });

  it("coach-publisert workbench-økt: Start går til live, ferdig til recap", () => {
    const id = "wb-1";
    assert.equal(
      planSessionStartHref(id, wbStatusTilPlanStatus("PUBLISHED")),
      "/portal/live/wb-1",
    );
    assert.equal(
      planSessionStartHref(id, wbStatusTilPlanStatus("IN_PROGRESS")),
      "/portal/live/wb-1/tapper",
    );
    assert.equal(
      planSessionStartHref(id, wbStatusTilPlanStatus("COMPLETED")),
      "/portal/live/wb-1/summary",
    );
  });

  it("oktArkLiveHref: pågående → tapper, ferdig → recap", () => {
    assert.equal(oktArkLiveHref("wb-1", "IN_PROGRESS"), "/portal/live/wb-1/tapper");
    assert.equal(oktArkLiveHref("wb-1", "COMPLETED"), "/portal/live/wb-1/summary");
  });
});
