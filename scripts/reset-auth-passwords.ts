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

const USERS = [
  { email: "anders@akgolf.no", password: "AndersGolf2026!" },
  { email: "markus@akgolf.no", password: "MarkusGolf2026!" },
  { email: "leder@gfgkjunior.no", password: "EspenGFGK2026!" },
  { email: "njo@gfgk.no", password: "NjoGFGK2026!" },
] as const;

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
