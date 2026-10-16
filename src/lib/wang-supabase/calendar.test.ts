import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  byggWangSkolekalender,
  byggWangUtoverprofilplan,
  erWangKalenderRolle,
  filtrerWangKalenderhendelser,
  velgWangKalenderfeed,
} from "./calendar";
import type { WangCalendarData, WangCalendarEvent } from "./types";

const baseEvent: WangCalendarEvent = {
  id: "00000000-0000-4000-8000-000000000001",
  schoolSportId: "00000000-0000-4000-8000-000000000002",
  groupId: "00000000-0000-4000-8000-000000000003",
  studentId: null,
  planNodeId: null,
  source: "wang",
  kind: "training",
  title: "Fiktiv WANG-økt",
  startsAt: "2026-10-14T06:00:00+00:00",
  endsAt: "2026-10-14T08:00:00+00:00",
  place: "Fiktiv arena",
  lockedForStudent: true,
  status: "published",
};

describe("WANG-kalender", () => {
  it("åpnes bare for roller med kalenderbehov", () => {
    for (const role of [
      "school_leader",
      "principal",
      "head_of_sports",
      "sports_director",
      "coach",
      "student",
      "guardian",
      "club_coach",
    ] as const) {
      assert.equal(erWangKalenderRolle(role), true);
    }
    assert.equal(erWangKalenderRolle("central_admin"), false);
    assert.equal(erWangKalenderRolle("readonly"), false);
  });

  it("bygger skolekalender for alle aktive idretter uten elevspesifikke hendelser", () => {
    const secondSchoolSportId = "00000000-0000-4000-8000-000000000041";
    const studentEvent: WangCalendarEvent = {
      ...baseEvent,
      id: "00000000-0000-4000-8000-000000000042",
      studentId: "00000000-0000-4000-8000-000000000043",
      source: "student",
      kind: "self_training",
      lockedForStudent: false,
    };
    const data = byggWangSkolekalender(
      [
        {
          id: baseEvent.schoolSportId!,
          sport_id: "00000000-0000-4000-8000-000000000044",
          school_year: "2026/2027",
        },
        {
          id: secondSchoolSportId,
          sport_id: "00000000-0000-4000-8000-000000000045",
          school_year: "2026/2027",
        },
      ],
      [
        { id: "00000000-0000-4000-8000-000000000044", name: "Golf" },
        { id: "00000000-0000-4000-8000-000000000045", name: "Apparatturn" },
      ],
      [{
        id: baseEvent.groupId!,
        school_sport_id: baseEvent.schoolSportId!,
        name: "Fiktiv gruppe",
        grade: "VG1",
        school_year: "2026/2027",
      }],
      [studentEvent, baseEvent],
    );

    assert.equal(data.feeds.length, 2);
    assert.equal(data.feeds[0].label, "Apparatturn");
    assert.deepEqual(data.feeds[0].events, []);
    assert.equal(data.feeds[1].label, "Golf · Fiktiv gruppe");
    assert.equal(data.feeds[1].accessKind, "leadership");
    assert.deepEqual(data.feeds[1].events.map((event) => event.id), [baseEvent.id]);
    assert.doesNotMatch(JSON.stringify(data), /sleep|readiness|checkin|email|phone|contact/i);
  });

  it("skjuler utkast for delte lesere, men beholder elevens egne hendelser", () => {
    const draftWang = { ...baseEvent, id: "00000000-0000-4000-8000-000000000011", status: "draft" as const };
    const ownDraft = {
      ...baseEvent,
      id: "00000000-0000-4000-8000-000000000012",
      source: "student" as const,
      kind: "self_training" as const,
      status: "draft" as const,
      lockedForStudent: false,
    };
    const archived = {
      ...baseEvent,
      id: "00000000-0000-4000-8000-000000000013",
      status: "archived" as const,
    };
    const events = [draftWang, ownDraft, archived, baseEvent];

    assert.deepEqual(
      filtrerWangKalenderhendelser("shared", events).map((event) => event.id),
      [baseEvent.id],
    );
    assert.deepEqual(
      filtrerWangKalenderhendelser("self", events).map((event) => event.id),
      [ownDraft.id, baseEvent.id],
    );
    assert.deepEqual(
      filtrerWangKalenderhendelser("staff", events).map((event) => event.id),
      [draftWang.id, ownDraft.id, baseEvent.id],
    );
  });

  it("faller tilbake til første autoriserte kalender ved ukjent id", () => {
    const data: WangCalendarData = {
      feeds: [
        {
          id: "00000000-0000-4000-8000-000000000021",
          label: "Øyvind Rohjan",
          detail: "VG1 · Fiktiv gruppe",
          accessKind: "self",
          accessExpiresAt: null,
          events: [],
        },
      ],
    };
    assert.equal(
      velgWangKalenderfeed(data, "00000000-0000-4000-8000-000000000099")?.id,
      data.feeds[0].id,
    );
    assert.equal(velgWangKalenderfeed({ feeds: [] }, data.feeds[0].id), null);
  });

  it("bygger uke og kommende konkurranser uten helse- eller kontaktdata", () => {
    const previousSundayCamp: WangCalendarEvent = {
      ...baseEvent,
      id: "00000000-0000-4000-8000-000000000031",
      kind: "camp",
      title: "Fiktiv samling",
      startsAt: "2026-10-11T16:00:00+02:00",
      endsAt: "2026-10-12T10:00:00+02:00",
    };
    const competition: WangCalendarEvent = {
      ...baseEvent,
      id: "00000000-0000-4000-8000-000000000032",
      kind: "competition",
      title: "Fiktiv konkurranse",
      startsAt: "2026-10-17T08:00:00+02:00",
      endsAt: "2026-10-17T12:00:00+02:00",
    };
    const nextMonthCompetition: WangCalendarEvent = {
      ...competition,
      id: "00000000-0000-4000-8000-000000000033",
      startsAt: "2026-11-02T08:00:00+01:00",
      endsAt: "2026-11-02T12:00:00+01:00",
    };
    const archived = {
      ...competition,
      id: "00000000-0000-4000-8000-000000000034",
      status: "archived" as const,
    };

    const schedule = byggWangUtoverprofilplan(
      [nextMonthCompetition, archived, competition, previousSundayCamp, baseEvent],
      new Date("2026-10-14T12:00:00+02:00"),
    );

    assert.equal(schedule.weekStartsAt, "2026-10-11T22:00:00.000Z");
    assert.equal(schedule.weekEndsAt, "2026-10-18T22:00:00.000Z");
    assert.deepEqual(
      schedule.weekEvents.map((event) => event.id),
      [previousSundayCamp.id, baseEvent.id, competition.id],
    );
    assert.deepEqual(
      schedule.upcomingCompetitions.map((event) => event.id),
      [competition.id, nextMonthCompetition.id],
    );
    assert.doesNotMatch(
      JSON.stringify(schedule),
      /sleep|readiness|checkin|email|phone|statusLabel|contact/i,
    );
  });
});
