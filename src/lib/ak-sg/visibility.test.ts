import assert from "node:assert/strict";
import { test } from "node:test";
import { harVisbarSg, synligSgWhere } from "./visibility";

test("historisk beregnet SG uten modellversjon skjules", () => {
  assert.equal(harVisbarSg({ sgSource: "beregnet", sgModelVersionId: null }), false);
  assert.equal(harVisbarSg({ sgSource: "estimert", sgModelVersionId: null }), false);
  assert.equal(harVisbarSg({ sgSource: "manual", sgModelVersionId: null }), true);
  assert.equal(harVisbarSg({ sgSource: "beregnet", sgModelVersionId: "approved-v1" }), false);
  assert.equal(harVisbarSg({ sgSource: "beregnet", sgModelVersionId: "approved-v1" }, "approved-v1"), true);
  assert.equal(harVisbarSg({ sgSource: "beregnet", sgModelVersionId: "old-v0" }, "approved-v1"), false);
  assert.deepEqual(synligSgWhere(null), { OR: [{ sgSource: "manual" }] });
  assert.deepEqual(synligSgWhere("approved-v1"), {
    OR: [{ sgSource: "manual" }, { sgModelVersionId: "approved-v1" }],
  });
});
