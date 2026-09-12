import assert from "node:assert/strict";
import { test } from "node:test";
import { kanBehandlePlanAction } from "./plan-action-tilgang";

const action = { actionUserId: "spiller", actionCoachId: "tildelt-coach" };

test("spiller, tildelt coach med tilgang og admin kan behandle forslaget", () => {
  assert.equal(
    kanBehandlePlanAction({
      viewerId: "spiller",
      viewerRole: "PLAYER",
      ...action,
      harSpillerTilgang: false,
    }),
    true,
  );
  assert.equal(
    kanBehandlePlanAction({
      viewerId: "tildelt-coach",
      viewerRole: "COACH",
      ...action,
      harSpillerTilgang: true,
    }),
    true,
  );
  assert.equal(
    kanBehandlePlanAction({
      viewerId: "admin",
      viewerRole: "ADMIN",
      ...action,
      harSpillerTilgang: false,
    }),
    true,
  );
});

test("uvedkommende coach, annen tildelt coach og annen spiller avvises", () => {
  assert.equal(
    kanBehandlePlanAction({
      viewerId: "fremmed-coach",
      viewerRole: "COACH",
      ...action,
      harSpillerTilgang: false,
    }),
    false,
  );
  assert.equal(
    kanBehandlePlanAction({
      viewerId: "annen-coach",
      viewerRole: "COACH",
      ...action,
      harSpillerTilgang: true,
    }),
    false,
  );
  assert.equal(
    kanBehandlePlanAction({
      viewerId: "annen-spiller",
      viewerRole: "PLAYER",
      ...action,
      harSpillerTilgang: false,
    }),
    false,
  );
});
