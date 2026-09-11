import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { erPrivatFlate } from "./privat-flate";

describe("erPrivatFlate", () => {
  it("blokkerer autentiserte flater", () => {
    for (const p of [
      "/portal",
      "/portal/plan",
      "/admin/agencyos",
      "/admin/spillere/abc",
      "/api/caddie/chat",
      "/forelder/barn/x",
      "/team-norway/g1",
      "/meg",
      "/innsyn/talent",
      "/team-wang/coach",
      "/team-wang/coach/iup/e1",
      "/intern",
      "/intern/design",
      "/auth/samtykke-venter",
    ]) {
      assert.equal(erPrivatFlate(p), true, p);
    }
  });

  it("blokkerer Next data-payloads for de samme rutene", () => {
    assert.equal(erPrivatFlate("/_next/data/abc123/portal/plan.json"), true);
    assert.equal(erPrivatFlate("/_next/data/abc123/admin/spillere.json"), true);
    assert.equal(erPrivatFlate("/_next/data/abc123/forelder.json"), true);
  });

  it("lar offentlige flater være", () => {
    for (const p of [
      "/",
      "/booking",
      "/auth/login",
      "/auth/logget-ut",
      "/team-wang",
      "/team-wang/logg-inn",
      "/offline",
      "/_next/static/chunks/app.js",
    ]) {
      assert.equal(erPrivatFlate(p), false, p);
    }
  });
});
