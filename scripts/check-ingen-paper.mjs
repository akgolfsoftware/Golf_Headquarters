#!/usr/bin/env node
/**
 * Vakt: Paper skal aldri tilbake i produksjonskoden.
 *
 * Anders 30.08.2026: «Paper skal 100 % bort fra hele plattformen, uansett hva
 * regler og diverse sier.» Denne sjekken er det som gjør beslutningen varig —
 * uten den siver Paper inn igjen neste gang noen kopierer en gammel fil.
 *
 * Feiler bygget hvis src/ inneholder:
 *   - import fra det slettede @/lib/v2/tokens
 *   - CSS-variabler --p-*
 *   - filnavn eller mapper med «paper»
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");
const funn = [];

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (/paper/i.test(e.name)) {
      funn.push(`${path.relative(ROOT, p)} — filnavn/mappe inneholder «paper»`);
    }
    if (e.isDirectory()) { walk(p); continue; }
    if (!/\.(ts|tsx|css)$/.test(e.name)) continue;
    const s = fs.readFileSync(p, "utf8");
    const rel = path.relative(ROOT, p);
    if (s.includes('from "@/lib/v2/tokens"')) {
      funn.push(`${rel} — importerer @/lib/v2/tokens (slettet 30.08.2026, bruk TL)`);
    }
    const m = s.match(/--p-[a-z0-9-]+/g);
    if (m) {
      funn.push(`${rel} — Paper-variabler: ${[...new Set(m)].slice(0, 4).join(", ")}`);
    }
  }
}

walk(SRC);

if (funn.length) {
  console.error("Paper er tilbake i src/. Bruk --tl-* / TL i stedet:\n");
  for (const f of funn) console.error(`  ${f}`);
  console.error(`\n${funn.length} funn. Se .claude/rules/beslutninger.md (30.08.2026).`);
  process.exit(1);
}
console.log("OK: ingen Paper-rester i src/.");
