import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  hentSyntetiskWangProfil,
  kanAdministrereWangTestprofiler,
  lagSyntetiskeWangMaalinger,
  WANG_SYNTHETIC_PROFILES,
} from "./synthetic-profiles";
import { WANG_ROLES } from "./types";

describe("syntetiske WANG-testprofiler", () => {
  it("har nøyaktig én profil per støttet rolle", () => {
    assert.equal(WANG_SYNTHETIC_PROFILES.length, WANG_ROLES.length);
    assert.deepEqual(
      WANG_SYNTHETIC_PROFILES.map((profile) => profile.role).sort(),
      [...WANG_ROLES].sort(),
    );
    assert.equal(new Set(WANG_SYNTHETIC_PROFILES.map((profile) => profile.id)).size, WANG_ROLES.length);
  });

  it("bruker bare tydelig fiktive navn uten kontaktopplysninger", () => {
    for (const profile of WANG_SYNTHETIC_PROFILES) {
      assert.match(profile.displayName, /^Fiktiv /);
      const visibleIdentity = [
        profile.displayName,
        profile.schoolName,
        profile.sportName,
        profile.accessScope,
      ].filter(Boolean).join(" ");
      assert.doesNotMatch(visibleIdentity, /@|\+47|\b\d{8}\b/);
    }
  });

  it("avgrenser skole, idrett og eksterne personvernfelt", () => {
    assert.equal(hentSyntetiskWangProfil("central_admin").schoolId, null);
    assert.equal(hentSyntetiskWangProfil("coach").sportName, "Golf");
    assert.equal(hentSyntetiskWangProfil("guardian").wellbeingAccess, "Skjult");
    assert.equal(hentSyntetiskWangProfil("club_coach").expiresOn, "2027-07-31");
    assert.equal(hentSyntetiskWangProfil("readonly").wellbeingAccess, "Skjult");
  });

  it("gir bare sentral admin adgang til administrasjonssiden", () => {
    for (const role of WANG_ROLES) {
      assert.equal(kanAdministrereWangTestprofiler(role), role === "central_admin");
    }
  });

  it("lager tre ikke-sensitive statusmålinger for alle roller", () => {
    for (const profile of WANG_SYNTHETIC_PROFILES) {
      const metrics = lagSyntetiskeWangMaalinger(profile);
      assert.equal(metrics.length, 3);
      assert.match(metrics[2].detail, /uten personopplysninger/);
    }
  });
});
