import test from "node:test";
import assert from "node:assert/strict";
import { erWorkbenchOpptakskilde } from "./workbench-tilgang";
const økt = { id: "wb-spillerkopi", isTemplate: false, hiddenByPlayer: false, needsPlayerApproval: false, status: "PUBLISHED" };
test("opptak følger en publisert eller gjennomført spillerkopi", () => {
  for (const status of ["PUBLISHED", "IN_PROGRESS", "COMPLETED"]) assert.equal(erWorkbenchOpptakskilde({ ...økt, status }), true);
});
test("utkast og ikke godtatte eller skjulte spillerforslag får ikke opptak", () => {
  for (const status of ["DRAFT", "CANCELLED"]) assert.equal(erWorkbenchOpptakskilde({ ...økt, status }), false);
  assert.equal(erWorkbenchOpptakskilde({ ...økt, hiddenByPlayer: true }), false);
  assert.equal(erWorkbenchOpptakskilde({ ...økt, needsPlayerApproval: true }), false);
});
test("mal og gruppeoriginal kan aldri bli et personlig opptak", () => {
  assert.equal(erWorkbenchOpptakskilde({ ...økt, isTemplate: true }), false);
  assert.equal(erWorkbenchOpptakskilde({ ...økt, id: `wb-group-${"a".repeat(64)}` }), false);
});
