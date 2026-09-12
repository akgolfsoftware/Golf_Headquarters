import assert from "node:assert/strict";
import { test } from "node:test";
import {
  caddieDraftAvgjortWhere,
  caddieDraftKoWhere,
  eierCaddieDraft,
} from "./draft-eier";

test("bare eieren kan se og avgjøre utkast i køen", () => {
  assert.equal(eierCaddieDraft("admin", "admin"), true);
  assert.equal(eierCaddieDraft("admin", "annen-admin"), false);
  assert.equal(eierCaddieDraft("admin", "coach"), false);
  assert.deepEqual(caddieDraftKoWhere("admin"), { status: "PENDING", userId: "admin" });
});

test("avgjorte utkast telles bare for eieren", () => {
  const siden = new Date("2026-09-05T00:00Z");
  assert.deepEqual(caddieDraftAvgjortWhere("admin", "APPROVED", siden), {
    status: "APPROVED",
    userId: "admin",
    resolvedAt: { gte: siden },
  });
});
