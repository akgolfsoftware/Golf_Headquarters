#!/usr/bin/env node
/**
 * Mekanisk T → TL for PlayerHQ / AgencyOS / Forelder / Meg / v2-primitiver.
 * Marketing og auth røres ikke.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIRS = [
  "src/app/admin",
  "src/app/portal",
  "src/app/forelder",
  "src/app/meg",
  "src/components/admin",
  "src/components/portal",
  "src/components/forelder",
  "src/components/meg",
  "src/components/v2",
  "src/components/workbench",
  "src/components/planlegge-v2",
  "src/components/sg-hub",
  "src/components/gameplan",
  "src/components/fys-plan",
  "src/components/teknisk-plan",
  "src/components/coachhq",
  "src/components/shared",
  "src/lib/v2/hjelpetekster.ts",
];

/** Lengst først — unngå T.panel inne i T.panel2. */
const REPL = [
  ["T.onHandling", "TL.onFill"],
  ["T.handlingSoft", "TL.dim"],
  ["T.forestSoft", "TL.dim"],
  ["T.onForest", "TL.onFill"],
  ["T.onLime", "TL.onFill"],
  ["T.onCta", "TL.onFill"],
  ["T.onBrand", "TL.onFill"],
  ["T.borderS", "TL.hair"],
  ["T.panel2", "TL.dock"],
  ["T.panel3", "TL.dim"],
  ["T.fg2", "TL.mute"],
  ["T.rPill", "TL.radius.pill"],
  ["T.rCard", "TL.radius.card"],
  ["T.rInput", "TL.radius.field"],
  ["T.rSheet", "TL.radius.sheet"],
  ["T.rTag", "TL.radius.row"],
  ["T.rRow", "TL.radius.row"],
  ["T.bodyFont", "TL.font.sans"],
  ["T.railFg", "TL.mute"],
  ["T.railOn", "TL.text"],
  ["T.nivaGrad", "TL.dim"],
  ["T.segSkygge", '"none"'],
  ["T.handling", "TL.fill"],
  ["T.forest", "TL.fill"],
  ["T.lime", "TL.fill"],
  ["T.cta", "TL.fill"],
  ["T.panel", "TL.elev"],
  ["T.border", "TL.hair"],
  ["T.track", "TL.hair"],
  ["T.mut", "TL.mute"],
  ["T.disp", "TL.font.sans"],
  ["T.ui", "TL.font.sans"],
  ["T.mono", "TL.font.mono"],
  ["T.rail", "TL.dock"],
  ["T.warn", "TL.warn"],
  ["T.info", "TL.viz.target"],
  ["T.down", "TL.danger"],
  ["T.up", "TL.ok"],
  ["T.tint", "TL.dim"],
  ["T.bg", "TL.scene"],
  ["T.fg", "TL.text"],
];

const KEEP_T = /\bT\.(ax|tee|farge|wrapped|milepael|stripeMerke|chartFaint|tierCollegeBg|displayXl|numHero|numLg|numMd|bodySm|body\b|capsSm|caps\b|gap|maxw|nivaGrad)/;

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const st = fs.statSync(dir);
  if (st.isFile()) {
    if (dir.endsWith(".ts") || dir.endsWith(".tsx")) acc.push(dir);
    return acc;
  }
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts)$/.test(e.name) && !e.name.endsWith(".test.ts")) acc.push(p);
  }
  return acc;
}

const files = DIRS.flatMap((d) => walk(path.join(ROOT, d)));
let changed = 0;
for (const f of files) {
  let src = fs.readFileSync(f, "utf8");
  if (!src.includes("T.") && !/\bT\b/.test(src)) continue;
  const orig = src;
  for (const [a, b] of REPL) src = src.split(a).join(b);

  const usesTl = /\bTL\./.test(src);
  const keepT = KEEP_T.test(src) || /\bT\.(ax|tee|farge|wrapped)/.test(src);
  const hasTlImport = src.includes('from "@/lib/v2/train-lock"');
  const hasTImport = src.includes('from "@/lib/v2/tokens"');

  if (usesTl && !hasTlImport) {
    const tlLine = 'import { TL } from "@/lib/v2/train-lock";\n';
    if (hasTImport) {
      src = src.replace(
        /import \{([^}]+)\} from "@\/lib\/v2\/tokens";/,
        (m, inner) => {
          const names = inner.split(",").map((s) => s.trim()).filter(Boolean);
          const rest = names.filter((n) => n !== "T");
          if (keepT) rest.unshift("T");
          const tLine = rest.length
            ? `import { ${[...new Set(rest)].join(", ")} } from "@/lib/v2/tokens";\n`
            : "";
          return tlLine + tLine.trimEnd();
        },
      );
    } else {
      src = src.replace(/^("use client";\n)?/, (m) => `${m}${tlLine}`);
    }
  }

  if (src !== orig) {
    fs.writeFileSync(f, src);
    changed++;
  }
}
console.log(`Endret ${changed} filer.`);
