import assert from "node:assert/strict";
import { test } from "node:test";

import {
  erDemokonto,
  erTnGruppeSlug,
  gruppeSlugForEpost,
  startsideForDemokonto,
  TN_DEMO_SLUG,
  WANG_DEMO_SLUG,
} from "./demo-grupper";

test("vanlige kontoer får de ekte gruppene", () => {
  assert.equal(gruppeSlugForEpost("trener@wang.no", "WANG"), "wang-toppidrett");
  assert.equal(gruppeSlugForEpost("trener@golfforbundet.no", "TEAM_NORWAY"), "team-norway");
  assert.equal(gruppeSlugForEpost(null, "TEAM_NORWAY"), "team-norway");
  assert.equal(erDemokonto("anders@akgolf.no"), false);
});

test("demokontoene får bare egen demogruppe, uansett store bokstaver og mellomrom", () => {
  assert.equal(gruppeSlugForEpost("demo@wang.no", "WANG"), WANG_DEMO_SLUG);
  assert.equal(gruppeSlugForEpost(" Demo@Golfforbundet.no ", "TEAM_NORWAY"), TN_DEMO_SLUG);
  assert.equal(erDemokonto("DEMO@wang.no"), true);
});

test("en demokonto når aldri den andre flaten eller en ekte gruppe", () => {
  assert.equal(gruppeSlugForEpost("demo@wang.no", "TEAM_NORWAY"), null);
  assert.equal(gruppeSlugForEpost("demo@golfforbundet.no", "WANG"), null);
  for (const epost of ["demo@wang.no", "demo@golfforbundet.no"]) {
    for (const flate of ["WANG", "TEAM_NORWAY"] as const) {
      const slug = gruppeSlugForEpost(epost, flate);
      assert.ok(slug === null || slug.endsWith("-demo"), `${epost} på ${flate} ga ${slug}`);
    }
  }
});

test("Team Norway-demogruppa regnes som Team Norway, WANG-demogruppa gjør ikke det", () => {
  assert.equal(erTnGruppeSlug("team-norway"), true);
  assert.equal(erTnGruppeSlug(TN_DEMO_SLUG), true);
  assert.equal(erTnGruppeSlug(WANG_DEMO_SLUG), false);
  assert.equal(erTnGruppeSlug(null), false);
});

test("demokontoene starter på sin trenerflate, vanlige kontoer følger rollen", () => {
  assert.equal(startsideForDemokonto("demo@golfforbundet.no"), "/team-norway");
  assert.equal(startsideForDemokonto(" DEMO@wang.no "), "/team-wang/coach");
  assert.equal(startsideForDemokonto("anders@akgolf.no"), null);
  assert.equal(startsideForDemokonto(null), null);
});
