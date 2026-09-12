import assert from "node:assert/strict";
import { test } from "node:test";
import { planActionAvvisSpor, planActionFeilSpor, planActionOkSpor } from "./plan-action-spor";

test("godkjent og avvist spor peker på samme actionId uten å kjøre på nytt", () => {
  const ok = planActionOkSpor({
    actionId: "pa-1",
    actionType: "SESSION_ADD",
    userId: "spiller",
    applied: true,
    summary: "Økt lagt til",
  });
  assert.equal(ok.status, "OK");
  assert.equal(ok.output.actionId, "pa-1");
  assert.equal(ok.output.utfall, "ACCEPTED");
  const avvist = planActionAvvisSpor({
    actionId: "pa-1",
    actionType: "SESSION_ADD",
    userId: "spiller",
  });
  assert.equal(avvist.output.utfall, "REJECTED");
  assert.equal(avvist.output.applied, false);
  assert.equal(avvist.output.actionId, "pa-1");
});

test("feilspor beholder actionId og fjerner e-post og database-url", () => {
  const spor = planActionFeilSpor({
    actionId: "pa-1",
    actionType: "SESSION_ADD",
    userId: "spiller",
    error: new Error("postgresql://secret@db/internal_table kari@example.test"),
  });
  assert.equal(spor.status, "ERROR");
  assert.equal(spor.output.actionId, "pa-1");
  assert.equal(spor.output.utfall, "ERROR");
  assert.equal(spor.error?.includes("kari@example.test"), false);
  assert.equal(spor.error?.includes("postgresql://"), false);
  assert.equal(spor.error?.includes("secret"), false);
});
