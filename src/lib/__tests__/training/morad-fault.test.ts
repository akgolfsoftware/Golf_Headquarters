import assert from "node:assert/strict";
import test from "node:test";
import { sgBandFaultKandidater } from "@/lib/training/skills/morad-fault";

test("sgBandFaultKandidater returnerer hypotese-kandidater for APP", () => {
  const kandidater = sgBandFaultKandidater("APP");
  assert.ok(kandidater.length > 0);
  assert.ok(kandidater.every((k) => typeof k === "string"));
});

test("sgBandFaultKandidater returnerer tom liste for PUTT — MORAD dekker ikke putting", () => {
  assert.deepEqual(sgBandFaultKandidater("PUTT"), []);
});
