// src/lib/__tests__/meg-classify-schema.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { ClassificationSchema } from "@/lib/meg/classify-schema";

test("godtar gyldig klassifisering", () => {
  const r = ClassificationSchema.safeParse({
    kind: "sleep",
    summary: "Sov dårlig, våknet 03",
    tags: ["søvn"],
    value_num: 5,
    value_unit: "timer",
  });
  assert.ok(r.success);
});

test("avviser ukjent kind", () => {
  const r = ClassificationSchema.safeParse({ kind: "alien", summary: "x", tags: [] });
  assert.equal(r.success, false);
});

test("tillater utelatt value_num/value_unit", () => {
  const r = ClassificationSchema.safeParse({ kind: "note", summary: "tanke", tags: [] });
  assert.ok(r.success);
});
