import "server-only";

import { z } from "zod";

import { opprettWangServerKlient } from "./server";
import type {
  WangAuthenticatedProfile,
  WangMessageInbox,
  WangMessageThreadSummary,
  WangRole,
} from "./types";

const MESSAGE_ROLES = [
  "school_leader",
  "principal",
  "head_of_sports",
  "sports_director",
  "coach",
  "student",
  "guardian",
  "club_coach",
] as const satisfies readonly WangRole[];

const STARTER_ROLES = [
  "school_leader",
  "principal",
  "head_of_sports",
  "sports_director",
  "coach",
] as const satisfies readonly WangRole[];

const participantSchema = z.object({ thread_id: z.uuid() });
const threadSchema = z.object({
  id: z.uuid(),
  student_id: z.uuid(),
  subject: z.string().min(1).max(160),
  updated_at: z.iso.datetime({ offset: true }),
  closed_at: z.iso.datetime({ offset: true }).nullable(),
});
const studentSchema = z.object({
  id: z.uuid(),
  profile_id: z.uuid().nullable(),
  demo_name: z.string().min(1).nullable(),
  is_demo: z.boolean(),
});
const profileSchema = z.object({ id: z.uuid(), display_name: z.string().min(1) });

type MessageThreadRow = z.infer<typeof threadSchema>;
type MessageStudentRow = z.infer<typeof studentSchema>;
type MessageProfileRow = z.infer<typeof profileSchema>;

function validerRader<T>(schema: z.ZodType<T>, data: unknown, label: string): T[] {
  const result = z.array(schema).safeParse(data ?? []);
  if (!result.success) throw new Error(`WANG-${label} har ugyldige data.`);
  return result.data;
}

export function erWangMeldingsrolle(role: WangRole): boolean {
  return MESSAGE_ROLES.includes(role as (typeof MESSAGE_ROLES)[number]);
}

export function kanStarteWangSamtale(role: WangRole): boolean {
  return STARTER_ROLES.includes(role as (typeof STARTER_ROLES)[number]);
}

export function byggWangMeldingsinnboks(
  role: WangRole,
  threads: MessageThreadRow[],
  students: MessageStudentRow[],
  profiles: MessageProfileRow[],
): WangMessageInbox {
  const studentById = new Map(students.map((student) => [student.id, student]));
  const profileNameById = new Map(profiles.map((profile) => [profile.id, profile.display_name]));

  const summaries: WangMessageThreadSummary[] = threads.map((thread) => {
    const student = studentById.get(thread.student_id);
    if (!student) throw new Error("WANG-samtalen mangler elevkobling.");

    const studentName = student.is_demo
      ? student.demo_name
      : student.profile_id
        ? profileNameById.get(student.profile_id)
        : null;
    if (!studentName) throw new Error("WANG-samtalen mangler elevnavn.");

    return {
      id: thread.id,
      subject: thread.subject,
      studentName,
      isDemo: student.is_demo,
      updatedAt: thread.updated_at,
      closedAt: thread.closed_at,
    };
  });

  return {
    threads: summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    canStartConversation: kanStarteWangSamtale(role),
    emailNotificationsEnabled: false,
  };
}

export async function hentWangMeldingsinnboks(
  profile: WangAuthenticatedProfile,
): Promise<WangMessageInbox> {
  if (!erWangMeldingsrolle(profile.role)) {
    return {
      threads: [],
      canStartConversation: false,
      emailNotificationsEnabled: false,
    };
  }

  const supabase = await opprettWangServerKlient();
  const participantsResult = await supabase
    .from("wang_message_participants")
    .select("thread_id")
    .eq("profile_id", profile.id)
    .is("left_at", null);

  if (participantsResult.error) throw new Error("WANG-innboksen kunne ikke hentes.");
  const participants = validerRader(
    participantSchema,
    participantsResult.data,
    "meldingsdeltakere",
  );
  const threadIds = [...new Set(participants.map((participant) => participant.thread_id))];
  if (threadIds.length === 0) return byggWangMeldingsinnboks(profile.role, [], [], []);

  const threadsResult = await supabase
    .from("wang_message_threads")
    .select("id, student_id, subject, updated_at, closed_at")
    .in("id", threadIds)
    .order("updated_at", { ascending: false });
  if (threadsResult.error) throw new Error("WANG-innboksen kunne ikke hentes.");
  const threads = validerRader(threadSchema, threadsResult.data, "samtaler");
  if (threads.length === 0) return byggWangMeldingsinnboks(profile.role, [], [], []);

  const studentIds = [...new Set(threads.map((thread) => thread.student_id))];
  const studentsResult = await supabase
    .from("wang_students")
    .select("id, profile_id, demo_name, is_demo")
    .in("id", studentIds);
  if (studentsResult.error) throw new Error("WANG-innboksen kunne ikke hentes.");
  const students = validerRader(studentSchema, studentsResult.data, "samtaleelever");

  const profileIds = [
    ...new Set(
      students.flatMap((student) =>
        !student.is_demo && student.profile_id ? [student.profile_id] : [],
      ),
    ),
  ];
  let profiles: MessageProfileRow[] = [];
  if (profileIds.length > 0) {
    const profilesResult = await supabase
      .from("wang_profiles")
      .select("id, display_name")
      .in("id", profileIds);
    if (profilesResult.error) throw new Error("WANG-innboksen kunne ikke hentes.");
    profiles = validerRader(profileSchema, profilesResult.data, "samtaleprofiler");
  }

  return byggWangMeldingsinnboks(profile.role, threads, students, profiles);
}
