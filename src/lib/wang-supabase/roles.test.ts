import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  hentWangModulHref,
  hentWangRolledefinisjon,
  WANG_MODULES,
  WANG_ROLE_DEFINITIONS,
} from "./roles";
import { WANG_ROLES } from "./types";

describe("WANG-roller", () => {
  it("alle støttede roller har en komplett rolledefinisjon", () => {
    assert.deepEqual(Object.keys(WANG_ROLE_DEFINITIONS).sort(), [...WANG_ROLES].sort());
  });

  it("sentral admin får samlet oversikt uten elevmodul", () => {
    const role = hentWangRolledefinisjon("central_admin");
    assert.equal(role.modules.includes("schools"), true);
    assert.equal(role.modules.includes("athletes"), false);
    assert.equal(role.modules.includes("test-profiles"), true);
    assert.match(role.privacyNotice, /Navngitte elever åpnes ikke/);
  });

  it("ingen andre roller får administrasjon av testprofiler", () => {
    for (const role of WANG_ROLES.filter((role) => role !== "central_admin")) {
      assert.equal(hentWangRolledefinisjon(role).modules.includes("test-profiles"), false);
    }
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
    assert.equal(WANG_MODULES.workbench.href, "/team-wang/app/workbench");
    assert.equal(WANG_MODULES.athletes.href, "/team-wang/app/utovere");
  });

  it("foresatt og klubbtrener får ikke utøverlisten eller analyse", () => {
    for (const role of ["guardian", "club_coach"] as const) {
      const definition = hentWangRolledefinisjon(role);
      assert.equal(definition.modules.includes("athletes"), false);
      assert.equal(definition.modules.includes("analysis"), false);
    }
  });

  it("kobler elev, eksterne lesere og sportsteam til den beskyttede kalenderen", () => {
    assert.equal(WANG_MODULES["my-week"].href, "/team-wang/app/kalender");
    assert.equal(WANG_MODULES.calendar.href, "/team-wang/app/kalender");
    assert.equal(WANG_MODULES.camps.href, "/team-wang/app/kalender?visning=samlinger");
    assert.equal(hentWangModulHref("calendar", true), "/team-wang/demo");
    assert.equal(hentWangModulHref("calendar", false), "/team-wang/app/kalender");
  });

  it("planlagte moduler er tydelig merket uten død lenke", () => {
    assert.equal(WANG_MODULES.schools.href, null);
    assert.match(WANG_MODULES.schools.description, /neste modul/);
  });
});
