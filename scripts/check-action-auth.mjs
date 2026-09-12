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
const AUTH_IMPORT = /from\s+["']@\/lib\/(?:auth\/(?:action-guards|assert-own-or-coached|requireConsentingUser|requirePortalUser|requireCapability|coached|getCurrentUser|canAccessMissionControl|own-or-coached)|teknisk-plan\/ensure-plan-access)["']/;
// Kun EKTE direktiv: en linje som bare er "use server" (evt. med semikolon).
// Unngår falske treff på "use server" nevnt inne i kommentarer/dok-strenger.
const USE_SERVER = /^\s*["']use server["'];?\s*$/m;

/** Runtime-vakter. En import uten kall er ikke autorisasjon (R-I / REV-F10). */
const AUTH_FNS = [
  "requireCoachActionUser",
  "requireAdminActionUser",
  "requireSpillerActionUser",
  "requireParentActionUser",
  "requireConsentingUser",
  "requirePortalUser",
  "requireCapability",
  "getCurrentUser",
  "getCurrentUserRaw",
  "canAccessMissionControl",
  "harCoachTilgangTilSpiller",
  "assertCoachTilgangTilSpiller",
  "erCoachetSpiller",
  "coachScopedPlayerWhere",
  "canAccessPlayer",
  "ensurePlanAccess",
  "assertCanViewPlayerData",
  "assertOwnOrCoached",
  "coachAction",
  "spillerAction",
  "adminAction",
  "parentAction",
  "publicAction",
];

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

function importedAuthNames(txt) {
  const names = [];
  const importRe =
    /import\s+(type\s+)?(?:\{([^}]+)\}|\*\s+as\s+\w+|(\w+))\s+from\s+["']@\/lib\/(?:auth\/[^"']+|teknisk-plan\/ensure-plan-access)["']/g;
  let m;
  while ((m = importRe.exec(txt))) {
    if (m[1]) continue;
    if (m[2]) {
      for (const part of m[2].split(",")) {
        const trimmed = part.trim();
        if (!trimmed || trimmed.startsWith("type ")) continue;
        const name = trimmed.split(/\s+as\s+/).pop()?.trim();
        if (name && AUTH_FNS.includes(name)) names.push(name);
      }
    } else if (m[3] && AUTH_FNS.includes(m[3])) {
      names.push(m[3]);
    }
  }
  return names;
}

function callCount(txt, fn) {
  return (txt.match(new RegExp("\\b" + fn + "\\s*\\(", "g")) || []).length;
}

const missingImport = [];
const unusedGuard = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const rel = file.replace(/\\/g, "/");
    const txt = readFileSync(file, "utf8");
    if (!USE_SERVER.test(txt)) continue;
    // Skip non-action helpers that happened to have the directive
    if (rel.endsWith("/constants.ts") || rel.includes("/lib/periode-helpers")) continue;
    if (PUBLIC_ALLOW.has(rel)) continue;
    const hasAuthImport = AUTH_IMPORT.test(txt);
    const hasPublicActionMarker =
      txt.includes("publicAction") && txt.includes("@/lib/auth/action-guards");
    if (!hasAuthImport && !hasPublicActionMarker) {
      missingImport.push(rel);
      continue;
    }
    const imported = importedAuthNames(txt);
    const unused = imported.filter((fn) => callCount(txt, fn) === 0);
    if (unused.length) unusedGuard.push({ rel, unused });
  }
}

if (missingImport.length) {
  console.error(
    "check-action-auth: server-action-filer uten auth-import:\n" +
      missingImport.map((f) => `  ${f}`).join("\n") +
      "\nImporter requireCoachActionUser / requireSpillerActionUser / " +
      "assertCanViewPlayerData / publicAction fra @/lib/auth/action-guards " +
      "(eller annen kjent auth-helper).",
  );
  process.exit(1);
}

if (unusedGuard.length) {
  console.error(
    "check-action-auth: importert tilgangsvakt uten kall (R-I):\n" +
      unusedGuard
        .map((u) => `  ${u.rel}: ${u.unused.join(", ")}`)
        .join("\n") +
      "\nEn ubrukt import er ikke autorisasjon. Kall vakten i den eksporterte handlingen.",
  );
  process.exit(1);
}

console.log("check-action-auth: OK.");
