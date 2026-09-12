import assert from "node:assert/strict";
import { test } from "node:test";
import {
  kanSeSporsmal,
  kanSvarePaSporsmal,
  sporsmalListeFilter,
} from "./coach-sporsmal-tilgang";

const sporsmal = { askerUserId: "spiller", coachUserId: "tildelt-coach" };

test("spiller, tildelt coach og admin kan se tråden", () => {
  assert.equal(
    kanSeSporsmal({
      viewerId: "spiller",
      viewerRole: "PLAYER",
      ...sporsmal,
      harSpillerTilgang: false,
    }),
    true,
  );
  assert.equal(
    kanSeSporsmal({
      viewerId: "tildelt-coach",
      viewerRole: "COACH",
      ...sporsmal,
      harSpillerTilgang: false,
    }),
    true,
  );
  assert.equal(
    kanSeSporsmal({
      viewerId: "admin",
      viewerRole: "ADMIN",
      ...sporsmal,
      harSpillerTilgang: false,
    }),
    true,
  );
});

test("annen spiller og coach uten tilgang får ikke se eller svare", () => {
  assert.equal(
    kanSeSporsmal({
      viewerId: "annen-spiller",
      viewerRole: "PLAYER",
      ...sporsmal,
      harSpillerTilgang: false,
    }),
    false,
  );
  assert.equal(
    kanSeSporsmal({
      viewerId: "fremmed-coach",
      viewerRole: "COACH",
      askerUserId: "spiller",
      coachUserId: null,
      harSpillerTilgang: false,
    }),
    false,
  );
  assert.equal(
    kanSvarePaSporsmal({
      viewerId: "fremmed-coach",
      viewerRole: "COACH",
      coachUserId: "tildelt-coach",
      harSpillerTilgang: true,
    }),
    false,
  );
  assert.equal(
    kanSvarePaSporsmal({
      viewerId: "tildelt-coach",
      viewerRole: "COACH",
      coachUserId: null,
      harSpillerTilgang: true,
    }),
    true,
  );
});

test("åpen kø i lista er bare egne spillere for coach", () => {
  const filter = sporsmalListeFilter({
    viewerId: "tildelt-coach",
    viewerRole: "COACH",
    coachedPlayerIds: ["spiller"],
  });
  assert.deepEqual(filter, {
    OR: [
      { coachUserId: "tildelt-coach" },
      { coachUserId: null, askerUserId: { in: ["spiller"] } },
    ],
  });
});
