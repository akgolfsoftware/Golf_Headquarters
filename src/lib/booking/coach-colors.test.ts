import test from "node:test";
import assert from "node:assert/strict";
import { coachColorFor, getCoachColor, hashCoachId } from "./coach-colors";

test("hashCoachId is deterministic", () => {
  assert.equal(hashCoachId("coach-a"), hashCoachId("coach-a"));
  assert.notEqual(hashCoachId("coach-a"), hashCoachId("coach-b"));
});

test("coachColorFor null falls back to gray", () => {
  const c = coachColorFor(null);
  assert.equal(c.accent, "#94A3B8");
});

test("same coach always same accent", () => {
  const a = coachColorFor("user_abc123");
  const b = getCoachColor("user_abc123");
  assert.equal(a.accent, b.accent);
  assert.equal(a.soft, b.soft);
});

test("palette spreads across different ids", () => {
  const accents = new Set(
    ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"].map(
      (id) => coachColorFor(id).accent,
    ),
  );
  assert.ok(accents.size >= 4, "expected multiple distinct accents");
});
