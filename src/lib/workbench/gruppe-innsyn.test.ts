import assert from "node:assert/strict";
import { test } from "node:test";
import { editableGroupWhere, gruppeInnsynWhere } from "./group-scope";

test("gruppeInnsynWhere: head coach (ADMIN) har ingen avgrensning", () => {
  assert.deepEqual(gruppeInnsynWhere({ id: "a", role: "ADMIN" }), {});
});

test("gruppeInnsynWhere: assistant coach avgrenses til egne og tilknyttede grupper", () => {
  const where = JSON.stringify(gruppeInnsynWhere({ id: "coach-1", role: "COACH" }));
  assert.ok(where.includes('"coachId":"coach-1"'));
  assert.ok(where.includes('"userId":"coach-1"'));
  assert.ok(where.includes('"endedAt":null'));
});

test("gruppeInnsynWhere: spiller og forelder får aldri treff", () => {
  for (const role of ["PLAYER", "PARENT"]) {
    assert.deepEqual(gruppeInnsynWhere({ id: "x", role }), { id: { in: [] } });
  }
});

test("editableGroupWhere: spiller og forelder får aldri treff (skoledata-siden)", () => {
  assert.deepEqual(editableGroupWhere({ id: "x", role: "PLAYER" }), { id: { in: [] } });
});
