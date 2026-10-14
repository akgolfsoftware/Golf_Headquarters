import "server-only";

import { z } from "zod";

import { osloUkeGrenser } from "@/lib/jarvis/ukesreview";

import { hentWangUtoverprofil } from "./data";
import { opprettWangServerKlient } from "./server";
import type {
  WangAthleteProfileSchedule,
  WangAthleteProfileWithSchedule,
  WangAuthenticatedProfile,
  WangCalendarAccessKind,
  WangCalendarData,
  WangCalendarEvent,
  WangRole,
} from "./types";

const calendarRoles = [
  "sports_director",
  "coach",
  "student",
  "guardian",
  "club_coach",
] as const;

const calendarEventSchema = z.object({
  id: z.uuid(),
  school_sport_id: z.uuid().nullable(),
  group_id: z.uuid().nullable(),
  student_id: z.uuid().nullable(),
  plan_node_id: z.uuid().nullable(),
  source: z.enum(["school", "wang", "student", "club"]),
  kind: z.enum([
    "school_lesson",
    "assessment",
    "training",
    "competition",
    "camp",
    "self_training",
    "club_training",
  ]),
  title: z.string(),
  starts_at: z.iso.datetime({ offset: true }),
  ends_at: z.iso.datetime({ offset: true }),
  place: z.string().nullable(),
  locked_for_student: z.boolean(),
  status: z.enum(["draft", "published", "archived"]),
});

const membershipSchema = z.object({
  school_sport_id: z.uuid(),
  role: z.enum(["sports_director", "coach", "readonly"]),
});

const schoolSportSchema = z.object({
  id: z.uuid(),
  sport_id: z.uuid(),
  school_year: z.string(),
});

const sportSchema = z.object({ id: z.uuid(), name: z.string().min(1) });

const groupSchema = z.object({
  id: z.uuid(),
  school_sport_id: z.uuid(),
  name: z.string().min(1),
  grade: z.string().nullable(),
  school_year: z.string(),
});

const studentSchema = z.object({
  id: z.uuid(),
  profile_id: z.uuid().nullable(),
  group_id: z.uuid(),
  demo_name: z.string().nullable(),
  grade: z.enum(["VG1", "VG2", "VG3"]),
});

const profileSchema = z.object({ id: z.uuid(), display_name: z.string().min(1) });

const externalAccessSchema = z.object({
  student_id: z.uuid(),
  expires_at: z.iso.datetime({ offset: true }),
  scopes: z.array(
    z.enum([
      "calendar",
      "plans",
      "training",
      "competitions",
      "camps",
      "messages",
      "contacts",
    ]),
  ),
});

function validerRader<T>(schema: z.ZodType<T>, data: unknown, navn: string): T[] {
  const resultat = z.array(schema).safeParse(data ?? []);
  if (!resultat.success) throw new Error(`WANG-kalenderen mottok ugyldige ${navn}.`);
  return resultat.data;
}

function mapEvent(event: z.infer<typeof calendarEventSchema>): WangCalendarEvent {
  return {
    id: event.id,
    schoolSportId: event.school_sport_id,
    groupId: event.group_id,
    studentId: event.student_id,
    planNodeId: event.plan_node_id,
    source: event.source,
    kind: event.kind,
    title: event.title,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    place: event.place,
    lockedForStudent: event.locked_for_student,
    status: event.status,
  };
}

function sorterHendelser(events: WangCalendarEvent[]): WangCalendarEvent[] {
  return [...events].sort((left, right) => left.startsAt.localeCompare(right.startsAt));
}

function unikeHendelser(events: WangCalendarEvent[]): WangCalendarEvent[] {
  return [...new Map(events.map((event) => [event.id, event])).values()];
}

export function byggWangUtoverprofilplan(
  events: WangCalendarEvent[],
  now: Date,
): WangAthleteProfileSchedule {
  const { start, slutt } = osloUkeGrenser(now);
  const visibleEvents = filtrerWangKalenderhendelser("staff", unikeHendelser(events));

  return {
    weekStartsAt: start.toISOString(),
    weekEndsAt: slutt.toISOString(),
    weekEvents: visibleEvents.filter(
      (event) => new Date(event.endsAt) > start && new Date(event.startsAt) < slutt,
    ),
    upcomingCompetitions: visibleEvents
      .filter((event) => event.kind === "competition" && new Date(event.startsAt) >= now)
      .slice(0, 3),
  };
}

export function erWangKalenderRolle(
  role: WangRole,
): role is (typeof calendarRoles)[number] {
  return calendarRoles.includes(role as (typeof calendarRoles)[number]);
}

export function filtrerWangKalenderhendelser(
  accessKind: WangCalendarAccessKind,
  events: WangCalendarEvent[],
): WangCalendarEvent[] {
  return sorterHendelser(
    events.filter((event) => {
      if (event.status === "archived") return false;
      if (accessKind === "staff") return true;
      if (accessKind === "shared") return event.status === "published";
      return (
        event.status === "published" ||
        event.source === "student" ||
        event.source === "club"
      );
    }),
  );
}

export function velgWangKalenderfeed(
  data: WangCalendarData,
  requestedFeedId: string | undefined,
) {
  return data.feeds.find((feed) => feed.id === requestedFeedId) ?? data.feeds[0] ?? null;
}

async function hentSportsteamKalender(
  profile: WangAuthenticatedProfile,
): Promise<WangCalendarData> {
  const supabase = await opprettWangServerKlient();
  const membershipsResult = await supabase
    .from("wang_staff_memberships")
    .select("school_sport_id, role")
    .eq("profile_id", profile.id)
    .eq("active", true);

  if (membershipsResult.error) throw new Error("WANG-tildelingene kunne ikke hentes.");
  const memberships = validerRader(
    membershipSchema,
    membershipsResult.data,
    "sportstildelinger",
  );
  const schoolSportIds = [
    ...new Set(
      memberships
        .filter((membership) => membership.role === profile.role)
        .map((membership) => membership.school_sport_id),
    ),
  ];
  if (schoolSportIds.length === 0) return { feeds: [] };

  const [schoolSportsResult, groupsResult, eventsResult] = await Promise.all([
    supabase
      .from("wang_school_sports")
      .select("id, sport_id, school_year")
      .in("id", schoolSportIds)
      .eq("status", "active"),
    supabase
      .from("wang_groups")
      .select("id, school_sport_id, name, grade, school_year")
      .in("school_sport_id", schoolSportIds)
      .order("name"),
    supabase
      .from("wang_calendar_events")
      .select(
        "id, school_sport_id, group_id, student_id, plan_node_id, source, kind, title, starts_at, ends_at, place, locked_for_student, status",
      )
      .in("school_sport_id", schoolSportIds)
      .is("student_id", null)
      .order("starts_at"),
  ]);

  if (schoolSportsResult.error || groupsResult.error || eventsResult.error) {
    throw new Error("WANG-kalenderen kunne ikke hentes.");
  }

  const schoolSports = validerRader(
    schoolSportSchema,
    schoolSportsResult.data,
    "skoleidretter",
  );
  const groups = validerRader(groupSchema, groupsResult.data, "grupper");
  const events = validerRader(calendarEventSchema, eventsResult.data, "hendelser").map(mapEvent);
  const sportIds = [...new Set(schoolSports.map((schoolSport) => schoolSport.sport_id))];
  const sportsResult = await supabase
    .from("wang_sports")
    .select("id, name")
    .in("id", sportIds);

  if (sportsResult.error) throw new Error("WANG-idrettene kunne ikke hentes.");
  const sports = validerRader(sportSchema, sportsResult.data, "idretter");

  return {
    feeds: groups.map((group) => {
      const schoolSport = schoolSports.find((candidate) => candidate.id === group.school_sport_id);
      const sport = sports.find((candidate) => candidate.id === schoolSport?.sport_id);
      return {
        id: group.id,
        label: group.name,
        detail: `${sport?.name ?? "Idrett"} · ${group.school_year}`,
        accessKind: "staff" as const,
        accessExpiresAt: null,
        events: filtrerWangKalenderhendelser(
          "staff",
          events.filter(
            (event) =>
              event.groupId === group.id ||
              (event.groupId === null && event.schoolSportId === group.school_sport_id),
          ),
        ),
      };
    }),
  };
}

async function hentElevkalender(
  profile: WangAuthenticatedProfile,
): Promise<WangCalendarData> {
  const supabase = await opprettWangServerKlient();
  const now = new Date().toISOString();
  let studentIds: string[] = [];
  const expiresByStudent = new Map<string, string>();
  const accessKind: WangCalendarAccessKind = profile.role === "student" ? "self" : "shared";

  if (profile.role === "student") {
    const studentResult = await supabase
      .from("wang_students")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (studentResult.error) throw new Error("Elevprofilen kunne ikke hentes.");
    const parsed = z.object({ id: z.uuid() }).nullable().safeParse(studentResult.data);
    if (!parsed.success) throw new Error("Elevprofilen har ugyldige data.");
    studentIds = parsed.data ? [parsed.data.id] : [];
  } else {
    const accessResult = await supabase
      .from("wang_external_access")
      .select("student_id, expires_at, scopes")
      .eq("reader_profile_id", profile.id)
      .eq("role", profile.role)
      .contains("scopes", ["calendar"])
      .lte("starts_at", now)
      .gt("expires_at", now)
      .is("revoked_at", null);
    if (accessResult.error) throw new Error("Kalendertilgangen kunne ikke hentes.");
    const accessRows = validerRader(
      externalAccessSchema,
      accessResult.data,
      "delte tilganger",
    );
    studentIds = [...new Set(accessRows.map((access) => access.student_id))];
    for (const access of accessRows) expiresByStudent.set(access.student_id, access.expires_at);
  }

  if (studentIds.length === 0) return { feeds: [] };

  const studentsResult = await supabase
    .from("wang_students")
    .select("id, profile_id, group_id, demo_name, grade")
    .in("id", studentIds);
  if (studentsResult.error) throw new Error("Elevkalenderen kunne ikke hentes.");
  const students = validerRader(studentSchema, studentsResult.data, "elever");
  const groupIds = [...new Set(students.map((student) => student.group_id))];

  const groupsResult = await supabase
    .from("wang_groups")
    .select("id, school_sport_id, name, grade, school_year")
    .in("id", groupIds);
  if (groupsResult.error) throw new Error("Elevgruppene kunne ikke hentes.");
  const groups = validerRader(groupSchema, groupsResult.data, "grupper");
  const schoolSportIds = [...new Set(groups.map((group) => group.school_sport_id))];
  const profileIds = students.flatMap((student) => (student.profile_id ? [student.profile_id] : []));

  const [profilesResult, groupEventsResult, sportEventsResult, studentEventsResult] =
    await Promise.all([
      profileIds.length > 0
        ? supabase.from("wang_profiles").select("id, display_name").in("id", profileIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("wang_calendar_events")
        .select(
          "id, school_sport_id, group_id, student_id, plan_node_id, source, kind, title, starts_at, ends_at, place, locked_for_student, status",
        )
        .in("group_id", groupIds)
        .is("student_id", null),
      supabase
        .from("wang_calendar_events")
        .select(
          "id, school_sport_id, group_id, student_id, plan_node_id, source, kind, title, starts_at, ends_at, place, locked_for_student, status",
        )
        .in("school_sport_id", schoolSportIds)
        .is("group_id", null)
        .is("student_id", null),
      supabase
        .from("wang_calendar_events")
        .select(
          "id, school_sport_id, group_id, student_id, plan_node_id, source, kind, title, starts_at, ends_at, place, locked_for_student, status",
        )
        .in("student_id", studentIds),
    ]);

  if (
    profilesResult.error ||
    groupEventsResult.error ||
    sportEventsResult.error ||
    studentEventsResult.error
  ) {
    throw new Error("Kalenderhendelsene kunne ikke hentes.");
  }

  const profiles = validerRader(profileSchema, profilesResult.data, "profiler");
  const events = unikeHendelser(
    [
      ...validerRader(calendarEventSchema, groupEventsResult.data, "gruppehendelser"),
      ...validerRader(calendarEventSchema, sportEventsResult.data, "idrettshendelser"),
      ...validerRader(calendarEventSchema, studentEventsResult.data, "elevhendelser"),
    ].map(mapEvent),
  );

  return {
    feeds: students.map((student) => {
      const group = groups.find((candidate) => candidate.id === student.group_id);
      const studentProfile = profiles.find((candidate) => candidate.id === student.profile_id);
      const label = student.profile_id === profile.id
        ? profile.displayName
        : studentProfile?.display_name ?? student.demo_name ?? "Elev";
      const feedEvents = events.filter(
        (event) =>
          event.studentId === student.id ||
          event.groupId === student.group_id ||
          (event.studentId === null &&
            event.groupId === null &&
            event.schoolSportId === group?.school_sport_id),
      );

      return {
        id: student.id,
        label,
        detail: `${student.grade} · ${group?.name ?? "Gruppe ikke satt"}`,
        accessKind,
        accessExpiresAt: expiresByStudent.get(student.id) ?? null,
        events: filtrerWangKalenderhendelser(accessKind, feedEvents),
      };
    }),
  };
}

export async function hentWangKalender(
  profile: WangAuthenticatedProfile,
): Promise<WangCalendarData> {
  if (!erWangKalenderRolle(profile.role)) return { feeds: [] };
  if (profile.role === "sports_director" || profile.role === "coach") {
    return hentSportsteamKalender(profile);
  }
  return hentElevkalender(profile);
}

export async function hentWangUtoverprofilMedPlan(
  profile: WangAuthenticatedProfile,
  studentId: string,
  now = new Date(),
): Promise<WangAthleteProfileWithSchedule | null> {
  const athlete = await hentWangUtoverprofil(profile, studentId);
  if (!athlete) return null;

  const supabase = await opprettWangServerKlient();
  const { start } = osloUkeGrenser(now);
  const horizon = new Date(now);
  horizon.setUTCDate(horizon.getUTCDate() + 180);
  const fields =
    "id, school_sport_id, group_id, student_id, plan_node_id, source, kind, title, starts_at, ends_at, place, locked_for_student, status";

  const [groupEventsResult, sportEventsResult, studentEventsResult] = await Promise.all([
    supabase
      .from("wang_calendar_events")
      .select(fields)
      .eq("group_id", athlete.group.id)
      .is("student_id", null)
      .gte("ends_at", start.toISOString())
      .lt("starts_at", horizon.toISOString()),
    supabase
      .from("wang_calendar_events")
      .select(fields)
      .eq("school_sport_id", athlete.sport.schoolSportId)
      .is("group_id", null)
      .is("student_id", null)
      .gte("ends_at", start.toISOString())
      .lt("starts_at", horizon.toISOString()),
    supabase
      .from("wang_calendar_events")
      .select(fields)
      .eq("student_id", athlete.id)
      .gte("ends_at", start.toISOString())
      .lt("starts_at", horizon.toISOString()),
  ]);

  if (groupEventsResult.error || sportEventsResult.error || studentEventsResult.error) {
    throw new Error("Utøverens kalendergrunnlag kunne ikke hentes.");
  }

  const events = [
    ...validerRader(calendarEventSchema, groupEventsResult.data, "gruppehendelser"),
    ...validerRader(calendarEventSchema, sportEventsResult.data, "idrettshendelser"),
    ...validerRader(calendarEventSchema, studentEventsResult.data, "elevhendelser"),
  ].map(mapEvent);

  return {
    athlete,
    schedule: byggWangUtoverprofilplan(events, now),
  };
}
