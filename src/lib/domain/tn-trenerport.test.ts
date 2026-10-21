import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { erTnSpillerRolle, tnIkkeTrenerMaal } from "./tn-trenerport";

// Anders 21.10.2026: «Team Norway er kun for coach. Alle spiller bruker kun PlayerHQ.»
test("spiller i TN-gruppa sendes til PlayerHQ", () => {
  assert.equal(tnIkkeTrenerMaal("PLAYER", "PLAYER"), "/portal");
  assert.equal(tnIkkeTrenerMaal("PLAYER", null), "/portal");
});

test("forelder sendes til forelderflaten", () => {
  assert.equal(tnIkkeTrenerMaal("PARENT", null), "/forelder");
});

test("coach med spillerrolle i TN-gruppa sendes også til PlayerHQ", () => {
  assert.equal(tnIkkeTrenerMaal("COACH", "PLAYER"), "/portal");
});

test("TN-trener og ADMIN slipper inn", () => {
  assert.equal(tnIkkeTrenerMaal("COACH", "COACH"), null);
  assert.equal(tnIkkeTrenerMaal("COACH", "ASSISTANT"), null);
  assert.equal(tnIkkeTrenerMaal("ADMIN", null), null);
  assert.equal(tnIkkeTrenerMaal("ADMIN", "PLAYER"), null);
  assert.equal(erTnSpillerRolle("ADMIN", "PLAYER"), false);
});

test("layouten for hele /team-norway sender ikke-trenere videre", () => {
  const layout = readFileSync(new URL("../../app/team-norway/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /export default async function TeamNorwayLayout/);
  assert.match(layout, /const maal = tnIkkeTrenerMaal\(bruker\.role,/);
  assert.match(layout, /if \(maal\) redirect\(maal\)/);
});
