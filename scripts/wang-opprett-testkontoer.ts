import "./_env";

import { randomBytes } from "node:crypto";
import { access, chmod, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, isAbsolute, relative, resolve } from "node:path";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

import {
  erGodkjentSyntetiskWangAuthBruker,
  lagWangTestAccountSpecs,
  lagWangTestCredentialDocument,
  type WangTestCredentialAccount,
} from "../src/lib/wang-supabase/test-account-provisioning";
import {
  assertWangTestAccountTarget,
  WANG_DEMO_SCHOOL_CODE,
  WANG_DEMO_SCHOOL_YEAR,
  WANG_DEMO_SPORT_CODE,
} from "../src/lib/wang-supabase/test-account-linking";

function hentArgument(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? null : null;
}

function krevRad<T>(
  result: { data: T | null; error: { message: string } | null },
  message: string,
): T {
  if (result.error || result.data === null) throw new Error(message);
  return result.data;
}

async function finnes(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function krevPrivatUtfil(rawPath: string): string {
  if (!isAbsolute(rawPath)) throw new Error("--output må være en absolutt sti utenfor kodebasen.");
  const outputPath = resolve(rawPath);
  const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const fromRepo = relative(repositoryRoot, outputPath);
  if (!fromRepo.startsWith("..") || isAbsolute(fromRepo)) {
    throw new Error("Testpassord kan ikke lagres i kodebasen.");
  }
  return outputPath;
}

async function hentDemoElevId(supabase: SupabaseClient): Promise<string> {
  const school = krevRad<{ id: string }>(await supabase
    .from("wang_schools")
    .select("id")
    .eq("code", WANG_DEMO_SCHOOL_CODE)
    .eq("active", true)
    .single(), "Godkjent WANG-skole ble ikke funnet.");

  const sport = krevRad<{ id: string }>(await supabase
    .from("wang_sports")
    .select("id")
    .eq("code", WANG_DEMO_SPORT_CODE)
    .eq("workbench_status", "active")
    .single(), "Aktiv Golf-idrett ble ikke funnet.");

  const schoolSport = krevRad<{ id: string }>(await supabase
    .from("wang_school_sports")
    .select("id")
    .eq("school_id", school.id)
    .eq("sport_id", sport.id)
    .eq("school_year", WANG_DEMO_SCHOOL_YEAR)
    .eq("status", "active")
    .single(), "Aktiv Golf-kobling for 2026/2027 ble ikke funnet.");

  const groups = krevRad<Array<{ id: string }>>(await supabase
    .from("wang_groups")
    .select("id")
    .eq("school_sport_id", schoolSport.id)
    .eq("school_year", WANG_DEMO_SCHOOL_YEAR)
    .eq("is_demo", true)
    .order("id"), "Demo-gruppene kunne ikke kontrolleres.");
  const groupIds = groups.map((group) => group.id);
  if (groupIds.length === 0) throw new Error("Ingen godkjent Golf-demo-gruppe ble funnet.");

  const students = krevRad<Array<{ id: string; profile_id: string | null }>>(await supabase
    .from("wang_students")
    .select("id, profile_id")
    .in("group_id", groupIds)
    .eq("is_demo", true)
    .order("id"), "Demo-elevene kunne ikke kontrolleres.");
  const student = students.find((candidate) => candidate.profile_id === null);
  if (!student) {
    throw new Error("Ingen ukoblet demo-elev finnes i den godkjente Golf-gruppen.");
  }
  return student.id;
}

async function hentAlleAuthBrukere(supabase: SupabaseClient): Promise<User[]> {
  const users: User[] = [];
  const perPage = 1000;
  for (let page = 1; ; page += 1) {
    const result = await supabase.auth.admin.listUsers({ page, perPage });
    if (result.error) throw new Error("Auth-brukerne kunne ikke kontrolleres.");
    users.push(...result.data.users);
    if (result.data.users.length < perPage) return users;
  }
}

async function opprettEllerRoterKontoer(
  supabase: SupabaseClient,
): Promise<WangTestCredentialAccount[]> {
  const specs = lagWangTestAccountSpecs();
  const users = await hentAlleAuthBrukere(supabase);

  for (const spec of specs) {
    const matches = users.filter((user) => user.email === spec.email);
    if (matches.length > 1) throw new Error(`Flere Auth-brukere har adressen for ${spec.profileKey}.`);
    if (matches[0] && !erGodkjentSyntetiskWangAuthBruker(spec, matches[0])) {
      throw new Error(`Eksisterende Auth-bruker for ${spec.profileKey} mangler sikker syntetisk markør.`);
    }
  }

  const accounts: WangTestCredentialAccount[] = [];
  for (const spec of specs) {
    const password = randomBytes(24).toString("base64url");
    const existing = users.find((user) => user.email === spec.email);
    const attributes = {
      email: spec.email,
      password,
      email_confirm: true,
      app_metadata: {
        wang_synthetic: true,
        wang_synthetic_profile_key: spec.profileKey,
      },
      user_metadata: { wang_synthetic_profile_key: spec.profileKey },
    };
    const result = existing
      ? await supabase.auth.admin.updateUserById(existing.id, attributes)
      : await supabase.auth.admin.createUser(attributes);
    if (result.error || !result.data.user) {
      throw new Error(`Den syntetiske Auth-kontoen for ${spec.profileKey} kunne ikke opprettes.`);
    }
    if (!erGodkjentSyntetiskWangAuthBruker(spec, result.data.user)) {
      throw new Error(`Auth-kontoen for ${spec.profileKey} ble ikke lagret med riktig markør.`);
    }
    accounts.push({ ...spec, id: result.data.user.id, password });
  }
  return accounts;
}

async function main() {
  const outputArg = hentArgument("--output");
  if (!outputArg) throw new Error("Bruk --output med en absolutt, privat filsti utenfor kodebasen.");
  const outputPath = krevPrivatUtfil(outputArg);
  if (await finnes(outputPath) && !process.argv.includes("--overwrite")) {
    throw new Error("Utfilen finnes allerede. Bruk --overwrite bare når passordene bevisst skal roteres.");
  }
  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({
      mode: "dry-run",
      profiles: lagWangTestAccountSpecs().length,
      writesPerformed: false,
      emailSent: false,
    }, null, 2));
    return;
  }

  const target = assertWangTestAccountTarget(process.env);
  const supabase = createClient(target.url, target.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const studentId = await hentDemoElevId(supabase);
  const accounts = await opprettEllerRoterKontoer(supabase);
  const document = lagWangTestCredentialDocument({ studentId, accounts });

  await mkdir(dirname(outputPath), { recursive: true, mode: 0o700 });
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o600 });
  await chmod(outputPath, 0o600);
  console.log(`Ti syntetiske WANG-kontoer er klare. Privat koblingsfil: ${outputPath}`);
  console.log("Ingen e-post er sendt, og ingen ekte personopplysninger er brukt.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Ukjent feil.";
  console.error(`WANG-testkontooppretting avvist: ${message}`);
  process.exitCode = 1;
});
