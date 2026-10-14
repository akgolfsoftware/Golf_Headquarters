import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  byggWangMeldingsinnboks,
  erWangMeldingsrolle,
  kanStarteWangSamtale,
} from "./messages";
import { WANG_ROLES } from "./types";

const THREAD_ID = "00000000-0000-4000-8000-000000000001";
const STUDENT_ID = "00000000-0000-4000-8000-000000000002";
const PROFILE_ID = "00000000-0000-4000-8000-000000000003";

describe("WANG-meldinger", () => {
  it("utelukker sentral admin og generell lesetilgang fra navngitte samtaler", () => {
    assert.equal(erWangMeldingsrolle("central_admin"), false);
    assert.equal(erWangMeldingsrolle("readonly"), false);
    for (const role of WANG_ROLES.filter(
      (candidate) => candidate !== "central_admin" && candidate !== "readonly",
    )) {
      assert.equal(erWangMeldingsrolle(role), true);
    }
  });

  it("lar bare skoleledelse og tildelt sportsteam starte en samtale", () => {
    for (const role of [
      "school_leader",
      "principal",
      "head_of_sports",
      "sports_director",
      "coach",
    ] as const) {
      assert.equal(kanStarteWangSamtale(role), true);
    }
    for (const role of ["student", "guardian", "club_coach", "central_admin", "readonly"] as const) {
      assert.equal(kanStarteWangSamtale(role), false);
    }
  });

  it("bygger bare samtaleoversikt uten innhold eller kontakt- og helsedata", () => {
    const inbox = byggWangMeldingsinnboks(
      "coach",
      [{
        id: THREAD_ID,
        student_id: STUDENT_ID,
        subject: "Oppfølging av ukeplan",
        updated_at: "2026-10-14T13:30:00+00:00",
        closed_at: null,
      }],
      [{
        id: STUDENT_ID,
        profile_id: PROFILE_ID,
        demo_name: null,
        is_demo: false,
      }],
      [{ id: PROFILE_ID, display_name: "Fiktiv Utøver" }],
    );

    assert.deepEqual(inbox, {
      threads: [{
        id: THREAD_ID,
        subject: "Oppfølging av ukeplan",
        studentName: "Fiktiv Utøver",
        isDemo: false,
        updatedAt: "2026-10-14T13:30:00+00:00",
        closedAt: null,
      }],
      canStartConversation: true,
      emailNotificationsEnabled: false,
    });
    assert.doesNotMatch(
      JSON.stringify(inbox.threads),
      /body|messageBody|email|phone|sleep|readiness|checkin|contact/i,
    );
  });
});
