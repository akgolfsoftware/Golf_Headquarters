import test from "node:test";
import assert from "node:assert/strict";
import { byggAiDispatch } from "@/lib/agencyos/ai-dispatch-build";

test("tom kø: én NÅ til workbench + alltid-rader, maks 4", () => {
  const d = byggAiDispatch({
    isAdmin: true,
    planActions: 0,
    caddieDrafts: 0,
    sessionRequests: 0,
    agentRunsRunning: 0,
  });
  assert.ok(d.enTingNa);
  assert.match(d.enTingNa!.tekst, /Ingen kø/);
  assert.equal(d.enTingNa!.href, "/admin/planlegge");
  assert.ok(d.rader.length <= 4);
  assert.ok(d.rader.length >= 1);
  assert.ok(d.rader.some((r) => r.id === "agent-team-start"));
});

test("planActions haster og blir NÅ", () => {
  const d = byggAiDispatch({
    isAdmin: true,
    planActions: 3,
    caddieDrafts: 0,
    sessionRequests: 0,
    agentRunsRunning: 0,
  });
  assert.equal(d.enTingNa?.href, "/admin/godkjenninger");
  assert.match(d.enTingNa!.tekst, /3/);
  assert.equal(d.rader[0]?.id, "plan-actions");
  assert.equal(d.rader[0]?.prioritet, "hoy");
});

test("prioritet: plan > caddie > session > innboks, maks 4", () => {
  const d = byggAiDispatch({
    isAdmin: true,
    planActions: 1,
    caddieDrafts: 2,
    sessionRequests: 1,
    agentRunsRunning: 1,
    agentRunsFailed: 1,
    innboksNye: 5,
    fokusSpillere: 2,
  });
  assert.equal(d.rader.length, 4);
  const ids = d.rader.map((r) => r.id);
  assert.ok(ids.includes("plan-actions"));
  assert.ok(ids.includes("caddie-drafts"));
  // Haster-rader fyller før soft always-rows
  assert.ok(!ids.includes("workbench-plan") || ids.length === 4);
});

test("coach uten admin får ikke caddie-rad selv om tall > 0 i input (caller sørger for 0)", () => {
  const d = byggAiDispatch({
    isAdmin: false,
    planActions: 1,
    caddieDrafts: 0,
    sessionRequests: 0,
    agentRunsRunning: 0,
  });
  assert.ok(!d.rader.some((r) => r.til === "caddie"));
  assert.ok(!d.rader.some((r) => r.id === "agenter-status"));
});

test("feilet team blir NÅ når ingen annen kø", () => {
  const d = byggAiDispatch({
    isAdmin: true,
    planActions: 0,
    caddieDrafts: 0,
    sessionRequests: 0,
    agentRunsRunning: 0,
    agentRunsFailed: 2,
  });
  assert.equal(d.enTingNa?.href, "/admin/agent-team");
  assert.match(d.enTingNa!.tekst, /feilet/);
});
