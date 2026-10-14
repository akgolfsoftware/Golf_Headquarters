import "server-only";

import { z } from "zod";

import { opprettWangServerKlient } from "./server";
import type {
  WangAuthenticatedProfile,
  WangGolfDemoData,
  WangRole,
  WangWorkbenchAssignment,
} from "./types";

const sportSchema = z.object({
  code: z.string(),
  name: z.string(),
  family: z.string().nullable(),
  workbench_status: z.enum(["active", "future"]),
  mapping_approved: z.boolean(),
});

const groupSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
  grade: z.string().nullable(),
  school_year: z.string(),
});

const studentSchema = z.object({
  id: z.uuid(),
  group_id: z.uuid(),
  demo_name: z.string(),
  grade: z.enum(["VG1", "VG2", "VG3"]),
  status_label: z.string(),
  checkin_status: z.string(),
});

const planSchema = z.object({
  id: z.uuid(),
  group_id: z.uuid().nullable(),
  parent_id: z.uuid().nullable(),
  level: z.enum(["year", "period", "month", "week", "session"]),
  title: z.string(),
  starts_on: z.string(),
  ends_on: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  source_note: z.string().nullable(),
  subject_basis_status: z.string(),
});

const eventSchema = z.object({
  id: z.uuid(),
  group_id: z.uuid().nullable(),
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

const staffMembershipSchema = z.object({
  school_sport_id: z.uuid(),
  role: z.enum(["sports_director", "coach", "readonly"]),
});

const schoolSportSchema = z.object({
  id: z.uuid(),
  sport_id: z.uuid(),
  school_year: z.string(),
  status: z.enum(["active", "future"]),
  workbench_enabled: z.boolean(),
});

const assignedSportSchema = sportSchema.extend({ id: z.uuid() });
const assignedGroupSchema = groupSchema.extend({ school_sport_id: z.uuid() });
const assignedPlanSchema = planSchema.extend({ school_sport_id: z.uuid() });
const assignedEventSchema = eventSchema.extend({ school_sport_id: z.uuid().nullable() });

function validerRader<T>(schema: z.ZodType<T>, data: unknown, navn: string): T[] {
  const resultat = z.array(schema).safeParse(data ?? []);
  if (!resultat.success) {
    throw new Error(`WANG-demoen mottok ugyldige ${navn}.`);
  }
  return resultat.data;
}

export async function hentWangGolfDemo(): Promise<WangGolfDemoData> {
  const supabase = await opprettWangServerKlient();
  const [sportsResult, groupsResult, studentsResult, plansResult, eventsResult] =
    await Promise.all([
      supabase
        .from("wang_sports")
        .select("code, name, family, workbench_status, mapping_approved")
        .order("name"),
      supabase
        .from("wang_groups")
        .select("id, code, name, grade, school_year")
        .eq("is_demo", true)
        .order("code"),
      supabase
        .from("wang_students")
        .select("id, group_id, demo_name, grade, status_label, checkin_status")
        .eq("is_demo", true)
        .order("demo_name"),
      supabase
        .from("wang_plan_nodes")
        .select(
          "id, group_id, parent_id, level, title, starts_on, ends_on, status, source_note, subject_basis_status",
        )
        .eq("is_demo", true)
        .order("starts_on"),
      supabase
        .from("wang_calendar_events")
        .select(
          "id, group_id, plan_node_id, source, kind, title, starts_at, ends_at, place, locked_for_student, status",
        )
        .eq("is_demo", true)
        .order("starts_at"),
    ]);

  const feil = [
    sportsResult.error,
    groupsResult.error,
    studentsResult.error,
    plansResult.error,
    eventsResult.error,
  ].find(Boolean);

  if (feil) {
    throw new Error("WANG-demoen kunne ikke hente data akkurat nå.");
  }

  const sports = validerRader(sportSchema, sportsResult.data, "idretter");
  const groups = validerRader(groupSchema, groupsResult.data, "grupper");
  const students = validerRader(studentSchema, studentsResult.data, "utøvere");
  const plans = validerRader(planSchema, plansResult.data, "planer");
  const events = validerRader(eventSchema, eventsResult.data, "kalenderhendelser");

  return {
    sports: sports.map((sport) => ({
      code: sport.code,
      name: sport.name,
      family: sport.family,
      workbenchStatus: sport.workbench_status,
      mappingApproved: sport.mapping_approved,
    })),
    groups: groups.map((group) => ({
      id: group.id,
      code: group.code,
      name: group.name,
      grade: group.grade,
      schoolYear: group.school_year,
    })),
    students: students.map((student) => ({
      id: student.id,
      groupId: student.group_id,
      name: student.demo_name,
      grade: student.grade,
      statusLabel: student.status_label,
      checkinStatus: student.checkin_status,
    })),
    plans: plans.map((plan) => ({
      id: plan.id,
      groupId: plan.group_id,
      parentId: plan.parent_id,
      level: plan.level,
      title: plan.title,
      startsOn: plan.starts_on,
      endsOn: plan.ends_on,
      status: plan.status,
      sourceNote: plan.source_note,
      subjectBasisStatus: plan.subject_basis_status,
    })),
    events: events.map((event) => ({
      id: event.id,
      groupId: event.group_id,
      planNodeId: event.plan_node_id,
      source: event.source,
      kind: event.kind,
      title: event.title,
      startsAt: event.starts_at,
      endsAt: event.ends_at,
      place: event.place,
      lockedForStudent: event.locked_for_student,
      status: event.status,
    })),
  };
}

export function erWangWorkbenchRolle(
  role: WangRole,
): role is "sports_director" | "coach" {
  return role === "sports_director" || role === "coach";
}

export function velgWangWorkbenchGruppe(
  assignments: WangWorkbenchAssignment[],
  requestedGroupId: string | undefined,
) {
  const groups = assignments.flatMap((assignment) => assignment.groups);
  return groups.find((group) => group.id === requestedGroupId) ?? groups[0] ?? null;
}

export async function hentWangWorkbencher(
  profile: WangAuthenticatedProfile,
): Promise<WangWorkbenchAssignment[]> {
  if (!erWangWorkbenchRolle(profile.role)) return [];

  const supabase = await opprettWangServerKlient();
  const membershipsResult = await supabase
    .from("wang_staff_memberships")
    .select("school_sport_id, role")
    .eq("profile_id", profile.id)
    .eq("active", true);

  if (membershipsResult.error) {
    throw new Error("WANG-tilgangene kunne ikke hentes.");
  }

  const memberships = validerRader(
    staffMembershipSchema,
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

  if (schoolSportIds.length === 0) return [];

  const schoolSportsResult = await supabase
    .from("wang_school_sports")
    .select("id, sport_id, school_year, status, workbench_enabled")
    .in("id", schoolSportIds)
    .eq("status", "active")
    .order("school_year", { ascending: false });

  if (schoolSportsResult.error) {
    throw new Error("WANG-idrettene kunne ikke hentes.");
  }

  const schoolSports = validerRader(
    schoolSportSchema,
    schoolSportsResult.data,
    "skoleidretter",
  );
  if (schoolSports.length === 0) return [];

  const allowedSchoolSportIds = schoolSports.map((schoolSport) => schoolSport.id);
  const sportIds = [...new Set(schoolSports.map((schoolSport) => schoolSport.sport_id))];

  const [sportsResult, groupsResult, plansResult, eventsResult] = await Promise.all([
    supabase
      .from("wang_sports")
      .select("id, code, name, family, workbench_status, mapping_approved")
      .in("id", sportIds)
      .order("name"),
    supabase
      .from("wang_groups")
      .select("id, school_sport_id, code, name, grade, school_year")
      .in("school_sport_id", allowedSchoolSportIds)
      .order("code"),
    supabase
      .from("wang_plan_nodes")
      .select(
        "id, school_sport_id, group_id, parent_id, level, title, starts_on, ends_on, status, source_note, subject_basis_status",
      )
      .in("school_sport_id", allowedSchoolSportIds)
      .order("starts_on"),
    supabase
      .from("wang_calendar_events")
      .select(
        "id, school_sport_id, group_id, plan_node_id, source, kind, title, starts_at, ends_at, place, locked_for_student, status",
      )
      .in("school_sport_id", allowedSchoolSportIds)
      .order("starts_at"),
  ]);

  const queryError = [
    sportsResult.error,
    groupsResult.error,
    plansResult.error,
    eventsResult.error,
  ].find(Boolean);
  if (queryError) {
    throw new Error("WANG-Workbench kunne ikke hentes.");
  }

  const sports = validerRader(assignedSportSchema, sportsResult.data, "idretter");
  const groups = validerRader(assignedGroupSchema, groupsResult.data, "grupper");
  const plans = validerRader(assignedPlanSchema, plansResult.data, "planer");
  const events = validerRader(assignedEventSchema, eventsResult.data, "kalenderhendelser");

  return schoolSports.map((schoolSport) => {
    const sport = sports.find((candidate) => candidate.id === schoolSport.sport_id);
    if (!sport) throw new Error("WANG-idretten mangler katalogdata.");

    return {
      schoolSportId: schoolSport.id,
      schoolYear: schoolSport.school_year,
      sportCode: sport.code,
      sportName: sport.name,
      sportFamily: sport.family,
      workbenchStatus: sport.workbench_status,
      workbenchEnabled: schoolSport.workbench_enabled,
      mappingApproved: sport.mapping_approved,
      groups: groups
        .filter((group) => group.school_sport_id === schoolSport.id)
        .map((group) => ({
          id: group.id,
          code: group.code,
          name: group.name,
          grade: group.grade,
          schoolYear: group.school_year,
        })),
      plans: plans
        .filter((plan) => plan.school_sport_id === schoolSport.id)
        .map((plan) => ({
          id: plan.id,
          groupId: plan.group_id,
          parentId: plan.parent_id,
          level: plan.level,
          title: plan.title,
          startsOn: plan.starts_on,
          endsOn: plan.ends_on,
          status: plan.status,
          sourceNote: plan.source_note,
          subjectBasisStatus: plan.subject_basis_status,
        })),
      events: events
        .filter((event) => event.school_sport_id === schoolSport.id)
        .map((event) => ({
          id: event.id,
          groupId: event.group_id,
          planNodeId: event.plan_node_id,
          source: event.source,
          kind: event.kind,
          title: event.title,
          startsAt: event.starts_at,
          endsAt: event.ends_at,
          place: event.place,
          lockedForStudent: event.locked_for_student,
          status: event.status,
        })),
    };
  });
}
