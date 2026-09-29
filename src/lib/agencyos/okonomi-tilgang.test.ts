import { test } from "node:test";
import assert from "node:assert/strict";
import { harTilgangTilOkonomi } from "./okonomi-tilgang";

test("harTilgangTilOkonomi slipper ADMIN (head coach) inn", () => {
  assert.equal(harTilgangTilOkonomi("ADMIN"), true);
});

test("harTilgangTilOkonomi slipper ikke COACH (assistant coach) inn", () => {
  assert.equal(harTilgangTilOkonomi("COACH"), false);
});
