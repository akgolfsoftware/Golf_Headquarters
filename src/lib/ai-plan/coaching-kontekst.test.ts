import test from "node:test";
import assert from "node:assert/strict";
import { coachingRamme, COACHING_KONTEKSTER } from "./coaching-kontekst";
test("alle elleve bestilte kontekster har egne hensyn", () => {
  assert.equal(Object.keys(COACHING_KONTEKSTER).length, 11);
  for (const c of Object.values(COACHING_KONTEKSTER)) assert.ok(c.hensyn.length > 0);
});
test("flere gruppemedlemskap skaper ikke flere spillere eller høyere nivå", () => {
  const r = coachingRamme(["gfgk-elite", "team-norway", "gfgk-elite"]);
  assert.equal(r.kontekster.length, 2);
  assert.ok(r.regler.some(x => x.includes("separate størrelser")));
});
test("voksen, Mini og College har forskjellige begrensninger", () => {
  assert.match(JSON.stringify(coachingRamme(["selvbetjent"])), /Turneringer og WAGR er ikke nødvendige/);
  assert.match(JSON.stringify(coachingRamme(["gfgk-mini"])), /Ingen talentrangering/);
  assert.match(JSON.stringify(coachingRamme(["gfgk-college"])), /lagtrener/);
});
