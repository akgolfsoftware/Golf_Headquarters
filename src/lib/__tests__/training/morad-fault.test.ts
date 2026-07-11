import assert from "node:assert/strict";
import test from "node:test";
import { mapSgBandToFault } from "@/lib/training/skills/morad-fault";

test("mapSgBandToFault returnerer fault for APP", () => {
  const fault = mapSgBandToFault("APP");
  assert.ok(fault);
  assert.equal(typeof fault, "string");
});

test("mapSgBandToFault returnerer null for PUTT uten mapping", () => {
  const fault = mapSgBandToFault("PUTT");
  assert.equal(fault, null);
});