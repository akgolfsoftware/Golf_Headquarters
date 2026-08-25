#!/usr/bin/env node
/**
 * PostToolUse-hook — kvalitetsgate nivå 3 (Agentic OS Steg 6).
 * Etter hver Edit/Write på .ts/.tsx: kjør eslint på filen.
 * Feil rapporteres tilbake til Claude (exit 2) så de fikses umiddelbart —
 * samme gate som lint-staged/CI, bare tidligere i loopen.
 * Mangler node_modules (f.eks. fersk container): hopp stille over eslint.
 * (2026-07-25: hex-gaten er fjernet — gammel designkanon avviklet.)
 * (2026-08-14: typografi-vakt lagt til — varsler om inline fontSize utenfor
 * Paper-skalaen uten å blokkere. Kilde: scripts/typografi-skala.mjs,
 * dok: docs/port/typografi-skala-paper.md. Trenger ikke node_modules.)
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

let input;
try {
  input = JSON.parse(readFileSync(0, "utf-8"));
} catch {
  process.exit(0);
}

const sti = String(input.tool_input?.file_path ?? "");
if (!/\.(ts|tsx)$/.test(sti) || !/(^|\/)src\//.test(sti)) process.exit(0);

// Typografi-vakt (warning, blokkerer ikke): inline fontSize utenfor Paper-skalaen.
let typografiVarsel = "";
if (/\.tsx$/.test(sti)) {
  try {
    const rot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
    const skalaSti = join(rot, "scripts", "typografi-skala.mjs");
    if (existsSync(skalaSti) && existsSync(sti)) {
      const { erUnntatt, finnAvvik } = await import(pathToFileURL(skalaSti).href);
      if (!erUnntatt(sti)) {
        const avvik = finnAvvik(readFileSync(sti, "utf-8"));
        if (avvik.length > 0) {
          const liste = avvik
            .slice(0, 8)
            .map((a) => `linje ${a.linje}: fontSize ${a.verdi}px`)
            .join(" · ");
          typografiVarsel =
            `Typografi-advarsel (blokkerer ikke) for ${sti} — ${avvik.length} fontSize utenfor den målte skalaen: ` +
            `${liste}. OBS: skalaen er fra Paper-porten (docs/port/typografi-skala-paper.md) og er HISTORIKK — ` +
            `Train-lock er designfasit for alle produktskjermer (25.08.2026, CLAUDE.md invariant 2). ` +
            `Ignorer varselet på Train-lock-flater inntil Train-lock-skalaen er definert.`;
        }
      }
    }
  } catch {
    // Vakten skal aldri velte hooken.
  }
}

const feil = [];

if (existsSync("node_modules/.bin/eslint")) {
  try {
    execFileSync("node_modules/.bin/eslint", ["--quiet", "--no-warn-ignored", sti], {
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 60_000,
    });
  } catch (err) {
    const ut = `${err.stdout ?? ""}${err.stderr ?? ""}`.trim();
    if (ut) feil.push(`eslint:\n${ut}`);
  }
}

if (feil.length > 0) {
  const varsel = typografiVarsel ? `\n\n${typografiVarsel}` : "";
  process.stderr.write(
    `Kvalitetsgate (nivå 3) feilet for ${sti} — fiks FØR du går videre:\n\n${feil.join("\n\n")}${varsel}\n`,
  );
  process.exit(2);
}

if (typografiVarsel) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: typografiVarsel,
      },
    }),
  );
}
process.exit(0);
