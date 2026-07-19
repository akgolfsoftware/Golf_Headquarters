#!/usr/bin/env node
/**
 * PreToolUse-hook — deterministisk sikkerhet (Agentic OS Steg 6).
 * Nivå 1: BLOKKER sensitive filer (secrets, PII, juridisk) hardt.
 * Nivå 2: KREV eksplisitt godkjenning for schema-/deploy-kritiske endringer
 *         og destruktive git-operasjoner (main er Anders' port).
 * Leser tool-kallet som JSON på stdin, svarer med permissionDecision på stdout.
 */

import { readFileSync } from "node:fs";

function svar(decision, reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: decision,
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

let input;
try {
  input = JSON.parse(readFileSync(0, "utf-8"));
} catch {
  process.exit(0); // uleselig input → ikke bland oss inn
}

const tool = input.tool_name ?? "";
const ti = input.tool_input ?? {};

// ── Nivå 1 + 2: filbaserte verktøy ─────────────────────────────────────────
if (["Read", "Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
  const sti = String(ti.file_path ?? ti.notebook_path ?? "");

  // Nivå 1 — ALDRI: secrets og PII. (.env.example er trygg mal og tillates.)
  const nivaa1 = [
    { re: /(^|\/)\.env(?!\.example)(\..*)?$/, hva: "env-fil med secrets" },
    { re: /(^|\/)data\/beta-users-.*\.csv$/, hva: "PII: beta-brukere" },
    { re: /(^|\/)data\/notion-spillere-.*\.json$/, hva: "PII: spillerdata" },
    { re: /(^|\/)data\/tournaments-import\.json$/, hva: "PII: turneringsimport" },
    { re: /(^|\/)docs\/juridisk\//, hva: "juridisk dokumentasjon" },
    { re: /(^|\/)docs\/gdpr\//, hva: "GDPR-dokumentasjon" },
  ];
  for (const r of nivaa1) {
    if (r.re.test(sti)) {
      svar("deny", `BLOKKERT (nivå 1): ${sti} er ${r.hva}. Denne filen røres ikke av agenter — se .claude/settings.json.`);
    }
  }

  // Nivå 2 — spør Anders først: fundament som kan velte auth/data/deploy.
  if (tool !== "Read") {
    const nivaa2 = [
      /(^|\/)prisma\/schema\.prisma$/,
      /(^|\/)prisma\/migrations\//,
      /(^|\/)src\/lib\/env\.ts$/,
      /(^|\/)src\/proxy\.ts$/,
      /(^|\/)src\/lib\/security\//,
      /(^|\/)vercel\.json$/,
      /(^|\/)\.github\/workflows\//,
    ];
    if (nivaa2.some((re) => re.test(sti))) {
      svar(
        "ask",
        `NIVÅ 2: ${sti} er schema-/auth-/deploy-kritisk. Krever eksplisitt godkjenning. ` +
          `Husk: migrate dev og db push er BEGGE blokkert — se .claude/rules/gotchas.md §Schema-endringer.`,
      );
    }
  }
}

// ── Nivå 2: Bash-kommandoer ────────────────────────────────────────────────
if (tool === "Bash") {
  const cmd = String(ti.command ?? "");

  // Regexene forankres til KOMMANDO-segmenter (start eller etter ; & | og
  // subshell-tegn) — ellers falsk-positiver på fritekst i f.eks. commit-meldinger.
  const SEG = String.raw`(^|[;&|(]\s*)`;
  const seg = (mønster) => new RegExp(SEG + mønster);

  // Main-porten: spør — push godkjennes KUN når Anders har sagt eksplisitt «ja» i samtalen.
  // (Endret fra deny → ask 2026-07-19 etter Anders' beslutning: hard deny gjorde at ingen
  // økt kunne fullføre en godkjent merge. Selve ja-et håndheves av Anders i prompten.)
  if (seg(String.raw`git\s+push\b[^&|;]*\s(HEAD:)?main\b`).test(cmd)) {
    svar("ask", "MAIN-PORTEN: push til main krever Anders' eksplisitte «ja» i samtalen (CLAUDE.md §Git-arbeidsflyt). Godkjenn kun hvis ja er gitt.");
  }
  // Deny: kjente feller.
  if (seg(String.raw`(npx\s+|pnpm\s+|yarn\s+|bunx?\s+)?prisma\s+(migrate\s+dev|db\s+push)\b`).test(cmd)) {
    svar("deny", "BLOKKERT: migrate dev og db push er begge ødelagte for dette repoet (shadow-DB / data-tap). Bruk kirurgisk db execute — se gotchas.md §Schema-endringer.");
  }
  if (seg(String.raw`(npx\s+)?vercel\s+deploy\b[^&|;]*--prod`).test(cmd)) {
    svar("deny", "BLOKKERT: aldri manuell prod-deploy — Vercels git-integrasjon deployer main automatisk (CLAUDE.md §CI/CD).");
  }

  // Ask: destruktivt eller sensitivt.
  const askMønstre = [
    [seg(String.raw`git\s+merge\b`), "merge (kan treffe main)"],
    [seg(String.raw`git\s+push\b[^&|;]*--force`), "force-push"],
    [seg(String.raw`git\s+reset\s+--hard`), "reset --hard"],
    [seg(String.raw`git\s+rebase\b[^&|;]*\bmain\b`), "rebase main"],
    [seg(String.raw`git\s+push\b[^&|;]*--delete`), "sletting av remote-gren"],
    [seg(String.raw`git\s+branch\s+-D\b`), "tvungen gren-sletting"],
    [/\.env\.local\b/, "kommando som rører .env.local"],
  ];
  for (const [re, hva] of askMønstre) {
    if (re.test(cmd)) {
      svar("ask", `NIVÅ 2: ${hva} — krever eksplisitt godkjenning fra Anders før den kjøres.`);
    }
  }
}

process.exit(0); // alt annet: slipp gjennom
