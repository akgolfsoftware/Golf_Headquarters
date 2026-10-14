import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  byggWangUtoveroversikt,
  erWangUtoveroversiktRolle,
} from "./data";

const SCHOOL_ID = "00000000-0000-4000-8000-000000000001";
const SCHOOL_SPORT_ID = "00000000-0000-4000-8000-000000000002";
const SPORT_ID = "00000000-0000-4000-8000-000000000003";
const GROUP_ID = "00000000-0000-4000-8000-000000000004";
const DEMO_STUDENT_ID = "00000000-0000-4000-8000-000000000005";
const LINKED_STUDENT_ID = "00000000-0000-4000-8000-000000000006";
const PROFILE_ID = "00000000-0000-4000-8000-000000000007";

describe("WANG-utøveroversikt", () => {
  it("er bare tilgjengelig for skoleledelse og tildelt sportsteam", () => {
    for (const role of [
      "school_leader",
      "principal",
      "head_of_sports",
      "sports_director",
      "coach",
    ] as const) {
      assert.equal(erWangUtoveroversiktRolle(role), true);
    }

    for (const role of [
      "central_admin",
      "student",
      "guardian",
      "club_coach",
      "readonly",
    ] as const) {
      assert.equal(erWangUtoveroversiktRolle(role), false);
    }
  });

  it("bygger bare en enkel elevliste uten helse- eller kontaktdata", () => {
    const overview = byggWangUtoveroversikt(
      [
        {
          id: SCHOOL_SPORT_ID,
          school_id: SCHOOL_ID,
          sport_id: SPORT_ID,
          school_year: "2026/2027",
          status: "active",
          workbench_enabled: true,
        },
      ],
      [
        {
          id: SPORT_ID,
          code: "golf",
          name: "Golf",
          family: "presisjon",
          workbench_status: "active",
          mapping_approved: true,
        },
      ],
      [
        {
          id: GROUP_ID,
          school_sport_id: SCHOOL_SPORT_ID,
          code: "FRE-GO-G1",
          name: "Golf VG1",
          grade: "VG1",
          school_year: "2026/2027",
        },
      ],
      [
        {
          id: LINKED_STUDENT_ID,
          profile_id: PROFILE_ID,
          group_id: GROUP_ID,
          demo_name: null,
          grade: "VG1",
          is_demo: false,
        },
        {
          id: DEMO_STUDENT_ID,
          profile_id: null,
          group_id: GROUP_ID,
          demo_name: "Demo Elev",
          grade: "VG1",
          is_demo: true,
        },
      ],
      [{ id: PROFILE_ID, display_name: "Test Utøver" }],
    );

    assert.deepEqual(
      overview.sports[0].groups[0].athletes.map((athlete) => athlete.name),
      ["Demo Elev", "Test Utøver"],
    );
    const serialized = JSON.stringify(overview);
    assert.doesNotMatch(serialized, /sleep|readiness|checkin|email|phone|statusLabel/i);
  });
});
