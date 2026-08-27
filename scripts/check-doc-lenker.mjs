#!/usr/bin/env node
// Lenkevakt for docs — opprydding 27.08.2026 (docs/OPPRYDDING-PLAN-2026-08-27.md).
// Sjekker at "levende" styringsdokumenter ikke peker på docs/**.md-filer som ikke finnes.
// Historiske/supersederte dokumenter (docs/natt/*-DONE, docs/arkiv/**, m.fl.) er bevisst
// utelatt — de har lov til å sitere slettede filer som del av historikken.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const LEVENDE_KILDER = [
  "CLAUDE.md",
  "AGENTS.md",
  "START-HER.md",
  ".claude/rules/gotchas.md",
  ".claude/rules/beslutninger.md",
  ".claude/rules/arkitektur.md",
  "docs/STATUS-NÅ.md",
  "docs/AAPNE-SPORSMAAL.md",
  "docs/MASTERPLAN-GJENSTAAENDE.md",
  "docs/FASIT-AK-GOLF-HQ.md",
  "docs/feillogg.md",
  "docs/platform/AGENT-BRIEF.md",
  "docs/platform/BUSINESS-RULES.md",
  "docs/natt/README.md",
  "docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md",
  "docs/treningsplanlegger/README.md",
];

const LENKE_MØNSTER = /docs\/[A-Za-zÆØÅæøå0-9._/-]+\.md/g;

let feil = 0;

for (const kilde of LEVENDE_KILDER) {
  const sti = join(ROOT, kilde);
  if (!existsSync(sti)) {
    console.error(`FEIL: levende kilde mangler selv: ${kilde}`);
    feil++;
    continue;
  }
  const innhold = readFileSync(sti, "utf8");
  const treff = innhold.match(LENKE_MØNSTER) ?? [];
  for (const lenke of new Set(treff)) {
    if (!existsSync(join(ROOT, lenke))) {
      console.error(`FEIL: ${kilde} peker på ${lenke} — filen finnes ikke`);
      feil++;
    }
  }
}

if (feil > 0) {
  console.error(`\n${feil} død(e) doc-lenke(r) i levende styringsdokumenter.`);
  process.exit(1);
}
console.log("OK: ingen døde doc-lenker i levende styringsdokumenter.");
