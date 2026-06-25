/**
 * npx tsx --test src/lib/agents/plan-action-executor.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";
import { computeDelta, type PlanContext } from "./plan-action-executor";

const baseCtx: PlanContext = {
  planId: "plan-1",
  userId: "user-1",
  planlagteOkterNesteUke: 2,
  futureSessions: [
    {
      id: "s1",
      pyramidArea: "SLAG",
      skillArea: "TEE_TOTAL",
      scheduledAt: new Date("2026-07-01T17:00:00Z"),
      status: "PLANNED",
      durationMin: 60,
      title: "Driver",
    },
  ],
};

test("computeDelta PYRAMID_ADJUST legger til økt", () => {
  const delta = computeDelta(
    "PYRAMID_ADJUST",
    {
      omrade: "FYS",
      forklaring: "FYS under mål",
    },
    baseCtx,
  );
  assert.equal(delta.sessionsToAdd.length, 1);
  assert.equal(delta.sessionsToAdd[0].pyramidArea, "FYS");
});

test("computeDelta TRAINING_GAP mapper SG til skillArea", () => {
  const delta = computeDelta(
    "TRAINING_GAP",
    {
      svakestOmraade: "PUTT",
      svakestLabel: "Putting",
    },
    baseCtx,
  );
  assert.equal(delta.sessionsToAdd.length, 1);
  assert.equal(delta.sessionsToAdd[0].skillArea, "PUTTING");
  assert.equal(delta.sessionsToAdd[0].pyramidArea, "SLAG");
});

test("computeDelta WEEK_SHIFT flytter planlagte økter", () => {
  const delta = computeDelta("WEEK_SHIFT", { uker: 1 }, baseCtx);
  assert.equal(delta.sessionsToModify.length, 1);
  assert.ok(delta.sessionsToModify[0].scheduledAt);
});

test("computeDelta DRILL_SWAP endrer drill på session", () => {
  const delta = computeDelta(
    "DRILL_SWAP",
    { sessionId: "s1", exerciseId: "ex-new" },
    baseCtx,
  );
  assert.equal(delta.sessionsToModify[0].sessionId, "s1");
  assert.equal(delta.sessionsToModify[0].replaceDrillExerciseId, "ex-new");
});