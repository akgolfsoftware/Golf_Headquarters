#!/usr/bin/env node
/**
 * Typografi-vakt (warning-modus) — AVVIKSRAPPORT-2026-08-13 §6.1.
 * Sjekker inline `fontSize` i .tsx-filer mot Paper-skalaen
 * (scripts/typografi-skala.mjs, forklart i docs/port/typografi-skala-paper.md).
 *
 * Bruk:
 *   node scripts/check-typografi.mjs <fil> [fil...]   — sjekk angitte filer
 *   node scripts/check-typografi.mjs --diff           — sjekk filer endret mot origin/main
 *   node scripts/check-typografi.mjs --alle           — hele src/ (statusrapport)
 *
 * Exit 0 alltid (warning-modus). Vippes til blokkerende (exit 1 ved avvik)
 * ved å sette TYPOGRAFI_STRENG=1 — først når restansen i dokumentet er tom.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { erUnntatt, finnAvvik } from "./typografi-skala.mjs";

const args = process.argv.slice(2);
let filer = [];

if (args[0] === "--diff") {
  const ut = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
    encoding: "utf-8",
  });
  filer = ut.split("\n").filter((f) => /\.tsx$/.test(f) && f.startsWith("src/"));
} else if (args[0] === "--alle") {
  const ut = execFileSync("git", ["ls-files", "src/**/*.tsx"], { encoding: "utf-8" });
  filer = ut.split("\n").filter(Boolean);
} else {
  filer = args.filter((f) => /\.tsx$/.test(f));
}

let totalt = 0;
const perVerdi = new Map();

for (const fil of filer) {
  if (!existsSync(fil) || erUnntatt(fil)) continue;
  const avvik = finnAvvik(readFileSync(fil, "utf-8"));
  if (avvik.length === 0) continue;
  totalt += avvik.length;
  for (const a of avvik) {
    perVerdi.set(a.verdi, (perVerdi.get(a.verdi) ?? 0) + 1);
    console.log(`${fil}:${a.linje}  fontSize ${a.verdi}px er utenfor Paper-skalaen`);
  }
}

if (totalt > 0) {
  const oppsummering = [...perVerdi.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([v, n]) => `${v}px×${n}`)
    .join(" · ");
  console.log(
    `\n${totalt} fontSize utenfor skalaen (${oppsummering}).` +
      `\nSkala + nærmeste erstatning: docs/port/typografi-skala-paper.md`,
  );
  if (process.env.TYPOGRAFI_STRENG === "1") process.exit(1);
} else if (filer.length > 0) {
  console.log("Typografi: alle inline fontSize innenfor Paper-skalaen.");
}
process.exit(0);
