/**
 * Roter SCREENTEST_PASSWORD i ÉN operasjon (jf. memory: DB-rotasjon glemmer .env.local):
 *   1. Genererer nytt sterkt passord lokalt (vises aldri i logg).
 *   2. Setter det på begge testbrukerne i Supabase Auth (screentest + coachtest).
 *   3. Oppdaterer SCREENTEST_PASSWORD-linjen i .env.local.
 *   4. Setter GitHub Actions-secreten (gh secret set), hvis gh er logget inn.
 *   5. Verifiserer med ekte innlogging mot Supabase.
 *
 * Kjøres av Anders (agenter har ikke tilgang til .env.local):
 *   npx tsx --conditions=react-server scripts/roter-screentest-passord.ts
 */

import "./_env";

import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BRUKERE = ["screentest@akgolf.test", "coachtest@akgolf.test"];

async function main() {
  if (!URL || !SERVICE) throw new Error("Mangler NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY i .env.local");
  const nytt = randomBytes(18).toString("base64url");
  const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

  // 1+2: sett nytt passord på begge testbrukerne
  const { data: liste, error: listeFeil } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listeFeil) throw listeFeil;
  for (const epost of BRUKERE) {
    const bruker = liste.users.find((u) => u.email === epost);
    if (!bruker) throw new Error(`Fant ikke ${epost} i Supabase Auth`);
    const { error } = await admin.auth.admin.updateUserById(bruker.id, { password: nytt });
    if (error) throw error;
    console.log(`Passord satt: ${epost}`);
  }

  // 3: .env.local i SAMME operasjon
  const sti = ".env.local";
  const inn = readFileSync(sti, "utf8");
  if (!/^SCREENTEST_PASSWORD=/m.test(inn)) throw new Error("Fant ikke SCREENTEST_PASSWORD i .env.local");
  writeFileSync(sti, inn.replace(/^SCREENTEST_PASSWORD=.*$/m, `SCREENTEST_PASSWORD=${nytt}`));
  console.log("Oppdatert: .env.local");

  // 4: GitHub Actions-secret (best effort)
  try {
    execFileSync("gh", ["secret", "set", "SCREENTEST_PASSWORD", "--body", nytt], { stdio: ["ignore", "inherit", "inherit"] });
    console.log("Oppdatert: GitHub-secret SCREENTEST_PASSWORD");
  } catch {
    console.log("ADVARSEL: gh secret set feilet — sett SCREENTEST_PASSWORD manuelt i GitHub → Settings → Secrets");
  }

  // 5: verifiser med ekte innlogging
  const anon = createClient(URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { error: loginFeil } = await anon.auth.signInWithPassword({ email: BRUKERE[1], password: nytt });
  if (loginFeil) throw new Error(`Verifisering feilet: ${loginFeil.message}`);
  console.log("Verifisert: innlogging med nytt passord OK. Ferdig.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
