import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { erWangWorkbenchRolle, velgWangWorkbenchGruppe } from "./data";
import type { WangWorkbenchAssignment } from "./types";

const assignment: WangWorkbenchAssignment = {
  schoolSportId: "00000000-0000-4000-8000-000000000001",
  schoolYear: "2026/2027",
  sportCode: "golf",
  sportName: "Golf",
  sportFamily: "teknikk",
  workbenchStatus: "active",
  workbenchEnabled: true,
  mappingApproved: true,
  groups: [
    {
      id: "00000000-0000-4000-8000-000000000011",
      code: "FRE-GO-G1",
      name: "Golf G1",
      grade: "VG1",
      schoolYear: "2026/2027",
    },
    {
      id: "00000000-0000-4000-8000-000000000012",
      code: "FRE-GO-G2",
      name: "Golf G2",
      grade: "VG2",
      schoolYear: "2026/2027",
    },
  ],
  plans: [],
  events: [],
};

describe("WANG Workbench", () => {
  it("er bare tilgjengelig for sportssjef og trener", () => {
    assert.equal(erWangWorkbenchRolle("sports_director"), true);
    assert.equal(erWangWorkbenchRolle("coach"), true);
    assert.equal(erWangWorkbenchRolle("principal"), false);
    assert.equal(erWangWorkbenchRolle("student"), false);
  });

  it("godtar bare en gruppe som finnes i brukerens tildelinger", () => {
    assert.equal(
      velgWangWorkbenchGruppe([assignment], assignment.groups[1].id)?.name,
      "Golf G2",
    );
    assert.equal(
      velgWangWorkbenchGruppe(
        [assignment],
        "00000000-0000-4000-8000-000000000099",
      )?.name,
      "Golf G1",
    );
    assert.equal(velgWangWorkbenchGruppe([], assignment.groups[0].id), null);
  });
});
