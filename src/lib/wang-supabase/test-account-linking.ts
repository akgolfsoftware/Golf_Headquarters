import { WANG_SYNTHETIC_PROFILES } from "./synthetic-profiles";
import { WANG_ROLES, type WangRole } from "./types";

export const WANG_DEMO_PROJECT_REF = "uwuhkgkaqnuerlkqvrpw";
export const WANG_DEMO_SCHOOL_CODE = "fredrikstad-toppidrett";
export const WANG_DEMO_SPORT_CODE = "golf";
export const WANG_DEMO_SCHOOL_YEAR = "2026/2027";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EXTERNAL_SCOPES = {
  guardian: ["calendar", "plans", "competitions", "camps", "messages", "contacts"],
  club_coach: [
    "calendar",
    "plans",
    "training",
    "competitions",
    "camps",
    "messages",
    "contacts",
  ],
} as const;

type WangExternalRole = keyof typeof EXTERNAL_SCOPES;

export interface WangTestAccountInput {
  projectRef: string;
  studentId: string;
  profileIds: Record<WangRole, string>;
}

export interface WangTestAccountPlan {
  projectRef: typeof WANG_DEMO_PROJECT_REF;
  schoolCode: typeof WANG_DEMO_SCHOOL_CODE;
  sportCode: typeof WANG_DEMO_SPORT_CODE;
  schoolYear: typeof WANG_DEMO_SCHOOL_YEAR;
  profiles: Array<{
    id: string;
    profileKey: string;
    expectedEmail: string;
    displayName: string;
    role: WangRole;
    schoolScope: "central" | "fredrikstad";
  }>;
  staffAssignments: Array<{
    profileId: string;
    role: "sports_director" | "coach";
  }>;
  studentLink: { studentId: string; profileId: string };
  externalAccess: Array<{
    profileId: string;
    role: WangExternalRole;
    scopes: readonly string[];
    expiresAt: string;
  }>;
}

function erObjekt(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function krevUuid(value: unknown, label: string): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new Error(`${label} må være en gyldig UUID.`);
  }
  return value;
}

function krevProfilIder(value: unknown): Record<WangRole, string> {
  if (!erObjekt(value)) throw new Error("profileIds mangler.");
  const keys = Object.keys(value).sort();
  const expectedKeys = [...WANG_ROLES].sort();
  if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) {
    throw new Error("profileIds må inneholde nøyaktig én ID for hver WANG-rolle.");
  }

  const result = Object.fromEntries(
    WANG_ROLES.map((role) => [role, krevUuid(value[role], `profileIds.${role}`)]),
  ) as Record<WangRole, string>;
  if (new Set(Object.values(result)).size !== WANG_ROLES.length) {
    throw new Error("Hver WANG-testkonto må ha en unik bruker-ID.");
  }
  return result;
}

export function parseWangTestAccountInput(value: unknown): WangTestAccountInput {
  if (!erObjekt(value)) throw new Error("Testkontofilen må være et JSON-objekt.");
  if (value.projectRef !== WANG_DEMO_PROJECT_REF) {
    throw new Error("Testkontofilen peker ikke på den godkjente WANG-databasen.");
  }
  return {
    projectRef: WANG_DEMO_PROJECT_REF,
    studentId: krevUuid(value.studentId, "studentId"),
    profileIds: krevProfilIder(value.profileIds),
  };
}

export function expectedWangTestEmail(profileKey: string): string {
  if (!/^[a-z0-9-]+$/.test(profileKey)) throw new Error("Ugyldig testprofilnøkkel.");
  return `wang-demo-${profileKey}@example.invalid`;
}

export function lagWangTestAccountPlan(value: unknown): WangTestAccountPlan {
  const input = parseWangTestAccountInput(value);
  const profiles = WANG_SYNTHETIC_PROFILES.map((profile) => {
    if (!profile.displayName.startsWith("Fiktiv ") || /@|\+47|\b\d{8}\b/.test(profile.displayName)) {
      throw new Error("Testprofilene kan bare bruke tydelig fiktive identiteter.");
    }
    return {
      id: input.profileIds[profile.role],
      profileKey: profile.profileKey,
      expectedEmail: expectedWangTestEmail(profile.profileKey),
      displayName: profile.displayName,
      role: profile.role,
      schoolScope: profile.role === "central_admin" ? "central" as const : "fredrikstad" as const,
    };
  });

  return {
    projectRef: WANG_DEMO_PROJECT_REF,
    schoolCode: WANG_DEMO_SCHOOL_CODE,
    sportCode: WANG_DEMO_SPORT_CODE,
    schoolYear: WANG_DEMO_SCHOOL_YEAR,
    profiles,
    staffAssignments: (["sports_director", "coach"] as const).map((role) => ({
      profileId: input.profileIds[role],
      role,
    })),
    studentLink: {
      studentId: input.studentId,
      profileId: input.profileIds.student,
    },
    externalAccess: (["guardian", "club_coach"] as const).map((role) => ({
      profileId: input.profileIds[role],
      role,
      scopes: EXTERNAL_SCOPES[role],
      expiresAt: "2027-07-31T23:59:59+02:00",
    })),
  };
}

export function assertWangTestAccountTarget(env: Readonly<Record<string, string | undefined>>): {
  url: string;
  serviceRoleKey: string;
} {
  const rawUrl = env.NEXT_PUBLIC_WANG_SUPABASE_URL;
  const serviceRoleKey = env.WANG_SUPABASE_SERVICE_ROLE_KEY;
  let url: URL;
  try {
    if (!rawUrl) throw new Error();
    url = new URL(rawUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_WANG_SUPABASE_URL mangler eller er ugyldig.");
  }
  if (
    url.protocol !== "https:" ||
    url.hostname !== `${WANG_DEMO_PROJECT_REF}.supabase.co` ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("Kobling er bare tillatt mot den godkjente WANG-databasen.");
  }
  if (!serviceRoleKey) throw new Error("WANG_SUPABASE_SERVICE_ROLE_KEY mangler.");
  return { url: url.origin, serviceRoleKey };
}

export function assertSyntheticWangAuthIdentity(
  profile: WangTestAccountPlan["profiles"][number],
  authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> },
): void {
  if (
    authUser.id !== profile.id ||
    authUser.email !== profile.expectedEmail ||
    authUser.user_metadata?.wang_synthetic_profile_key !== profile.profileKey
  ) {
    throw new Error(`Auth-brukeren for ${profile.profileKey} er ikke en godkjent syntetisk WANG-konto.`);
  }
}
