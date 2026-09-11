import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  erPrivatKlientsti,
  erPrivatNextDataSti,
} from "./private-cache-routes";

describe("private ruter går aldri til Cache Storage", () => {
  it("dekker alle innloggede toppnivåflater", () => {
    for (const pathname of [
      "/portal",
      "/portal/live/okt-1",
      "/admin/recording",
      "/forelder/barn",
      "/innsyn/talent/radar",
      "/meg",
      "/team-norway/gruppe-1",
      "/team-wang/coach/iup/elev-1",
      "/auth/reset-password",
      "/api/recording/status",
    ]) {
      assert.equal(erPrivatKlientsti(pathname), true, pathname);
    }
  });

  it("treffer hele stisegmenter, ikke lignende offentlige navn", () => {
    assert.equal(erPrivatKlientsti("/meg"), true);
    assert.equal(erPrivatKlientsti("/meget-offentlig"), false);
    assert.equal(erPrivatKlientsti("/team-wang"), false);
    assert.equal(erPrivatKlientsti("/gfgk-junior"), false);
  });

  it("dekker Next data-payloads for de samme rutene", () => {
    assert.equal(
      erPrivatNextDataSti("/_next/data/bygg-id/forelder/barn.json"),
      true,
    );
    assert.equal(
      erPrivatNextDataSti("/_next/data/bygg-id/team-wang/coach.json"),
      true,
    );
    assert.equal(
      erPrivatNextDataSti("/_next/data/bygg-id/offentlig.json"),
      false,
    );
  });
});
