import { test } from "node:test";
import assert from "node:assert/strict";
import { rundeScopeWhere } from "./runder-scope";

test("rundeScopeWhere: assistant coach er avgrenset til egne spillere (coachId i filteret)", () => {
  const where = JSON.stringify(rundeScopeWhere({ id: "coach-1", role: "COACH" }));
  assert.ok(where.includes('"coachId":"coach-1"'));
});

test("rundeScopeWhere: head coach (ADMIN) har ikke coachId-avgrensning, men bare coachede spillere", () => {
  const where = JSON.stringify(rundeScopeWhere({ id: "admin-1", role: "ADMIN" }));
  assert.ok(!where.includes("coachId"));
  assert.ok(where.includes('"role":"PLAYER"'));
});

test("rundeScopeWhere: myk-slettede spillere er alltid utelatt", () => {
  for (const role of ["ADMIN", "COACH"]) {
    const where = JSON.stringify(rundeScopeWhere({ id: "x", role }));
    assert.ok(where.includes('"deletedAt":null'));
  }
});
