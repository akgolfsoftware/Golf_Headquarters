import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  byggWangMeldingsinnboks,
  byggWangMeldingssamtale,
  erWangMeldingsrolle,
  kanStarteWangSamtale,
} from "./messages";
import { WANG_ROLES } from "./types";

const THREAD_ID = "00000000-0000-4000-8000-000000000001";
const STUDENT_ID = "00000000-0000-4000-8000-000000000002";
const PROFILE_ID = "00000000-0000-4000-8000-000000000003";
const COACH_ID = "00000000-0000-4000-8000-000000000004";
const MESSAGE_ID = "00000000-0000-4000-8000-000000000005";

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

  it("bygger en skrivebeskyttet samtale og bruker rolle når deltakerens navn er skjult", () => {
    const conversation = byggWangMeldingssamtale(
      PROFILE_ID,
      {
        id: THREAD_ID,
        student_id: STUDENT_ID,
        subject: "Oppfølging av ukeplan",
        updated_at: "2026-10-14T14:00:00+00:00",
        closed_at: null,
      },
      {
        id: STUDENT_ID,
        profile_id: PROFILE_ID,
        demo_name: null,
        is_demo: false,
      },
      [
        { profile_id: PROFILE_ID, participant_role: "student" },
        { profile_id: COACH_ID, participant_role: "coach" },
      ],
      [{
        id: MESSAGE_ID,
        sender_profile_id: COACH_ID,
        body: "Se gjennom planen før neste økt.",
        created_at: "2026-10-14T13:55:00+00:00",
      }],
      [{ id: PROFILE_ID, display_name: "Fiktiv Utøver" }],
    );

    assert.deepEqual(conversation, {
      id: THREAD_ID,
      subject: "Oppfølging av ukeplan",
      studentName: "Fiktiv Utøver",
      isDemo: false,
      updatedAt: "2026-10-14T14:00:00+00:00",
      closedAt: null,
      canReply: false,
      messages: [{
        id: MESSAGE_ID,
        senderLabel: "Trener",
        isCurrentUser: false,
        body: "Se gjennom planen før neste økt.",
        createdAt: "2026-10-14T13:55:00+00:00",
      }],
    });
    assert.doesNotMatch(JSON.stringify(conversation), /email|phone|sleep|readiness|checkin/i);
  });

  it("avviser en samtale der eleven ikke samsvarer med tråden", () => {
    assert.throws(
      () => byggWangMeldingssamtale(
        PROFILE_ID,
        {
          id: THREAD_ID,
          student_id: STUDENT_ID,
          subject: "Oppfølging",
          updated_at: "2026-10-14T14:00:00+00:00",
          closed_at: null,
        },
        {
          id: COACH_ID,
          profile_id: PROFILE_ID,
          demo_name: null,
          is_demo: false,
        },
        [],
        [],
        [],
      ),
      /ugyldig elevkobling/,
    );
  });
});
