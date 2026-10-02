import assert from "node:assert/strict";
import { test } from "node:test";
import { harVisbarSg } from "./visibility";

test("historisk beregnet SG uten modellversjon skjules", () => {
  assert.equal(harVisbarSg({ sgSource: "beregnet", sgModelVersionId: null }), false);
  assert.equal(harVisbarSg({ sgSource: "estimert", sgModelVersionId: null }), false);
  assert.equal(harVisbarSg({ sgSource: "manual", sgModelVersionId: null }), true);
  assert.equal(harVisbarSg({ sgSource: "beregnet", sgModelVersionId: "approved-v1" }), true);
});
