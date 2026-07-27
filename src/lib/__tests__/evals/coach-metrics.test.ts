// Rene enhetstester for coach-eval-aggregering (ingen mocks).
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAgentMetrics, totalsummer, type DecisionRow } from "@/lib/evals/coach-metrics";

const t0 = new Date("2026-07-26T08:00:00Z");
const rad = (over: Partial<DecisionRow>): DecisionRow => ({
  agentName: "round-agent",
  actionType: "FOCUS_CHANGE",
  status: "PENDING",
  editedBeforeApproval: false,
  rejectReason: null,
  createdAt: t0,
  decidedAt: null,
  ...over,
});

test("godkjent-uendret-rate beregnes av besluttede saker (ikke pending)", () => {
  const m = computeAgentMetrics([
    rad({ status: "ACCEPTED", decidedAt: new Date("2026-07-26T10:00:00Z") }),
    rad({ status: "ACCEPTED", editedBeforeApproval: true, decidedAt: new Date("2026-07-26T12:00:00Z") }),
    rad({ status: "REJECTED", rejectReason: "for tidlig i sesongen", decidedAt: new Date("2026-07-26T09:00:00Z") }),
    rad({ status: "PENDING" }),
  ]);
  assert.equal(m.length, 1);
  assert.equal(m[0].total, 4);
  assert.equal(m[0].pending, 1);
  assert.equal(m[0].acceptedUnchanged, 1);
  assert.equal(m[0].acceptedEdited, 1);
  assert.equal(m[0].approvedUnchangedRate, 1 / 3);
  assert.deepEqual(m[0].rejectReasons, ["for tidlig i sesongen"]);
});

test("median beslutningslatens i timer", () => {
  const m = computeAgentMetrics([
    rad({ status: "ACCEPTED", decidedAt: new Date("2026-07-26T09:00:00Z") }), // 1t
    rad({ status: "ACCEPTED", decidedAt: new Date("2026-07-26T11:00:00Z") }), // 3t
    rad({ status: "REJECTED", decidedAt: new Date("2026-07-26T18:00:00Z") }), // 10t
  ]);
  assert.equal(m[0].medianDecisionHours, 3);
});

test("grupperer per agent+actionType og sorterer verst først", () => {
  const m = computeAgentMetrics([
    rad({ agentName: "a", status: "ACCEPTED" }),
    rad({ agentName: "b", status: "REJECTED" }),
    rad({ agentName: "c" }), // kun pending → null-rate sist
  ]);
  assert.equal(m.length, 3);
  assert.equal(m[0].agentName, "b"); // 0 % godkjent-uendret
  assert.equal(m[1].agentName, "a"); // 100 %
  assert.equal(m[2].approvedUnchangedRate, null);
});

test("totalsummer på tvers av agenter", () => {
  const m = computeAgentMetrics([
    rad({ agentName: "a", status: "ACCEPTED" }),
    rad({ agentName: "b", status: "ACCEPTED", editedBeforeApproval: true }),
    rad({ agentName: "b", status: "REJECTED" }),
  ]);
  const t = totalsummer(m);
  assert.equal(t.decided, 3);
  assert.equal(t.approvedUnchangedRate, 1 / 3);
});
