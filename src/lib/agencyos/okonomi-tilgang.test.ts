import { test } from "node:test";
import assert from "node:assert/strict";
import { filtrerHeadCoachBare, harTilgangTilOkonomi } from "./okonomi-tilgang";

test("filtrerHeadCoachBare skjuler head coach-elementer for COACH, ikke for ADMIN", () => {
  const liste = [{ id: "a" }, { id: "okonomi", bareHeadCoach: true as const }];
  assert.deepEqual(filtrerHeadCoachBare(liste, "COACH").map((e) => e.id), ["a"]);
  assert.deepEqual(filtrerHeadCoachBare(liste, "ADMIN").map((e) => e.id), ["a", "okonomi"]);
});

test("harTilgangTilOkonomi slipper ADMIN (head coach) inn", () => {
  assert.equal(harTilgangTilOkonomi("ADMIN"), true);
});

test("harTilgangTilOkonomi slipper ikke COACH (assistant coach) inn", () => {
  assert.equal(harTilgangTilOkonomi("COACH"), false);
});
