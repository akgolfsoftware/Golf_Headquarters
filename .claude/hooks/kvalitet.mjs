#!/usr/bin/env node
/**
 * PostToolUse-hook — kvalitetsgate nivå 3 (Agentic OS Steg 6).
 * Etter hver Edit/Write på .ts/.tsx: kjør eslint på filen + hex-gaten.
 * Feil rapporteres tilbake til Claude (exit 2) så de fikses umiddelbart —
 * samme gate som lint-staged/CI, bare tidligere i loopen.
 * Mangler node_modules (f.eks. fersk container): hopp stille over.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

let input;
try {
  input = JSON.parse(readFileSync(0, "utf-8"));
} catch {
  process.exit(0);
}

const sti = String(input.tool_input?.file_path ?? "");
if (!/\.(ts|tsx)$/.test(sti) || !/(^|\/)src\//.test(sti)) process.exit(0);
if (!existsSync("node_modules/.bin/eslint")) process.exit(0);

const feil = [];

try {
  execFileSync("node_modules/.bin/eslint", ["--quiet", "--no-warn-ignored", sti], {
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 60_000,
  });
} catch (err) {
  const ut = `${err.stdout ?? ""}${err.stderr ?? ""}`.trim();
  if (ut) feil.push(`eslint:\n${ut}`);
}

try {
  execFileSync("node", ["scripts/check-no-hex.mjs"], {
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 60_000,
  });
} catch (err) {
  const ut = `${err.stdout ?? ""}${err.stderr ?? ""}`.trim();
  if (ut) feil.push(`hex-gate:\n${ut}`);
}

if (feil.length > 0) {
  process.stderr.write(
    `Kvalitetsgate (nivå 3) feilet for ${sti} — fiks FØR du går videre:\n\n${feil.join("\n\n")}\n`,
  );
  process.exit(2);
}
process.exit(0);
