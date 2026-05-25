// Tester at alle agents eksporteres fra src/lib/ai/agents/index.ts.
//
// Kjør med:
//   npx tsx --test src/lib/__tests__/ai/agents-index.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as Agents from "@/lib/ai/agents";

describe("Agents barrel-export", () => {
  it("eksporterer Caddie-funksjoner", () => {
    assert.equal(typeof Agents.chatCaddie, "function");
    assert.equal(typeof Agents.chatCaddieMedSpiller, "function");
    assert.ok(typeof Agents.CADDIE_SYSTEM_PROMPT === "string");
  });

  it("eksporterer Daily Brief-funksjoner", () => {
    assert.equal(typeof Agents.genererDailyBrief, "function");
    assert.ok(typeof Agents.DAILY_BRIEF_SYSTEM === "string");
  });

  it("eksporterer Plan Revision-funksjoner", () => {
    assert.equal(typeof Agents.foreslaPlanRevisjon, "function");
    assert.ok(typeof Agents.PLAN_REVISION_SYSTEM === "string");
  });

  it("eksporterer Vinn Tilbake-funksjoner", () => {
    assert.equal(typeof Agents.identifiserInaktiveSpillere, "function");
    assert.ok(typeof Agents.VINN_TILBAKE_SYSTEM === "string");
  });

  it("eksporterer SG Interpretation-funksjoner", () => {
    assert.equal(typeof Agents.tolkSg, "function");
    assert.ok(typeof Agents.SG_INTERPRETATION_SYSTEM === "string");
  });

  it("eksporterer Performance Peaking-funksjoner", () => {
    assert.equal(typeof Agents.foreslaPeakingPlan, "function");
    assert.ok(typeof Agents.PERFORMANCE_PEAKING_SYSTEM === "string");
  });
});
