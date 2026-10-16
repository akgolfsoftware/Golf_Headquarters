import "server-only";

import { z } from "zod";

import { WANG_ROLE_DEFINITIONS } from "./roles";
import { opprettWangServerKlient } from "./server";
import {
  WANG_ROLES,
  type WangAuthenticatedProfile,
  type WangRole,
  type WangStartMetric,
} from "./types";

const wangRoleSchema = z.enum(WANG_ROLES);

const profileSchema = z.object({
  id: z.uuid(),
  display_name: z.string().min(1),
  role: wangRoleSchema,
  school_id: z.uuid().nullable(),
  active: z.boolean(),
});

const schoolSchema = z.object({ name: z.string().min(1) });

export type WangUserContext =
  | { status: "logged_out" }
  | { status: "missing_profile" }
  | { status: "ready"; profile: WangAuthenticatedProfile };

function krevUtenFeil(error: { message: string } | null, message: string): void {
  if (error) throw new Error(message);
}

export async function hentWangBrukerkontekst(): Promise<WangUserContext> {
  const supabase = await opprettWangServerKlient();
  const authResult = await supabase.auth.getUser();

  if (!authResult.data.user) return { status: "logged_out" };

  const profileResult = await supabase
    .from("wang_profiles")
    .select("id, display_name, role, school_id, active")
    .eq("id", authResult.data.user.id)
    .maybeSingle();

  krevUtenFeil(profileResult.error, "WANG-profilen kunne ikke hentes.");
  if (!profileResult.data) return { status: "missing_profile" };

  const parsedProfile = profileSchema.safeParse(profileResult.data);
  if (!parsedProfile.success || !parsedProfile.data.active) {
    return { status: "missing_profile" };
  }

  let schoolName: string | null = null;
  if (parsedProfile.data.school_id) {
    const schoolResult = await supabase
      .from("wang_schools")
      .select("name")
      .eq("id", parsedProfile.data.school_id)
      .maybeSingle();
    krevUtenFeil(schoolResult.error, "WANG-skolen kunne ikke hentes.");
    if (schoolResult.data) {
      const parsedSchool = schoolSchema.safeParse(schoolResult.data);
      if (!parsedSchool.success) throw new Error("WANG-skolen har ugyldige data.");
      schoolName = parsedSchool.data.name;
    }
  }

  return {
    status: "ready",
    profile: {
      id: parsedProfile.data.id,
      displayName: parsedProfile.data.display_name,
      role: parsedProfile.data.role,
      schoolId: parsedProfile.data.school_id,
      schoolName,
    },
  };
}

function countValue(count: number | null): string {
  return String(count ?? 0);
}

function requireCountResults(
  results: Array<{ error: { message: string } | null }>,
): void {
  if (results.some((result) => result.error)) {
    throw new Error("WANG-oversikten kunne ikke hentes.");
  }
}

export async function hentWangStartmaalinger(
  profile: WangAuthenticatedProfile,
): Promise<WangStartMetric[]> {
  const supabase = await opprettWangServerKlient();

  if (profile.role === "central_admin") {
    const [schools, activeSports, enabledWorkbenches] = await Promise.all([
      supabase.from("wang_schools").select("id", { count: "exact", head: true }).eq("active", true),
      supabase
        .from("wang_school_sports")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("wang_school_sports")
        .select("id", { count: "exact", head: true })
        .eq("workbench_enabled", true),
    ]);
    requireCountResults([schools, activeSports, enabledWorkbenches]);
    return [
      { label: "Aktive skoler", value: countValue(schools.count), detail: "Ingen elevnavn i denne oversikten" },
      { label: "Aktive skoleidretter", value: countValue(activeSports.count), detail: "På tvers av WANG" },
      { label: "Aktive Workbencher", value: countValue(enabledWorkbenches.count), detail: "Golf er første sammenhengende demo" },
    ];
  }

  if (
    profile.role === "school_leader" ||
    profile.role === "principal" ||
    profile.role === "head_of_sports"
  ) {
    if (!profile.schoolId) return rollemaalinger(profile.role, profile.schoolName);
    const [activeSports, enabledWorkbenches] = await Promise.all([
      supabase
        .from("wang_school_sports")
        .select("id", { count: "exact", head: true })
        .eq("school_id", profile.schoolId)
        .eq("status", "active"),
      supabase
        .from("wang_school_sports")
        .select("id", { count: "exact", head: true })
        .eq("school_id", profile.schoolId)
        .eq("workbench_enabled", true),
    ]);
    requireCountResults([activeSports, enabledWorkbenches]);
    return [
      { label: "Aktive idretter", value: countValue(activeSports.count), detail: profile.schoolName ?? "Egen skole" },
      { label: "Aktive Workbencher", value: countValue(enabledWorkbenches.count), detail: "Fagmodeller åpnes først når de er godkjent" },
      { label: "Morgeninnsjekk", value: "Skjult", detail: "Bare sportssjef og trener" },
    ];
  }

  if (profile.role === "sports_director" || profile.role === "coach") {
    const memberships = await supabase
      .from("wang_staff_memberships")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id)
      .eq("active", true);
    requireCountResults([memberships]);
    return [
      { label: "Tildelte idretter", value: countValue(memberships.count), detail: "Tilgangen følger aktiv tildeling" },
      { label: "Skole", value: profile.schoolName ?? "Ikke koblet", detail: "Ingen tilgang på tvers av skoler" },
      { label: "Morgeninnsjekk", value: "Tilgjengelig", detail: "Bare for tildelte utøvere" },
    ];
  }

  if (profile.role === "guardian" || profile.role === "club_coach") {
    const access = await supabase
      .from("wang_external_access")
      .select("id", { count: "exact", head: true })
      .eq("reader_profile_id", profile.id)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString());
    requireCountResults([access]);
    return [
      { label: "Aktive invitasjoner", value: countValue(access.count), detail: "Tilgang med sluttdato" },
      { label: "Søvn og dagsform", value: "Skjult", detail: "Deles ikke med eksterne lesere" },
      { label: "Rolle", value: WANG_ROLE_DEFINITIONS[profile.role].label, detail: "Bare uttrykkelig delt innhold" },
    ];
  }

  return rollemaalinger(profile.role, profile.schoolName);
}

function rollemaalinger(role: WangRole, schoolName: string | null): WangStartMetric[] {
  return [
    { label: "Rolle", value: WANG_ROLE_DEFINITIONS[role].label, detail: "Kontrollert av WANG-profilen" },
    { label: "Skole", value: schoolName ?? "Ikke koblet", detail: "Tilgangen følger skoletilhørighet" },
    { label: "Tilgang", value: "Aktiv", detail: "Bare innhold innenfor ditt omfang" },
  ];
}
