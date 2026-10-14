import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  assertSyntheticWangAuthIdentity,
  assertWangTestAccountTarget,
  lagWangTestAccountPlan,
  type WangTestAccountPlan,
} from "../src/lib/wang-supabase/test-account-linking";

function hentArgument(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? null : null;
}

function krevUtenFeil(error: { message: string } | null, message: string): void {
  if (error) throw new Error(message);
}

function krevRad<T>(
  result: { data: T | null; error: { message: string } | null },
  message: string,
): T {
  if (result.error || result.data === null) throw new Error(message);
  return result.data;
}

async function hentKontekst(supabase: SupabaseClient, plan: WangTestAccountPlan) {
  const schoolResult = await supabase
    .from("wang_schools")
    .select("id")
    .eq("code", plan.schoolCode)
    .eq("active", true)
    .single();
  const school = krevRad(schoolResult, "Godkjent WANG-skole ble ikke funnet.");

  const sportResult = await supabase
    .from("wang_sports")
    .select("id")
    .eq("code", plan.sportCode)
    .eq("workbench_status", "active")
    .single();
  const sport = krevRad(sportResult, "Aktiv Golf-idrett ble ikke funnet.");

  const schoolSportResult = await supabase
    .from("wang_school_sports")
    .select("id")
    .eq("school_id", school.id)
    .eq("sport_id", sport.id)
    .eq("school_year", plan.schoolYear)
    .eq("status", "active")
    .single();
  const schoolSport = krevRad(
    schoolSportResult,
    "Aktiv Golf-kobling for 2026/2027 ble ikke funnet.",
  );

  const studentResult = await supabase
    .from("wang_students")
    .select("id, profile_id, group_id, is_demo")
    .eq("id", plan.studentLink.studentId)
    .eq("is_demo", true)
    .single();
  const student = krevRad(studentResult, "Valgt elev er ikke en godkjent demo-elev.");

  const groupResult = await supabase
    .from("wang_groups")
    .select("school_sport_id, is_demo")
    .eq("id", student.group_id)
    .eq("is_demo", true)
    .single();
  const group = krevRad(groupResult, "Demo-elevens gruppe ble ikke funnet.");
  if (group.school_sport_id !== schoolSport.id) {
    throw new Error("Demo-eleven tilhører ikke godkjent Golf-gruppe.");
  }
  if (
    student.profile_id !== null &&
    student.profile_id !== plan.studentLink.profileId
  ) {
    throw new Error("Demo-eleven er allerede koblet til en annen profil.");
  }

  return {
    schoolId: school.id as string,
    schoolSportId: schoolSport.id as string,
  };
}

async function kontrollerAuthBrukere(supabase: SupabaseClient, plan: WangTestAccountPlan) {
  for (const profile of plan.profiles) {
    const result = await supabase.auth.admin.getUserById(profile.id);
    if (result.error || !result.data.user) {
      throw new Error(`Godkjent syntetisk Auth-bruker mangler for ${profile.profileKey}.`);
    }
    assertSyntheticWangAuthIdentity(profile, result.data.user);
  }
}

async function kobleProfiler(supabase: SupabaseClient, plan: WangTestAccountPlan) {
  const context = await hentKontekst(supabase, plan);
  await kontrollerAuthBrukere(supabase, plan);

  const profilesResult = await supabase.from("wang_profiles").upsert(
    plan.profiles.map((profile) => ({
      id: profile.id,
      display_name: profile.displayName,
      role: profile.role,
      school_id: profile.schoolScope === "central" ? null : context.schoolId,
      active: true,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "id" },
  );
  krevUtenFeil(profilesResult.error, "WANG-profilene kunne ikke kobles.");

  const membershipsResult = await supabase.from("wang_staff_memberships").upsert(
    plan.staffAssignments.map((assignment) => ({
      profile_id: assignment.profileId,
      school_sport_id: context.schoolSportId,
      role: assignment.role,
      active: true,
    })),
    { onConflict: "profile_id,school_sport_id,role" },
  );
  krevUtenFeil(membershipsResult.error, "Sportsteamets tilganger kunne ikke kobles.");

  const studentResult = await supabase
    .from("wang_students")
    .update({ profile_id: plan.studentLink.profileId, updated_at: new Date().toISOString() })
    .eq("id", plan.studentLink.studentId)
    .eq("is_demo", true);
  krevUtenFeil(studentResult.error, "Elevens testkonto kunne ikke kobles.");

  const guardianAccess = plan.externalAccess.find((access) => access.role === "guardian");
  if (!guardianAccess) throw new Error("Testkontoplanen mangler foresatt.");
  const guardianResult = await supabase.from("wang_guardian_students").upsert({
    guardian_profile_id: guardianAccess.profileId,
    student_id: plan.studentLink.studentId,
    active: true,
  }, { onConflict: "guardian_profile_id,student_id" });
  krevUtenFeil(guardianResult.error, "Foresattrelasjonen kunne ikke kobles.");

  const externalAccessResult = await supabase.from("wang_external_access").upsert(
    plan.externalAccess.map((access) => ({
      reader_profile_id: access.profileId,
      student_id: plan.studentLink.studentId,
      role: access.role,
      scopes: [...access.scopes],
      starts_at: new Date().toISOString(),
      expires_at: access.expiresAt,
      revoked_at: null,
      invited_by: plan.studentLink.profileId,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "reader_profile_id,student_id,role" },
  );
  krevUtenFeil(externalAccessResult.error, "Ekstern lesetilgang kunne ikke kobles.");
}

async function main() {
  const inputPath = hentArgument("--input");
  if (!inputPath) throw new Error("Bruk --input med en privat JSON-fil som bare inneholder UUID-er.");
  const input = JSON.parse(await readFile(resolve(inputPath), "utf8")) as unknown;
  const plan = lagWangTestAccountPlan(input);
  const apply = process.argv.includes("--apply");

  if (!apply) {
    console.log(JSON.stringify({
      mode: "dry-run",
      projectRef: plan.projectRef,
      profiles: plan.profiles.length,
      staffAssignments: plan.staffAssignments.length,
      studentLinks: 1,
      externalAccessLinks: plan.externalAccess.length,
      writesPerformed: false,
    }, null, 2));
    return;
  }

  const target = assertWangTestAccountTarget(process.env);
  const supabase = createClient(target.url, target.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await kobleProfiler(supabase, plan);
  console.log("Ti syntetiske WANG-kontoer er koblet til avgrensede roller. Ingen e-post er sendt.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Ukjent feil.";
  console.error(`WANG-testprofilkobling avvist: ${message}`);
  process.exitCode = 1;
});
