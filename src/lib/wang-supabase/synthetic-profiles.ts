import { WANG_ROLE_DEFINITIONS } from "./roles";
import {
  WANG_ROLES,
  type WangAuthenticatedProfile,
  type WangRole,
  type WangStartMetric,
} from "./types";

export interface WangSyntheticProfile extends WangAuthenticatedProfile {
  profileKey: string;
  sportName: string | null;
  accessScope: string;
  wellbeingAccess: "Tilgjengelig" | "Skjult" | "Ikke relevant";
  expiresOn: string | null;
}

const FREDRIKSTAD_SCHOOL_ID = "00000000-0000-4000-8000-000000000100";

const SYNTHETIC_PROFILES: Record<WangRole, WangSyntheticProfile> = {
  central_admin: {
    id: "00000000-0000-4000-8000-000000000201",
    profileKey: "sentral-admin",
    displayName: "Fiktiv sentral administrator",
    role: "central_admin",
    schoolId: null,
    schoolName: null,
    sportName: null,
    accessScope: "Alle skoler · samlet status uten navngitte elever",
    wellbeingAccess: "Ikke relevant",
    expiresOn: null,
  },
  school_leader: {
    id: "00000000-0000-4000-8000-000000000202",
    profileKey: "skoleleder",
    displayName: "Fiktiv skoleleder",
    role: "school_leader",
    schoolId: FREDRIKSTAD_SCHOOL_ID,
    schoolName: "WANG Toppidrett Fredrikstad",
    sportName: null,
    accessScope: "Egen skole · alle idretter",
    wellbeingAccess: "Skjult",
    expiresOn: null,
  },
  principal: {
    id: "00000000-0000-4000-8000-000000000203",
    profileKey: "rektor",
    displayName: "Fiktiv rektor",
    role: "principal",
    schoolId: FREDRIKSTAD_SCHOOL_ID,
    schoolName: "WANG Toppidrett Fredrikstad",
    sportName: null,
    accessScope: "Egen skole · alle idretter og elevprofiler",
    wellbeingAccess: "Skjult",
    expiresOn: null,
  },
  head_of_sports: {
    id: "00000000-0000-4000-8000-000000000204",
    profileKey: "toppidrettssjef",
    displayName: "Fiktiv toppidrettssjef",
    role: "head_of_sports",
    schoolId: FREDRIKSTAD_SCHOOL_ID,
    schoolName: "WANG Toppidrett Fredrikstad",
    sportName: null,
    accessScope: "Egen skole · alle idretter og elevprofiler",
    wellbeingAccess: "Skjult",
    expiresOn: null,
  },
  sports_director: {
    id: "00000000-0000-4000-8000-000000000205",
    profileKey: "sportssjef-golf",
    displayName: "Fiktiv sportssjef",
    role: "sports_director",
    schoolId: FREDRIKSTAD_SCHOOL_ID,
    schoolName: "WANG Toppidrett Fredrikstad",
    sportName: "Golf",
    accessScope: "Egen skole · tildelt idrett",
    wellbeingAccess: "Tilgjengelig",
    expiresOn: null,
  },
  coach: {
    id: "00000000-0000-4000-8000-000000000206",
    profileKey: "trener-golf",
    displayName: "Fiktiv trener",
    role: "coach",
    schoolId: FREDRIKSTAD_SCHOOL_ID,
    schoolName: "WANG Toppidrett Fredrikstad",
    sportName: "Golf",
    accessScope: "Egen skole · tildelt idrett",
    wellbeingAccess: "Tilgjengelig",
    expiresOn: null,
  },
  student: {
    id: "00000000-0000-4000-8000-000000000207",
    profileKey: "elevutover-golf",
    displayName: "Fiktiv elevutøver",
    role: "student",
    schoolId: FREDRIKSTAD_SCHOOL_ID,
    schoolName: "WANG Toppidrett Fredrikstad",
    sportName: "Golf",
    accessScope: "Egen profil, kalender og treningsplan",
    wellbeingAccess: "Tilgjengelig",
    expiresOn: null,
  },
  guardian: {
    id: "00000000-0000-4000-8000-000000000208",
    profileKey: "foresatt-lesetilgang",
    displayName: "Fiktiv foresatt",
    role: "guardian",
    schoolId: FREDRIKSTAD_SCHOOL_ID,
    schoolName: "WANG Toppidrett Fredrikstad",
    sportName: "Golf",
    accessScope: "Én invitert elev · avgrenset lesetilgang",
    wellbeingAccess: "Skjult",
    expiresOn: "2027-07-31",
  },
  club_coach: {
    id: "00000000-0000-4000-8000-000000000209",
    profileKey: "klubbtrener-lesetilgang",
    displayName: "Fiktiv klubbtrener",
    role: "club_coach",
    schoolId: FREDRIKSTAD_SCHOOL_ID,
    schoolName: "WANG Toppidrett Fredrikstad",
    sportName: "Golf",
    accessScope: "Én invitert elev · tidsbegrenset lesetilgang",
    wellbeingAccess: "Skjult",
    expiresOn: "2027-07-31",
  },
  readonly: {
    id: "00000000-0000-4000-8000-000000000210",
    profileKey: "delt-lesetilgang",
    displayName: "Fiktiv leser",
    role: "readonly",
    schoolId: FREDRIKSTAD_SCHOOL_ID,
    schoolName: "WANG Toppidrett Fredrikstad",
    sportName: null,
    accessScope: "Bare uttrykkelig delt innhold",
    wellbeingAccess: "Skjult",
    expiresOn: "2027-07-31",
  },
};

export const WANG_SYNTHETIC_PROFILES: readonly WangSyntheticProfile[] = WANG_ROLES.map(
  (role) => SYNTHETIC_PROFILES[role],
);

export function hentSyntetiskWangProfil(role: WangRole): WangSyntheticProfile {
  return SYNTHETIC_PROFILES[role];
}

export function kanAdministrereWangTestprofiler(role: WangRole): boolean {
  return role === "central_admin";
}

export function lagSyntetiskeWangMaalinger(
  profile: WangSyntheticProfile,
): WangStartMetric[] {
  return [
    {
      label: "Rolle",
      value: WANG_ROLE_DEFINITIONS[profile.role].label,
      detail: profile.accessScope,
    },
    {
      label: "Skole og idrett",
      value: profile.schoolName ?? "WANG sentralt",
      detail: profile.sportName ?? "Ingen enkeltidrett valgt",
    },
    {
      label: "Søvn og dagsform",
      value: profile.wellbeingAccess,
      detail: "Fiktiv visning uten personopplysninger",
    },
  ];
}
