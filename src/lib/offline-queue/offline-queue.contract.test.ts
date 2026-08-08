import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as tapper from "./tapper-queue";
import * as live from "./live-drill-queue";

describe("offline-queue export contract (OfflineSyncBootstrap)", () => {
  it("tapper-queue exports listTapperKo + tomKo", () => {
    assert.equal(typeof tapper.listTapperKo, "function");
    assert.equal(typeof tapper.tomKo, "function");
  });
  it("live-drill-queue exports listLiveDrillKo + synkLiveDrillKo", () => {
    assert.equal(typeof live.listLiveDrillKo, "function");
    assert.equal(typeof live.synkLiveDrillKo, "function");
  });
});
