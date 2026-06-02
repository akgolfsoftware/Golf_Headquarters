/**
 * Reset passwords for beta-users via Supabase Admin API.
 * Den korrekte måten å sette passord — kjører gjennom GoTrue's egen flow
 * som garanterer at hashing/format matcher det auth.signInWithPassword forventer.
 *
 * Kjør: npx tsx scripts/reset-auth-passwords.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Passord leses fra env-variabelen BETA_USER_PASSWORDS (JSON: { "<email>": "<passord>" }).
// Aldri hardkod passord i kildekode — de havner i git-historikk.
// Eksempel (sett i .env.local, som er gitignored):
//   BETA_USER_PASSWORDS='{"anders@akgolf.no":"<sterkt-passord>","markus@akgolf.no":"<sterkt-passord>"}'
const raw = process.env.BETA_USER_PASSWORDS;
if (!raw) {
  console.error(
    "Mangler BETA_USER_PASSWORDS i miljøet. Sett den i .env.local som JSON:\n" +
      '  BETA_USER_PASSWORDS=\'{"anders@akgolf.no":"<passord>", ...}\'',
  );
  process.exit(1);
}

let parsed: Record<string, string>;
try {
  parsed = JSON.parse(raw) as Record<string, string>;
} catch {
  console.error("BETA_USER_PASSWORDS er ikke gyldig JSON.");
  process.exit(1);
}

const USERS: { email: string; password: string }[] = Object.entries(parsed).map(
  ([email, password]) => ({ email, password }),
);

async function main() {
  console.log("Resetter passord via Supabase Admin API\n");

  // Hent alle eksisterende auth-brukere
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  });
  if (listErr) {
    console.error("Kunne ikke liste brukere:", listErr);
    process.exit(1);
  }

  for (const u of USERS) {
    const existing = list.users.find((x) => x.email === u.email);
    if (!existing) {
      console.warn(`  ! Bruker finnes ikke i auth.users: ${u.email}`);
      continue;
    }

    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: u.password,
      email_confirm: true,
    });

    if (error) {
      console.error(`  ✗ ${u.email}:`, error.message);
    } else {
      console.log(`  ✓ ${u.email} — passord resatt`);
    }
  }

  console.log("\nFerdig. Prøv login på http://localhost:3001/auth/login");
}

main().catch((err) => {
  console.error("FEIL:", err);
  process.exit(1);
});
