import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hentWangRolledefinisjon, WANG_MODULES } from "./roles";

describe("WANG-roller", () => {
  it("sentral admin får samlet oversikt uten elevmodul", () => {
    const role = hentWangRolledefinisjon("central_admin");
    assert.equal(role.modules.includes("schools"), true);
    assert.equal(role.modules.includes("athletes"), false);
    assert.match(role.privacyNotice, /Navngitte elever åpnes ikke/);
  });

  it("rektor og toppidrettssjef får samme moduler uten morgeninnsjekk", () => {
    const principal = hentWangRolledefinisjon("principal");
    const headOfSports = hentWangRolledefinisjon("head_of_sports");
    assert.deepEqual(principal.modules, headOfSports.modules);
    assert.match(principal.privacyNotice, /sportssjef og trener/);
  });

  it("sportssjef og trener får samme faglige moduler", () => {
    const sportsDirector = hentWangRolledefinisjon("sports_director");
    const coach = hentWangRolledefinisjon("coach");
    assert.deepEqual(sportsDirector.modules, coach.modules);
    assert.equal(coach.modules.includes("workbench"), true);
    assert.equal(coach.modules.includes("analysis"), true);
  });

  it("foresatt og klubbtrener får ikke utøverlisten eller analyse", () => {
    for (const role of ["guardian", "club_coach"] as const) {
      const definition = hentWangRolledefinisjon(role);
      assert.equal(definition.modules.includes("athletes"), false);
      assert.equal(definition.modules.includes("analysis"), false);
    }
  });

  it("planlagte moduler er tydelig merket uten død lenke", () => {
    assert.equal(WANG_MODULES.schools.href, null);
    assert.match(WANG_MODULES.schools.description, /neste modul/);
  });
});
