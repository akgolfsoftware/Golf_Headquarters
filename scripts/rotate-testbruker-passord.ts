/**
 * Roter passordet for ALLE testbrukere på akgolf.test-domenet — både
 * @akgolf.test og underdomener som @stall.akgolf.test (demo-stallen fra
 * seed-screentest-coach.ts ble seedet med samme passord).
 *
 * Bakgrunn: det gamle testbruker-passordet lå i klartekst i flere scripts og
 * må byttes. Nytt passord leses fra SCREENTEST_PASSWORD i .env.local og settes
 * via Supabase Admin API (samme flow som scripts/reset-auth-passwords.ts).
 *
 * Sikkerhet:
 *  - Oppdaterer KUN brukere med e-post som slutter på "@akgolf.test" eller ".akgolf.test".
 *  - Logger hvilke kontoer som ble endret — aldri selve passordet.
 *
 * Kjør: npx tsx scripts/rotate-testbruker-passord.ts
 */

import "./_env";

import { createClient } from "@supabase/supabase-js";

const NEW_PASSWORD = process.env.SCREENTEST_PASSWORD ?? "";
if (!NEW_PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local");
  process.exit(1);
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function main() {
  // Hent alle auth-brukere (paginert) og filtrer til @akgolf.test.
  const targets: { id: string; email: string }[] = [];
  const perPage = 100;
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("Kunne ikke liste brukere:", error.message);
      process.exit(1);
    }
    for (const u of data.users) {
      if (u.email && (u.email.endsWith("@akgolf.test") || u.email.endsWith(".akgolf.test"))) {
        targets.push({ id: u.id, email: u.email });
      }
    }
    if (data.users.length < perPage) break;
  }

  if (targets.length === 0) {
    console.log("Fant ingen @akgolf.test-brukere — ingenting å rotere.");
    return;
  }

  console.log(`Roterer passord for ${targets.length} @akgolf.test-brukere:\n`);
  let failed = 0;
  for (const t of targets) {
    const { error } = await admin.auth.admin.updateUserById(t.id, {
      password: NEW_PASSWORD,
    });
    if (error) {
      failed++;
      console.error(`  FEIL  ${t.email}: ${error.message}`);
    } else {
      console.log(`  OK    ${t.email}`);
    }
  }

  console.log(`\nFerdig: ${targets.length - failed} oppdatert, ${failed} feilet.`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
