/**
 * N4 — TestShot zod + invarianten «aldri bland PEI og Broadie som samme felt».
 * Action-lag mot DB dekkes av kirurgisk DDL + senere testdag (N10).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CreateTestShotInputSchema,
  TestShotSchema,
} from "./test-shot";

test("gyldig slag: pei og sg kan stå side om side som egne felt", () => {
  const r = TestShotSchema.parse({
    id: "s1",
    testResultId: "r1",
    shotNumber: 0,
    pei: 0.0426,
    sg: -0.1,
    pgaPutts: 1.8,
    x: 1.2,
    y: 4.5,
    retning: "NE",
    createdAt: new Date("2026-08-26T12:00:00Z"),
  });
  assert.equal(r.pei, 0.0426);
  assert.equal(r.sg, -0.1);
});

test("null-felt tillatt — ikke alle slag har PEI eller SG", () => {
  const r = TestShotSchema.parse({
    id: "s2",
    testResultId: "r1",
    shotNumber: 1,
    pei: null,
    sg: null,
    pgaPutts: null,
    x: null,
    y: null,
    retning: null,
    createdAt: new Date(),
  });
  assert.equal(r.pei, null);
  assert.equal(r.sg, null);
});

test("CreateTestShotInput krever testResultId og shotNumber >= 0", () => {
  const ok = CreateTestShotInputSchema.parse({
    testResultId: "r1",
    shotNumber: 0,
    pei: 0.04,
  });
  assert.equal(ok.testResultId, "r1");

  assert.equal(
    CreateTestShotInputSchema.safeParse({ testResultId: "r1", shotNumber: -1 })
      .success,
    false,
  );
  assert.equal(
    CreateTestShotInputSchema.safeParse({ shotNumber: 0 }).success,
    false,
  );
});

test("shotNumber må være heltall", () => {
  assert.equal(
    CreateTestShotInputSchema.safeParse({
      testResultId: "r1",
      shotNumber: 1.5,
    }).success,
    false,
  );
});
