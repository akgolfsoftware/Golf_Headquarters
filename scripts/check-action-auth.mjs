#!/usr/bin/env node
// KS-1 gate: alle server-action-filer under admin/ og portal/ MÅ importere
// en kjent auth-helper (eller være på public-allowlisten). Forhindrer nye
// usikrede actions. Kjør: node scripts/check-action-auth.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOTS = ["src/app/admin", "src/app/portal"];
const AUTH_IMPORT = /from\s+["']@\/lib\/auth\/(?:action-guards|assert-own-or-coached|requireConsentingUser|requirePortalUser|requireCapability|coached|getCurrentUser)["']/;
const ALT_AUTH = /from\s+["']@\/lib\/teknisk-plan\/ensure-plan-access["']/;
const USE_SERVER = /["']use server["']/;

/** Bevisst offentlige / token-baserte actions (token i URL er hemmeligheten). */
const PUBLIC_ALLOW = new Set([
  // ingen under admin/portal i dag — marketing/auth ligger utenfor ROOTS
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
