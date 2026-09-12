import assert from "node:assert/strict";
import { test } from "node:test";
import { WANG_TOPPIDRETT_SLUG } from "./wang-tilgang";
import {
  WANG_REISE,
  wangCoachHref,
  wangElevIupFraUke,
  wangIupHref,
  wangInnloggingTilCoach,
  wangSlugForReise,
} from "./wang-reise";

test("reisen holder Toppidrett-slug og samme elev fra uke til IUP", () => {
  assert.equal(WANG_REISE[0]?.href, "/team-wang");
  assert.equal(wangCoachHref(), "/team-wang/coach");
  assert.equal(wangIupHref("elev-1"), "/team-wang/coach/iup/elev-1");
  assert.equal(wangInnloggingTilCoach(), "/team-wang/logg-inn?next=%2Fteam-wang%2Fcoach");
  assert.equal(wangSlugForReise(), WANG_TOPPIDRETT_SLUG);
  assert.notEqual(wangSlugForReise(), "wang-ung");
});

test("IUP-lenke krever samme gruppe som coach-uka og eleven i rosteret", () => {
  const roster = {
    coachGruppeId: "wang-top-id",
    liveGruppeId: "wang-top-id",
    elever: [{ id: "elev-1" }, { id: "elev-2" }],
    elevId: "elev-1",
  };
  assert.equal(wangElevIupFraUke(roster), "/team-wang/coach/iup/elev-1");
  assert.equal(wangElevIupFraUke({ ...roster, elevId: "fremmed" }), null);
  assert.equal(wangElevIupFraUke({ ...roster, liveGruppeId: "wang-ung-id" }), null);
});
