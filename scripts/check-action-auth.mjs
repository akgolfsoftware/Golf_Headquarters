#!/usr/bin/env node
// KS-1 gate: alle server-action-filer under admin/ og portal/ MÅ importere
// en kjent auth-helper (eller være på public-allowlisten). Forhindrer nye
// usikrede actions. Kjør: node scripts/check-action-auth.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

// Dekker HELE app/lib/components — ikke bare admin/portal. En usikret server
// action i src/lib/x/actions.ts er like eksponert som en under portal/, siden
// server actions kan POST-es direkte forbi layout-guards.
const ROOTS = ["src/app", "src/lib", "src/components"];
const AUTH_IMPORT = /from\s+["']@\/lib\/auth\/(?:action-guards|assert-own-or-coached|requireConsentingUser|requirePortalUser|requireCapability|coached|getCurrentUser|canAccessMissionControl)["']/;
const ALT_AUTH = /from\s+["']@\/lib\/teknisk-plan\/ensure-plan-access["']/;
// Kun EKTE direktiv: en linje som bare er "use server" (evt. med semikolon).
// Unngår falske treff på "use server" nevnt inne i kommentarer/dok-strenger.
const USE_SERVER = /^\s*["']use server["'];?\s*$/m;

/**
 * Bevisst offentlige / token-baserte actions. For token-flytene ER token i URL
 * hemmeligheten (verifiseres i selve actionen), og de er i tillegg
 * same-origin-gatet. logout/rapportering opererer ikke på spillerdata.
 */
const PUBLIC_ALLOW = new Set([
  "src/app/(marketing)/kontakt/actions.ts", // offentlig kontaktskjema
  "src/app/auth/guardian-consent/[token]/actions.ts", // token = hemmelighet
  "src/app/auth/lyd-samtykke/[token]/actions.ts", // token = hemmelighet
  "src/app/inviter/forelder/[token]/actions.ts", // token = hemmelighet
  "src/lib/auth/logout.ts", // opererer kun på egen sesjon
  "src/lib/report-client-error.ts", // klient-feilrapport, ingen dataflate
]);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) yield p;
  }
}

const offenders = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const rel = file.replace(/\\/g, "/");
    const txt = readFileSync(file, "utf8");
    if (!USE_SERVER.test(txt)) continue;
    // Skip non-action helpers that happened to have the directive
    if (rel.endsWith("/constants.ts") || rel.includes("/lib/periode-helpers")) continue;
    if (PUBLIC_ALLOW.has(rel)) continue;
    if (AUTH_IMPORT.test(txt) || ALT_AUTH.test(txt)) continue;
    // Markør: publicAction() kalt/importert
    if (
      txt.includes("publicAction") &&
      txt.includes("@/lib/auth/action-guards")
    ) {
      continue;
    }
    offenders.push(rel);
  }
}

if (offenders.length) {
  console.error(
    "check-action-auth: server-action-filer uten auth-import:\n" +
      offenders.map((f) => `  ${f}`).join("\n") +
      "\nImporter requireCoachActionUser / requireSpillerActionUser / " +
      "assertCanViewPlayerData / publicAction fra @/lib/auth/action-guards " +
      "(eller annen kjent auth-helper).",
  );
  process.exit(1);
}

console.log("check-action-auth: OK.");
