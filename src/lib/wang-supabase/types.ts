export type WangSportStatus = "active" | "future";
export const WANG_ROLES = [
  "central_admin",
  "school_leader",
  "principal",
  "head_of_sports",
  "sports_director",
  "coach",
  "student",
  "guardian",
  "club_coach",
  "readonly",
] as const;
export type WangRole = (typeof WANG_ROLES)[number];
export type WangPlanLevel = "year" | "period" | "month" | "week" | "session";
export type WangPlanStatus = "draft" | "published" | "archived";
export type WangEventSource = "school" | "wang" | "student" | "club";
export type WangEventKind =
  | "school_lesson"
  | "assessment"
  | "training"
  | "competition"
  | "camp"
  | "self_training"
  | "club_training";

export interface WangDemoSport {
  code: string;
  name: string;
  family: string | null;
  workbenchStatus: WangSportStatus;
  mappingApproved: boolean;
}

export interface WangDemoGroup {
  id: string;
  code: string;
  name: string;
  grade: string | null;
  schoolYear: string;
}

export interface WangDemoStudent {
  id: string;
  groupId: string;
  name: string;
  grade: "VG1" | "VG2" | "VG3";
  statusLabel: string;
  checkinStatus: string;
}

export interface WangDemoPlanNode {
  id: string;
  groupId: string | null;
  parentId: string | null;
  level: WangPlanLevel;
  title: string;
  startsOn: string;
  endsOn: string;
  status: WangPlanStatus;
  sourceNote: string | null;
  subjectBasisStatus: string;
}

export interface WangDemoEvent {
  id: string;
  groupId: string | null;
  planNodeId: string | null;
  source: WangEventSource;
  kind: WangEventKind;
  title: string;
  startsAt: string;
  endsAt: string;
  place: string | null;
  lockedForStudent: boolean;
  status: WangPlanStatus;
}

export interface WangGolfDemoData {
  sports: WangDemoSport[];
  groups: WangDemoGroup[];
  students: WangDemoStudent[];
  plans: WangDemoPlanNode[];
  events: WangDemoEvent[];
}

export interface WangWorkbenchAssignment {
  schoolSportId: string;
  schoolYear: string;
  sportCode: string;
  sportName: string;
  sportFamily: string | null;
  workbenchStatus: WangSportStatus;
  workbenchEnabled: boolean;
  mappingApproved: boolean;
  groups: WangDemoGroup[];
  plans: WangDemoPlanNode[];
  events: WangDemoEvent[];
}

export interface WangAthleteListItem {
  id: string;
  name: string;
  grade: "VG1" | "VG2" | "VG3";
  isDemo: boolean;
}

export interface WangAthleteGroup {
  id: string;
  code: string;
  name: string;
  grade: string | null;
  schoolYear: string;
  athletes: WangAthleteListItem[];
}

export interface WangAthleteSport {
  schoolSportId: string;
  schoolYear: string;
  sportCode: string;
  sportName: string;
  groups: WangAthleteGroup[];
}

export interface WangAthleteOverview {
  sports: WangAthleteSport[];
}

export interface WangWellbeingAlert {
  studentId: string;
  athleteName: string;
  grade: "VG1" | "VG2" | "VG3";
  isDemo: boolean;
  groupName: string;
  sportName: string;
  streakStartsOn: string;
  streakEndsOn: string;
  consecutiveDays: number;
}

export interface WangAthleteProfileData {
  id: string;
  name: string;
  grade: "VG1" | "VG2" | "VG3";
  isDemo: boolean;
  schoolName: string | null;
  group: {
    id: string;
    code: string;
    name: string;
    schoolYear: string;
  };
  sport: {
    schoolSportId: string;
    code: string;
    name: string;
  };
}

export interface WangAthleteProfileSchedule {
  weekStartsAt: string;
  weekEndsAt: string;
  weekEvents: WangCalendarEvent[];
  upcomingCompetitions: WangCalendarEvent[];
}

export interface WangAthleteProfileWithSchedule {
  athlete: WangAthleteProfileData;
  schedule: WangAthleteProfileSchedule;
}

export type WangCalendarAccessKind = "self" | "shared" | "staff" | "leadership";

export interface WangCalendarEvent extends WangDemoEvent {
  schoolSportId: string | null;
  studentId: string | null;
}

export interface WangCalendarFeed {
  id: string;
  label: string;
  detail: string;
  accessKind: WangCalendarAccessKind;
  accessExpiresAt: string | null;
  events: WangCalendarEvent[];
}

export interface WangCalendarData {
  feeds: WangCalendarFeed[];
}

export interface WangAuthenticatedProfile {
  id: string;
  displayName: string;
  role: WangRole;
  schoolId: string | null;
  schoolName: string | null;
}

export interface WangStartMetric {
  label: string;
  value: string;
  detail: string;
}
