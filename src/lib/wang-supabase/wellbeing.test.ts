import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  byggWangHelsevarsler,
  erWangHelsevarselRolle,
  finnAktivSovnrekke,
} from "./wellbeing";
import type { WangAthleteOverview } from "./types";

const STUDENT_ID = "00000000-0000-4000-8000-000000000001";

const overview: WangAthleteOverview = {
  sports: [{
    schoolSportId: "00000000-0000-4000-8000-000000000002",
    schoolYear: "2026/2027",
    sportCode: "golf",
    sportName: "Golf",
    groups: [{
      id: "00000000-0000-4000-8000-000000000003",
      code: "FRE-GO-G1",
      name: "Golf VG1",
      grade: "VG1",
      schoolYear: "2026/2027",
      athletes: [{
        id: STUDENT_ID,
        name: "Fiktiv Utøver",
        grade: "VG1",
        isDemo: true,
      }],
    }],
  }],
};

describe("WANG-helsevarsler", () => {
  it("er bare tilgjengelig for tildelt sportssjef og trener", () => {
    assert.equal(erWangHelsevarselRolle("sports_director"), true);
    assert.equal(erWangHelsevarselRolle("coach"), true);
    for (const role of [
      "central_admin",
      "school_leader",
      "principal",
      "head_of_sports",
      "student",
      "guardian",
      "club_coach",
      "readonly",
    ] as const) {
      assert.equal(erWangHelsevarselRolle(role), false);
    }
  });

  it("varsler ved under seks timer tre kalenderdager på rad", () => {
    assert.deepEqual(
      finnAktivSovnrekke(
        [
          { checkin_date: "2026-10-12", sleep_hours: 5.75 },
          { checkin_date: "2026-10-13", sleep_hours: 5.5 },
          { checkin_date: "2026-10-14", sleep_hours: 4.75 },
        ],
        "2026-10-14",
      ),
      { startsOn: "2026-10-12", endsOn: "2026-10-14", consecutiveDays: 3 },
    );
  });

  it("seks timer, manglende dag og gammel rekke bryter aktivt varsel", () => {
    assert.equal(
      finnAktivSovnrekke(
        [
          { checkin_date: "2026-10-11", sleep_hours: 5 },
          { checkin_date: "2026-10-12", sleep_hours: 5 },
          { checkin_date: "2026-10-13", sleep_hours: 5 },
          { checkin_date: "2026-10-14", sleep_hours: 6 },
        ],
        "2026-10-14",
      ),
      null,
    );
    assert.equal(
      finnAktivSovnrekke(
        [
          { checkin_date: "2026-10-11", sleep_hours: 5 },
          { checkin_date: "2026-10-12", sleep_hours: 5 },
          { checkin_date: "2026-10-13", sleep_hours: 6 },
        ],
        "2026-10-14",
      ),
      null,
    );
    assert.equal(
      finnAktivSovnrekke(
        [
          { checkin_date: "2026-10-10", sleep_hours: 5 },
          { checkin_date: "2026-10-12", sleep_hours: 5 },
          { checkin_date: "2026-10-13", sleep_hours: 5 },
        ],
        "2026-10-14",
      ),
      null,
    );
    assert.equal(
      finnAktivSovnrekke(
        [
          { checkin_date: "2026-10-09", sleep_hours: 5 },
          { checkin_date: "2026-10-10", sleep_hours: 5 },
          { checkin_date: "2026-10-11", sleep_hours: 5 },
        ],
        "2026-10-14",
      ),
      null,
    );
  });

  it("bygger et minimert varsel uten søvntall, dagsform eller kontaktdata", () => {
    const alerts = byggWangHelsevarsler(
      overview,
      [
        { student_id: STUDENT_ID, checkin_date: "2026-10-12", sleep_hours: 5.5 },
        { student_id: STUDENT_ID, checkin_date: "2026-10-13", sleep_hours: 5.25 },
        { student_id: STUDENT_ID, checkin_date: "2026-10-14", sleep_hours: 5 },
      ],
      "2026-10-14",
    );

    assert.deepEqual(alerts, [{
      studentId: STUDENT_ID,
      athleteName: "Fiktiv Utøver",
      grade: "VG1",
      isDemo: true,
      groupName: "Golf VG1",
      sportName: "Golf",
      streakStartsOn: "2026-10-12",
      streakEndsOn: "2026-10-14",
      consecutiveDays: 3,
    }]);
    assert.doesNotMatch(
      JSON.stringify(alerts),
      /sleep|hours|readiness|checkin|email|phone|contact/i,
    );
  });
});
